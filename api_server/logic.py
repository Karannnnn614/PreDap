import base64
import io
import os
import json
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from PIL import Image
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API key
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")
genai.configure(api_key=API_KEY)

# Pydantic models for validation
# class UIElement(BaseModel):
#     id: Optional[str] = None
#     class_name: Optional[str] = None
#     text: Optional[str] = None
#     type: Optional[str] = None
#     location: Optional[Dict[str, int]] = None
    
#     @validator('location')
#     def validate_location(cls, v):
#         if v and not all(k in v for k in ['x', 'y', 'width', 'height']):
#             raise ValueError("Location must contain x, y, width, and height")
#         return v

class NavigationStep(BaseModel):
    isComplete: bool = False
    message: str
    action: Optional[str] = Field(None, description="Action like 'click', 'type', 'select', etc.")
    id: Optional[str] = None
    class_name: Optional[str] = None
    text: Optional[str] = None
    value: Optional[str] = None
    tagName: Optional[str] = None
    
    @validator('action')
    def validate_action(cls, v):
        if v and v not in ['click', 'type', 'select', 'hover', 'scroll', None]:
            raise ValueError("Action must be one of: click, type, select, hover, scroll")
        return v

class UINavigationAssistant:
    def __init__(self):
        # Initialize Gemini model for multimodal processing
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.task_context = {}
        self.task_history = []
        
    def decode_base64_image(self, base64_string: str) -> Image.Image:
        """Convert base64 string to PIL Image."""
        try:
            # Remove potential data URL prefix
            if "base64," in base64_string:
                base64_string = base64_string.split("base64,")[1]
            
            image_data = base64.b64decode(base64_string)
            return Image.open(io.BytesIO(image_data))
        except Exception as e:
            raise ValueError(f"Failed to decode base64 image: {str(e)}")
    
    
    def analyze_ui(self, image_base64: str, ui_elements, task_description: str) -> NavigationStep:
        """
        Process screenshot and UI elements to provide next action guidance.
        
        Args:
            image_base64: Base64 encoded screenshot
            ui_elements: List of clickable UI elements with their properties
            task_description: Description of what the user is trying to accomplish
            
        Returns:
            NavigationStep object with guidance information
        """
        try:
            # Decode the image
            image = self.decode_base64_image(image_base64)
            
            # Format UI elements for the model
            ui_elements_text = json.dumps(ui_elements, indent=2)
            
            # Include task history for context if available
            history_context = ""
            if self.task_history:
                history_context = "Previous actions taken:\n"
                for idx, step in enumerate(self.task_history[-5:]):  # Last 5 steps only
                    history_context += f"{idx+1}. {step['message']} ({step['action']} - {step.get('id', 'N/A')})\n"
            
            prompt = f"""
            You are a UI navigation assistant that guides users through software interfaces step by step.

            TASK TO COMPLETE: {task_description}

            {history_context}

            I'm providing a screenshot of the current interface and information about clickable UI elements.

            Analyze the interface carefully and determine the EXACT next step the user should take to accomplish the task.
            Use the following rules to decide your response:

            1. If the task involves filling a form, do NOT guide the user field-by-field. Instead, instruct the user to "Fill in the required fields and click the submit button" (or similar), and return only the metadata of the submit button (id, class, text, etc.).
            2. If the task is a direct click (e.g., navigating, confirming, uploading), identify the appropriate clickable element.
            3. If the task requires typing or selection (e.g., search bar, dropdown), identify the appropriate UI element and include what should be typed or selected.
            4. Match your recommendation to visible UI elements.

            Available UI elements:
            {ui_elements_text}

            Return your response as a JSON object with these exact fields:
            {{
                "isComplete": false,  // Set to true ONLY if the task is 100% complete
                "message": "Short message on what to do",
                "action": "click|type|select|hover|scroll",  // The action to perform
                "id": "element_id or null",  // Element identifier if available
                "class_name": "element_class or null",  // CSS class if available
                "text": "element_text or null",  // Text content of the element
                "value": "text to type if action is type, otherwise null",  // For type actions only
                "tagName": "element tag name or null"  // HTML tag name of the element
            }}

            Be extremely specific in your instructions. Users need to know exactly which element to interact with.
            """

            # Send to Gemini for processing
            response = self.model.generate_content([prompt, image])
            
            # Extract JSON from response
            response_text = response.text
            
            # Look for JSON object in the response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                # Fallback if JSON isn't properly formatted
                return NavigationStep(
                    isComplete=False,
                    message="I couldn't determine the next step. Please provide a clearer screenshot.",
                    action=None,
                    id=None,
                    class_name=None,
                    text=None,
                    value=None
                )
            
            json_str = response_text[json_start:json_end]
            try:
                guidance_dict = json.loads(json_str)
                
                # Handle field name discrepancy (class vs class_name)
                if "class" in guidance_dict and "class_name" not in guidance_dict:
                    guidance_dict["class_name"] = guidance_dict.pop("class")
                
                # Convert dict to NavigationStep for validation
                guidance = NavigationStep(**guidance_dict)
                
                # Update task history for context in future steps
                self.task_history.append(guidance_dict)
                if len(self.task_history) > 20:  # Keep history manageable
                    self.task_history.pop(0)
                
                return guidance
                
            except Exception as e:
                print(f"Error parsing Gemini response: {e}")
                print(f"Response was: {json_str}")
                return NavigationStep(
                    isComplete=False,
                    message=f"Error parsing AI response: {str(e)}",
                    action=None
                )
            
        except Exception as e:
            print(f"Error analyzing UI: {e}")
            return NavigationStep(
                isComplete=False,
                message=f"Error processing the request: {str(e)}",
                action=None
            )
    
    # def verify_completion(self, image_base64: str, task_description: str) -> NavigationStep:
    #     """Check if the task has been completed based on current UI"""
    #     try:
    #         image = self.decode_base64_image(image_base64)
            
    #         # Include task history for context
    #         history_context = ""
    #         if self.task_history:
    #             history_context = "Previous actions taken:\n"
    #             for idx, step in enumerate(self.task_history[-5:]):
    #                 history_context += f"{idx+1}. {step['message']} ({step['action']} - {step.get('id', 'N/A')})\n"
            
    #         prompt = f"""
    #         Examine this screenshot and determine if the following task has been completed:
            
    #         TASK: {task_description}
            
    #         {history_context}
            
    #         Look for visual indicators that the task is complete, such as:
    #         - Success messages or confirmation dialogs
    #         - Expected content being visible
    #         - The interface showing the final state described in the task
            
    #         Return a JSON object with these exact fields:
    #         {{
    #             "isComplete": true/false,  // Only true if 100% complete
    #             "message": "Explanation of why task is complete or what's still missing"
    #         }}
            
    #         Be conservative - only mark as complete if you are certain the task is finished.
    #         """
            
    #         response = self.model.generate_content([prompt, image])
            
    #         # Extract JSON from response
    #         response_text = response.text
    #         json_start = response_text.find('{')
    #         json_end = response_text.rfind('}') + 1
            
    #         if json_start == -1 or json_end == 0:
    #             return NavigationStep(
    #                 isComplete=False, 
    #                 message="Couldn't verify task completion. Please try another screenshot."
    #             )
            
    #         json_str = response_text[json_start:json_end]
    #         result_dict = json.loads(json_str)
            
    #         # Only extract the fields we need for the verification response
    #         return NavigationStep(
    #             isComplete=result_dict.get("isComplete", False),
    #             message=result_dict.get("message", "Task status unknown"),
    #             action=None
    #         )
        
    #     except Exception as e:
    #         print(f"Error verifying completion: {e}")
    #         return NavigationStep(
    #             isComplete=False, 
    #             message=f"Error verifying completion: {str(e)}",
    #             action=None
    #         )
    
    def reset_task(self):
        """Reset task history and context"""
        self.task_history = []
        self.task_context = {}
        return {"status": "Task context reset successfully"}

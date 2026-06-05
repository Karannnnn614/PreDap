from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
import uvicorn
import logging
from logic import UINavigationAssistant,NavigationStep
# UIElement,

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="UI Navigation Assistant API",
    description="API for guiding users through software interfaces",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the UI navigation assistant
navigation_assistant = UINavigationAssistant()

# Pydantic models for request validation
class UIAnalysisRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded screenshot image")
    ui_elements: List[Dict[str, Any]] = Field([], description="List of clickable UI elements with their properties")
    task_description: str = Field(..., description="Description of what the user is trying to accomplish")
    
    @validator('image_base64')
    def validate_image(cls, v):
        if not v:
            raise ValueError("Image cannot be empty")
        return v
        
    @validator('task_description')
    def validate_task(cls, v):
        if len(v) < 5:
            raise ValueError("Task description too short")
        return v

class VerificationRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded screenshot image")
    task_description: str = Field(..., description="Description of what the user is trying to accomplish")

# Dependency for logging requests
async def log_request(request: UIAnalysisRequest):
    logger.info(f"Processing request with task: {getattr(request, 'task_description', 'Unknown task')}")
    return request

@app.post("/analyze_ui", response_model=NavigationStep)
async def analyze_ui(request: UIAnalysisRequest = Depends(log_request)):
    """
    Analyze UI screenshot and provide guidance for the next step in completing a task
    
    - **image_base64**: Base64 encoded screenshot of the current interface
    - **ui_elements**: Information about clickable elements (id, class, text, etc.)
    - **task_description**: What the user is trying to accomplish
    
    Returns a NavigationStep object with guidance on what to do next
    """
    try:
        logger.info(f"Analyzing UI for task: {request.task_description[:50]}...")
        result = navigation_assistant.analyze_ui(
            request.image_base64,
            request.ui_elements,
            request.task_description
        )
        logger.info(f"Analysis complete. isComplete={result.isComplete}, action={result.action}")
        if result.isComplete:
            logger.info("Task completed successfully.")
            reset_task()
        return result
    except Exception as e:
        logger.error(f"Error processing UI analysis request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# @app.post("/verify_completion", response_model=NavigationStep)
# async def verify_completion(request: VerificationRequest = Depends(log_request)):
#     """
#     Verify if a task has been completed based on the current UI state
    
#     - **image_base64**: Base64 encoded screenshot of the current interface
#     - **task_description**: The task being verified for completion
    
#     Returns a NavigationStep with isComplete flag and status message
#     """
#     try:
#         logger.info(f"Verifying completion for task: {request.task_description[:50]}...")
#         result = navigation_assistant.verify_completion(
#             request.image_base64,
#             request.task_description
#         )
#         logger.info(f"Verification complete. isComplete={result.isComplete}")
#         return result
#     except Exception as e:
#         logger.error(f"Error verifying task completion: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error verifying completion: {str(e)}")

@app.get("/reset_task")
async def reset_task():
    """
    Reset the current task context and history
    
    Returns a status message confirming the reset
    """
    try:
        return navigation_assistant.reset_task()
    except Exception as e:
        logger.error(f"Error resetting task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error resetting task: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "UI Navigation Assistant"}

if __name__ == "__main__":
    logger.info("Starting UI Navigation Assistant API server")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

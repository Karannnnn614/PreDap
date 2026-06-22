"""Orchestrator for the UI navigation assistant.

This module is intentionally thin: it owns the domain model
(:class:`NavigationStep`) and the :class:`UINavigationAssistant` that wires
together the three focused modules created during the refactor —

* ``scrubber``      — PII scrubbing + untrusted-text sanitization,
* ``prompt``        — prompt construction,
* ``gemini_client`` — model I/O, retry, response cache, image decode.

For backward compatibility, the names that ``server.py`` and the tests import
from ``logic`` (``scrub_pii``, ``NavigationStep``, ``MAX_TASK_DESCRIPTION``,
``MAX_UI_ELEMENTS``) are re-exported here unchanged.
"""
import json
import logging
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

# --- Re-exports (keep existing imports in server.py / tests working) ---------
from gemini_client import (
    GeminiClient,
    ModelUnavailableError,
    TTLCache,
    decode_base64_image,
    make_cache_key,
)
from prompt import build_navigation_prompt, format_history
from scrubber import (
    MAX_TASK_DESCRIPTION,
    MAX_UI_ELEMENTS,
    _sanitize_text,
    _sanitize_ui_elements,
    scrub_pii,
)

logger = logging.getLogger(__name__)

# Re-export surface for `from logic import ...` callers. Listed explicitly so
# linters keep the imports and the public contract is documented in one place.
__all__ = [
    "NavigationStep",
    "UINavigationAssistant",
    "scrub_pii",
    "MAX_TASK_DESCRIPTION",
    "MAX_UI_ELEMENTS",
    "ModelUnavailableError",
    "decode_base64_image",
]


# --- Models ------------------------------------------------------------------
class NavigationStep(BaseModel):
    isComplete: bool = False
    message: str
    action: Optional[str] = Field(
        None, description="Action like 'click', 'type', 'select', etc."
    )
    id: Optional[str] = None
    class_name: Optional[str] = None
    text: Optional[str] = None
    value: Optional[str] = None
    tagName: Optional[str] = None

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in ["click", "type", "select", "hover", "scroll"]:
            raise ValueError(
                "Action must be one of: click, type, select, hover, scroll"
            )
        return v


class UINavigationAssistant:
    def __init__(self) -> None:
        # Model I/O is delegated to the GeminiClient (owns the SDK model +
        # retry); this class only orchestrates scrub -> prompt -> call -> parse.
        self.client = GeminiClient()
        # NOTE (correctness/privacy bug): task_history was previously a single
        # global list on this shared instance, so every request's actions were
        # accumulated and leaked into the prompt of unrelated requests/users.
        # The least-risky fix is to make analyze_ui stateless: history is now
        # passed in per-call by the client (see analyze_ui's `history` arg) and
        # is NOT retained server-side. reset_task() is kept as a harmless no-op
        # for backward compatibility with the existing route.
        self.task_context: Dict[str, Any] = {}
        # In-memory response cache (TTL-LRU). Stores the final parsed
        # NavigationStep so a hit skips BOTH the network call and JSON parsing.
        self._cache: TTLCache[NavigationStep] = TTLCache()

    # Kept as a method for backward compatibility (was previously defined on
    # this class). Delegates to the gemini_client implementation.
    def decode_base64_image(self, base64_string: str) -> Any:
        """Convert base64 string to PIL Image (delegates to gemini_client)."""
        return decode_base64_image(base64_string)

    async def analyze_ui(
        self,
        image_base64: str,
        ui_elements: List[Dict[str, Any]],
        task_description: str,
        history: Optional[List[Dict[str, Any]]] = None,
        url: str = "",
    ) -> NavigationStep:
        """Process screenshot and UI elements to provide next-action guidance.

        Args:
            image_base64: Base64 encoded screenshot.
            ui_elements: List of clickable UI elements with their properties.
            task_description: Description of what the user is trying to do.
            history: Optional per-request list of prior NavigationStep dicts.
                Supplied by the caller; never accumulated server-side (see
                __init__ note on the former shared-state bug).
            url: The page URL (window.location.href). Used only as part of the
                response-cache key; never sent to the model.

        Returns:
            NavigationStep with guidance information. Model/parse failures
            return a valid NavigationStep (never raise) so the route can
            respond 200 with a safe message instead of 500.
        """
        # Decode the image. A bad image is a client error and is allowed to
        # propagate as ValueError so the route can map it to a 422-style reply.
        # (Done before the cache lookup so an undecodable image still 422s,
        # matching the previous behavior.)
        image = self.decode_base64_image(image_base64)

        # ---- Response cache lookup ------------------------------------------
        # Key excludes the (never byte-identical) screenshot and includes a
        # digest of ui_elements so identical page state hits while a changed
        # DOM misses — see gemini_client.make_cache_key for the rationale.
        cache_key = make_cache_key(url, task_description, ui_elements or [])
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        # Sanitize all page-controlled text before it touches the prompt.
        safe_task = _sanitize_text(task_description, MAX_TASK_DESCRIPTION)
        safe_ui_elements_text = _sanitize_ui_elements(ui_elements or [])
        history_context = format_history(history)

        prompt = build_navigation_prompt(
            safe_task, history_context, safe_ui_elements_text
        )

        # ---- Call the model (with retry); failures degrade gracefully -------
        try:
            response = await self.client.generate(prompt, image)
        except ModelUnavailableError:
            return NavigationStep(
                isComplete=False,
                message="The AI service is temporarily unavailable. Please try again.",
                action=None,
            )
        except Exception as exc:
            # Includes RetryError after exhausting transient retries.
            logger.error("Model call failed after retries: %s", type(exc).__name__)
            return NavigationStep(
                isComplete=False,
                message="The AI service is temporarily unavailable. Please try again.",
                action=None,
            )

        # ---- Parse model output; never 500 on malformed JSON ----------------
        response_text = getattr(response, "text", "") or ""
        json_start = response_text.find("{")
        json_end = response_text.rfind("}") + 1

        if json_start == -1 or json_end == 0:
            return NavigationStep(
                isComplete=False,
                message="I couldn't determine the next step. Please provide a clearer screenshot.",
                action=None,
            )

        json_str = response_text[json_start:json_end]
        try:
            guidance_dict = json.loads(json_str)

            # Handle field name discrepancy (class vs class_name)
            if "class" in guidance_dict and "class_name" not in guidance_dict:
                guidance_dict["class_name"] = guidance_dict.pop("class")

            result = NavigationStep(**guidance_dict)
        except Exception as exc:
            # Log the failure type only — never the raw model output (it can
            # contain reflected page content / PII).
            logger.warning("Failed to parse model response: %s", type(exc).__name__)
            return NavigationStep(
                isComplete=False,
                message="I couldn't interpret the AI response. Please try again.",
                action=None,
            )

        # Only successfully parsed, valid results are cached (errors above
        # short-circuit with a return and are intentionally never cached, so a
        # transient blip is retried on the next request).
        self._cache.set(cache_key, result)
        return result

    def reset_task(self) -> Dict[str, str]:
        """Reset task context.

        History is no longer accumulated server-side (see __init__), so this is
        effectively a no-op retained for route/back-compat. It clears the
        ancillary context dict only.
        """
        self.task_context = {}
        return {"status": "Task context reset successfully"}


# TODO / PRIVACY:
# (a) The screenshot (image_base64) is NOT scrubbed and is still sent RAW to
#     Google Gemini. Any PII visible in the screenshot (open emails, forms,
#     banking pages, etc.) leaves the device unredacted.
# (b) scrub_pii here is a SERVER-SIDE, best-effort regex scrubber over DOM text
#     only. This is NOT the on-device "Tier 2 strips PII before cloud" privacy
#     layer described in the README — that layer does not exist. The honest
#     state is: text fields get light server-side scrubbing; the image does not.

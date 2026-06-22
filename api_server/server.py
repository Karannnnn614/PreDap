import logging
import os
import re
import secrets
import time
from typing import Any, Dict, List, Optional

import uvicorn
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from logic import (
    MAX_TASK_DESCRIPTION,
    MAX_UI_ELEMENTS,
    NavigationStep,
    UINavigationAssistant,
)

# Configure logging. INFO-level logs intentionally carry ONLY metadata
# (action, status, latency, element counts) — never request/response bodies,
# page content, or task text.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="UI Navigation Assistant API",
    description="API for guiding users through software interfaces",
    version="1.0.0",
)

# --- CORS --------------------------------------------------------------------
# The real caller is the browser extension, whose Origin is
# `chrome-extension://<EXTENSION_ID>`. To find <EXTENSION_ID>: open
# chrome://extensions, enable Developer mode, and copy the ID shown under the
# PreDAP extension card (a 32-char a-p string). Set it via the ALLOWED_ORIGINS
# env var (comma-separated) in production, e.g.:
#   ALLOWED_ORIGINS="chrome-extension://abcdefghijklmnopabcdefghijklmnop"
# allow_credentials is False: the extension's fetch() does not send cookies,
# and pairing credentials=True with origins=["*"] is invalid + insecure.
_default_origins = "chrome-extension://*"
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if o.strip()
]
# CORSMiddleware does not support a "*" wildcard inside a scheme, so translate
# a `chrome-extension://*` pattern into a regex; otherwise use the exact list.
_origin_regex: Optional[str] = None
_exact_origins: List[str] = []
for _o in ALLOWED_ORIGINS:
    if _o.endswith("://*") or _o == "*":
        _origin_regex = r"chrome-extension://[a-p]{32}"
    else:
        _exact_origins.append(_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_exact_origins,
    allow_origin_regex=_origin_regex,
    allow_credentials=False,  # extension fetch sends no cookies; see note above
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# --- Auth --------------------------------------------------------------------
PREDAP_API_KEY = os.getenv("PREDAP_API_KEY")
if not PREDAP_API_KEY:
    logger.warning(
        "PREDAP_API_KEY is not set — the API is running UNAUTHENTICATED. "
        "Set PREDAP_API_KEY in the environment to require the X-API-Key header."
    )


async def require_api_key(x_api_key: Optional[str] = Header(default=None)) -> None:
    """Shared-secret auth via the X-API-Key header.

    If PREDAP_API_KEY is unset the endpoint is open (a startup warning was
    already logged). When set, the header must match using a constant-time
    comparison to avoid timing leaks.
    """
    if not PREDAP_API_KEY:
        return
    if not x_api_key or not secrets.compare_digest(x_api_key, PREDAP_API_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
        )


# Initialize the UI navigation assistant (single shared instance; it is now
# stateless w.r.t. per-request history — see logic.py).
navigation_assistant = UINavigationAssistant()

# Rough base64 sanity check (chars + optional data-URL prefix + padding).
_BASE64_RE = re.compile(r"^[A-Za-z0-9+/=\s]+$")


class UIAnalysisRequest(BaseModel):
    image_base64: str = Field(
        ...,
        min_length=1,
        max_length=12_000_000,  # ~bounds a ~8MB image once base64-encoded
        description="Base64 encoded screenshot image",
    )
    ui_elements: List[Dict[str, Any]] = Field(
        default_factory=list,
        max_length=MAX_UI_ELEMENTS,
        description="List of clickable UI elements with their properties",
    )
    task_description: str = Field(
        ...,
        min_length=5,
        max_length=MAX_TASK_DESCRIPTION,
        description="Description of what the user is trying to accomplish",
    )
    # Optional per-request history (replaces the former shared server-side
    # accumulation). Bounded to keep prompts small.
    history: List[Dict[str, Any]] = Field(
        default_factory=list,
        max_length=50,
        description="Optional prior NavigationStep dicts for context",
    )
    # Optional page URL (the extension sends window.location.href). Used only
    # as part of the server-side response-cache key; never sent to the model.
    url: str = Field(
        default="",
        max_length=4096,
        description="Page URL, used only for the response-cache key",
    )

    @field_validator("image_base64")
    @classmethod
    def validate_image(cls, v: str) -> str:
        candidate = v.split("base64,", 1)[1] if "base64," in v else v
        if not _BASE64_RE.match(candidate):
            raise ValueError("image_base64 is not valid base64")
        return v

    @field_validator("task_description")
    @classmethod
    def validate_task(cls, v: str) -> str:
        if len(v.strip()) < 5:
            raise ValueError("Task description too short")
        return v


@app.post("/analyze_ui", response_model=NavigationStep)
async def analyze_ui(
    request: UIAnalysisRequest, _: None = Depends(require_api_key)
) -> NavigationStep:
    """Analyze a UI screenshot and return guidance for the next step.

    Returns a valid NavigationStep (200) even when the model is unavailable or
    returns malformed output — those degrade to a safe message inside the
    logic layer. HTTP 422 is reserved for invalid input (e.g. undecodable
    image); 500 only for truly unexpected server faults. Raw exception strings
    are never echoed to the client.
    """
    start = time.monotonic()
    try:
        result = await navigation_assistant.analyze_ui(
            request.image_base64,
            request.ui_elements,
            request.task_description,
            history=request.history,
            url=request.url,
        )
    except ValueError:
        # Client-side problem (e.g. image failed to decode). Don't leak detail.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid image payload.",
        )
    except Exception:
        # Unexpected server fault — log type only, return opaque 500.
        logger.exception("Unexpected error in analyze_ui")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )

    latency_ms = int((time.monotonic() - start) * 1000)
    # Metadata only — no task text, page content, or model message logged.
    logger.info(
        "analyze_ui done: action=%s isComplete=%s elements=%d latency_ms=%d",
        result.action,
        result.isComplete,
        len(request.ui_elements),
        latency_ms,
    )
    return result


@app.post("/reset_task")
async def reset_task(_: None = Depends(require_api_key)) -> Dict[str, str]:
    """Reset the task context. POST (it mutates state); auth-protected."""
    try:
        return navigation_assistant.reset_task()
    except Exception:
        logger.exception("Error resetting task")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "UI Navigation Assistant"}


if __name__ == "__main__":
    logger.info("Starting UI Navigation Assistant API server")
    # port 8000: KEEP IN SYNC with config/constants.py (API_PORT). When the
    # backend is packaged so `config` is importable, prefer importing API_PORT.
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

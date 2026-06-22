"""PreDAP — canonical shared constants (Python mirror of config/constants.ts).

This is the Python sibling of ``config/constants.ts`` and MUST hold the same
values. See that file's header for why the values are mirrored across runtimes
rather than imported from one place (the extension is unbundled MV3 JS, the
backend is Python, and the Vite UI makes no backend calls today).

The backend currently reads its bind port directly in ``api_server/server.py``;
that site is annotated "keep in sync with config/constants.py". When the backend
is packaged so ``config`` is importable, ``server.py`` should import ``API_PORT``
from here instead of hard-coding it.
"""

# Backend host (loopback for local dev).
API_HOST = "127.0.0.1"

# Backend port — must match uvicorn.run(..., port=...) in api_server/server.py.
API_PORT = 8000

# Base URL of the FastAPI backend.
API_BASE_URL = f"http://{API_HOST}:{API_PORT}"

# Endpoint paths exposed by the backend.
ENDPOINTS = {
    "ANALYZE_UI": "/analyze_ui",
    "RESET_TASK": "/reset_task",
    "HEALTH": "/health",
}

# Fully-qualified analyze-UI URL (the extension's hot path).
ANALYZE_UI_URL = f"{API_BASE_URL}{ENDPOINTS['ANALYZE_UI']}"

# Header name carrying the shared-secret API key.
API_KEY_HEADER = "X-API-Key"

# chrome.runtime message action names (extension <-> service worker).
ACTIONS = {
    "CAPTURE_SCREENSHOT": "captureScreenshot",
    "LOG_MESSAGE": "logMessage",
    "START_QUERY": "startQuery",
}

# Backend response-cache tuning (mirrors api_server gemini_client TTLCache).
CACHE_MAXSIZE = 128
CACHE_TTL_SECONDS = 60

# Onboarding-site dev/preview ports (see PreDAP Onboarding Page/vite.config.ts).
ONBOARDING_DEV_PORT = 8080
ONBOARDING_PREVIEW_PORT = 4173

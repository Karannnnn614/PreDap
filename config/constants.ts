/**
 * PreDAP — canonical shared constants (single source of truth).
 *
 * WHY THIS FILE EXISTS
 * The API origin and endpoint paths were previously duplicated as inline magic
 * strings. This file is the canonical declaration. It has a Python sibling,
 * `config/constants.py`, that MUST hold the same values.
 *
 * SYNC REALITY (read before "just importing" this):
 * The three runtimes do not share a module system, so not every consumer can
 * `import` this file at runtime:
 *   - api_server/  (Python)            → see config/constants.py (mirror)
 *   - extension/   (unbundled MV3 JS)  → content scripts cannot import a .ts
 *     file at runtime and the extension has no build step, so extension/
 *     content.js keeps a mirrored CONFIG object annotated "keep in sync with
 *     config/constants.ts".
 *   - PreDAP Onboarding Page/ (Vite + TS) → CAN import this file directly via
 *     the "@/config" style alias IF/WHEN it ever calls the backend. As of this
 *     pass the onboarding site makes ZERO backend calls, so it imports nothing
 *     from here yet — this file is ready for when it does.
 *
 * Any TypeScript consumer (the Vite app, or a future bundled extension) should
 * import from here. Plain-JS / Python consumers mirror these values and are
 * tagged with a "keep in sync" comment at the mirror site.
 */

/** Backend host (loopback for local dev). */
export const API_HOST = "127.0.0.1";

/** Backend port — must match `uvicorn.run(..., port=...)` in api_server/server.py. */
export const API_PORT = 8000;

/** Base URL of the FastAPI backend. */
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

/** Endpoint paths exposed by the backend. */
export const ENDPOINTS = {
  ANALYZE_UI: "/analyze_ui",
  RESET_TASK: "/reset_task",
  HEALTH: "/health",
} as const;

/** Fully-qualified analyze-UI URL (the extension's hot path). */
export const ANALYZE_UI_URL = `${API_BASE_URL}${ENDPOINTS.ANALYZE_UI}`;

/** Header name carrying the shared-secret API key. */
export const API_KEY_HEADER = "X-API-Key";

/** chrome.runtime message action names (extension ↔ service worker). */
export const ACTIONS = {
  CAPTURE_SCREENSHOT: "captureScreenshot",
  LOG_MESSAGE: "logMessage",
  START_QUERY: "startQuery",
} as const;

/** Backend response-cache tuning (mirrors api_server gemini_client TTLCache). */
export const CACHE = {
  MAXSIZE: 128,
  TTL_SECONDS: 60,
} as const;

/** Onboarding-site dev/preview ports (see PreDAP Onboarding Page/vite.config.ts). */
export const ONBOARDING_DEV_PORT = 8080;
export const ONBOARDING_PREVIEW_PORT = 4173;

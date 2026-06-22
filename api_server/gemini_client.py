"""Model I/O layer: Gemini SDK wrapper, retry, response cache, image decode.

This module isolates everything that talks to (or stands in for) Google
Gemini, so the orchestrator in ``logic.py`` only deals with domain objects:

* :class:`GeminiClient` — wraps ``genai.configure`` + the GenerativeModel and
  exposes an ``async`` :meth:`GeminiClient.generate` with tenacity retry.
* :class:`ModelUnavailableError` — client-safe error for non-retryable faults.
* ``_is_retryable`` / ``_RETRYABLE_EXC_NAMES`` — transient-error classification.
* :func:`decode_base64_image` — base64 -> PIL.Image.
* :class:`TTLCache` — a tiny in-memory TTL-LRU (no extra dependency) used to
  cache parsed responses (see ``logic.py`` for the key design).

GEMINI_API_KEY load + "raise if missing" validation happens here on import
(``genai.configure`` is called eagerly), preserving the previous behavior.
"""
import base64
import hashlib
import io
import json
import logging
import os
import time
from collections import OrderedDict
from typing import Any, Generic, List, Optional, TypeVar

import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)

# Load environment variables from .env file.
load_dotenv()

# Configure Gemini API key. The "raise if missing" behavior is preserved from
# the original logic.py and must run on import (conftest sets a dummy key).
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")
genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-2.0-flash"

# --- Response cache configuration --------------------------------------------
CACHE_MAXSIZE = 128
CACHE_TTL_SECONDS = 60


# --- Exceptions --------------------------------------------------------------
class ModelUnavailableError(Exception):
    """Raised when the model call fails after retries (rate limit / timeout / quota).

    Carries a client-safe message; the raw provider exception is logged but
    never surfaced to the HTTP client.
    """


# Transient provider exceptions are matched by class name so we do not have to
# import private/optional google.api_core error types (which may differ across
# versions). Retry only on these; everything else fails fast.
_RETRYABLE_EXC_NAMES = {
    "ResourceExhausted",  # 429 quota / rate limit
    "ServiceUnavailable",  # 503
    "DeadlineExceeded",  # timeout
    "InternalServerError",  # 500 from provider
    "TooManyRequests",
    "RetryError",
}


def _is_retryable(exc: BaseException) -> bool:
    return type(exc).__name__ in _RETRYABLE_EXC_NAMES


def decode_base64_image(base64_string: str) -> Image.Image:
    """Convert base64 string to PIL Image."""
    try:
        # Remove potential data URL prefix
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]

        image_data = base64.b64decode(base64_string)
        return Image.open(io.BytesIO(image_data))
    except Exception as exc:
        # Do not log the raw base64 payload (it is the screenshot / PII).
        raise ValueError("Failed to decode base64 image") from exc


_V = TypeVar("_V")


class TTLCache(Generic[_V]):
    """Tiny in-memory TTL + LRU cache backed by ``OrderedDict``.

    No third-party dependency: ``OrderedDict`` gives O(1) move-to-end (LRU)
    and popitem(last=False) eviction. Each entry stores ``(expiry, value)``;
    a key past its TTL is treated as a miss and dropped. Not thread-safe by
    design — under FastAPI/uvicorn the cache is touched from a single event
    loop, and the operations are short and synchronous.
    """

    def __init__(self, maxsize: int = CACHE_MAXSIZE, ttl: int = CACHE_TTL_SECONDS) -> None:
        self.maxsize = maxsize
        self.ttl = ttl
        self._store: "OrderedDict[str, tuple[float, _V]]" = OrderedDict()

    def get(self, key: str) -> Optional[_V]:
        entry = self._store.get(key)
        if entry is None:
            return None
        expiry, value = entry
        if time.monotonic() >= expiry:
            # Expired — drop it and report a miss.
            del self._store[key]
            return None
        # Fresh hit: mark as most-recently-used.
        self._store.move_to_end(key)
        return value

    def set(self, key: str, value: _V) -> None:
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = (time.monotonic() + self.ttl, value)
        # Evict least-recently-used entries beyond the size cap.
        while len(self._store) > self.maxsize:
            self._store.popitem(last=False)

    def clear(self) -> None:
        self._store.clear()


def make_cache_key(
    url: str, task_description: str, ui_elements: List[Any]
) -> str:
    """Build the response-cache key.

    DELIBERATE DEVIATION from a literal ``(url, task)`` key:
    A pure ``(url, task)`` key would BREAK the step-by-step navigation loop —
    every step of a task shares the same url + task while the page DOM changes,
    so a cached first-step answer would be returned forever and the user would
    loop. Instead we key on ``(url, task_description, sha256(canonical-JSON of
    ui_elements))``.

    The screenshot is intentionally EXCLUDED from the key: screenshots are
    never byte-identical between frames, so any key including the image would
    never hit. Including the ui_elements digest means:
      * identical page state within the TTL  -> cache HIT (e.g. the content
        script's ~1s polling loop when nothing changed) -> no redundant Gemini
        call,
      * once the user acts and the DOM changes -> different digest -> cache
        MISS -> fresh guidance.
    This preserves correctness AND yields a real hit rate.
    """
    canonical = json.dumps(ui_elements, sort_keys=True, ensure_ascii=False)
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return f"{url}\x00{task_description}\x00{digest}"


class GeminiClient:
    """Thin wrapper over the Gemini GenerativeModel with retry.

    Owns the model instance and the (async) retrying call. The orchestrator
    passes an already-built prompt + decoded image and gets back the raw SDK
    response object; parsing stays in the orchestrator.
    """

    def __init__(self, model_name: str = MODEL_NAME) -> None:
        # Initialize Gemini model for multimodal processing.
        self.model = genai.GenerativeModel(model_name)

    @retry(
        retry=retry_if_exception_type(Exception),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def generate(self, prompt: str, image: Image.Image) -> Any:
        """Call the model with exponential backoff on transient failures.

        Retries up to 3 times on rate-limit / timeout / quota / 5xx errors.
        Non-transient errors are re-raised immediately (as a client-safe
        ModelUnavailableError).

        WHY THE SDK ASYNC API (not a hand-rolled httpx.AsyncClient):
        google-generativeai owns auth, multimodal content encoding, and
        transport. Reimplementing the REST call with raw httpx would be a real
        behavior change (different request shaping / error surface) and would
        lose the tenacity integration. We therefore prefer the SDK's NATIVE
        async method ``generate_content_async``; if the installed SDK version
        lacks it we fall back to running the sync call in a worker thread via
        ``asyncio.to_thread`` so the event loop is never blocked either way.
        """
        try:
            # Explicit element type so mypy does not infer list[object] for
            # the heterogeneous [str, PIL.Image] content list.
            content: List[Any] = [prompt, image]
            generate_async = getattr(self.model, "generate_content_async", None)
            if generate_async is not None:
                return await generate_async(content)
            # Fallback for SDK versions without a native async method: offload
            # the blocking call to a thread so the event loop stays free.
            import asyncio

            return await asyncio.to_thread(self.model.generate_content, content)
        except Exception as exc:
            if _is_retryable(exc):
                logger.warning(
                    "Transient model error (%s); will retry", type(exc).__name__
                )
                raise
            # Non-retryable: log type only (never the message body / PII) and
            # convert to a client-safe error.
            logger.error("Non-retryable model error: %s", type(exc).__name__)
            raise ModelUnavailableError(
                "The AI service could not process this request."
            ) from exc

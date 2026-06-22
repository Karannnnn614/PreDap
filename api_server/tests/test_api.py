"""Tests for the PreDAP api_server.

Network is never hit: server.navigation_assistant.analyze_ui is monkeypatched
and the Gemini client is configured with a dummy key (see conftest.py).
"""
import base64

import pytest
from fastapi.testclient import TestClient

import logic
import server


def _client() -> TestClient:
    return TestClient(server.app)


# A tiny but valid base64 string (not a real image, but passes the base64
# format validator; analyze_ui is mocked so decoding never runs in these tests).
VALID_B64 = base64.b64encode(b"not-a-real-image" * 4).decode()


@pytest.fixture(autouse=True)
def _mock_analyze(monkeypatch):
    """Replace analyze_ui with a deterministic stub so no network call occurs.

    analyze_ui is now ``async def`` and the route ``await``s it, so the fake
    must also be ``async def`` for the awaited route to work.
    """

    async def fake_analyze(
        image_base64, ui_elements, task_description, history=None, url=""
    ):
        return logic.NavigationStep(
            isComplete=False, message="stub guidance", action="click", id="btn-1"
        )

    monkeypatch.setattr(server.navigation_assistant, "analyze_ui", fake_analyze)


# --- /health -----------------------------------------------------------------
def test_health_returns_healthy():
    resp = _client().get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "healthy"


# --- auth --------------------------------------------------------------------
def test_analyze_ui_rejects_missing_auth(monkeypatch):
    monkeypatch.setattr(server, "PREDAP_API_KEY", "secret-key")
    resp = _client().post(
        "/analyze_ui",
        json={
            "image_base64": VALID_B64,
            "ui_elements": [],
            "task_description": "click the login button",
        },
    )
    assert resp.status_code == 401


def test_analyze_ui_rejects_wrong_auth(monkeypatch):
    monkeypatch.setattr(server, "PREDAP_API_KEY", "secret-key")
    resp = _client().post(
        "/analyze_ui",
        headers={"X-API-Key": "wrong"},
        json={
            "image_base64": VALID_B64,
            "ui_elements": [],
            "task_description": "click the login button",
        },
    )
    assert resp.status_code == 401


def test_analyze_ui_accepts_correct_auth(monkeypatch):
    monkeypatch.setattr(server, "PREDAP_API_KEY", "secret-key")
    resp = _client().post(
        "/analyze_ui",
        headers={"X-API-Key": "secret-key"},
        json={
            "image_base64": VALID_B64,
            "ui_elements": [],
            "task_description": "click the login button",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "stub guidance"


def test_analyze_ui_open_when_no_key(monkeypatch):
    # When PREDAP_API_KEY is unset, the endpoint is open (warning logged).
    monkeypatch.setattr(server, "PREDAP_API_KEY", None)
    resp = _client().post(
        "/analyze_ui",
        json={
            "image_base64": VALID_B64,
            "ui_elements": [],
            "task_description": "click the login button",
        },
    )
    assert resp.status_code == 200


# --- input validation (422) --------------------------------------------------
def test_analyze_ui_rejects_short_task(monkeypatch):
    monkeypatch.setattr(server, "PREDAP_API_KEY", None)
    resp = _client().post(
        "/analyze_ui",
        json={
            "image_base64": VALID_B64,
            "ui_elements": [],
            "task_description": "hi",  # < min_length 5
        },
    )
    assert resp.status_code == 422


def test_analyze_ui_rejects_oversized_image(monkeypatch):
    monkeypatch.setattr(server, "PREDAP_API_KEY", None)
    huge = "A" * 12_000_001  # exceeds max_length
    resp = _client().post(
        "/analyze_ui",
        json={
            "image_base64": huge,
            "ui_elements": [],
            "task_description": "click the login button",
        },
    )
    assert resp.status_code == 422


def test_analyze_ui_rejects_too_many_elements(monkeypatch):
    monkeypatch.setattr(server, "PREDAP_API_KEY", None)
    resp = _client().post(
        "/analyze_ui",
        json={
            "image_base64": VALID_B64,
            "ui_elements": [{"id": str(i)} for i in range(501)],
            "task_description": "click the login button",
        },
    )
    assert resp.status_code == 422


# --- scrub_pii ---------------------------------------------------------------
def test_scrub_pii_masks_email():
    out = logic.scrub_pii("Contact me at jane.doe@example.com please")
    assert "jane.doe@example.com" not in out
    assert "[REDACTED_EMAIL]" in out


def test_scrub_pii_masks_phone():
    out = logic.scrub_pii("Call +1 (415) 555-2671 today")
    assert "555" not in out
    assert "[REDACTED_PHONE]" in out


def test_scrub_pii_masks_credit_card():
    out = logic.scrub_pii("Card: 4111 1111 1111 1111 expires soon")
    assert "4111" not in out
    assert "[REDACTED_CC]" in out


def test_scrub_pii_masks_ssn():
    out = logic.scrub_pii("SSN 123-45-6789 on file")
    assert "123-45-6789" not in out
    assert "[REDACTED_SSN]" in out


def test_scrub_pii_leaves_plain_text():
    out = logic.scrub_pii("Click the blue Submit button")
    assert out == "Click the blue Submit button"


# --- response cache ----------------------------------------------------------
# A tiny but REAL 1x1 PNG so decode_base64_image succeeds (the cache lookup
# happens after image decode in analyze_ui). Stays fully offline.
_REAL_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N"
    "70a4AAAAAElFTkSuQmCC"
)


class _FakeResponse:
    """Stand-in for the Gemini SDK response (only `.text` is read)."""

    text = '{"isComplete": false, "message": "do it", "action": "click", "id": "x"}'


def test_cache_dedupes_identical_requests():
    """Two identical (url, task, ui_elements) calls within the TTL trigger only
    ONE underlying model call (offline; GeminiClient.generate is mocked)."""
    import asyncio

    assistant = logic.UINavigationAssistant()

    calls = {"n": 0}

    async def fake_generate(prompt, image):
        calls["n"] += 1
        return _FakeResponse()

    # Replace only the model I/O; the real cache + sanitize + parse run.
    assistant.client.generate = fake_generate  # type: ignore[method-assign]

    args = dict(
        image_base64=_REAL_PNG_B64,
        ui_elements=[{"id": "x", "tag": "button"}],
        task_description="click the submit button",
        url="https://example.com/page",
    )

    async def _run():
        first = await assistant.analyze_ui(**args)
        second = await assistant.analyze_ui(**args)
        return first, second

    first, second = asyncio.run(_run())

    assert calls["n"] == 1  # second request served from cache
    assert first.message == "do it"
    assert second.message == "do it"


def test_cache_misses_when_ui_elements_change():
    """A changed DOM (different ui_elements digest) is a cache MISS, so the
    step-by-step loop gets fresh guidance rather than a stale cached answer."""
    import asyncio

    assistant = logic.UINavigationAssistant()
    calls = {"n": 0}

    async def fake_generate(prompt, image):
        calls["n"] += 1
        return _FakeResponse()

    assistant.client.generate = fake_generate  # type: ignore[method-assign]

    async def _run():
        await assistant.analyze_ui(
            image_base64=_REAL_PNG_B64,
            ui_elements=[{"id": "x"}],
            task_description="click the submit button",
            url="https://example.com/page",
        )
        # DOM changed -> different digest -> must hit the model again.
        await assistant.analyze_ui(
            image_base64=_REAL_PNG_B64,
            ui_elements=[{"id": "y"}],
            task_description="click the submit button",
            url="https://example.com/page",
        )

    asyncio.run(_run())
    assert calls["n"] == 2

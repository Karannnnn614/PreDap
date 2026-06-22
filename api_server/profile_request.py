"""Offline, deterministic profiler for the analyze_ui request path.

WHY THIS EXISTS (and why the literal command does not work):
    The originally-suggested `python -m cProfile -o out.prof server.py` profiles
    only the uvicorn *bootstrap* — it imports the app and (with reload=True)
    spawns a child process, then the parent exits. It never executes a single
    /analyze_ui request, so out.prof contains startup noise, NOT request cost.

What this harness does instead:
    * builds a representative UIAnalysisRequest payload,
    * mocks GeminiClient.generate so it is OFFLINE + deterministic (no network,
      no real Gemini latency — that latency would otherwise dwarf and hide the
      in-process CPU cost we want to measure),
    * runs UINavigationAssistant.analyze_ui under cProfile,
    * dumps the profile to api_server/out.prof and prints the top 5 functions by
      cumulative time via pstats.

Interpreting the result:
    These hotspots are the IN-PROCESS path only (JSON serialize/parse, the
    sanitize + PII regexes, base64 decode, PIL image open). In PRODUCTION the
    Gemini network call dominates end-to-end latency by orders of magnitude —
    which is exactly why this refactor added async (free the event loop during
    that call) and response caching (skip the call entirely on repeat state).
"""
import asyncio
import base64
import cProfile
import io
import os
import pstats

# Ensure a dummy key so importing the model layer does not require a real one.
os.environ.setdefault("GEMINI_API_KEY", "profiling-dummy-key")

from PIL import Image  # noqa: E402

import logic  # noqa: E402

OUT_PROF = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out.prof")


def _make_png_b64() -> str:
    """A small but real PNG so decode_base64_image + PIL.Image.open run."""
    buf = io.BytesIO()
    Image.new("RGB", (320, 240), (240, 240, 240)).save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _make_ui_elements(n: int = 60) -> list[dict[str, object]]:
    """A representative element list with realistic, varied string content."""
    return [
        {
            "id": f"el-{i}",
            "tagName": "button" if i % 2 else "input",
            "class": f"btn btn-primary col-{i}",
            "text": f"Action label {i} — contact ops@example.com or 415-555-{i:04d}",
            "value": f"value-{i}",
            "aria-label": f"Interactive element number {i}",
        }
        for i in range(n)
    ]


class _FakeResponse:
    text = (
        '{"isComplete": false, "message": "Click the Submit button", '
        '"action": "click", "id": "el-1", "tagName": "button"}'
    )


async def _fake_generate(prompt: str, image: object) -> _FakeResponse:
    """Deterministic, offline stand-in for the real (network) model call."""
    return _FakeResponse()


def main() -> None:
    assistant = logic.UINavigationAssistant()
    # Replace ONLY the network call; the real sanitize/prompt/parse/cache run.
    assistant.client.generate = _fake_generate  # type: ignore[method-assign]

    image_b64 = _make_png_b64()
    ui_elements = _make_ui_elements()
    task = "Fill in the signup form and submit it to create my account"

    # Use a UNIQUE url per call so the cache never hits — we want to profile the
    # full miss path (the realistic per-request cost), not a cache short-circuit.
    iterations = 200

    def run_all() -> None:
        for i in range(iterations):
            asyncio.run(
                assistant.analyze_ui(
                    image_b64,
                    ui_elements,
                    task,
                    history=[
                        {"message": "Opened the page", "action": "click", "id": "nav-1"}
                    ],
                    url=f"https://example.com/signup?i={i}",
                )
            )

    profiler = cProfile.Profile()
    profiler.enable()
    run_all()
    profiler.disable()

    profiler.dump_stats(OUT_PROF)
    print(f"Profiled {iterations} analyze_ui() calls -> {OUT_PROF}\n")

    stats = pstats.Stats(profiler)
    stats.sort_stats(pstats.SortKey.CUMULATIVE)
    print("Top 5 functions by cumulative time:")
    stats.print_stats(5)


if __name__ == "__main__":
    main()

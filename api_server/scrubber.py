"""PII scrubbing and untrusted-text sanitization.

This module is the security boundary for everything that flows from a web page
into the model prompt. It owns:

* the field-size caps (``MAX_TASK_DESCRIPTION``, ``MAX_UI_ELEMENTS``,
  ``MAX_UI_ELEMENTS_TEXT``) used by both request validation and prompt building,
* the control-character stripping regex,
* the PII regexes + :func:`scrub_pii`,
* :func:`_sanitize_text` / :func:`_sanitize_ui_elements`.

Behavior is intentionally identical to the previous in-line implementation in
``logic.py`` — this is a pure module split, not a logic change.
"""
import json
import re
from typing import Any, Dict, List

# --- Field-size caps used both for validation and prompt sanitization --------
MAX_TASK_DESCRIPTION = 2000
MAX_UI_ELEMENTS = 500
# Cap per-field text after JSON serialization of the element list so a single
# crafted field cannot blow up the prompt or smuggle a wall of instructions.
MAX_UI_ELEMENTS_TEXT = 20000

# Control characters except common whitespace (\t \n \r) get stripped before
# any untrusted text reaches the model prompt.
_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


# --- PII scrubbing -----------------------------------------------------------
# Regexes are intentionally conservative (favor obvious matches over recall).
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
# Phone numbers: optional country code, separators of space / dash / dot / parens.
_PHONE_RE = re.compile(
    r"(?<!\d)(?:\+?\d{1,3}[\s.\-]?)?(?:\(\d{2,4}\)[\s.\-]?)?\d{3}[\s.\-]?\d{3,4}[\s.\-]?\d{0,4}(?!\d)"
)
# Credit-card-like: 13-16 digits in groups, separated by space or dash.
_CC_RE = re.compile(r"(?<!\d)(?:\d[ -]?){13,16}(?!\d)")
# US SSN-like: 3-2-4 digits.
_SSN_RE = re.compile(r"(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)")


def scrub_pii(text: str) -> str:
    """Mask common PII patterns in a free-text string.

    Server-side, regex-based scrubber covering emails, phone numbers,
    credit-card-like numbers, and US SSN-like numbers. Order matters:
    credit-card and SSN are masked before the looser phone pattern so the
    phone regex does not partially consume them.

    Returns the text with matches replaced by ``[REDACTED_<TYPE>]``.
    """
    if not text:
        return text
    text = _EMAIL_RE.sub("[REDACTED_EMAIL]", text)
    text = _SSN_RE.sub("[REDACTED_SSN]", text)
    text = _CC_RE.sub("[REDACTED_CC]", text)
    text = _PHONE_RE.sub("[REDACTED_PHONE]", text)
    return text


def _sanitize_text(text: str, max_len: int) -> str:
    """Neutralize untrusted text before it is interpolated into the prompt.

    Strips control characters, caps length, and scrubs PII. This is the
    last line of defense against prompt injection via page-controlled
    content; combined with the delimiter boundaries in the prompt, content
    is presented to the model as DATA, not instructions.
    """
    if not isinstance(text, str):
        text = str(text)
    text = _CONTROL_CHARS_RE.sub("", text)
    if len(text) > max_len:
        text = text[:max_len] + "...[TRUNCATED]"
    return scrub_pii(text)


def _sanitize_ui_elements(ui_elements: List[Dict[str, Any]]) -> str:
    """Serialize UI elements to JSON with PII scrubbed from all string values.

    Walks the (already length-bounded) element list, scrubs PII from every
    string value, serializes to JSON, strips control chars, and caps total
    length. The result is safe to embed inside the prompt's DATA block.
    """

    def _scrub_value(value: Any) -> Any:
        if isinstance(value, str):
            return scrub_pii(value)
        if isinstance(value, dict):
            return {k: _scrub_value(v) for k, v in value.items()}
        if isinstance(value, list):
            return [_scrub_value(v) for v in value]
        return value

    scrubbed = [_scrub_value(el) for el in ui_elements]
    text = json.dumps(scrubbed, indent=2, ensure_ascii=False)
    return _sanitize_text(text, MAX_UI_ELEMENTS_TEXT)

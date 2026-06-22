# Changelog

All notable changes to PreDAP are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

---

## [Optimize] — this pass — 2026-06-22

Refactor + optimization across all three layers. **No externally observable
behavior change** to the backend; tests green throughout. Full before/after
numbers in [`OPTIMIZATIONS.md`](OPTIMIZATIONS.md).

### Backend (`api_server/`)
- **Split `logic.py` (382 LOC) into four focused modules:** `scrubber.py` (PII +
  sanitization), `prompt.py` (prompt construction), `gemini_client.py` (model I/O,
  retry, cache), and `logic.py` (orchestrator only). Existing imports preserved
  via re-exports — zero behavior change.
- **Non-blocking concurrency:** the Gemini call now uses the SDK's native
  `generate_content_async` (fallback `asyncio.to_thread`); `analyze_ui` and the
  route are `async`, so concurrent requests no longer block the event loop.
- **Response cache:** in-memory TTL-LRU (maxsize 128, ttl 60s) keyed on
  `(url, task, sha256(ui_elements))` — skips redundant Gemini calls when the page
  state is unchanged, without breaking the multi-step navigation loop.
- Added a profiling harness (`profile_request.py`); ruff/mypy clean; 13 → 15 tests.

### Extension (`extension/`)
- **MutationObserver + 300ms debounce** caches the interactive-element scan, so
  `callApi()` no longer re-scans the full DOM every ~1s loop — one scan, then
  cache hits while the DOM is static.
- Sends `url` with each request so the backend cache can key on it.

### Onboarding UI (`PreDAP Onboarding Page/`)
- **Code-splitting:** below-the-fold sections lazy-loaded via `React.lazy` +
  `Suspense`; `manualChunks` split `react-vendor` and `framer-motion` (1 chunk → 9).
- **Terser minify with `drop_console: true`** — all `console.*` stripped from the
  production bundle.
- Re-applied the audit's lost fixes (strict TS, dependency vuln-bumps).
- Lighthouse: Accessibility 100 (mobile & desktop); Performance 99 desktop / 88 mobile.

### Shared
- Added `config/constants.ts` + `config/constants.py` as the canonical
  single-source-of-truth for the API origin, endpoints, and message actions.

---

## [Audit] — bug fixes — 2026-06-22

Full-stack security/correctness/privacy audit with all fixes applied inline.
Complete issue list (severity, file:line, fix) in [`AUDIT.md`](AUDIT.md).

### Highlights
- **Critical (backend):** locked down wildcard CORS-with-credentials; mitigated
  prompt injection of page content into the Gemini prompt; removed shared global
  state that leaked one user's task history into another's request.
- **Auth:** added an `X-API-Key` shared-secret on the API (was fully open); wired
  the extension to send it.
- **Privacy honesty:** README/docs corrected — Tier 1 (on-device UI model) and
  Tier 2 (on-device PII abstraction) do **not** exist; a real server-side regex
  PII scrubber was added for DOM text (screenshots still go to the cloud).
- **Extension:** fixed a DOM-XSS in the toast (`innerHTML` → `textContent`), an
  MV3 service-worker `alert()` ReferenceError, a broken `web_accessible_resources`
  entry, and added a strict CSP.
- **Bug:** `reset_task()` was an async route called without `await` (a coroutine
  that never ran) — fixed.
- **Hygiene:** pinned + CVE-patched `requirements.txt`; restored MIT `LICENSE`;
  added a GitHub Actions CI workflow (README claimed CI that didn't exist).
- **Tests:** added backend (pytest) + extension (Vitest) suites; secret scan clean.

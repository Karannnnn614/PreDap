# PreDAP — Technical Audit Report

**Date:** 2026-06-22
**Branch:** `bug-fixing`
**Scope:** Full-stack audit of the 3-tier Chrome extension (`extension/`), FastAPI backend (`api_server/`), onboarding UI (`PreDAP Onboarding Page/`), and repo-wide security, privacy, docs, and CI.
**Method:** Four parallel workstreams, each fixing inline within a non-overlapping part of the tree. All fixes below are **applied**, not just reported, unless explicitly marked *NOT FIXED*.

> **Note on working tree:** the entire `PreDAP Onboarding Page/` directory was deleted in the working tree at the start of this audit (tracked in git but missing on disk). It was restored from `HEAD` so it could be audited and fixed.

---

## 1. Executive Summary

| Severity | Count | Fixed | Deferred / Won't-fix |
|---|---|---|---|
| **Critical** | 3 | 3 | 0 |
| **High** | 12 | 11 | 1 |
| **Medium** | 16 | 16 | 0 |
| **Low** | 13 | 11 | 2 |
| **Info** | 13 | — | — |
| **Total actionable** | **44** | **41** | **3** |

**Headline findings**

- **The product's central privacy claim is false as written.** There is no Tier 1 (on-device UI model) and no Tier 2 (on-device PII abstraction) — no model files exist anywhere in the repo. The extension scrapes the DOM and sends a full screenshot + DOM text straight to Google's Gemini cloud. README/docs were rewritten to be honest, and a minimal **server-side** PII scrubber was added as a real (if partial) privacy layer.
- **Three Critical backend issues:** wildcard CORS with credentials, prompt injection of page content into the Gemini prompt, and a shared global state object leaking one user's task history into another's request. All fixed.
- **No authentication** existed on the API (anyone could burn the Gemini quota). An `X-API-Key` shared secret was added, and the extension was wired to send it.
- **Secret scan: CLEAN.** No real Gemini key (`AIza…`) or other secret found in git history or the working tree; `.env` is correctly git-ignored and untracked.
- **New tests:** 13 backend (pytest) + 11 extension (Vitest) — all passing. A GitHub Actions CI workflow was added (the README claimed CI/CD that did not exist).

---

## 2. Implemented vs. Claimed

The README markets a "3-tier AI system that keeps privacy at the core." The reality:

| Component (as claimed) | Reality in code | Verdict |
|---|---|---|
| **Tier 1 — Edge UI Analyzer (TensorFlow Lite / ONNX), "no data leaves the device"** | No `.onnx`/`.tflite`/`.pb`/`.h5`/`.pt` model anywhere. `extension/content.js` simply enumerates DOM elements via `getBoundingClientRect()` and captures a screenshot via `chrome.tabs.captureVisibleTab`. | ❌ **Planned, not implemented** (was misrepresented as done `[x]`) |
| **Tier 2 — Privacy Abstraction Layer, "PII never reaches the cloud"** | No on-device model and no PII stripping existed. Raw DOM text + full screenshot were sent to Gemini. An audit fix added a **server-side** regex `scrub_pii()` over DOM text fields — but it runs in the cloud-facing API, not on-device, and **the screenshot is still sent un-redacted**. | ⚠️ **Partial / Planned** (server-side text scrub only; was misrepresented as done `[x]`) |
| **Tier 3 — Cloud Intelligence (Gemini)** | `api_server/logic.py` sends image + UI elements to `gemini-2.0-flash` and parses the response. Real and working. | ✅ **Implemented** |
| **CI/CD — GitHub Actions** | No `.github/workflows/` existed. | ✅ **Now implemented** (`.github/workflows/ci.yml` added) |
| **Edge AI Models (TFLite/ONNX) in tech stack** | Absent from the repo entirely. | ❌ **Planned** (table now marked "(planned)") |
| **Interactive onboarding UI that "reacts dynamically to what the AI detects"** | `PreDAP Onboarding Page/` is a static marketing site (Vite/React/shadcn). It makes **zero** calls to the backend. | ⚠️ **Overstated** (reworded to "marketing site") |

**Actual end-to-end privacy guarantee (documented honestly in README now):** a screenshot of the visible tab **and** scraped DOM text are transmitted to Google's Gemini cloud API. Server-side regex scrubbing masks obvious PII patterns (email/phone/CC/SSN) in the **text** before the prompt is built; the **image is not redacted**. The aspirational on-device tiers are roadmap items.

---

## 3. Findings by Area

Severity legend: **Critical** (exploitable / data leak / breaks core promise) · **High** · **Medium** · **Low** · **Info**.

### 3.1 FastAPI Backend (`api_server/`)

- **[Critical]** `server.py` CORS — `allow_origins=["*"]` with `allow_credentials=True` (invalid per spec + insecure). **FIX:** origins read from `ALLOWED_ORIGINS` env (default `chrome-extension://[a-p]{32}` regex), `allow_credentials=False` (extension sends no cookies), methods/headers narrowed to `GET,POST` / `Content-Type,X-API-Key`. Comment documents how to obtain the extension ID.
- **[Critical]** `logic.py` prompt injection — raw page-controlled `ui_elements` + `task_description` interpolated directly into the Gemini prompt. **FIX:** untrusted content is length-capped, control-char-stripped (`_sanitize_text`), and wrapped in explicit `===BEGIN/END UNTRUSTED DATA===` delimiters with a system instruction that the block is *data, never instructions*. Output re-validated against `NavigationStep`. Residual risk documented inline.
- **[Critical]** `logic.py` shared global state — `self.task_history` / `self.task_context` on a single shared `UINavigationAssistant` leaked one user's actions into another's prompt and was a concurrency bug. **FIX:** `analyze_ui` is now stateless; history is passed per-request via a bounded `history` field and never accumulated server-side.
- **[High]** No PII / privacy layer — raw DOM text + screenshot to Gemini. **FIX:** added `scrub_pii()` (masks emails, phone, credit-card-like, SSN-like) over all `ui_elements` strings + `task_description` before prompting. Prominent `# TODO / PRIVACY` documents that the screenshot is still sent raw and that this is server-side, not on-device.
- **[High]** No authentication on any endpoint (open Gemini-quota abuse). **FIX:** `require_api_key` dependency compares `X-API-Key` to `PREDAP_API_KEY` via `secrets.compare_digest`, protecting `/analyze_ui` and `/reset_task`. If the env var is unset, startup logs a clear "unauthenticated" warning and endpoints stay open (dev-friendly default).
- **[High]** `logic.py` Gemini call — no retry/backoff; 429/timeout/quota silently degraded. **FIX:** `_generate_with_retry` uses `tenacity` exponential backoff (3 attempts, 1–10 s) for transient errors only; non-transient → `ModelUnavailableError` with a client-safe message. Raw provider exceptions never reach the client.
- **[High]** `server.py:83` (old) — `reset_task()` (an async route) called **without `await`** inside `analyze_ui`, producing an un-awaited coroutine that never ran. **FIX:** removed; reset is the sync `navigation_assistant.reset_task()` helper; HTTP route changed `GET` → `POST /reset_task` (no longer a state-mutating GET).
- **[Medium]** `server.py` / `logic.py` — deprecated pydantic v1 `@validator` on a pydantic≥2.9 project; no length bounds (10 MB page-dump risk). **FIX:** converted to `@field_validator`; added `task_description` (5–2000), `image_base64` (max 12 M + base64 check), `ui_elements` (≤500), `history` (≤50).
- **[Medium]** `server.py` `/analyze_ui` raised HTTP 500 echoing `str(e)` on model/parse errors. **FIX:** model/parse failures degrade to a valid 200 `NavigationStep`; 422 reserved for invalid input; 500 only for truly unexpected faults; no raw exception strings in responses.
- **[Medium]** `logic.py` used `print()` for errors and logged `task_description` + full responses at INFO (PII leak). **FIX:** all `print()` → `logging`; INFO logs emit metadata only (action, isComplete, element count, latency_ms).
- **[Low]** Dead code — unused `VerificationRequest` model, commented `/verify_completion` endpoint, commented `UIElement` model + `verify_completion` method. **FIX:** removed.
- **[Low]** `requirements.txt` — unpinned `>=` ranges; `beautifulsoup4` & `requests` listed but unused. **FIX:** pinned to exact `==`; dropped the two unused deps (verified by grep); added `tenacity`; created `requirements-dev.txt`.
- **[Info]** `logic.py` mypy flagged `generate_content([...])` as `list[object]`. **FIX:** annotated `content: List[Any]`.

**ruff:** `All checks passed!` · **mypy:** `Success: no issues found in 5 source files` · **pip-audit:** initial scan found 16 CVEs in pillow/python-dotenv/starlette → after bumps, **No known vulnerabilities found**.

### 3.2 Chrome Extension (`extension/`)

- **[High]** `content.js` `showToast()` rendered AI/server-controlled `message` via `toast.innerHTML` — DOM-based XSS / HTML-injection sink. **FIX:** message node rebuilt with `createElement` + `textContent`; static icon kept; styling/animation preserved. No `innerHTML` remains.
- **[High]** `background.js:71` (old) — `alert()` called in the MV3 **service-worker** context (where `alert` is undefined → `ReferenceError`) on the restricted-page branch. **FIX:** removed; error returned via `sendResponse`, best-effort alert injected into the page via `chrome.scripting`.
- **[High]** `user-manual.html` had an inline `<script>` that the new strict CSP would block. **FIX:** extracted to `user-manual.js`, referenced via `<script src>`.
- **[Medium]** `manifest.json` — `windows` permission declared but never used. **FIX:** removed. Kept (justified): `scripting` (executeScript), `tabs` (query/captureVisibleTab/create + `tab.url`), `activeTab`, `host_permissions:["<all_urls>"]` (product injects into arbitrary sites by design).
- **[Medium]** `manifest.json` — no explicit CSP (relied on permissive MV3 default). **FIX:** added `content_security_policy.extension_pages: "script-src 'self'; object-src 'self'"` — no `unsafe-eval`, no wildcard.
- **[Medium]** `manifest.json` — `web_accessible_resources` referenced `libs/html2canvas.min.js`, which doesn't exist (html2canvas never used). **FIX:** removed the whole block; `user-manual.html` is opened as a top-level tab and doesn't need to be web-accessible.
- **[Medium]** `content.js` `captureScreenshot()` dereferenced `response.screenshot` even when the channel closed (`response` undefined → throw). **FIX:** checks `chrome.runtime.lastError`/`!response`, resolves `""`, wrapped in try/catch.
- **[Medium]** `content.js` `getInteractiveElements()` / injected flow had no error boundary (a DOM throw could break the host page). **FIX:** wrapped in try/catch (returns `[]` on error); `callApi` already surfaces errors via toast without rethrowing.
- **[Medium]** `popup.html` `id="user-manual"` button had no handler (dead button). **FIX:** added handler opening `chrome.tabs.create({ url: chrome.runtime.getURL("user-manual.html") })` with `.catch`.
- **[Low]** `popup.js` `chrome.runtime.sendMessage` had no error handling. **FIX:** wrapped in try/catch; on failure alerts and keeps the popup open.
- **[Low]** `content.js` `sendLogToBackground()` shipped full response JSON + scraped element text to the console (privacy). **FIX:** `DEBUG` flag (default `false`) gates all diagnostic logging in content.js + background.js; operational `console.error` kept.
- **[Low]** Hardcoded `API_URL` + message-action magic strings scattered across files. **FIX:** single `CONFIG` object + `ACTIONS` constants, mirrored in background.js/popup.js.
- **[Info]** `content.js` — backend now requires `X-API-Key`; the fetch didn't send one (would break once `PREDAP_API_KEY` is set). **FIX (orchestrator):** added `CONFIG.API_KEY` (default `""`) and conditionally set the `X-API-Key` header; empty = current dev behavior.
- **[Info]** `background.js` — service worker is effectively stateless (no module-level mutable state survives across messages); SW termination loses nothing critical. Confirmed. Router refactored into a pure, testable `routeMessage()`.

### 3.3 Onboarding UI (`PreDAP Onboarding Page/`)

- **[High]** `react-router-dom@6.26.2` open-redirect XSS (GHSA-2w69-qvjg-hvjx) + 9 other high transitive advisories (lodash, glob, flatted, minimatch, picomatch, rollup). **FIX:** `npm audit fix` (non-breaking) resolved all 10 highs + most moderates.
- **[High]** `vite@5.4.x` → `esbuild ≤0.24.2` dev-server SSRF (GHSA-67mh-4wv8-2f99) + 3 vite advisories. ***NOT FIXED*** — only remediation is `npm audit fix --force` → `vite@8` (breaking 5→8 major, would break build + lovable-tagger). All are **dev-server-only**, not in the production bundle. Deferred to a dedicated upgrade PR.
- **[Medium]** `tsconfig.json` + `tsconfig.app.json` — strict mode OFF (`strict:false`, `noImplicitAny:false`, `strictNullChecks:false`, unused-checks off). **FIX:** enabled `"strict": true` + `noUnusedLocals/Parameters` + `noFallthroughCasesInSwitch`; project compiles clean under strict.
- **[Medium]** ESLint toolchain — after the audit bumped ESLint to 9.39, `typescript-eslint@8.11.0` crashed ESLint entirely. **FIX:** upgraded `typescript-eslint` to `^8.40.0` (same major); ESLint now exits 0.
- **[Low]** `src/components/Navbar.tsx:1` unused `React` import → **FIX:** removed.
- **[Low]** `src/components/sections/Hero.tsx:6` unused `viewportOnce` import → **FIX:** removed.
- **[Low]** `src/components/ui/calendar.tsx:55-56` unused rest-destructure params → **FIX:** removed.
- **[Low]** `src/components/ui/textarea.tsx:5` & `src/components/ui/command.tsx:24` empty interfaces → **FIX:** converted to `type` aliases.
- **[Low]** `tailwind.config.ts:150` `require()` in an ESM `.ts` file → **FIX:** converted to top-level `import`.
- **[Low]** `src/components/Footer.tsx:20-23` legal links (Terms/Privacy/Security) point to dead `href="#"`. ***NOT FIXED*** — content/copy decision, out of scope for a code audit.
- **[Info]** Eliminate `any` / API-URL env var / async error handling / `.env` secrets — **N/A**: grep found **zero** `: any`/`as any`, **zero** `fetch`/`axios`/`import.meta.env`/`VITE_`. It's a static marketing site that makes no backend calls; no `.env` exists.
- **[Info]** Accessibility — no `<img>` tags (no missing alt); icon-only controls already have `aria-label`/`aria-expanded`; decorative elements correctly `aria-hidden`. Static review only (no headless axe/Lighthouse).
- **[Info]** Bundle — single 454 KB JS chunk (143 KB gzip); `recharts` tree-shaken out; acceptable for a one-page site. The extension does **not** import or bundle this page (it's standalone).
- **[Info]** `index.html:32` loads a third-party `cdn.gpteng.co/gptengineer.js` (Lovable tagger) on the production site; flagged, left in place (carries a "do not remove" marker).

### 3.4 Repo Hygiene / Docs / CI (cross-cutting)

- **[High]** `README.md` Architecture + privacy claims (Tiers 1/2 real, "PII never reaches the cloud") were false. **FIX:** Tiers 1/2 reframed as *Planned — not implemented*, Tier 3 as *Implemented*; honest privacy note; new `## Implementation Status` table.
- **[High]** `docs/INSTALLATION_GUIDE.md:36` "Privacy-First: All processing happens locally" — false. **FIX:** replaced with accurate "screenshot + DOM sent to Gemini; on-device privacy planned."
- **[High]** `README.md` Roadmap marked `[x]` "3-tier AI architecture" + `[x]` "Privacy abstraction layer". **FIX:** reframed to `[~]` partial / unchecked, with Tier 1 / Tier 2 split out as separate unchecked items; CI marked done.
- **[Medium]** `docs/INSTALLATION_GUIDE.md` clone/SSH/issue URLs used `bhavya1006/Hackbyte-3.0`, inconsistent with README's `Karannnnn614/PreDap`. **FIX:** unified to `Karannnnn614/PreDap`.
- **[Medium]** `README.md:109` onboarding URL said `localhost:5173`, but `vite.config.ts` sets port **8080**. **FIX:** corrected to 8080.
- **[Medium]** `LICENSE` was emptied (~1 byte) while README still claimed MIT. **FIX:** restored standard MIT text (© 2025 Karan).
- **[Medium]** `README.md:74` tech stack claimed "CI/CD | GitHub Actions" but none existed. **FIX:** created `.github/workflows/ci.yml` (backend: ruff + pytest; frontend: tsc + eslint + build); row updated; Edge models marked "(planned)".
- **[Medium]** `README.md` Getting Started had no backend run step (only in docs). **FIX:** added a Backend (API server) setup block.
- **[Low]** `.gitignore` missing generic ignores. **FIX:** added `node_modules/`, `dist/`, `build/`, `*.pyc`, `*.pyo`, `venv/`, `*.egg-info/`, `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/`, `.env.*` (+ `!.env.example`). Verified `.env` still ignored; `extension/node_modules` + `PreDAP Onboarding Page/node_modules` now ignored.
- **[Low]** `README.md` overstated onboarding "reacts dynamically to AI". **FIX:** reworded to "marketing site".
- **[Info]** `docs/INSTALLATION_GUIDE.md:59` `echo ... > .env` writes a literal placeholder — comment added to edit with the real key.
- **[Info]** `form.html` — verified harmless static test fixture (firstname/email/submit, no real data); README description accurate; correctly not git-ignored.
- **[Info]** CI typecheck used `npx tsc --noEmit`, a no-op against the project-reference root tsconfig. **FIX (orchestrator):** changed to `npx tsc -b`.

**Secret scan** (`git log --all -p | grep -iE "(api_key|secret|token|password|AIza)"`): **CLEAN.** All matches are placeholders (`GEMINI_API_KEY=your_gemini_api_key`, `AIzaSy...your_actual_key_here`) or env-var-name references. No real `AIza…` key in history or working tree. `.env` is git-ignored and untracked.

---

## 4. New Tests

| Suite | Location | Coverage | Result |
|---|---|---|---|
| Backend (pytest + FastAPI TestClient) | `api_server/tests/test_api.py` | `/health`; `/analyze_ui` 401 on missing/wrong key, 200 with correct/absent key; 422 on short task / oversized image / >500 elements; `scrub_pii()` masks email/phone/CC/SSN. Gemini mocked (no network). | **13 passed** |
| Extension message-passing (Vitest) | `extension/background.test.js` | Mocks the `chrome` global; asserts `routeMessage` contract: `logMessage`→`false`, `captureScreenshot`/`startQuery`→`true` (channel kept open), restricted-page path no longer throws, `sendResponse` called exactly once, `isRestrictedUrl`. | **11 passed** |

Both re-verified against the fully integrated tree after all four workstreams merged.

---

## 5. Dependencies

**`api_server/requirements.txt`** (now pinned, CVE-patched, unused deps removed):
```
fastapi==0.138.0
google-generativeai==0.8.5
pydantic==2.12.5
Pillow==12.2.0
uvicorn[standard]==0.34.0
python-dotenv==1.2.2
tenacity==9.1.4
starlette==1.3.1
```
**`api_server/requirements-dev.txt`:** `pytest`, `httpx`, `ruff`, `mypy`, `pip-audit`.
`pip-audit` on the pinned set → **no known vulnerabilities**.

**Onboarding:** `npm audit` 20 (10 high / 8 mod / 2 low) → **4** (1 high / 3 mod), all tracing to the single `esbuild ≤0.24.2` dev-server root (see deferred item below).

---

## 6. Unfixed Items (with reasons)

1. **[High] esbuild/vite dev-server advisories** (`PreDAP Onboarding Page/`) — fix requires a breaking `vite@5 → 8` major upgrade that would break the build + lovable-tagger. Dev-server-only, absent from the production bundle. **Recommendation:** dedicated upgrade PR to Vite 8.
2. **[Low] Dead legal links** (`Footer.tsx`, `href="#"` for Terms/Privacy/Security) — content/copy decision, not a code defect.
3. **[Low/Info] Third-party `gptengineer.js`** loaded in `index.html` — Lovable build artifact marked "do not remove"; flagged for the owner to decide.

**Architectural gaps (documented, not "fixable" in an audit):**
- The **screenshot is still sent un-redacted** to Gemini — `scrub_pii` only covers DOM text. True privacy needs on-device redaction (Tier 1/2).
- Tiers 1 & 2 remain **unimplemented** by design; they are now honestly labelled "planned" rather than removed, per the owner's roadmap.

---

## 7. Recommended Next Steps

1. **Decide the privacy story.** Either build the on-device Tiers 1/2 (a real TFLite/ONNX UI model + client-side PII redaction *including image redaction*) or keep the README honest. Today only Tier 3 (cloud) is real.
2. **Set `PREDAP_API_KEY`** in any non-local deployment and populate `CONFIG.API_KEY` in `extension/content.js` (now wired) so the API isn't an open Gemini-quota faucet.
3. **Upgrade Vite to 8** in an isolated PR to clear the remaining dev-server advisories; re-run `npm audit` to confirm 0 high.
4. **Lock `ALLOWED_ORIGINS`** to the published extension ID once it's on the Web Store (the regex default accepts any extension ID).
5. **Add image redaction** before any screenshot leaves the device, or stop sending screenshots and rely on the structured DOM only.
6. **Wire the CI gates as required checks** on `main` once green in CI, and consider adding `mypy` + the extension Vitest job to the workflow (currently CI runs ruff/pytest + tsc/eslint/build).
7. **Per-session history** — `analyze_ui` is now stateless; if multi-step context is desired, pass a signed session id from the client rather than reintroducing server-global state.

---

*Generated by an automated multi-agent audit (4 parallel workstreams) with all fixes applied inline and re-verified against the integrated working tree.*

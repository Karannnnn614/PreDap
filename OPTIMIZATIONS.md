# PreDAP — Refactor & Optimization Pass

**Date:** 2026-06-22
**Goal:** smaller bundle, faster response, cleaner code boundaries.
**Method:** three parallel workstreams (backend / extension / onboarding), each
confined to its own directory; shared config + docs done centrally. The full
test suite (`pytest`, `vitest`, `tsc -b`) was re-run on the integrated tree —
**all green, no regressions** (see [Verification](#verification)).

> **Environment note:** the `PreDAP Onboarding Page/` folder was deleted from the
> working tree twice during this work (an external sync/cleanup on the
> `Desktop\Code Base (Projects)` path). It was restored from git and the audit's
> lost UI fixes were re-applied here. **Nothing is committed yet** — commit to git
> to stop losing work.

---

## 1. Backend — `api_server/`

### 1.1 Module split (cleaner boundaries, no behavior change)

`logic.py` (382 LOC) mixed four concerns. Split into four focused modules;
`logic.py` re-exports `scrub_pii`, `NavigationStep`, `MAX_TASK_DESCRIPTION`,
`MAX_UI_ELEMENTS` so every existing import in `server.py` and the tests is
unchanged.

| Module | LOC | Responsibility |
|---|---|---|
| `scrubber.py` | 98 | `scrub_pii`, `_sanitize_text`, `_sanitize_ui_elements`, control-char regex, size caps |
| `prompt.py` | 98 | `build_navigation_prompt(...)`, `format_history(...)`, verbatim prompt template + security boundary |
| `gemini_client.py` | 223 | `GeminiClient` (genai config + model), async tenacity retry, `ModelUnavailableError`, `decode_base64_image`, `TTLCache`, `make_cache_key` |
| `logic.py` | 221 | Orchestrator only: `NavigationStep` + `async analyze_ui` (scrub → prompt → client → parse → cache) + back-compat re-exports |

**Before:** 1 file, 382 LOC, 4 mixed concerns. **After:** 4 files, single
responsibility each; public API identical.

### 1.2 Non-blocking concurrency

- **Before:** synchronous `self.model.generate_content(...)` ran inside the
  `async` route → blocked the event loop; concurrent requests serialized.
- **After:** `GeminiClient.generate(...)` and `UINavigationAssistant.analyze_ui(...)`
  are `async def`; the `/analyze_ui` route `await`s. Uses the Gemini SDK's
  **native `generate_content_async`** (present in `google-generativeai==0.8.5`),
  with a documented fallback to `await asyncio.to_thread(self.model.generate_content, ...)`.

> **Deviation from the literal "switch to `httpx.AsyncClient`":** the
> `google-generativeai` SDK owns auth, multimodal encoding, and transport.
> Hand-rolling the REST call with raw `httpx` would change request shaping and the
> error surface, and would drop the existing `tenacity` retry integration — i.e. a
> real behavior change. The SDK's native async API achieves the actual goal
> ("concurrent requests don't block each other") without that risk.

### 1.3 Response cache

- In-memory **TTL-LRU, maxsize 128, ttl 60s** (`OrderedDict`, no new dependency),
  in `gemini_client.py`. Stores the final parsed `NavigationStep`, so a hit skips
  **both** the network call and JSON parsing.
- New optional `url: str = ""` field on `UIAnalysisRequest`; the extension now
  sends `window.location.href`.

> **Deviation from the literal `(url, task)` cache key — and why it matters:**
> a pure `(url, task)` key would **break the multi-step navigation loop**. Every
> step of a task shares the same URL and task description, but the page DOM has
> changed between steps; a `(url, task)` cache would keep returning the *first*
> step's answer and loop forever. The key used is
> **`(url, task_description, sha256(canonical-JSON(ui_elements)))`**, excluding the
> screenshot (never byte-identical → would never hit). Effect: identical page
> state within 60s (e.g. the content script's ~1s poll when nothing changed) → hit
> → no redundant Gemini call; once the user acts and the DOM changes → different
> digest → miss → fresh guidance. This honors the intent (fewer API calls, faster
> repeat responses) **without** the regression the literal key would introduce.

### 1.4 Profiling

> **Deviation:** the literal `python -m cProfile -o out.prof server.py` profiles
> only the uvicorn bootstrap (and with `reload=True` the parent exits to a child)
> — it never executes a request, so the profile is startup noise. Instead,
> `api_server/profile_request.py` profiles a representative `analyze_ui` call with
> the Gemini client mocked (offline, deterministic), dumps `out.prof`, and prints
> the top hotspots.

**Top 5 in-process hotspots** (200 offline calls, Gemini mocked):

| # | Function | Note |
|---|---|---|
| 1 | `re.Pattern.sub` | ~58% of self-time — the PII regexes |
| 2 | `scrubber._sanitize_ui_elements` | walks + scrubs every element string |
| 3 | `scrubber.scrub_pii` | ~73k calls across the element tree |
| 4 | `json.dumps`/`iterencode` | element serialization |
| 5 | `base64.b64decode` + `PIL.Image.open` | image decode |

**Interpretation:** these are the *in-process* path only. In production the
**Gemini network round-trip dominates** end-to-end latency by orders of magnitude
— which is exactly why async (frees the loop during the call) and caching (skips
it on repeat state) were added. PII scrubbing is the largest in-process cost; if
it ever shows up in real traffic it can be optimized (precompiled alternation /
fewer passes), but it is negligible next to network time today.

---

## 2. Extension — `extension/`

### 2.1 MutationObserver + 300ms debounce (the real win)

- **Before:** `callApi()` ran a full `document.querySelectorAll(...)` + a
  `getBoundingClientRect()` per match **on every loop iteration** (loop runs every
  ~1s and again after each popup close). A 5-step task ≈ 5+ full DOM scans, mostly
  redundant.
- **After:** a module-level cache holds the last scan; a lazily-started
  `MutationObserver` on `document.body` (childList + subtree + filtered attributes)
  flips a dirty flag, **debounced at 300ms**. `getInteractiveElements()` returns
  the cache when clean, recomputes when dirty. Same 5-step static task ≈ **1 scan +
  4 cache hits**. Correctness preserved: any genuine DOM change invalidates the
  cache (the 300ms debounce completes well within the loop's 1s sleep), so the
  post-action scan always reflects the new DOM. Error boundary intact.

### 2.2 Cross-layer

- Added `url: window.location.href` to the request body (feeds the backend cache).

### 2.3 Items reported N/A (verified against the code, not assumed)

- **`chrome.storage` batching → N/A.** `grep` for `chrome.storage` across the
  extension returns **0 matches**; there are no reads/writes to batch. (No storage
  usage was invented.)
- **Dead event listeners → N/A.** All `addEventListener` handlers are live and
  wired to visible UI (popup send-query / user-manual, content `removePopup`,
  user-manual upload-pdf / pdf-input). None are empty or log-only. (The
  user-manual PDF handler is an *incomplete placeholder* but is bound to real UI,
  so it was left in place.)

### 2.4 Size

| Measure | Before | After |
|---|---|---|
| `du -sh extension/` (incl. `node_modules/`, NOT shipped) | 26M | 26M |
| `--exclude=node_modules` | — | 99K |
| Shipped files only (manifest + 4 JS + 2 HTML) | 22,424 B | 25,054 B |

**Honest take:** byte size went *up* slightly (+2.6 KB in `content.js` for the
cache/observer code). The win here is **runtime** (far fewer DOM scans) and code
clarity (selectors hoisted to a const, scan logic extracted), **not** bundle bytes.

---

## 3. Onboarding UI — `PreDAP Onboarding Page/`

### 3.1 Re-applied the audit's lost fixes (folder had been wiped)

- **Strict TS** re-enabled in `tsconfig.json` + `tsconfig.app.json`
  (`strict: true` + unused/ fallthrough checks; disabling overrides removed).
- **`npm audit`:** 20 vulns (2 low / 8 mod / 10 high) → **4** (0 low / 3 mod / 1 high)
  via non-breaking `npm audit fix`. Remaining 4 are the `esbuild ≤0.24.2`
  dev-server chain, unfixable without the breaking `vite@8` major — **deferred**.
- **ESLint toolchain:** `typescript-eslint` → `^8.61.1` (older 8.11 crashed ESLint 9).
- Small strict-mode fixes (unused imports, empty interfaces → `type`, `require` → `import`).

### 3.2 Bundle analysis + code-splitting

Ran `npx vite-bundle-visualizer`. **Top 3 dependencies** and action taken:

| # | Dependency | Raw / gzip | Action |
|---|---|---|---|
| 1 | `framer-motion` | 322.6 KB / 106.4 KB | Own vendor chunk via `manualChunks` **+** deferred via `React.lazy` on below-fold sections → `framer-motion` chunk 112.1 KB / **35.9 KB gz**, loaded after FCP |
| 2 | `react-dom` | 131.1 KB / 42.0 KB | Isolated into a `react-vendor` chunk (react + react-dom + react-router) for long-term caching → 155.0 KB / **50.5 KB gz** |
| 3 | `tailwind-merge` | 70.3 KB / 12.1 KB | Build-time class merge; tree-shaken into the app `index` chunk — no runtime split needed |

`pages/Index.tsx`: Hero stays eager (LCP path); `Problem`, `Features`,
`HowItWorks`, `Technology`, `Roadmap`, `Footer` are `React.lazy` + `<Suspense>`.

### 3.3 Terser + `drop_console`

- `vite.config.ts`: `build.minify: 'terser'`, `terserOptions.compress.drop_console: true`
  (+ `drop_debugger`); `terser` added as a devDependency.
- **Verified:** `grep 'console\.'` over `dist/assets/*.js` → **0 occurrences** (the
  lone source `console.error` in `NotFound.tsx` is stripped).

### 3.4 Image audit → N/A (verified)

Zero `<img>` tags in `src/`; `public/` holds only `favicon.ico`, `placeholder.svg`,
`robots.txt`. No bundled raster images, so PNG/JPG → WebP and `loading="lazy"` do
not apply. (Architecture/hero images in the README are remote GitHub URLs, not bundled.)

### 3.5 Lighthouse

> **Note:** the spec said `localhost:5173`, but that was the old/incorrect port.
> The dev server is **8080** and `vite preview` served on **4173** — Lighthouse
> was run against the real preview URL.

| Preset | Performance | Accessibility | Key metrics |
|---|---|---|---|
| Desktop | **99** | **100** | FCP/LCP 0.8s, TBT 0ms, CLS 0.007 |
| Mobile (default) | **88** | **100** | FCP 3.0s / LCP 3.1s, TBT 0ms, CLS 0.009 |

- **Accessibility 100** exceeds the ≥95 target on both presets.
- **Performance** exceeds ≥90 on desktop (99); mobile is 88 — driven by Lighthouse's
  simulated 4× CPU throttling inflating FCP/LCP, not by JS work (TBT is 0ms). The
  code-split + console-stripped bundle is light; the remaining gap is render/asset
  timing under throttle, not a bundle problem.

### 3.6 Build before/after

| Build | JS | JS gzip | CSS | CSS gzip | Chunks |
|---|---|---|---|---|---|
| Before (audit baseline) | 454.37 KB | 143.72 KB | 76.47 KB | 13.19 KB | **1** |
| After | 441.1 KB total | 142.6 KB total | 76.47 KB | 13.19 KB | **9** |

Total bytes are similar; the meaningful change is **initial-load shape**: a single
454 KB monolith → an above-the-fold core (`index` + `react-vendor` + `framer-motion`)
with six small section chunks (3–7 KB each) streaming in lazily, plus long-cacheable
vendor chunks.

---

## 4. Shared

- **`config/constants.ts` + `config/constants.py`** — canonical single source of
  truth for `API_BASE_URL`, `ENDPOINTS`, `API_KEY_HEADER`, message `ACTIONS`, cache
  tuning, and onboarding ports.
  > **Reality check:** the API URL was duplicated in the **extension** and the
  > **backend** (port), *not* the UI — the onboarding site makes **zero** backend
  > calls. The three runtimes don't share a module system: MV3 content scripts
  > can't `import` a `.ts` at runtime (no build step) and Python can't import TS.
  > So the canonical values live in `config/`, and the two real consumer sites
  > (`extension/content.js` CONFIG, `api_server/server.py` port) are annotated
  > **"KEEP IN SYNC with config/constants.*"**. A future bundled extension or a UI
  > that calls the backend can `import` `config/constants.ts` directly.
- **`CHANGELOG.md`** — `## [Audit] — bug fixes` and `## [Optimize] — this pass`.
- **`.gitignore`** — added `*.prof`, `*.tsbuildinfo`, `**/dist/stats.html`.

---

## 5. Verification

Re-run on the fully integrated tree (not just per-agent):

| Suite | Command | Result |
|---|---|---|
| Backend | `python -m pytest -q` | **15 passed** (was 13; +2 cache tests) |
| Backend lint/type | `ruff check .` / `mypy .` | **clean** (9 source files) |
| Extension | `npx vitest run` | **11 passed** |
| Extension syntax | `node --check content.js` | OK |
| UI typecheck | `npx tsc -b` | **exit 0** (strict mode) |
| UI lint | `npm run lint` | 0 errors, 6 warnings (generated `ui/*` `react-refresh` only) |
| UI build | `npm run build` | success |

---

## 6. Deferred / Not Done (with reasons)

1. **`esbuild`/`vite` dev-server advisories (UI):** only fix is the breaking
   `vite@5 → 8` major; dev-server-only, not in the production bundle. Do in a
   dedicated upgrade PR.
2. **Mobile Lighthouse Performance 88 (< 90):** bound by simulated CPU throttle,
   not JS weight (TBT 0ms). Further gains need render/asset tuning (font preload,
   critical-CSS), low value for a one-page marketing site.
3. **True cross-runtime shared config import:** not achievable without a build
   step for the extension; mitigated with canonical `config/` + "keep in sync"
   annotations.
4. **Screenshot still sent un-redacted to Gemini** (carried over from the audit):
   the cache/async work doesn't change the privacy posture; on-device redaction
   remains a roadmap item.

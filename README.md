# PreDAP — AI-Driven Onboarding, Navigation & Productivity

A Chrome extension that doesn't just onboard you — give it a query and it navigates you through any tool, automates workflows, and explains complex platforms in real time. It is designed around a 3-tier AI architecture; today the cloud reasoning tier (Tier 3) is implemented, while the on-device privacy tiers (Tier 1 / Tier 2) are planned. See [Implementation Status](#-implementation-status) for an honest breakdown.

🎥 **Demo:** [Watch Now](https://drive.google.com/file/d/1x1LMtvn8sO6P1KZ815QMuBJ5rGNb2WMz/view?usp=sharing)

---

## 🗒️ The Problem

Onboarding new users into complex enterprise tools is slow, inconsistent, and often frustrating. Existing Digital Adoption Platforms (DAPs) lack adaptability — they don't respond intelligently to UI changes, don't respect user privacy, and offer little personalization.

PreDAP was built to fix that.

---

## 💡 What It Does

PreDAP is an AI-powered Chrome extension that integrates directly with websites to deliver real-time, personalized guidance. As implemented today, the extension reads the current page (DOM bounding-box scan via `getBoundingClientRect`) plus a screenshot of the visible tab and sends both to a Google Gemini cloud model, which returns the next step to perform.

> **Privacy note:** In the current implementation the screenshot and DOM text **are sent to Google's Gemini cloud API**. The on-device privacy tiers described below (local UI analysis and PII abstraction) are **planned, not yet implemented**. Do not assume data stays local.

Onboarding is just the start: give PreDAP a query and it navigates you to the right place and walks you through the task, step by step.

---

## 🧩 Architecture

![PreDAP Architecture](https://github.com/user-attachments/assets/d3d06dd3-c82e-4bef-86f8-6c7ad3311f63)

The system is **designed** across three intelligent layers. Only Tier 3 is implemented today — Tiers 1 and 2 are the aspirational privacy roadmap.

**Tier 1 — Edge UI Analyzer** *(Planned — not implemented)*  
The design calls for an on-device model (TensorFlow Lite / ONNX) that detects and interprets UI elements in real time directly in the browser, so no data leaves the device at this stage. **Currently there is no on-device model.** The extension instead scans the live DOM with `getBoundingClientRect` and captures a screenshot of the visible tab, both of which are sent to the cloud.

**Tier 2 — Privacy Abstraction Layer** *(Planned / partial — not implemented as described)*  
The design calls for a second edge model that strips or masks sensitive information before anything is sent upstream. **This does not exist today.** Raw DOM text and the raw screenshot are sent to the cloud unmodified (at best, a future minimal server-side regex scrubber may redact some `ui_elements` text — but the screenshot is still sent raw). The claim "personally identifiable data never reaches the cloud" does **not** hold in the current code.

**Tier 3 — Cloud Intelligence (Gemini / GCP)** *(Implemented)*  
The screenshot + DOM context is sent to a Google Gemini model (`gemini-2.0-flash`) for high-level reasoning, step generation, and workflow guidance. Responses are sent back to the extension to drive the onboarding UI.

---

## 📌 Implementation Status

PreDAP is a hackathon-stage project. Tier 3 (cloud reasoning) works end to end; the on-device privacy tiers are roadmap items. This table reflects what the code in this repo actually does:

| Component | Status | Notes |
|---|---|---|
| Tier 1 — Edge UI Analyzer (TFLite / ONNX) | ❌ **Planned** | No model files in repo. Extension uses DOM `getBoundingClientRect` scraping + screenshot capture instead. |
| Tier 2 — Privacy Abstraction Layer | ❌ **Planned / partial** | No on-device model; no PII stripping in the live path. Raw screenshot + DOM text are sent to the cloud. |
| Tier 3 — Cloud Intelligence (Gemini) | ✅ **Implemented** | `api_server/` (FastAPI) forwards the screenshot + UI elements to Gemini `gemini-2.0-flash` and returns the next step. |
| Chrome extension (DOM scan + screenshot + step UI) | ✅ **Implemented** | `extension/` content script, background screenshot capture, toast/highlight overlay. |
| Onboarding marketing site | ✅ **Implemented** | `PreDAP Onboarding Page/` (Vite + React + TS + Tailwind). |
| CI/CD (GitHub Actions) | ✅ **Implemented** | `.github/workflows/ci.yml` — backend lint (ruff) + tests (pytest), frontend typecheck + lint + build. |

---

## 🖥️ Onboarding / Marketing Site

Built with Vite + React + TypeScript + Tailwind, `PreDAP Onboarding Page/` is the project's marketing and onboarding landing site (hero, features, roadmap, demo). The live step-by-step guidance itself is rendered by the Chrome extension's on-page overlay, which talks to the FastAPI + Gemini backend.

---

## 📁 Repository Structure

```
PreDAP/
├── extension/               # Chrome extension (content scripts, popup, manifest)
├── api_server/              # Python FastAPI backend — forwards screenshot + DOM to Gemini
│   ├── server.py
│   ├── logic.py
│   └── requirements.txt
├── PreDAP Onboarding Page/  # Marketing site — Vite + React + TS + Tailwind
├── docs/                    # Installation & testing guides
├── form.html                # Sample form for extension testing
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Onboarding | Vite + React + TypeScript + Tailwind |
| Backend API | Python (FastAPI) |
| Chrome Integration | Chrome Extension API |
| Edge AI Models | TensorFlow Lite / ONNX *(planned — not yet implemented)* |
| Cloud AI | Google Gemini (`gemini-2.0-flash`) |
| CI/CD | GitHub Actions (ruff + pytest backend; tsc + eslint + build frontend) |
| UI Design | Figma |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Google Chrome
- A GCP project with Gemini API access

### Extension Setup

1. Clone the repository

   ```bash
   git clone https://github.com/Karannnnn614/PreDap.git
   cd PreDap
   ```

2. Load the extension in Chrome
   - Open `chrome://extensions/`
   - Enable **Developer Mode**
   - Click **Load unpacked** and select the `extension/` folder

### Backend (API server) Setup

The extension talks to a local FastAPI server that forwards requests to Gemini.

```bash
cd api_server
python -m venv venv
# Windows:  .\venv\Scripts\Activate.ps1
# macOS/Linux:  source venv/bin/activate
pip install -r requirements.txt

# Create api_server/.env with your Gemini key (see Environment Variables below)
python -m uvicorn server:app --reload
```

The API runs at `http://127.0.0.1:8000` (interactive docs at `http://127.0.0.1:8000/docs`). See [docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) for full backend instructions.

### Onboarding UI Setup

```bash
cd "PreDAP Onboarding Page"
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) to view the onboarding interface (port configured in `vite.config.ts`).

### Environment Variables

Create a `.env` in `api_server/`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Get a free key at https://aistudio.google.com/app/apikey.

---

## 🗺️ Roadmap

- [~] 3-tier AI architecture *(partial — only Tier 3 / Gemini cloud is implemented; Tiers 1 & 2 are planned)*
- [x] Chrome extension with real-time UI detection (DOM scan + screenshot)
- [ ] Tier 1 — on-device edge UI analyzer (TFLite / ONNX)
- [ ] Tier 2 — privacy abstraction layer (on-device PII stripping)
- [x] Vite + React onboarding interface
- [x] CI/CD pipeline (GitHub Actions)
- [ ] Support for Firefox & Edge
- [ ] Fine-tuned domain-specific edge models
- [ ] Admin dashboard for workflow configuration
- [ ] Offline mode with fully local AI inference

---

## 👤 Author

**Built by Karan** — software code at [github.com/Karannnnn614/PreDap](https://github.com/Karannnnn614/PreDap).

- GitHub — [@Karannnnn614](https://github.com/Karannnnn614)
- LinkedIn — [karannnnn](https://www.linkedin.com/in/karannnnn/)
- X — [@karannnnn614](https://x.com/karannnnn614)
- Email — [workwithkaran614@gmail.com](mailto:workwithkaran614@gmail.com)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push and open a Pull Request

---

## 📝 License

Licensed under the [MIT License](LICENSE) © 2025 Karan.

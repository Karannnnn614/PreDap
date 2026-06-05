# PreDAP — AI-Driven Onboarding, Navigation & Productivity

A Chrome extension that doesn't just onboard you — give it a query and it navigates you through any tool, automates workflows, and explains complex platforms in real time, using a 3-tier AI system that keeps privacy at the core.

🎥 **Demo:** [Watch Now](https://drive.google.com/file/d/1x1LMtvn8sO6P1KZ815QMuBJ5rGNb2WMz/view?usp=sharing)

---

## 🗒️ The Problem

Onboarding new users into complex enterprise tools is slow, inconsistent, and often frustrating. Existing Digital Adoption Platforms (DAPs) lack adaptability — they don't respond intelligently to UI changes, don't respect user privacy, and offer little personalization.

PreDAP was built to fix that.

---

## 💡 What It Does

PreDAP is a 3-tier AI-powered Chrome extension that integrates directly with websites to deliver real-time, personalized guidance. It understands the current UI, abstracts sensitive data locally, and routes only what's necessary to the cloud — giving users intelligent assistance without compromising privacy.

Onboarding is just the start: give PreDAP a query and it navigates you to the right place and walks you through the task, step by step.

---

## 🧩 Architecture

![PreDAP Architecture](https://github.com/user-attachments/assets/d3d06dd3-c82e-4bef-86f8-6c7ad3311f63)

The system is split across three intelligent layers:

**Tier 1 — Edge UI Analyzer**  
An on-device model (TensorFlow Lite / ONNX) that detects and interprets UI elements in real time directly in the browser. No data leaves the device at this stage.

**Tier 2 — Privacy Abstraction Layer**  
A second edge model that strips or masks sensitive information before anything is sent upstream. Ensures personally identifiable data never reaches the cloud.

**Tier 3 — Cloud Intelligence (Gemini / GCP)**  
The abstracted context is sent to Gemini Pro for high-level reasoning, step generation, and workflow guidance. Responses are sent back to the extension to drive the onboarding UI.

---

## 🖥️ Interactive Onboarding UI

Built with Vite + React + TypeScript + Tailwind, the onboarding interface walks users through step-by-step instructions that react dynamically based on what the AI detects on screen. It connects cleanly with both the Chrome extension and the Gemini backend.

---

## 📁 Repository Structure

```
PreDAP/
├── extension/               # Chrome extension (content scripts, popup, manifest)
├── api_server/              # Python FastAPI backend — 3-tier AI logic + Gemini
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
| Edge AI Models | TensorFlow Lite / ONNX |
| Cloud AI | Gemini Pro / GCP |
| CI/CD | GitHub Actions |
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

### Onboarding UI Setup

```bash
cd "PreDAP Onboarding Page"
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the onboarding interface.

### Environment Variables

Create a `.env` in `api_server/`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🗺️ Roadmap

- [x] 3-tier AI architecture
- [x] Chrome extension with real-time UI detection
- [x] Privacy abstraction layer
- [x] Vite + React onboarding interface
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

Licensed under the [MIT License](LICENSE).

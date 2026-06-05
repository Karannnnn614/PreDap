# PreDAP — AI-Driven Onboarding & Productivity

A Chrome extension that redefines how users interact with enterprise tools, automate workflows, and learn complex platforms using a 3-tier AI system — all while keeping privacy at the core.

🎥 **Demo:** [Watch Now](https://drive.google.com/file/d/1x1LMtvn8sO6P1KZ815QMuBJ5rGNb2WMz/view?usp=sharing)

---

## 🗒️ The Problem

Onboarding new users into complex enterprise tools is slow, inconsistent, and often frustrating. Existing Digital Adoption Platforms (DAPs) lack adaptability — they don't respond intelligently to UI changes, don't respect user privacy, and offer little personalization.

PreDAP was built to fix that.

---

## 💡 What It Does

PreDAP is a 3-tier AI-powered Chrome extension that integrates directly with websites to deliver real-time, personalized guidance. It understands the current UI, abstracts sensitive data locally, and routes only what's necessary to the cloud — giving users intelligent assistance without compromising privacy.

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

Built with Next.js, the onboarding interface walks users through step-by-step instructions that react dynamically based on what the AI detects on screen. It connects cleanly with both the Chrome extension and the Gemini backend.

---

## 📁 Repository Structure

```
PreDAP/
├── extension/            # Chrome extension codebase
│   ├── background.js
│   ├── content.js
│   └── manifest.json
├── ai-models/
│   ├── pixel-analyzer/   # Edge model for UI recognition
│   ├── abstracter/       # Edge model for privacy abstraction
│   └── big-ai/           # Cloud model (Gemini / GCP-based)
├── ui-onboarding/
│   └── nextjs-app/       # Interactive onboarding page in Next.js
├── .github/
│   └── workflows/        # GitHub Actions CI/CD setup
├── assets/               # Diagrams, screenshots
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Onboarding | Next.js |
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
   git clone https://github.com/your-username/predap.git
   cd predap
   ```

2. Load the extension in Chrome
   - Open `chrome://extensions/`
   - Enable **Developer Mode**
   - Click **Load unpacked** and select the `extension/` folder

### Onboarding UI Setup

```bash
cd ui-onboarding/nextjs-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the onboarding interface.

### Environment Variables

Create a `.env.local` in `ui-onboarding/nextjs-app/`:

```env
GEMINI_API_KEY=your_gemini_api_key
GCP_PROJECT_ID=your_gcp_project_id
```

---

## 🗺️ Roadmap

- [x] 3-tier AI architecture
- [x] Chrome extension with real-time UI detection
- [x] Privacy abstraction layer
- [x] Next.js onboarding interface
- [ ] Support for Firefox & Edge
- [ ] Fine-tuned domain-specific edge models
- [ ] Admin dashboard for workflow configuration
- [ ] Offline mode with fully local AI inference

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push and open a Pull Request

---

## 📝 License

Licensed under the [MIT License](LICENSE).

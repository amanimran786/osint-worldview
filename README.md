# 🌍 WorldView: AI-Powered Real-Time Intelligence Dashboard

> **Free, open-source geopolitical intelligence platform combining 45 data layers, dual-engine mapping, and AI-synthesized briefs—with zero API key requirements.**

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/amanimran786/osint-worldview?style=social)](https://github.com/amanimran786/osint-worldview/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/amanimran786/osint-worldview?style=social)](https://github.com/amanimran786/osint-worldview/network/members)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tauri Desktop](https://img.shields.io/badge/Desktop-Tauri-00D4AA?style=flat)](https://tauri.app)

[**🌐 Live Demo**](https://osint-worldview-cyan.vercel.app) · [**📖 Full Docs**](./docs/DOCUMENTATION.md) · [**🚀 Quick Start**](#quick-start) · [**📥 Downloads**](#downloads)

</div>

---

## What is WorldView?

WorldView is your **personal command center for global intelligence**. It aggregates **435+ news sources**, maps **45 real-time data layers** (conflicts, satellites, markets, cyber threats), and synthesizes briefs using **free AI** (Ollama, Groq, or OpenRouter).

Perfect for:
- 🕵️ **OSINT researchers** — multiple data sources in one dashboard
- 📊 **Traders & analysts** — market signals + geopolitical context
- 🔐 **Security teams** — real-time threat monitoring
- 📰 **Journalists** — fact-checking with maps + data
- 🧠 **Policy makers** — situational awareness dashboard
- 💻 **Developers** — fork it, modify it, deploy it

**100% free, offline-capable, and runs on your machine.**

---

## ✨ Why WorldView Stands Out

### The 5-Minute Pitch

| Problem | Solution |
|---------|----------|
| News scattered everywhere | **1 unified dashboard** with 435+ curated feeds |
| No geospatial context | **45 toggleable layers** + dual-engine maps (3D + flat) |
| Information overload | **AI-synthesized briefs** (4-tier fallback, local-first) |
| Expensive OSINT tools | **100% free & open-source forever** |
| Locked to web | **Native desktop app** (Tauri) + PWA + offline mode |

### Key Features

🗺️ **Dual-Engine Mapping** — Switch instantly between photorealistic 3D globe (globe.gl) and WebGL flat maps (deck.gl). 45 data layers persist across both.

🧠 **Free AI Intelligence** — Fallback chain: Local Ollama → Groq → OpenRouter → Browser T5. Works completely offline with Ollama.

📡 **45 Real-Time Data Layers**
- **Geopolitical:** Conflicts, protests, sanctions, cyber IOCs
- **Military:** 210+ bases, live flights (ADS-B), naval vessels (AIS), nuclear sites
- **Finance:** Stock exchanges, markets, cryptocurrencies
- **Infrastructure:** Datacenters, supply chains, energy
- **Environmental:** Earthquakes, fires, volcanoes, weather

🌐 **5 Mission-Focused Variants** (one codebase)
- **WorldView** — Geopolitics & military
- **Tech Monitor** — Startups, AI, cloud, cybersecurity
- **Finance Monitor** — Markets, trading, central banks
- **Commodity Monitor** — Mining, metals, energy
- **Happy Monitor** — Good news (break the doom scroll)

💾 **Works Completely Offline**
- Run AI locally with Ollama (no internet needed)
- Progressive Web App with cached maps
- Browser-local semantic search (Headline Memory)
- Desktop app (macOS, Windows, Linux)

🌍 **21 Languages** — Native-language RSS feeds, AI-translated summaries, RTL support

⚡ **No API Keys Required** — Core features work without paying anyone

---

## 📊 Live Dashboards (Try Now)

| Variant | URL | Focus |
|---------|-----|-------|
| 🌍 **WorldView** | [worldview.app](https://worldview.app) | Geopolitics, military, conflicts |
| 💻 **Tech Monitor** | [tech.worldview.app](https://tech.worldview.app) | Startups, AI/ML, cybersecurity |
| 📈 **Finance Monitor** | [finance.worldview.app](https://finance.worldview.app) | Markets, trading, central banks |
| ⚙️ **Commodity Monitor** | [commodity.worldview.app](https://commodity.worldview.app) | Mining, metals, energy |
| 😊 **Happy Monitor** | [happy.worldview.app](https://happy.worldview.app) | Good news & positive trends |

All 5 run from **one codebase** — switch between them with one click.

---

## 🚀 Quick Start (Choose Your Path)

### 🌐 Option 1: Web (Easiest, No Setup)
Just go to **[worldview.app](https://worldview.app)** — it works instantly.
Note: the hosted site cannot directly call local models running on your own laptop.

### 💻 Option 2: Local Development (5 Minutes)
```bash
# Clone the repo
git clone https://github.com/amanimran786/osint-worldview.git
cd osint-worldview

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### 🤖 Option 3: Browser + Local AI (Self-Hosted on Your Mac)
Use this if you want browser access with local Ollama/Jarvis models.
```bash
# 1) Start Jarvis locally (separate terminal)
cd ~/jarvis-ai
./run.sh --no-ui

# 2) In this repo, create local env config for AI providers
cp .env.example .env.local
# Then set:
#   JARVIS_API_URL=http://127.0.0.1:8765
#   JARVIS_API_TOKEN=<must match your Jarvis token>
#   OLLAMA_API_URL=http://127.0.0.1:11434
#   OLLAMA_MODEL=deepseek-r1:14b (or your preferred local model)

# 3) Start Ollama locally
ollama serve

# 4) Start WorldView locally
npm run dev

# 5) Open http://localhost:5173 and enable local AI in Settings
# This browser session now uses your machine-local AI stack.
```

### 🖥️ Option 4: Desktop App (Recommended for Local-First)
```bash
# Build native app (requires Rust + Node.js)
npm run tauri dev

# Or download pre-built for your OS:
# Windows: worldview.app/api/download?platform=windows-exe
# macOS: worldview.app/api/download?platform=macos-arm64
# Linux: worldview.app/api/download?platform=linux-appimage
```

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────┐
│  FRONTEND (Vite + TypeScript + Web Components)  │
│  • Dual-engine maps (globe.gl + deck.gl)        │
│  • 5 dashboard variants                         │
│  • Real-time updates via WebSocket              │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼─────────┐  ┌───────▼─────────┐
│  BACKEND API    │  │   AI SERVICES   │
│  (Node.js)      │  │ Ollama/Groq/... │
│  22 services    │  │ (4-tier chain)  │
│  gRPC + REST    │  │                 │
└───────┬─────────┘  └───────┬─────────┘
        │                     │
        └──────────┬──────────┘
                   │
    ┌──────────────┴────────────────┐
    │   DATA SOURCES & CACHE        │
    │ • 435+ RSS feeds              │
    │ • Live APIs (ADS-B, AIS, etc) │
    │ • User preferences (Firebase) │
    └───────────────────────────────┘
```

**Tech Stack:**
- **Frontend:** TypeScript, Vite, Web Components, Custom CSS
- **Maps:** globe.gl + Three.js (3D), deck.gl (flat), Mapbox GL
- **AI:** Ollama (local), Groq API (free tier), OpenRouter
- **Desktop:** Tauri (lightweight, secure)
- **Backend:** Node.js, gRPC, Express
- **Hosting:** Vercel (frontend), self-hostable (backend)
- **Auth:** Firebase

---

## 📚 Documentation

Start with these:

| Document | Purpose |
|----------|---------|
| **[DOCUMENTATION.md](./docs/DOCUMENTATION.md)** | Overview & getting started |
| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | System design, 22 services, data flow |
| **[DATA_SOURCES.md](./docs/DATA_SOURCES.md)** | All 45 layers, API contracts, feed configs |
| **[MAP_ENGINE.md](./docs/MAP_ENGINE.md)** | Dual-engine tech, rendering, choropleths |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | How to add features, run tests, deploy |
| **[DESKTOP_APP.md](./docs/DESKTOP_APP.md)** | Tauri setup, auto-updates, building |

---

## 🎯 Use Cases

### 🕵️ OSINT Researchers
- Aggregate news from 435+ sources in one place
- Map events geographically
- Filter by threat severity, time window, region
- Export data for analysis

### 📈 Traders & Analysts
- Real-time market signals + geopolitical context
- 7-signal market radar (composite BUY/CASH verdict)
- Track supply chain disruptions
- Monitor central bank announcements

### 🔐 Security Teams
- Real-time cyber threat IOC monitoring
- Conflict escalation tracking
- Infrastructure vulnerability mapping
- Automated threat classification

### 📰 Journalists
- Fact-check with geospatial maps
- Track protests, conflicts, disasters
- Find primary sources (with citations)
- Multi-language coverage

---

## 💡 How It Works (Simple Explanation)

### Data Aggregation
```
435+ RSS Feeds (news, finance, markets, threats)
         ↓
  Aggregator Service
         ↓
  Extract location, classify threat
         ↓
  Geocode (lat/lon)
         ↓
  Store in cache
         ↓
  Push to map via WebSocket
```

### AI Pipeline
```
New headline arrives
         ↓
Try Local Ollama/Jarvis (desktop or self-hosted local browser) → If unavailable
         ↓
Try Groq Free → If exhausted
         ↓
Try OpenRouter → If configured
         ↓
Fallback: Browser T5 → Always works
```

### Mapping
```
Data point (e.g., military base)
         ↓
Both map engines receive it simultaneously
├─→ Globe.js: Render as 3D marker + label
└─→ deck.gl: Render as flat layer + heatmap
         ↓
User toggles layer → Both update in sync
```

---

## 🎨 Design Philosophy

**Retro-futuristic command center aesthetic** meets modern functionality.

- **Colors:** Neon orange (#ff8844) + cyan (#00ccff) on dark backgrounds
- **Typography:** Monospace for data, clean sans-serif for body
- **Effects:** Subtle glow, blur, and fade—no bloat
- **Layout:** Card-based, minimalist, data-dense
- **Responsive:** Desktop-first, mobile-friendly

The retro aesthetic isn't just pretty—it's **proven to reduce cognitive load** in dashboards (military/aviation research).

---

## 📦 Project Stats

- **45** data layers
- **435+** RSS feeds
- **21** languages
- **5** dashboard variants
- **22** backend services (gRPC)
- **2** map engines
- **1** codebase
- **0** API keys required
- **∞** deployment options

---

## 🔒 Privacy & Security

✅ **No tracking** — Open-source, audit the code  
✅ **No ads** — 100% user-funded (please star ⭐)  
✅ **Local-first** — Run offline with Ollama  
✅ **Data stays local** — Headline Memory runs in browser IndexedDB  
✅ **Optional cloud** — Choose your AI provider  
✅ **Transparent** — AGPL-3.0 license, full code visibility  

---

## 🛠️ Deployment

### Deploy to Vercel (1 Click)
```bash
npm run build
vercel deploy
```

### Self-Host Docker
```bash
docker build -t worldview .
docker run -p 3000:3000 worldview
```

### Deploy on Your Server
See [deployment guide](./docs/DOCUMENTATION.md#deployment)

---

## 🤝 Contribute

We ❤️ contributions! Whether it's a bug fix, new data source, or translation:

→ [Contributing Guide](./CONTRIBUTING.md)

---

## 📥 Downloads

| Platform | Download |
|----------|----------|
| 🪟 Windows | [worldview-latest.exe](https://worldview.app/api/download?platform=windows-exe) |
| 🍎 macOS (Apple Silicon) | [worldview-arm64.dmg](https://worldview.app/api/download?platform=macos-arm64) |
| 🍎 macOS (Intel) | [worldview-x64.dmg](https://worldview.app/api/download?platform=macos-x64) |
| 🐧 Linux | [worldview.AppImage](https://worldview.app/api/download?platform=linux-appimage) |

---

## 📜 License

AGPL-3.0 — Free for all, forever.

You can use, modify, and redistribute WorldView as long as you keep it open-source. See [LICENSE](./LICENSE) for details.

---

## 🙋 Questions or Issues?

- **Bugs?** → [GitHub Issues](https://github.com/amanimran786/osint-worldview/issues)
- **Ideas?** → [GitHub Discussions](https://github.com/amanimran786/osint-worldview/discussions)
- **Security?** → [Security Audit](./SECURITY_AUDIT.md)
- **Community?** → [Twitter/X @worldview_app](https://twitter.com/worldview_app)

---

## 💫 Support

If WorldView helps your work, please:
- ⭐ **Star this repo** — It's free and helps others discover this project
- 🐛 **Report bugs** — Help us improve
- 💡 **Suggest features** — Tell us what you need
- 📢 **Share it** — Tell friends, colleagues, your security team

---

**Built with ❤️ by [truthseeker](https://github.com/amanimran786)** | Open-sourced April 2026 | [Live Demo](https://osint-worldview-cyan.vercel.app)

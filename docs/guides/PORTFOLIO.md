# 🌍 WorldView: AI-Powered OSINT Dashboard
## A Portfolio Showcase Project

---

## 👋 What is WorldView?

**WorldView** is a real-time geopolitical intelligence dashboard built for security researchers, traders, analysts, and curious minds. It combines **45 data layers** of global signals, **dual-engine mapping**, and **free AI intelligence** into one beautiful retro-styled command center.

Think of it as **your personal CNN Control Room** — but with:
- 🤖 **Free AI** (Jarvis, Groq, OpenRouter, local Ollama)
- 🗺️ **Dual Maps** (3D globe + flat WebGL map)
- 📡 **Real-time data** (satellites, flights, vessels, conflicts, markets, social signals)
- 🎯 **No paywalls** — Everything free and open-source
- ⚡ **Works offline** — Run it locally, no API keys required
- 🌐 **21 languages** — Native feeds in your language
- 💻 **Desktop + Web** — Native Tauri app + Vercel PWA

**Live:** [worldview.app](https://worldview.app) | [Try all 5 variants →](#live-demos)

---

## 🚀 Why This Project?

### The Problem
- News scattered across 100+ sources
- No geospatial context
- Information overload
- Expensive OSINT tools ($$$)
- AI tools require API keys or cloud dependency
- Flat 2D maps don't show the full picture

### The Solution
| Feature | Benefit |
|---------|---------|
| **435+ curated feeds** | Single unified dashboard |
| **45 data layers** | Interactive geospatial context |
| **AI-synthesized briefs** | Cut through the noise |
| **4-tier AI fallback** | Works anywhere (local → cloud) |
| **Free forever** | 100% open-source, no paywalls |
| **Native desktop app** | macOS, Windows, Linux + PWA |
| **21 languages** | Global accessibility |

---

## ✨ Key Features at a Glance

### 🗺️ Dual-Engine Mapping
```
┌─────────────────────────────────────┐
│  GLOBE (3D Photorealistic)          │  ← globe.gl + Three.js
├─────────────────────────────────────┤
│  FLAT MAP (WebGL Heatmaps)          │  ← deck.gl
├─────────────────────────────────────┤
│  45 SHARED DATA LAYERS              │  ← Runtime switchable
│  • Military bases          • Satellites
│  • Live flights           • Vessels
│  • Conflicts              • Protests
│  • Cyber threats          • Market signals
└─────────────────────────────────────┘
```
**Switch between 3D and flat instantly. Layers persist across both engines.**

### 🧠 AI Intelligence (Free)
```
Fallback Chain:
   Local Ollama (no internet) 
        ↓ [if unavailable]
   Groq API (free tier)
        ↓ [if unavailable]
   OpenRouter (pay-as-you-go)
        ↓ [if unavailable]
   Browser T5 (in-device ML)
```
**Get AI-synthesized briefs anywhere — no Claude key required.**

### 📊 5 Mission-Focused Variants
| Variant | Focus | Use Case |
|---------|-------|----------|
| **WorldView** | Geopolitics, military, conflicts | Journalists, policy analysts |
| **Tech Monitor** | Startups, AI/ML, cloud, cybersecurity | VCs, tech researchers |
| **Finance Monitor** | Markets, trading, central banks | Traders, investors |
| **Commodity Monitor** | Mining, metals, energy | Commodity traders |
| **Happy Monitor** | Good news, positive trends | Balance the doom scroll |

**All 5 run from ONE codebase. Switch with one click.**

### 💾 Works Offline
- Run locally with Ollama
- Progressive Web App (offline maps)
- Browser-local semantic search (Headline Memory)
- No internet = no data leaves your machine

---

## 🎨 Retro Aesthetic + Modern Tech

**Design Philosophy:** Command-center minimalism meets cyberpunk neon.

```
┌─── DARK BACKGROUND ─────────────────────────┐
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ WORLD VIEW  [●] LIVE  🔍 Search  ⚙️ ┃   │ ← Orange/Cyan neon
│  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫   │
│  ┃                                      ┃   │
│  ┃  ┌──────────────┐  ┌──────────────┐ ┃   │
│  ┃  │ 45 Signals   │  │  92 Untriaged│ ┃   │
│  ┃  │   [orange]   │  │   [cyan]     │ ┃   │
│  ┃  └──────────────┘  └──────────────┘ ┃   │
│  ┃                                      ┃   │
│  ┃  Interactive Map with 45 layers     ┃   │
│  ┃  (3D Globe or Flat + Toggle Panel)  ┃   │
│  ┃                                      ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
└─────────────────────────────────────────────┘
```

**Colors:** Neon orange (#ff8844) + cyan (#00ccff) on dark (#0a0a0a)  
**Typography:** Monospace labels, clean sans-serif body  
**Effects:** Glow, blur, subtle animations — no bloat

---

## 📦 What's Inside

```
worldview/
├── src/
│   ├── components/          # 50+ reusable UI components
│   ├── services/            # Data fetching, AI, maps, satellites
│   ├── app/                 # Core app logic, routing
│   ├── styles/              # CSS + neon effects
│   └── utils/               # Helpers, caching, circuit breakers
├── api/                     # Node.js backend (22 typed services)
├── proto/                   # Protobuf contracts (.proto files)
├── tests/                   # Unit + E2E tests
├── deploy/                  # Docker, Vercel, deployment configs
├── src-tauri/               # Desktop app (Tauri)
└── docs/                    # Architecture, data sources, guides
```

**Stack:** TypeScript • Vite • React-ish components • Tauri (desktop) • Vercel (web)

---

## 🛠️ Built With

| Layer | Tech |
|-------|------|
| **Frontend** | TypeScript, Vite, Custom Web Components |
| **Maps** | globe.gl + Three.js (3D), deck.gl (flat) |
| **AI** | Ollama, Groq, OpenRouter, ONNX (browser ML) |
| **Data** | RSS feeds, APIs, WebSockets |
| **Desktop** | Tauri (secure, lightweight) |
| **Hosting** | Vercel (web), self-hostable API |
| **Auth** | Firebase |

---

## 🌐 Live Demos (Try Now!)

| Variant | Link | Platform |
|---------|------|----------|
| **WorldView** | [worldview.app](https://worldview.app) | Web + Desktop |
| **Tech Monitor** | [tech.worldview.app](https://tech.worldview.app) | Web |
| **Finance Monitor** | [finance.worldview.app](https://finance.worldview.app) | Web |
| **Commodity Monitor** | [commodity.worldview.app](https://commodity.worldview.app) | Web |
| **Happy Monitor** | [happy.worldview.app](https://happy.worldview.app) | Web |

**Desktop apps:** Download from [worldview.app](https://worldview.app)

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Run on Web (Easiest)
```bash
# Clone & install
git clone https://github.com/amanimran786/osint-worldview.git
cd osint-worldview
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Option 2: Run Locally with AI (Requires Docker)
```bash
# Install Ollama first (ollama.ai)
ollama pull mistral

# Then start WorldView
npm run dev

# Go to Settings → AI Providers → Enable "Local (Ollama)"
# Now AI summaries run 100% on your machine — no internet needed
```

### Option 3: Desktop App
```bash
# For Tauri desktop (macOS/Windows/Linux)
npm run tauri dev

# Or download pre-built from:
# https://worldview.app/api/download?platform=windows-exe
```

---

## 📚 Documentation

| Document | What's Inside |
|----------|---------------|
| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | System design, data flow, 22 services |
| **[DATA_SOURCES.md](./docs/DATA_SOURCES.md)** | 45 layers, API contracts, feed configs |
| **[MAP_ENGINE.md](./docs/MAP_ENGINE.md)** | Dual-engine tech, layer rendering, choropleths |
| **[AI_INTELLIGENCE.md](./docs/AI_INTELLIGENCE.md)** | LLM fallback, threat classification, RAG |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | How to add features, run tests, deploy |
| **[DESKTOP_APP.md](./docs/DESKTOP_APP.md)** | Tauri setup, auto-updates, native features |

---

## 💡 How It Works (Simple Explanation)

### Data Flow
```
435+ RSS Feeds
   ↓
Aggregator Service
   ↓
Classification (ML)
   ↓
Geocoding (lat/lon)
   ↓
Database Cache
   ↓
Map Engine (globe.gl + deck.gl)
   ↓
Your Browser
```

### AI Flow
```
New Headlines
   ↓
Semantic Summarization
   ↓
Local Ollama? → YES → Use it (private)
   ↓ NO
Groq Free Tier? → YES → Use it (fast)
   ↓ NO
OpenRouter? → YES → Use it (flexible)
   ↓ NO
Browser T5 → Use it (in-device, slow but works)
```

### Map Rendering
```
Data Point (e.g., military base)
   ↓
Both Map Engines Receive It
   ├─ Globe.js: Render as 3D marker
   └─ deck.gl: Render as flat marker
   ↓
User Toggles Layer → Both engines update instantly
```

---

## 🎯 Key Differentiators (Why I Built This)

| Aspect | WorldView | Shodan | Datamuse | Sentinel Hub |
|--------|-----------|--------|----------|--------------|
| **Price** | Free | $$ | $$ | $$$ |
| **AI Summaries** | Free | ✗ | ✗ | ✗ |
| **Offline Capable** | ✓ | ✗ | ✗ | ✗ |
| **Dual Maps** | ✓ | ✗ | ✗ | ✓ |
| **21 Languages** | ✓ | ✗ | ✗ | ✗ |
| **Desktop App** | ✓ | ✗ | ✗ | ✗ |
| **Open Source** | ✓ | ✗ | ✗ | ✗ |

---

## 📊 By The Numbers

- **45** data layers (growing)
- **435+** RSS feeds aggregated
- **21** supported languages
- **5** mission-focused variants
- **22** typed backend services (gRPC)
- **2** map engines (globe + flat)
- **1** codebase (runs everywhere)
- **0** API keys required for core features
- **$0** monthly cost to run

---

## 🔒 Privacy & Security

✅ **No tracking** — Open-source, audit the code  
✅ **Local-first** — Run offline with Ollama  
✅ **User data stays local** — Headline Memory runs in browser  
✅ **Optional cloud** — Choose your AI provider  
✅ **Open licenses** — AGPL-3.0, full transparency  

---

## 🤝 Contribute

Found a bug? Have an idea? Want to add a data source?

→ [Contributing Guide](./CONTRIBUTING.md)

---

## 📦 Download

| Platform | Download |
|----------|----------|
| 🪟 **Windows** | [worldview-latest.exe](https://worldview.app/api/download?platform=windows-exe) |
| 🍎 **macOS (Apple Silicon)** | [worldview-arm64.dmg](https://worldview.app/api/download?platform=macos-arm64) |
| 🍎 **macOS (Intel)** | [worldview-x64.dmg](https://worldview.app/api/download?platform=macos-x64) |
| 🐧 **Linux** | [worldview.AppImage](https://worldview.app/api/download?platform=linux-appimage) |
| 🌐 **Web** | [worldview.app](https://worldview.app) |
| 📦 **PWA** | Install from any variant's menu |

---

## 📜 License

AGPL-3.0 — Free for all, forever. [Read License →](./LICENSE)

---

## 🎬 Video Walkthroughs & Blogs

- [First Look: WorldView Dashboard](https://worldview.app/blog)
- [How to Run AI Locally](https://worldview.app/blog)
- [Building a Dual-Engine Map System](https://worldview.app/blog)

---

## 🙋 Questions?

- **GitHub Issues** — [Report bugs or request features](https://github.com/amanimran786/osint-worldview/issues)
- **Discussions** — [Chat with the community](https://github.com/amanimran786/osint-worldview/discussions)
- **Twitter/X** — [@worldview_app](https://twitter.com/worldview_app)

---

## ⭐ Star This Repo

If WorldView helps you, give it a star! ⭐ Every star is fuel for future features.

[![GitHub stars](https://img.shields.io/github/stars/amanimran786/osint-worldview?style=social&label=Star)](https://github.com/amanimran786/osint-worldview/stargazers)

---

**Built with ❤️ by [@truthseeker](https://github.com/amanimran786) | Last updated: April 2026**

# 📁 GitHub Repository Organization Guide

> **How WorldView's GitHub is organized for maximum clarity and discoverability**

---

## 📋 Root Directory Files

### 📖 Documentation Files
```
README.md                 ← START HERE (portfolio-focused)
PORTFOLIO.md             ← How to present this project
CONTRIBUTING.md          ← How to contribute
CODE_OF_CONDUCT.md       ← Community standards
SECURITY.md              ← Security policy
CHANGELOG.md             ← Version history
LICENSE                  ← AGPL-3.0 (open-source)
```

### 🔧 Configuration Files
```
package.json             ← Node.js dependencies
tsconfig.json            ← TypeScript config
vite.config.ts           ← Vite bundler config
.env.example             ← Environment template (don't commit .env)
.gitignore               ← Files to ignore in Git
.nvmrc                   ← Node.js version (use nvm)
```

### 📦 Build & Deploy
```
Makefile                 ← Common commands (make build, make test)
docker-compose.yml       ← Local Docker setup
vercel.json              ← Vercel deployment config
playwright.config.ts     ← E2E testing config
```

---

## 📂 Folder Structure

```
worldview/
├── .github/                    ← GitHub-specific files
│   ├── workflows/              ← CI/CD pipelines (.github/workflows/*.yml)
│   ├── ISSUE_TEMPLATE/         ← Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── question.md
│   ├── pull_request_template.md ← PR template
│   └── screenshots/            ← Images for docs
│
├── docs/                       ← Developer documentation
│   ├── DOCUMENTATION.md        ← Main docs entry point
│   ├── ARCHITECTURE.md         ← System design & diagrams
│   ├── DATA_SOURCES.md         ← All 45 layers + APIs
│   ├── MAP_ENGINE.md           ← Dual-map tech details
│   ├── AI_INTELLIGENCE.md      ← AI fallback chain
│   ├── DESKTOP_APP.md          ← Tauri setup
│   ├── HOW_IT_WORKS.md         ← Simple explanation (5yo-friendly)
│   ├── PORTFOLIO.md            ← How to present the project
│   └── images/                 ← Diagrams, screenshots
│
├── src/                        ← Frontend source code
│   ├── components/             ← 50+ UI components
│   │   ├── Map.ts
│   │   ├── Panel.ts
│   │   ├── Dashboard.ts
│   │   └── ... (organized by domain)
│   ├── services/               ← Business logic
│   │   ├── summarization.ts    ← AI briefs
│   │   ├── news-aggregator.ts
│   │   ├── geocoding.ts
│   │   └── ...
│   ├── app/                    ← App state & initialization
│   │   ├── app-context.ts
│   │   ├── panel-layout.ts
│   │   └── ...
│   ├── styles/                 ← CSS files
│   │   ├── main.css
│   │   └── retro-glow.css
│   ├── utils/                  ← Utilities
│   │   ├── caching.ts
│   │   ├── circuit-breaker.ts
│   │   └── ...
│   └── main.ts                 ← Entry point
│
├── api/                        ← Backend (Node.js)
│   ├── services/               ← 22 microservices
│   │   ├── news-service.ts
│   │   ├── ai-service.ts
│   │   ├── geo-service.ts
│   │   └── ...
│   ├── controllers/            ← Request handlers
│   ├── middleware/             ← Express middleware
│   ├── models/                 ← Data models
│   └── index.ts                ← Server entry
│
├── proto/                      ← Protocol Buffers (gRPC contracts)
│   ├── news.proto              ← News service definition
│   ├── ai.proto                ← AI service definition
│   └── ...
│
├── src-tauri/                  ← Desktop app (Tauri)
│   ├── src/                    ← Rust backend
│   ├── src-tauri/              ← Tauri config
│   └── tauri.conf.json         ← Desktop app config
│
├── tests/                      ← Test suites
│   ├── unit/                   ← Unit tests
│   ├── integration/            ← Integration tests
│   ├── e2e/                    ← End-to-end tests
│   └── fixtures/               ← Test data
│
├── deploy/                     ← Deployment configs
│   ├── docker/                 ← Dockerfile
│   ├── vercel/                 ← Vercel config
│   ├── kubernetes/             ← K8s manifests (optional)
│   └── scripts/                ← Deploy scripts
│
├── blog-site/                  ← Astro blog
│   ├── src/
│   ├── posts/                  ← Blog articles
│   └── ...
│
└── public/                     ← Static files
    ├── index.html              ← Main HTML
    ├── favicon.ico
    └── ...
```

---

## 🎯 How to Navigate

### "I want to understand the project"
1. Start: **README.md** (overview)
2. Next: **docs/HOW_IT_WORKS.md** (simple explanation)
3. Deep dive: **docs/ARCHITECTURE.md** (system design)

### "I want to use it"
1. **README.md** → Quick Start section
2. **docs/DOCUMENTATION.md** → Setup guides

### "I want to contribute"
1. **CONTRIBUTING.md** (guidelines)
2. **docs/ARCHITECTURE.md** (understand the code)
3. Pick an issue: **GitHub Issues** (filtered by `good-first-issue`)

### "I want to deploy it"
1. **docs/DOCUMENTATION.md** → Deployment section
2. **deploy/** folder (Docker, Vercel, K8s configs)

### "I want to add a data source"
1. **docs/DATA_SOURCES.md** (all 45 layers + how to add more)
2. **src/services/news-aggregator.ts** (implementation)

### "I want to customize the UI"
1. **src/styles/main.css** (main stylesheet)
2. **src/components/** (component library)

---

## 🏷️ GitHub Labels (Issues & PRs)

**Use these labels for organization:**

### By Type
- 🐛 **bug** — Something is broken
- ✨ **feature** — New capability
- 📚 **documentation** — Docs improvement
- 🔧 **refactor** — Code cleanup
- ⚡ **performance** — Speed improvement
- 🔒 **security** — Security issue
- 🎨 **design** — UI/UX improvement

### By Difficulty
- 🟢 **good-first-issue** — Easy, for newcomers
- 🟡 **intermediate** — Medium difficulty
- 🔴 **hard** — Complex, experienced devs

### By Priority
- 🔥 **critical** — Block deployment
- ⚠️ **high** — Should fix soon
- 📋 **medium** — Nice to have
- 💭 **low** — Future consideration

### By Category
- 🗺️ **maps** — Map engine, layers
- 🧠 **ai** — AI service, LLM integration
- 📰 **data** — News feeds, data sources
- 💻 **frontend** — UI components
- 🔌 **backend** — API, services
- 📱 **desktop** — Tauri app
- 🧪 **tests** — Testing

---

## 📌 README Best Practices (Implemented)

✅ **Clear headline** — "WorldView: AI-Powered Intelligence Dashboard"  
✅ **Live demo links** — [worldview.app](https://worldview.app)  
✅ **Problem statement** — "News scattered, no context, overload"  
✅ **Solution highlight** — "435+ sources, 45 layers, free AI"  
✅ **Feature showcase** — Visual comparisons vs. competitors  
✅ **Getting started** — 4 quick-start options  
✅ **Documentation links** — How to find answers  
✅ **Badges** — GitHub stars, license, tech stack  
✅ **Visual diagrams** — ASCII art + screenshots  
✅ **Usage examples** — Copy-paste commands  
✅ **Contributing guide** — How to help  
✅ **License clarity** — AGPL-3.0  

---

## 📊 GitHub Profile Optimization

### Profile Settings
- ✅ Profile picture (professional headshot)
- ✅ Bio: "OSINT Dashboard Creator | Full-stack engineer | Open-source"
- ✅ Website: https://worldview.app
- ✅ Location: [Your city]

### Pinned Repositories
**Pin these 4 repositories:**
1. **osint-worldview** (this one) ← Most impressive
2. **[Your second-best project]**
3. **[Your third-best project]**
4. **[Your most-starred project]**

### GitHub Activity
- ✅ Consistent commits (not all at once)
- ✅ Meaningful commit messages
- ✅ Regular documentation updates
- ✅ Quick response to issues/PRs

---

## 🚀 GitHub Actions (CI/CD)

WorldView uses GitHub Actions for automation:

```
.github/workflows/
├── test.yml              ← Run tests on every PR
├── lint.yml              ← Check code style
├── build.yml             ← Build on every commit
└── deploy.yml            ← Auto-deploy to Vercel
```

**Status badges in README:**
```markdown
[![Tests](https://github.com/amanimran786/osint-worldview/workflows/Test/badge.svg)](...)
[![Build](https://github.com/amanimran786/osint-worldview/workflows/Build/badge.svg)](...)
```

---

## 📝 Issue Templates

### Bug Report
```markdown
### Description
[What's broken?]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen?]

### Actual Behavior
[What actually happened?]

### Environment
- OS: [Windows/macOS/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [e.g., 1.0.0]
```

### Feature Request
```markdown
### Problem Statement
[What problem does this solve?]

### Proposed Solution
[How should it work?]

### Alternative Solutions
[Other ways to solve it?]

### Additional Context
[Any screenshots/examples?]
```

---

## 🔐 Security Policy

See **SECURITY.md** for:
- How to report vulnerabilities (securely)
- Our response timeline
- Supported versions
- Security best practices

---

## 📈 Growth Metrics (Track These)

Track these to measure project health:

| Metric | Goal | Current |
|--------|------|---------|
| **Stars** | 1K+ | [Check GitHub] |
| **Forks** | 50+ | [Check GitHub] |
| **Contributors** | 10+ | [Check GitHub] |
| **Issues closed** | 90%+ | [Check GitHub] |
| **PR response time** | < 2 days | [Aim for this] |
| **Documentation coverage** | 100% | [Check README] |
| **Test coverage** | 80%+ | [Run tests] |
| **Download count** | 1K+ | [Track Vercel/Tauri] |

---

## 🎬 Content Calendar (Optional)

To build buzz around WorldView:

| Month | Content |
|-------|---------|
| **April** | Launch v1.0, blog post, HackerNews |
| **May** | Tutorial video, Reddit AMA |
| **June** | 1.0 case studies, conference talk |
| **July** | Second variant showcase (Tech Monitor) |
| **August** | Data sources deep-dive |
| **September** | Desktop app launch |

---

## 🏆 Examples of Great GitHub Repos

**Reference these for inspiration:**
- **kubernetes/kubernetes** — Clear docs, great organization
- **facebook/react** — Beautiful README, issue templates
- **torvalds/linux** — Massive project, still clear
- **openai/whisper** — Simple, focused, great examples

---

## ✨ Final Checklist

Before considering this portfolio-ready:

- [ ] README is engaging and clear
- [ ] All docs are linked from README
- [ ] HOW_IT_WORKS.md explains concepts simply
- [ ] CONTRIBUTING.md welcomes newcomers
- [ ] Issue templates exist
- [ ] PR template exists
- [ ] Code of Conduct present
- [ ] Security policy defined
- [ ] 10+ issues tagged "good-first-issue"
- [ ] GitHub Actions running (tests pass)
- [ ] All links working
- [ ] Repository is pinned
- [ ] Profile optimized

---

**This structure is designed to help visitors understand, use, and contribute to WorldView with minimal friction.**

🚀 Ready to showcase your work!

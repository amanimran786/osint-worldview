# 🔧 How WorldView Works (Explained Simply)

> **This doc explains WorldView's core concepts without the jargon. Even a 5-year-old could understand the ideas.**

---

## 🌍 The Basic Idea

Imagine you're watching the entire world at once through thousands of windows. Each window shows something happening:
- A conflict in Ukraine
- An earthquake in Japan
- A stock market moving in NY
- A hacking attack from North Korea
- A protest in France

WorldView gathers all these windows, puts them on a map, and **asks an AI: "What's important right now?"**

---

## 🗺️ The Maps (Two Views of the Same World)

WorldView has **two ways to see the world**:

### View 1: The Globe (3D, like Earth)
```
       🌍 (spinning)
      /   \
    (like a globe you spin in school)
```

You can rotate it, zoom in on a country, see things in 3D.

### View 2: The Flat Map (2D, like a poster)
```
┌─────────────────────────┐
│    [flat map view]      │  (like a poster on a wall)
│    with colored layers  │
└─────────────────────────┘
```

You can see everything at once, colors show intensity (heatmap).

**Magic:** When you click something on the globe, it highlights on the flat map too. They stay in sync.

---

## 📡 What Goes ON The Maps? (45 Data Layers)

Each "layer" is a category of information. Like layers in a cake:

```
Layer 45: Economic Data         ←─ Which stock exchanges are open?
Layer 44: Market Signals        ←─ Is crypto going up or down?
Layer 43: Supply Chains         ←─ Any disruptions in shipping?
Layer 42: Cyber Threats         ←─ Any hacking attempts detected?
...
Layer 3: Satellites             ←─ Real-time satellite locations
Layer 2: Flights               ←─ Military/civilian aircraft
Layer 1: Conflicts             ←─ Where are wars/protests happening?
```

You can **turn layers on/off** like a light switch:
- Want to see only conflicts? Tap it on.
- Want to hide markets? Tap it off.

**All 45 layers work on BOTH maps simultaneously.**

---

## 📰 Where Does The Data Come From?

### The Idea
We subscribe to **435+ news feeds** (like following 435 people on Twitter, but automated).

```
New York Times
  ↓
BBC News
  ↓
Reuters
  ↓
Twitter Security Alerts
  ↓
Market Data Feeds
  ↓
Military Tracking (ADS-B)
  ↓
Ocean Ship Tracking (AIS)
  ↓
Earthquake Alerts
  ↓
... 427 more feeds
```

### What Happens
Every feed is constantly checked for updates:
1. **New story appears** → "There's a protest in Paris"
2. **We extract location** → "Paris, France (48.8°N, 2.3°E)"
3. **We mark on map** → 🔴 Red dot appears on Paris
4. **AI analyzes it** → "Moderate threat level, traffic disruptions likely"
5. **Show on dashboard** → You see it instantly

---

## 🧠 The AI Brain (Free Intelligence)

### The Problem
You can see 100 things happening on the map. That's overwhelming. So we ask an AI:

**"Summarize what's important in 1 paragraph"**

The AI reads the news, understands context, and tells you.

### The Solution: 4 Layers of AI (Pick Your Own)

```
Option 1: Run AI on YOUR MACHINE (Ollama)
  ↓
  Fully private, 100% offline
  No internet needed, no cloud, no $$$
  Slower, but YOUR data stays yours

Option 2: Use Groq Cloud (Free Tier)
  ↓
  Fast, free tier available
  Uses internet, but respects privacy
  
Option 3: Use OpenRouter (Pay for what you use)
  ↓
  More AI models to choose from
  Small cost if you use it a lot
  
Option 4: Use Browser AI (Built into your browser)
  ↓
  Slowest, but ALWAYS works
  Requires no external services
  Runs in your browser (Firefox/Chrome)
```

**How it picks:** Start with Option 1 (offline). If offline isn't available, try Option 2 (fast free). If that's unavailable, try Option 3. If everything fails, use Option 4.

**Think of it like:** If Mom (Ollama) is home, ask her. If she's busy, call Grandma (Groq). If she doesn't answer, call Uncle Bob (OpenRouter). If everyone is busy, ask your siblings (Browser T5).

---

## 🎯 The Five Dashboards (Same Engine, Different Focus)

WorldView can focus on **different types of problems** depending on what you care about:

### 🌍 WorldView (Geopolitics)
Shows:
- Military conflicts
- Bases and weapons
- Political events
- Infrastructure risks

**Who uses it:** Journalists, policy makers, military analysts

### 💻 Tech Monitor (Startups & Technology)
Shows:
- New startups
- AI/ML developments
- Cybersecurity threats
- Cloud outages

**Who uses it:** VCs, tech reporters, security teams

### 📈 Finance Monitor (Trading & Markets)
Shows:
- Stock markets
- Crypto prices
- Central bank decisions
- Trade policy changes

**Who uses it:** Traders, investors, financial analysts

### ⚙️ Commodity Monitor (Mining, Energy, Metals)
Shows:
- Commodity prices
- Mining operations
- Energy production
- Supply disruptions

**Who uses it:** Traders, commodity investors, supply chain managers

### 😊 Happy Monitor (Good News)
Shows:
- Scientific breakthroughs
- Positive social trends
- Business successes
- Good human stories

**Who uses it:** Anyone tired of doom scrolling

**The magic:** All 5 are built from the **same 30,000 lines of code**. We just flip different "switches" to show different data.

---

## 💾 How It Works Offline

### The Idea
Most apps require internet. WorldView can work without it.

### How?
You have 3 "caches" (places that store info on your device):

**1. Browser Cache**
- Stores recent maps
- Stores recent news
- Stores recent data

**2. IndexedDB (Your Personal Database)**
- Stores all headlines you've seen
- Stores all locations on the map
- Stores your settings

**3. Service Worker (Background Helper)**
- Runs even when app is closed
- Keeps updating data in background
- Syncs when internet returns

So if internet goes down:
- You can still SEE the maps
- You can still SEARCH old news
- You can still RUN AI (with Ollama)
- When internet returns, it syncs

---

## 🔄 Real-Time Updates (How New Data Flows In)

Think of WorldView like a **news ticker at the bottom of a TV screen**.

```
┌─────────────────────────────────┐
│       WORLDVIEW MAP             │
│                                 │
│   🔴 🔵 🟡                      │ ← Live dots on map
└─────────────────────────────────┘
   ↑ ↑ ↑
   │ │ └─ New ship position (AIS)
   │ └─── New earthquake (USGS)
   └───── New military aircraft (ADS-B)

┌─────────────────────────────────┐
│ 📍 3 NEW EVENTS IN LAST 5 MIN   │
│ • Conflict escalation (Syria)   │
│ • Stock market crash (Tokyo)    │
│ • Shipping delay (Suez)         │
└─────────────────────────────────┘
```

This all happens via **WebSocket** — a channel that stays open so data can flow instantly (like a phone call, not emails).

---

## 🖥️ How Many Pieces Are There?

WorldView isn't one program. It's **22 services working together**:

### Services (the parts)

| Service | Job |
|---------|-----|
| News Aggregator | Reads 435+ feeds |
| Geocoder | Finds locations |
| Classifier | Marks threats (red/orange/yellow/green) |
| Map Renderer | Draws both maps |
| AI Service | Gets summaries from AI |
| User Auth | Logs you in |
| Cache Manager | Stores data locally |
| WebSocket Server | Pushes real-time updates |
| ... | 14 more |

**The magic:** Each service does ONE job really well, and they talk to each other.

It's like an **assembly line in a factory**:
- Station 1: Collect raw materials (news feeds)
- Station 2: Clean them (geocode, classify)
- Station 3: Assemble (put on map)
- Station 4: Quality check (verify data)
- Station 5: Ship to customer (send to browser)

---

## 🏗️ The Full Picture

```
YOUR BROWSER
├─ Map View 1 (3D Globe)
├─ Map View 2 (Flat)
├─ News Feed
├─ AI Summary Panel
└─ Settings

      ↕ (talks to)

BACKEND SERVER (22 services)
├─ News Aggregator (reads 435+ feeds)
├─ Geocoder (finds locations)
├─ Classifier (marks threats)
├─ Cache Manager (stores data)
├─ AI Connector (talks to Ollama/Groq/OpenRouter)
└─ ... 17 more services

      ↕ (talks to)

DATA SOURCES
├─ News sites (RSS feeds)
├─ Military tracking (ADS-B)
├─ Ship tracking (AIS)
├─ Earthquake alerts
├─ Market data
├─ Social media
└─ 100+ more sources

      ↕ (talks to)

YOUR COMPUTER (if using Ollama)
└─ Local AI (Mistral 7B running on your machine)
   (or cloud AI if you prefer)
```

---

## 🚀 Starting WorldView (What Happens Behind the Scenes)

### When you open https://worldview.app:

1. **Browser downloads the app** (from Vercel)
2. **App wakes up services** (in the backend)
3. **Services start fetching news** (from 435+ feeds)
4. **News is classified** (red/orange/yellow/green)
5. **News is located** (lat/lon coordinates)
6. **Map layers are drawn** (both 3D and flat)
7. **AI is called** (summarize what's happening)
8. **WebSocket connection opens** (for real-time updates)
9. **Dashboard loads** (you see it in ~2-3 seconds)
10. **Updates flow in** (new events appear automatically)

---

## 💡 Why This Design?

### Problem 1: Information Overload
**Solution:** AI summarizes thousands of events into important briefs

### Problem 2: Hard to See Context
**Solution:** Map layer shows WHERE things are happening

### Problem 3: No Offline Mode
**Solution:** Cache everything, works without internet

### Problem 4: Too Slow
**Solution:** Real-time WebSocket updates, no refreshing

### Problem 5: Expensive
**Solution:** Free AI (Ollama), free hosting option, no paywalls

### Problem 6: Can't Customize
**Solution:** Open-source code, run your own version

---

## 🎯 The Core Insight

WorldView solves one problem: **"What's happening RIGHT NOW around the world, and should I care?"**

By combining:
- **Maps** (WHERE it's happening)
- **AI** (WHAT it means)
- **Real-time** (WHEN it happened)
- **Free** (SO you can use it)

The answer becomes clear and actionable.

---

**That's the whole idea. Everything else is just making it faster, prettier, and easier.**

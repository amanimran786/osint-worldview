# OSINT Worldview

Compliance-first OSINT Threat Detection & Triage platform for a corporate GSOC team.

![stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![stack](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![stack](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![stack](https://img.shields.io/badge/Celery-37814A?style=flat&logo=celery&logoColor=white)
![stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

---

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│ Backend  │────▶│ Postgres │
│ React+TS │  /api│ FastAPI  │     │          │
└──────────┘     └────┬─────┘     └──────────┘
                      │
                 ┌────▼─────┐     ┌──────────┐
                 │  Celery   │────▶│  Redis   │
                 │  Worker   │     │          │
                 └───────────┘     └──────────┘
```

**Signals flow:** RSS feeds → Celery ingest → keyword-based scoring → Signals table → Analyst triage → Cases

## Features

| Area | What |
|------|------|
| **Ingest** | RSS feed polling (every 15 min via Celery Beat), on-demand poll via API |
| **Scoring** | Keyword-match rules with severity weighting, allowlist/denylist, dedup by URL+title hash |
| **Triage** | Status workflow: New → In Review → Escalated / Dismissed → Closed |
| **Cases** | Group signals into cases, add notes, assign analysts |
| **Rules** | CRUD detection rules with category, severity, keyword lists |
| **Sources** | Manage RSS/JSON/HTML sources, enable/disable, poll individually |
| **Retention** | Auto-cleanup of stale "New" signals older than configurable retention period |
| **Auth** | JWT stub (ready for full RBAC: Analyst, Lead, Admin) |

## Quick Start (Docker)

```bash
# 1. Clone
git clone <repo-url> osint-worldview && cd osint-worldview

# 2. Copy env
cp .env.example .env

# 3. Start everything
docker compose up --build -d

# 4. Seed default sources & rules
docker compose exec backend python scripts/seed.py

# 5. Open the app
open http://localhost:3000
```

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| API Docs  | http://localhost:8000/docs |
| Postgres  | localhost:5432 |
| Redis     | localhost:6379 |

## Local Dev (no Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Update .env to point to local Postgres/Redis
# DATABASE_URL=postgresql+psycopg2://osint:osint@localhost:5432/osint
# REDIS_URL=redis://localhost:6379/0

alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

### Celery Worker

```bash
cd backend
celery -A app.tasks.celery_app:celery worker --loglevel=info
```

### Celery Beat

```bash
cd backend
celery -A app.tasks.celery_app:celery beat --loglevel=info
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:5174  (proxies /api → backend:8000)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health/live` | Liveness probe |
| GET | `/api/health/ready` | Readiness probe |
| GET | `/api/signals/` | List signals (filter: status, source, min_severity) |
| POST | `/api/signals/` | Ingest a signal |
| PATCH | `/api/signals/{id}` | Update signal status/case |
| GET | `/api/rules/` | List rules |
| POST | `/api/rules/` | Create rule |
| PUT | `/api/rules/{id}` | Update rule |
| DELETE | `/api/rules/{id}` | Delete rule |
| GET | `/api/cases/` | List cases |
| POST | `/api/cases/` | Create case |
| PATCH | `/api/cases/{id}` | Update case |
| DELETE | `/api/cases/{id}` | Delete case |
| GET | `/api/cases/{id}/notes` | List notes for case |
| POST | `/api/cases/{id}/notes` | Add note to case |
| GET | `/api/sources/` | List sources |
| POST | `/api/sources/` | Create source |
| PUT | `/api/sources/{id}` | Update source |
| DELETE | `/api/sources/{id}` | Delete source |
| POST | `/api/sources/{id}/poll` | Trigger single source poll |
| POST | `/api/sources/poll-all` | Trigger poll of all sources |
| POST | `/api/auth/token` | Get JWT token (stub) |

## Project Structure

```
osint-worldview/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── .env
│   ├── app/
│   │   ├── main.py
│   │   ├── core/config.py
│   │   ├── db/session.py
│   │   ├── models/entities.py
│   │   ├── schemas/schemas.py
│   │   ├── api/
│   │   │   ├── router.py
│   │   │   └── routes/ (health, signals, rules, cases, sources, auth)
│   │   ├── services/scoring.py
│   │   └── tasks/ (celery_app, ingest)
│   ├── migrations/
│   │   └── versions/0001_init.py
│   └── scripts/seed.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api.ts
        ├── store.ts
        ├── types.ts
        ├── components/ (Sidebar, TopBar, SignalTable, SignalDetail, badges)
        └── pages/ (Dashboard, Signals, Cases, Rules, Sources)
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Axios, Lucide icons |
| Backend | FastAPI, Pydantic v1, SQLAlchemy 2.0 (sync), Alembic |
| Worker | Celery 5.3 + Redis broker/backend |
| Database | PostgreSQL 16 |
| Ingest | feedparser (RSS), requests, httpx |
| Auth | python-jose (JWT), passlib (bcrypt) |
| Deploy | Docker Compose, nginx reverse proxy |

## License

MIT

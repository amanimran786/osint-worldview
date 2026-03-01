# ╔══════════════════════════════════════════════════════════════╗
# ║  OSINT WorldView — Production (unified) Dockerfile         ║
# ║  Stage 1: Build React frontend                             ║
# ║  Stage 2: Python backend serving static + API              ║
# ╚══════════════════════════════════════════════════════════════╝

# ────── Stage 1: Build frontend ──────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package.json frontend/pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile || pnpm install

COPY frontend/ .
RUN pnpm build

# ────── Stage 2: Backend + serve static ──────
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    ENV=production

# Install Python deps (cached layer)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app/ app/
COPY backend/migrations/ migrations/
COPY backend/alembic.ini .
COPY backend/scripts/ scripts/

# Copy built frontend into /app/static
COPY --from=frontend-builder /frontend/dist /app/static

# Non-root user
RUN adduser --disabled-password --gecos "" appuser && \
    mkdir -p /data && \
    chown -R appuser:appuser /app /data
USER appuser

# Railway/Render inject PORT; Fly.io uses 8000
EXPOSE ${PORT:-8000}

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]

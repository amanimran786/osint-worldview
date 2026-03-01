import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.api.router import api_router

logger = logging.getLogger(__name__)

# In production, frontend is built into /app/static
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup / shutdown lifecycle hook."""
    # Startup: auto-create tables for SQLite (local dev)
    if settings.database_url.startswith("sqlite"):
        from app.db.session import engine, Base
        from app.models import entities  # noqa: F401 — register models
        Base.metadata.create_all(bind=engine)
        logger.info("SQLite tables created")
    yield
    # Shutdown: nothing to clean up for now
    logger.info("Application shutdown")


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
    docs_url="/docs" if settings.env == "dev" else None,
    redoc_url="/redoc" if settings.env == "dev" else None,
)

# CORS — use explicit origins from config instead of wildcard
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API routes (must be registered BEFORE the static catch-all) ──
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/api/health/ping")
def health_ping():
    """Lightweight health-check for Railway / load-balancers."""
    return {"status": "ok"}


# ── Serve frontend static files in production ──
if STATIC_DIR.is_dir():
    logger.info("Production mode: serving frontend from %s", STATIC_DIR)

    # Mount /assets for Vite hashed files
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Use a custom 404 handler to implement SPA fallback:
    # Any non-API, non-asset 404 serves index.html for client-side routing
    _index_html = (STATIC_DIR / "index.html").read_text()

    @app.exception_handler(StarletteHTTPException)
    async def spa_fallback(request, exc):
        # Only catch 404s for non-API routes
        if exc.status_code == 404 and not request.url.path.startswith("/api"):
            return HTMLResponse(_index_html, status_code=200)
        # Re-raise other HTTP errors as JSON
        from fastapi.responses import JSONResponse
        return JSONResponse(
            {"detail": exc.detail},
            status_code=exc.status_code,
        )

    # Mount all static files at root (serves index.html, favicon, etc.)
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="spa")

else:
    # Dev mode — no static files, Vite dev server handles frontend
    @app.get("/")
    def root():
        return {"service": settings.app_name, "status": "ok", "env": settings.env}

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

logger = logging.getLogger(__name__)


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

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {"service": settings.app_name, "status": "ok"}

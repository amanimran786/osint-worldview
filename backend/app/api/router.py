from fastapi import APIRouter

from app.api.routes import health, signals, rules, cases, sources, auth

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(signals.router)
api_router.include_router(rules.router)
api_router.include_router(cases.router)
api_router.include_router(sources.router)
api_router.include_router(auth.router)

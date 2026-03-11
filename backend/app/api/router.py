from fastapi import APIRouter

from app.api.routes import health, signals, rules, cases, sources, auth
from app.api.routes import analytics, ai, search, export, geo, websocket, layers
from app.api.routes import domains_v1

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(signals.router)
api_router.include_router(rules.router)
api_router.include_router(cases.router)
api_router.include_router(sources.router)
api_router.include_router(auth.router)
api_router.include_router(analytics.router)
api_router.include_router(ai.router)
api_router.include_router(search.router)
api_router.include_router(export.router)
api_router.include_router(geo.router)
api_router.include_router(websocket.router)
api_router.include_router(layers.router)
api_router.include_router(domains_v1.router)

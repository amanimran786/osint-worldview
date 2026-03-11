"""Domain-style v1 API routes inspired by WorldMonitor service contracts.

These wrappers expose stable domain endpoints while reusing existing
layer and AI route implementations.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.routes import layers, ai
from app.db.session import get_db

router = APIRouter(tags=["domains-v1"])


@router.get("/seismology/v1/list-earthquakes")
async def seismology_list_earthquakes(
    min_magnitude: float = Query(4.0, ge=0, le=10),
    period: str = Query("day", regex="^(hour|day|week|month)$"),
):
    data = await layers.get_earthquakes(min_magnitude=min_magnitude, period=period)
    return {
        "items": data.get("features", []),
        "count": data.get("count", 0),
        "period": data.get("period", period),
    }


@router.get("/climate/v1/list-weather-alerts")
async def climate_list_weather_alerts():
    data = await layers.get_weather_alerts()
    return {
        "items": data.get("weather", []),
        "count": data.get("count", 0),
    }


@router.get("/cyber/v1/list-threat-iocs")
async def cyber_list_threat_iocs(limit: int = Query(100, ge=1, le=500)):
    data = await layers.get_cyber_threats(limit=limit)
    return {
        "items": data.get("threats", []),
        "count": data.get("count", 0),
    }


@router.get("/natural/v1/list-disasters")
async def natural_list_disasters():
    data = await layers.get_disasters()
    return {
        "items": data.get("disasters", []),
        "count": data.get("count", 0),
    }


@router.get("/intelligence/v1/get-world-brief")
def intelligence_get_world_brief(
    limit: int = Query(20, ge=5, le=100),
    db: Session = Depends(get_db),
):
    analysis = ai.analyze_recent_signals(limit=limit, db=db)
    return {
        "analysis": analysis.analysis,
        "threat_level": analysis.threat_level,
        "key_entities": analysis.key_entities,
        "recommended_actions": analysis.recommended_actions,
    }


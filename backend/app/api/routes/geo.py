"""Geospatial API — signals with location data for map visualization."""
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Signal
from app.schemas.schemas import GeoSignalOut

router = APIRouter(prefix="/geo", tags=["geo"])


@router.get("/signals", response_model=List[GeoSignalOut])
def get_geo_signals(
    min_severity: int = Query(0),
    status: str | None = Query(None),
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    """Return signals that have geolocation data, for the map layer."""
    q = db.query(Signal).filter(
        Signal.latitude.isnot(None),
        Signal.longitude.isnot(None),
    )
    if min_severity > 0:
        q = q.filter(Signal.severity >= min_severity)
    if status:
        q = q.filter(Signal.status == status)

    q = q.order_by(Signal.severity.desc(), Signal.created_at.desc())
    return q.limit(limit).all()


@router.get("/heatmap")
def get_heatmap_data(
    db: Session = Depends(get_db),
):
    """Return aggregated country-level signal counts for a choropleth/heatmap."""
    from sqlalchemy import func

    rows = (
        db.query(
            Signal.country_code,
            func.count(Signal.id).label("count"),
            func.avg(Signal.severity).label("avg_severity"),
        )
        .filter(Signal.country_code.isnot(None))
        .group_by(Signal.country_code)
        .order_by(func.count(Signal.id).desc())
        .all()
    )

    return [
        {
            "country_code": row.country_code,
            "count": row.count,
            "avg_severity": round(float(row.avg_severity), 1),
        }
        for row in rows
    ]

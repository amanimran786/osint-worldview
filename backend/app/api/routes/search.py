"""Advanced search API — full-text search across signals with filters."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Signal
from app.schemas.schemas import SignalOut

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=List[SignalOut])
def search_signals(
    q: str = Query(..., min_length=1, max_length=500, description="Search query"),
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    min_severity: Optional[int] = Query(None),
    max_severity: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    country_code: Optional[str] = Query(None),
    has_location: Optional[bool] = Query(None, description="Only signals with geo data"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Full-text search across signal titles, snippets, and sources.

    Supports combined filtering by status, source, severity range,
    category, country, and geolocation presence.
    """
    search_term = f"%{q.lower()}%"

    query = db.query(Signal).filter(
        or_(
            Signal.title.ilike(search_term),
            Signal.snippet.ilike(search_term),
            Signal.source.ilike(search_term),
            Signal.location_name.ilike(search_term),
        )
    )

    # Apply filters
    if status:
        query = query.filter(Signal.status == status)
    if source:
        query = query.filter(Signal.source == source)
    if min_severity is not None:
        query = query.filter(Signal.severity >= min_severity)
    if max_severity is not None:
        query = query.filter(Signal.severity <= max_severity)
    if category:
        query = query.filter(Signal.category == category)
    if country_code:
        query = query.filter(Signal.country_code == country_code)
    if has_location is True:
        query = query.filter(Signal.latitude.isnot(None))

    query = query.order_by(Signal.severity.desc(), Signal.created_at.desc())
    return query.offset(offset).limit(limit).all()

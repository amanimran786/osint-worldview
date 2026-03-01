"""Analytics API — aggregated stats, charts, time series."""
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Signal, Case
from app.schemas.schemas import (
    AnalyticsOut,
    CategoryBreakdown,
    SeverityDistribution,
    SourceBreakdown,
    TimeseriesBucket,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/", response_model=AnalyticsOut)
def get_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Return aggregated analytics for the dashboard."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    # Total counts
    total_signals = db.query(func.count(Signal.id)).scalar() or 0
    new_signals = (
        db.query(func.count(Signal.id))
        .filter(Signal.status == "New")
        .scalar()
        or 0
    )
    critical_signals = (
        db.query(func.count(Signal.id))
        .filter(Signal.severity >= 60)
        .scalar()
        or 0
    )
    open_cases = (
        db.query(func.count(Case.id))
        .filter(Case.status != "Closed")
        .scalar()
        or 0
    )

    # Signals over time (daily buckets)
    signals_over_time = _signals_timeseries(db, cutoff, days)

    # Severity distribution
    severity_dist = _severity_distribution(db)

    # Top sources
    top_sources = _top_sources(db, limit=10)

    # Top categories
    top_categories = _top_categories(db, limit=10)

    return AnalyticsOut(
        total_signals=total_signals,
        new_signals=new_signals,
        critical_signals=critical_signals,
        open_cases=open_cases,
        signals_over_time=signals_over_time,
        severity_distribution=severity_dist,
        top_sources=top_sources,
        top_categories=top_categories,
    )


def _signals_timeseries(db: Session, cutoff: datetime, days: int) -> List[TimeseriesBucket]:
    """Generate daily signal counts for the time range."""
    rows = (
        db.query(
            func.date(Signal.created_at).label("day"),
            func.count(Signal.id).label("cnt"),
        )
        .filter(Signal.created_at >= cutoff)
        .group_by(func.date(Signal.created_at))
        .order_by(func.date(Signal.created_at))
        .all()
    )

    # Build a dict of existing data
    data_map = {str(row.day): row.cnt for row in rows}

    # Fill in missing days with 0
    buckets = []
    today = datetime.now(timezone.utc).date()
    for i in range(days):
        day = today - timedelta(days=days - 1 - i)
        day_str = str(day)
        buckets.append(TimeseriesBucket(date=day_str, count=data_map.get(day_str, 0)))

    return buckets


def _severity_distribution(db: Session) -> SeverityDistribution:
    """Count signals by severity level."""
    rows = db.query(Signal.severity).all()
    dist = SeverityDistribution()
    for (sev,) in rows:
        if sev >= 60:
            dist.critical += 1
        elif sev >= 35:
            dist.high += 1
        elif sev >= 15:
            dist.medium += 1
        else:
            dist.low += 1
    return dist


def _top_sources(db: Session, limit: int = 10) -> List[SourceBreakdown]:
    """Top signal sources by count."""
    rows = (
        db.query(Signal.source, func.count(Signal.id).label("cnt"))
        .group_by(Signal.source)
        .order_by(func.count(Signal.id).desc())
        .limit(limit)
        .all()
    )
    return [SourceBreakdown(source=row.source, count=row.cnt) for row in rows]


def _top_categories(db: Session, limit: int = 10) -> List[CategoryBreakdown]:
    """Top signal categories by count."""
    rows = (
        db.query(Signal.category, func.count(Signal.id).label("cnt"))
        .filter(Signal.category.isnot(None))
        .group_by(Signal.category)
        .order_by(func.count(Signal.id).desc())
        .limit(limit)
        .all()
    )
    return [CategoryBreakdown(category=row.category, count=row.cnt) for row in rows]

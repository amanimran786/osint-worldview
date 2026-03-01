"""Export API — download signals and cases as CSV or JSON."""
import csv
import io
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Signal, Case

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/signals/csv")
def export_signals_csv(
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    min_severity: Optional[int] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    """Export filtered signals as a CSV download."""
    q = db.query(Signal)
    if status:
        q = q.filter(Signal.status == status)
    if source:
        q = q.filter(Signal.source == source)
    if min_severity is not None:
        q = q.filter(Signal.severity >= min_severity)

    signals = q.order_by(Signal.created_at.desc()).limit(limit).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "title", "url", "source", "severity", "status",
        "category", "published_at", "fetched_at",
        "location_name", "country_code", "latitude", "longitude",
        "ai_summary",
    ])
    for sig in signals:
        writer.writerow([
            sig.id, sig.title, sig.url, sig.source, sig.severity, sig.status,
            sig.category or "", str(sig.published_at or ""), str(sig.fetched_at),
            sig.location_name or "", sig.country_code or "",
            sig.latitude or "", sig.longitude or "",
            sig.ai_summary or "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=signals_export.csv"},
    )


@router.get("/signals/json")
def export_signals_json(
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    min_severity: Optional[int] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    """Export filtered signals as a JSON download."""
    q = db.query(Signal)
    if status:
        q = q.filter(Signal.status == status)
    if source:
        q = q.filter(Signal.source == source)
    if min_severity is not None:
        q = q.filter(Signal.severity >= min_severity)

    signals = q.order_by(Signal.created_at.desc()).limit(limit).all()

    data = [
        {
            "id": sig.id,
            "title": sig.title,
            "url": sig.url,
            "source": sig.source,
            "severity": sig.severity,
            "status": sig.status,
            "category": sig.category,
            "published_at": str(sig.published_at) if sig.published_at else None,
            "fetched_at": str(sig.fetched_at),
            "location_name": sig.location_name,
            "country_code": sig.country_code,
            "latitude": sig.latitude,
            "longitude": sig.longitude,
            "ai_summary": sig.ai_summary,
        }
        for sig in signals
    ]

    import orjson
    json_bytes = orjson.dumps(data, option=orjson.OPT_INDENT_2)

    return StreamingResponse(
        iter([json_bytes]),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=signals_export.json"},
    )


@router.get("/cases/csv")
def export_cases_csv(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Export cases as a CSV download."""
    q = db.query(Case)
    if status:
        q = q.filter(Case.status == status)

    cases = q.order_by(Case.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "title", "status", "created_at", "updated_at"])
    for c in cases:
        writer.writerow([c.id, c.title, c.status, str(c.created_at), str(c.updated_at)])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cases_export.csv"},
    )

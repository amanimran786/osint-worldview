from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Signal, Rule, Detection
from app.schemas.schemas import SignalCreate, SignalOut, SignalUpdate
from app.services.scoring import apply_rules, canonical_key
from app.services.geolocation import extract_location

router = APIRouter(prefix="/signals", tags=["signals"])


@router.get("/", response_model=List[SignalOut])
def list_signals(
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    min_severity: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    q = db.query(Signal)
    if status:
        q = q.filter(Signal.status == status)
    if source:
        q = q.filter(Signal.source == source)
    if min_severity is not None:
        q = q.filter(Signal.severity >= min_severity)
    q = q.order_by(Signal.published_at.desc().nullslast(), Signal.id.desc())
    return q.offset(offset).limit(limit).all()


@router.post("/", response_model=SignalOut, status_code=201)
def ingest_signal(payload: SignalCreate, db: Session = Depends(get_db)):
    dedup = canonical_key(payload.url, payload.title)
    existing = db.query(Signal).filter(Signal.dedupe_key == dedup).first()
    if existing:
        return existing

    rules = db.query(Rule).filter(Rule.enabled.is_(True)).all()

    sig = Signal(
        title=payload.title,
        url=payload.url,
        snippet=payload.snippet,
        source=payload.source,
        published_at=payload.published_at,
        category=payload.category,
        dedupe_key=dedup,
    )

    result = apply_rules(sig, rules)
    sig.severity = result.score

    # Extract geolocation from signal text
    geo = extract_location(sig.title, sig.snippet)
    if geo:
        sig.latitude = geo["latitude"]
        sig.longitude = geo["longitude"]
        sig.location_name = geo["location_name"]
        sig.country_code = geo["country_code"]

    db.add(sig)
    db.flush()  # Flush to get sig.id before creating detections

    # Create Detection rows for each triggered rule
    for rule_id in result.triggered_rules:
        det = Detection(
            signal_id=sig.id,
            rule_id=rule_id,
            score=result.score,
            explanation="; ".join(result.explanations),
        )
        db.add(det)

    db.commit()
    db.refresh(sig)
    return sig


@router.patch("/{signal_id}", response_model=SignalOut)
def update_signal(signal_id: int, payload: SignalUpdate, db: Session = Depends(get_db)):
    sig = db.get(Signal, signal_id)
    if not sig:
        raise HTTPException(404, "Signal not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sig, key, value)
    db.commit()
    db.refresh(sig)
    return sig

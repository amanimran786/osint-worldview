"""AI-powered analysis endpoints."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.entities import Signal
from app.schemas.schemas import AISummaryOut, AISummaryRequest, AIAnalysisOut
from app.services.ai_analysis import (
    analyze_signals,
    generate_fallback_summary,
    summarize_signal,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/status")
def ai_status():
    """Check whether AI features are enabled."""
    return {
        "ai_enabled": settings.ai_enabled,
        "model": settings.openai_model if settings.ai_enabled else None,
    }


@router.post("/summarize", response_model=List[AISummaryOut])
def summarize_signals(payload: AISummaryRequest, db: Session = Depends(get_db)):
    """Generate AI summaries for the given signal IDs."""
    results: List[AISummaryOut] = []

    for signal_id in payload.signal_ids[:10]:  # cap at 10 per request
        sig = db.get(Signal, signal_id)
        if not sig:
            continue

        if settings.ai_enabled:
            summary = summarize_signal(sig.title, sig.snippet, sig.source)
        else:
            summary = None

        if not summary:
            summary = generate_fallback_summary(sig.title, sig.snippet)

        # Persist the summary
        sig.ai_summary = summary
        db.commit()

        results.append(AISummaryOut(signal_id=signal_id, summary=summary))

    return results


@router.post("/analyze", response_model=AIAnalysisOut)
def analyze_recent_signals(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """AI analysis of recent signals to identify patterns and threats."""
    signals = (
        db.query(Signal)
        .order_by(Signal.created_at.desc())
        .limit(limit)
        .all()
    )

    if not signals:
        raise HTTPException(404, "No signals to analyze")

    signals_data = [
        {
            "title": s.title,
            "source": s.source,
            "severity": s.severity,
            "category": s.category,
            "snippet": (s.snippet or "")[:200],
        }
        for s in signals
    ]

    if settings.ai_enabled:
        result = analyze_signals(signals_data)
        if result:
            return AIAnalysisOut(**result)

    # Fallback: generate a basic rule-based analysis
    return _fallback_analysis(signals)


def _fallback_analysis(signals) -> AIAnalysisOut:
    """Basic non-AI analysis based on signal metadata."""
    total = len(signals)
    critical = sum(1 for s in signals if s.severity >= 60)
    high = sum(1 for s in signals if 35 <= s.severity < 60)

    # Collect entities (sources and categories)
    sources = list({s.source for s in signals})
    categories = list({s.category for s in signals if s.category})

    # Determine threat level
    if critical > 3 or (critical / max(total, 1)) > 0.2:
        threat_level = "critical"
    elif high > 5 or critical > 0:
        threat_level = "high"
    elif high > 0:
        threat_level = "medium"
    else:
        threat_level = "low"

    analysis = (
        f"Analysis of {total} recent signals: {critical} critical, {high} high severity. "
        f"Active sources: {', '.join(sources[:5])}. "
        f"Categories observed: {', '.join(categories[:5]) or 'uncategorized'}. "
        f"Overall threat posture is assessed as {threat_level}."
    )

    actions = [
        "Review and triage all critical-severity signals",
        "Investigate signals with elevated severity scores",
        "Update detection rules based on emerging patterns",
    ]
    if critical > 0:
        actions.insert(0, "IMMEDIATE: Address critical signals requiring escalation")

    return AIAnalysisOut(
        analysis=analysis,
        threat_level=threat_level,
        key_entities=sources[:5] + categories[:5],
        recommended_actions=actions,
    )

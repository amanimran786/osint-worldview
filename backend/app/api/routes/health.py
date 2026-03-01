from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live")
def liveness():
    return {"status": "ok"}


@router.get("/ready")
def readiness(db: Session = Depends(get_db)):
    """Verify the application can reach the database."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "db": "ok"}
    except Exception as exc:
        return {"status": "degraded", "db": str(exc)}

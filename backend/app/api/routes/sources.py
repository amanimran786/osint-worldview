from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Source
from app.schemas.schemas import SourceCreate, SourceOut

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("/", response_model=List[SourceOut])
def list_sources(db: Session = Depends(get_db)):
    return db.query(Source).order_by(Source.id).all()


@router.post("/", response_model=SourceOut, status_code=201)
def create_source(payload: SourceCreate, db: Session = Depends(get_db)):
    src = Source(**payload.model_dump())
    db.add(src)
    db.commit()
    db.refresh(src)
    return src


@router.get("/{source_id}", response_model=SourceOut)
def get_source(source_id: int, db: Session = Depends(get_db)):
    src = db.get(Source, source_id)
    if not src:
        raise HTTPException(404, "Source not found")
    return src


@router.put("/{source_id}", response_model=SourceOut)
def update_source(source_id: int, payload: SourceCreate, db: Session = Depends(get_db)):
    src = db.get(Source, source_id)
    if not src:
        raise HTTPException(404, "Source not found")
    for k, v in payload.model_dump().items():
        setattr(src, k, v)
    db.commit()
    db.refresh(src)
    return src


@router.delete("/{source_id}", status_code=204)
def delete_source(source_id: int, db: Session = Depends(get_db)):
    src = db.get(Source, source_id)
    if not src:
        raise HTTPException(404, "Source not found")
    db.delete(src)
    db.commit()


@router.post("/{source_id}/poll")
def trigger_poll(source_id: int, db: Session = Depends(get_db)):
    """Enqueue an on-demand poll for a single source via Celery."""
    src = db.get(Source, source_id)
    if not src:
        raise HTTPException(404, "Source not found")
    from app.tasks.ingest import poll_single_source
    task = poll_single_source.delay(source_id)
    return {"task_id": task.id, "source": src.name, "status": "queued"}


@router.post("/poll-all")
def trigger_poll_all():
    """Enqueue a full poll of all enabled sources via Celery."""
    from app.tasks.ingest import poll_all_sources
    task = poll_all_sources.delay()
    return {"task_id": task.id, "status": "queued"}

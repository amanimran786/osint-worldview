from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Case, Note
from app.schemas.schemas import CaseCreate, CaseOut, CaseUpdate, NoteCreate, NoteOut

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("/", response_model=List[CaseOut])
def list_cases(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    q = db.query(Case)
    if status:
        q = q.filter(Case.status == status)
    return q.order_by(Case.id.desc()).offset(offset).limit(limit).all()


@router.post("/", response_model=CaseOut, status_code=201)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    case = Case(**payload.model_dump())
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(404, "Case not found")
    return case


@router.patch("/{case_id}", response_model=CaseOut)
def update_case(case_id: int, payload: CaseUpdate, db: Session = Depends(get_db)):
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(404, "Case not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(case, k, v)
    db.commit()
    db.refresh(case)
    return case


@router.delete("/{case_id}", status_code=204)
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(404, "Case not found")
    db.delete(case)
    db.commit()


# --- Notes sub-resource ---

@router.get("/{case_id}/notes", response_model=List[NoteOut])
def list_notes(case_id: int, db: Session = Depends(get_db)):
    return db.query(Note).filter(Note.case_id == case_id).order_by(Note.id).all()


@router.post("/{case_id}/notes", response_model=NoteOut, status_code=201)
def add_note(case_id: int, payload: NoteCreate, db: Session = Depends(get_db)):
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(404, "Case not found")
    note = Note(case_id=case_id, **payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

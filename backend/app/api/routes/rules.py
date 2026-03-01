from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Rule
from app.schemas.schemas import RuleCreate, RuleOut

router = APIRouter(prefix="/rules", tags=["rules"])


@router.get("/", response_model=List[RuleOut])
def list_rules(db: Session = Depends(get_db)):
    return db.query(Rule).order_by(Rule.id).all()


@router.post("/", response_model=RuleOut, status_code=201)
def create_rule(payload: RuleCreate, db: Session = Depends(get_db)):
    rule = Rule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("/{rule_id}", response_model=RuleOut)
def get_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.get(Rule, rule_id)
    if not rule:
        raise HTTPException(404, "Rule not found")
    return rule


@router.put("/{rule_id}", response_model=RuleOut)
def update_rule(rule_id: int, payload: RuleCreate, db: Session = Depends(get_db)):
    rule = db.get(Rule, rule_id)
    if not rule:
        raise HTTPException(404, "Rule not found")
    for k, v in payload.model_dump().items():
        setattr(rule, k, v)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.get(Rule, rule_id)
    if not rule:
        raise HTTPException(404, "Rule not found")
    db.delete(rule)
    db.commit()

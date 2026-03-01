from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# --------------- Mixin ---------------
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)


# --------------- User ---------------
class User(TimestampMixin, Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="Analyst")  # Analyst, Lead, Admin
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    notes: Mapped[List[Note]] = relationship(back_populates="author")
    assignments: Mapped[List[Assignment]] = relationship(back_populates="assignee")


# --------------- Source ---------------
class Source(TimestampMixin, Base):
    __tablename__ = "sources"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # rss, json, html
    url: Mapped[str] = mapped_column(Text, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)


# --------------- Rule ---------------
class Rule(TimestampMixin, Base):
    __tablename__ = "rules"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[int] = mapped_column(Integer, default=10)
    keywords: Mapped[str] = mapped_column(Text, nullable=False)  # comma-separated
    allowlist: Mapped[Optional[str]] = mapped_column(Text)
    denylist: Mapped[Optional[str]] = mapped_column(Text)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)


# --------------- Case ---------------
class Case(TimestampMixin, Base):
    __tablename__ = "cases"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="New")  # New, In Review, Escalated, Closed

    signals: Mapped[List[Signal]] = relationship(back_populates="case")
    assignments: Mapped[List[Assignment]] = relationship(back_populates="case")
    notes: Mapped[List[Note]] = relationship(back_populates="case")


# --------------- Signal ---------------
class Signal(TimestampMixin, Base):
    __tablename__ = "signals"
    __table_args__ = (
        Index("ix_signals_status_severity", "status", "severity"),
        Index("ix_signals_source", "source"),
        Index("ix_signals_published_at", "published_at"),
        Index("ix_signals_created_at", "created_at"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    snippet: Mapped[Optional[str]] = mapped_column(Text)
    url: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    severity: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50), default="New")
    case_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("cases.id"))
    dedupe_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Geospatial fields (extracted from text)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    location_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    country_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # AI summary
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    case: Mapped[Optional[Case]] = relationship(back_populates="signals")
    notes: Mapped[List[Note]] = relationship(back_populates="signal")
    detections: Mapped[List[Detection]] = relationship(back_populates="signal")


# --------------- Detection ---------------
class Detection(TimestampMixin, Base):
    __tablename__ = "detections"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    signal_id: Mapped[int] = mapped_column(Integer, ForeignKey("signals.id"))
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey("rules.id"))
    score: Mapped[int] = mapped_column(Integer, default=0)
    explanation: Mapped[Optional[str]] = mapped_column(Text)

    signal: Mapped[Signal] = relationship(back_populates="detections")


# --------------- Note ---------------
class Note(TimestampMixin, Base):
    __tablename__ = "notes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    signal_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("signals.id"))
    case_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("cases.id"))
    author_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"))

    signal: Mapped[Optional[Signal]] = relationship(back_populates="notes")
    case: Mapped[Optional[Case]] = relationship(back_populates="notes")
    author: Mapped[Optional[User]] = relationship(back_populates="notes")


# --------------- Assignment ---------------
class Assignment(TimestampMixin, Base):
    __tablename__ = "assignments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("cases.id"))
    assignee_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(50), default="Active")

    case: Mapped[Case] = relationship(back_populates="assignments")
    assignee: Mapped[User] = relationship(back_populates="assignments")


# --------------- AuditLog ---------------
class AuditLog(TimestampMixin, Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    target_type: Mapped[str] = mapped_column(String(100), nullable=False)
    target_id: Mapped[Optional[int]] = mapped_column(Integer)

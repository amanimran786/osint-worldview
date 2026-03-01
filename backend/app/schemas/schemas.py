from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# --------------- Signal ---------------
class SignalCreate(BaseModel):
    title: str
    snippet: Optional[str] = None
    url: str
    source: str
    published_at: Optional[datetime] = None
    category: Optional[str] = None

class SignalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    snippet: Optional[str]
    url: str
    source: str
    published_at: Optional[datetime]
    fetched_at: datetime
    severity: int
    category: Optional[str]
    status: str
    case_id: Optional[int]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    country_code: Optional[str] = None
    ai_summary: Optional[str] = None

class SignalUpdate(BaseModel):
    status: Optional[str] = None
    case_id: Optional[int] = None


# --------------- Rule ---------------
class RuleCreate(BaseModel):
    name: str
    category: str
    severity: int = 10
    keywords: str
    allowlist: Optional[str] = None
    denylist: Optional[str] = None
    enabled: bool = True

class RuleOut(RuleCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


# --------------- Source ---------------
class SourceCreate(BaseModel):
    name: str
    type: str  # rss, json, html
    url: str
    enabled: bool = True

class SourceOut(SourceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


# --------------- Case ---------------
class CaseCreate(BaseModel):
    title: str

class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: str
    created_at: datetime

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None


# --------------- Note ---------------
class NoteCreate(BaseModel):
    content: str
    signal_id: Optional[int] = None
    case_id: Optional[int] = None

class NoteOut(NoteCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: Optional[int]
    created_at: datetime


# --------------- Detection ---------------
class DetectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rule_id: int
    score: int
    explanation: Optional[str]


# --------------- Auth ---------------
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --------------- Analytics ---------------
class TimeseriesBucket(BaseModel):
    date: str
    count: int

class SeverityDistribution(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0
    critical: int = 0

class SourceBreakdown(BaseModel):
    source: str
    count: int

class CategoryBreakdown(BaseModel):
    category: str
    count: int

class AnalyticsOut(BaseModel):
    total_signals: int
    new_signals: int
    critical_signals: int
    open_cases: int
    signals_over_time: List[TimeseriesBucket]
    severity_distribution: SeverityDistribution
    top_sources: List[SourceBreakdown]
    top_categories: List[CategoryBreakdown]


# --------------- AI ---------------
class AISummaryRequest(BaseModel):
    signal_ids: List[int]

class AISummaryOut(BaseModel):
    signal_id: int
    summary: str

class AIAnalysisOut(BaseModel):
    analysis: str
    threat_level: str
    key_entities: List[str]
    recommended_actions: List[str]


# --------------- GeoSignal ---------------
class GeoSignalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    severity: int
    status: str
    source: str
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: Optional[str]
    country_code: Optional[str]

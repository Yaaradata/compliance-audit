from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel


class CreateCycleRequest(BaseModel):
    label: str
    cycle_year: int
    framework_id: UUID | None = None
    start_date: date | None = None
    target_submission_date: date | None = None


class UpdateCycleRequest(BaseModel):
    architecture_type: str | None = None
    label: str | None = None
    phase: str | None = None
    target_submission_date: date | None = None


class CycleOut(BaseModel):
    id: UUID
    tenant_id: UUID
    label: str
    cycle_year: int
    phase: str
    architecture_type: str | None = None
    framework_id: UUID | None = None
    start_date: date | None = None
    target_submission_date: date | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DomainScore(BaseModel):
    id: str
    name: str
    completed: int = 0
    total: int = 0
    score: float = 0


class ControlScore(BaseModel):
    id: str
    name: str
    type: str
    score: float = 0
    status: str = "not_started"
    evidence_count: int = 0


class DashboardResponse(BaseModel):
    overall_score: float = 0
    mandatory_controls: int = 0
    total_controls: int = 0
    evidence_items: int = 0
    total_evidence_items: int = 0
    gaps_identified: int = 0
    domain_scores: list[DomainScore] = []
    control_scores: list[ControlScore] = []
    gaps: list[dict] = []
    suggestions: list[dict] = []

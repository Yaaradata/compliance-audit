from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, computed_field, field_validator


# Roles a compliance officer can create when setting up a cycle (excludes compliance_officer and admin).
CYCLE_TEAM_ROLES = ["it_sme", "internal_reviewer", "external_assessor", "approver"]


class CycleTeamUserCreate(BaseModel):
    """One user to create for this cycle (same tenant as cycle)."""
    role: str
    email: str
    password: str
    name: str = ""

    @field_validator("role")
    @classmethod
    def role_must_be_team_role(cls, v: str) -> str:
        if v not in CYCLE_TEAM_ROLES:
            raise ValueError(f"Role must be one of: {CYCLE_TEAM_ROLES}")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class CycleTeamCreate(BaseModel):
    """Request to create team users for a cycle (compliance officer only)."""
    users: list[CycleTeamUserCreate]


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
    schema_name: str | None = None  # swift_2025 or swift_2026 for diagram/framework data
    start_date: date | None = None
    target_submission_date: date | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def display_id(self) -> str:
        """Human-readable cycle identifier; unique per cycle (derived from id + year)."""
        suffix = str(self.id).replace("-", "").upper()[:6]
        return f"CYC-{self.cycle_year}-{suffix}"


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

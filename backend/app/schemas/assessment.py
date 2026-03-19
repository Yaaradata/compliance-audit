from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, computed_field, field_validator

# Phase keys for timeline (must match CYCLE_PHASES in models/assessment.py)
PHASE_EVIDENCE_UPLOAD = "evidence_upload"
PHASE_L1_REVIEW = "l1_review"
PHASE_L2_REVIEW = "l2_review"
PHASE_APPROVAL = "approval"
TIMELINE_PHASES = [PHASE_EVIDENCE_UPLOAD, PHASE_L1_REVIEW, PHASE_L2_REVIEW, PHASE_APPROVAL]


class PhaseDeadlineInput(BaseModel):
    """Start and end for one phase (evidence_upload, l1_review, l2_review, approval)."""
    start_at: datetime
    end_at: datetime


# Roles a compliance officer can create when setting up a cycle (excludes compliance_officer and admin).
CYCLE_TEAM_ROLES = ["it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor"]


# Map cycle team role to timeline phase (for phase_deadlines when registering users).
ROLE_TO_PHASE = {
    "it_sme": PHASE_EVIDENCE_UPLOAD,
    "internal_reviewer_l1": PHASE_L1_REVIEW,
    "internal_reviewer_l2": PHASE_L2_REVIEW,
    "external_assessor": PHASE_APPROVAL,
}


class CycleTeamUserCreate(BaseModel):
    """One user to create for this cycle (same tenant as cycle). Includes phase start/end for timeline."""
    role: str
    email: str
    password: str
    name: str = ""
    start_at: datetime | None = None
    end_at: datetime | None = None

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
    end_date: date | None = None
    target_submission_date: date | None = None
    """Per-phase deadlines (evidence_upload, l1_review, l2_review, approval). Optional; used for notifications."""
    phase_deadlines: dict[str, PhaseDeadlineInput] | None = None


class UpdateCycleRequest(BaseModel):
    architecture_type: str | None = None
    label: str | None = None
    phase: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    target_submission_date: date | None = None
    phase_deadlines: dict[str, PhaseDeadlineInput] | None = None


class PhaseDeadlineOut(BaseModel):
    phase: str
    start_at: datetime
    end_at: datetime

    model_config = {"from_attributes": True}


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
    end_date: date | None = None
    target_submission_date: date | None = None
    phase_deadlines: list[PhaseDeadlineOut] | None = None
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


class ControlScopingItem(BaseModel):
    """One control's scoping decision for the applicability page."""
    control_id: str
    control_name: str
    type: str  # M or A
    scoping_decision: str  # applicable | not_applicable | risk_accepted
    scoping_justification_text: str | None = None
    scoping_justification_file_path: str | None = None


class ControlScopingUpdateItem(BaseModel):
    control_id: str
    scoping_decision: str  # applicable | not_applicable | risk_accepted
    scoping_justification_text: str | None = None
    scoping_justification_file_path: str | None = None


class ControlScopingUpdateRequest(BaseModel):
    decisions: list[ControlScopingUpdateItem]


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

from __future__ import annotations

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class CreateSubmissionRequest(BaseModel):
    evidence_item_id: str
    scope_key: str | None = None


class EvaluationEditItem(BaseModel):
    """User override for a single criterion (stored in evaluation_edits)."""
    met: bool
    description: str | None = None


class UpdateSubmissionRequest(BaseModel):
    status: str | None = None
    form_data: dict | None = None
    evaluation_result: dict | None = None
    evaluation_edits: dict | None = None


class SubmissionOut(BaseModel):
    id: UUID
    cycle_id: UUID
    evidence_item_id: str
    submitted_by: UUID | None = None
    status: str
    scope_key: str | None = None
    form_data: dict = {}
    completion_pct: float = 0
    version: int = 1
    created_at: datetime
    updated_at: datetime
    """Last AI evaluation result (ticks/crosses) when present; used to show status on revisit."""
    last_evaluation: EvaluateEvidenceResponse | None = None
    """User edits per criterion id: { "<id>": { "met": bool, "description": str|null } }. Kept separate for audit and downstream."""
    evaluation_edits: dict = {}

    model_config = {"from_attributes": True}


class AttachmentOut(BaseModel):
    id: UUID
    submission_id: UUID
    file_name: str
    file_type: str
    file_size_bytes: int = 0
    upload_status: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# --- AI evaluation (placeholder until AI integration) ---


class AiCriterionResultOut(BaseModel):
    id: str
    label: str
    met: bool
    description: str | None = None


class EvaluateEvidenceRequest(BaseModel):
    evidence_item_id: str
    submission_id: UUID | None = None


class EvaluateEvidenceResponse(BaseModel):
    evidence_item_id: str
    overall_met: bool
    """Per-item results for Sufficiency Definition (what must be present). Each met=True means that requirement is satisfied."""
    sufficiency_results: list[AiCriterionResultOut] = []
    """Per-item results for Evaluation Criteria (reviewer checks). description is set when met=False to explain what's missing."""
    criteria: list[AiCriterionResultOut]
    summary: str | None = None

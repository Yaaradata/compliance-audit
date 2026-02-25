from __future__ import annotations

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class CreateSubmissionRequest(BaseModel):
    evidence_item_id: str
    scope_key: str | None = None


class UpdateSubmissionRequest(BaseModel):
    status: str | None = None
    form_data: dict | None = None


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

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

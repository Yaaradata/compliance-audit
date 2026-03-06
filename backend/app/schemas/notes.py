from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class CreateNoteRequest(BaseModel):
    resource_type: str  # evidence_submission, review, approval_gate, gap
    resource_id: UUID
    body: str
    parent_id: UUID | None = None


class NoteOut(BaseModel):
    id: UUID
    tenant_id: UUID
    resource_type: str
    resource_id: UUID
    parent_id: UUID | None = None
    author_id: UUID
    body: str
    created_at: datetime
    author_name: str | None = None

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: UUID
    user_id: UUID
    resource_type: str
    resource_id: UUID
    action: str
    actor_id: UUID | None = None
    title: str | None = None
    body: str | None = None
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}

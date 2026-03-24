from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ArtifactCreateRequest(BaseModel):
    artifact_type: str = "composite"
    evidence_item_id: str
    framework_schema: str
    cscf_version: str
    title: str
    description: str | None = None
    file_path: str | None = None
    file_hash_sha256: str | None = None
    file_size_bytes: int | None = None
    mime_type: str | None = None
    original_filename: str | None = None
    form_data_json: dict[str, Any] | None = None
    submission_id: UUID | None = None
    cycle_id: UUID
    aws_metadata: dict[str, Any] | None = None
    tags: list[str] | None = None
    metadata: dict[str, Any] | None = None


class ArtifactFormDataUpdateRequest(BaseModel):
    form_data_json: dict[str, Any]


class ArtifactUploadFileRequest(BaseModel):
    file_path: str
    file_hash_sha256: str | None = None
    file_size_bytes: int | None = None
    mime_type: str | None = None
    original_filename: str | None = None


class ArtifactStatusTransitionRequest(BaseModel):
    status: str
    comment: str | None = None


class ArtifactReviewRequest(BaseModel):
    decision: str
    comment: str | None = None


class ArtifactReuseRequest(BaseModel):
    source_artifact_id: UUID
    target_cycle_id: UUID
    title: str | None = None
    description: str | None = None
    reconfirmation_note: str | None = None


class ArtifactCommentCreateRequest(BaseModel):
    control_id: str | None = None
    parent_comment_id: UUID | None = None
    body: str = Field(min_length=1)
    tagged_question_keys: list[str] | None = None


class ArtifactOut(BaseModel):
    artifact_id: UUID
    artifact_type: str
    evidence_item_id: str
    framework_schema: str
    cscf_version: str
    title: str
    description: str | None = None
    file_path: str | None = None
    form_data_json: dict[str, Any] | None = None
    submission_id: UUID | None = None
    cycle_id: UUID
    tenant_id: UUID
    created_by: UUID
    status: str
    version: int
    parent_artifact_id: UUID | None = None
    reuse_source_id: UUID | None = None
    aws_metadata: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ArtifactControlLinkOut(BaseModel):
    link_id: UUID
    artifact_id: UUID
    control_id: str
    evidence_item_id: str
    cycle_id: UUID
    tenant_id: UUID
    framework_schema: str
    link_type: str
    sufficiency_status: str
    ai_score: float | None = None
    ai_evaluation_json: dict[str, Any] | None = None
    reviewer_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CrossCheckOut(BaseModel):
    cross_check_id: UUID
    source_link_id: UUID
    source_artifact_id: UUID
    source_evidence_item: str
    source_control_id: str
    target_evidence_item: str
    check_description: str
    target_artifact_id: UUID | None = None
    status: str
    resolution_detail: str | None = None
    cycle_id: UUID
    tenant_id: UUID
    framework_schema: str
    created_at: datetime
    resolved_at: datetime | None = None

    model_config = {"from_attributes": True}


class AuditTrailOut(BaseModel):
    trail_id: UUID
    artifact_id: UUID
    control_id: str | None = None
    cycle_id: UUID
    tenant_id: UUID
    action: str
    from_status: str | None = None
    to_status: str | None = None
    performed_by: UUID
    comment: str | None = None
    action_metadata: dict[str, Any] | None = None
    performed_at: datetime

    model_config = {"from_attributes": True}


class ArtifactCommentOut(BaseModel):
    comment_id: UUID
    artifact_id: UUID
    control_id: str | None = None
    parent_comment_id: UUID | None = None
    author_id: UUID
    author_role: str
    body: str
    tagged_question_keys: list[str] | None = None
    tenant_id: UUID
    is_resolved: bool
    resolved_by: UUID | None = None
    resolved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

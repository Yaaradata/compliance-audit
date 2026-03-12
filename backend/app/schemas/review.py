from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, field_validator

# DB enum review_level uses 'l1_completeness', 'l2_quality', 'l3_assessment'; API exposes L1/L2/L3
DB_TO_LEVEL = {"l1_completeness": "L1", "l2_quality": "L2", "l3_assessment": "L3"}


class CreateReviewRequest(BaseModel):
    submission_id: UUID
    reviewer_id: UUID
    level: str


class UpdateReviewRequest(BaseModel):
    decision: str  # approve, return, escalate
    checklist_results: dict | None = None


class UpdateReviewResponse(BaseModel):
    """After approve: review is the approved one; next_review_id is the new L2/L3 assignment when evidence advances."""
    review: "ReviewOut"
    next_review_id: UUID | None = None


class ReviewOut(BaseModel):
    id: UUID
    submission_id: UUID
    reviewer_id: UUID
    level: str
    status: str
    decision: str | None = None
    assigned_at: datetime
    completed_at: datetime | None = None
    evidence_item_id: str | None = None
    submission_status: str | None = None
    submitter_name: str | None = None

    model_config = {"from_attributes": True}

    @field_validator("level", mode="before")
    @classmethod
    def normalize_level(cls, v: str) -> str:
        return DB_TO_LEVEL.get(v, v)


class ReviewDetailOut(BaseModel):
    """Placeholder for typed detail response."""
    pass


class CreateCommentRequest(BaseModel):
    body: str


class CommentOut(BaseModel):
    id: UUID
    review_id: UUID
    author_id: UUID
    body: str
    is_resolved: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmitForReviewRequest(BaseModel):
    """Optional: persist latest evaluation_edits when submitting so L1 reviewer sees submitter's overrides."""
    evaluation_edits: dict | None = None


class SubmitForReviewResponse(BaseModel):
    submission_id: UUID
    status: str
    review_id: UUID | None = None
    level: str | None = None

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class CreateReviewRequest(BaseModel):
    submission_id: UUID
    reviewer_id: UUID
    level: str


class UpdateReviewRequest(BaseModel):
    decision: str  # approve, return, escalate


class ReviewOut(BaseModel):
    id: UUID
    submission_id: UUID
    reviewer_id: UUID
    level: str
    status: str
    decision: str | None = None
    assigned_at: datetime

    model_config = {"from_attributes": True}


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

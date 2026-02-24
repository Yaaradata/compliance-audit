from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.review import ReviewAssignment, ReviewComment
from ..schemas.review import CreateReviewRequest, UpdateReviewRequest, ReviewOut, CreateCommentRequest, CommentOut

router = APIRouter()


@router.get("/assessments/{cycle_id}/reviews", response_model=list[ReviewOut])
def list_reviews(
    cycle_id: UUID,
    status: str | None = Query(None),
    level: str | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from ..models.assessment import EvidenceSubmission
    sub_ids = [s.id for s in db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()]
    if not sub_ids:
        return []

    q = db.query(ReviewAssignment).filter(ReviewAssignment.submission_id.in_(sub_ids))
    if status:
        q = q.filter(ReviewAssignment.status == status)
    if level:
        q = q.filter(ReviewAssignment.level == level)
    return q.order_by(ReviewAssignment.assigned_at.desc()).all()


@router.post("/assessments/{cycle_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(cycle_id: UUID, req: CreateReviewRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    review = ReviewAssignment(
        submission_id=req.submission_id,
        reviewer_id=req.reviewer_id,
        level=req.level,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/reviews/{review_id}", response_model=ReviewOut)
def get_review(review_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.put("/reviews/{review_id}", response_model=ReviewOut)
def update_review(review_id: UUID, req: UpdateReviewRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    from datetime import datetime, timezone
    review.decision = req.decision
    review.status = "approved" if req.decision == "approve" else "returned" if req.decision == "return" else "escalated"
    review.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(review)
    return review


@router.post("/reviews/{review_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(review_id: UUID, req: CreateCommentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    comment = ReviewComment(
        review_id=review_id,
        author_id=user.id,
        body=req.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

import logging
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import EvidenceSubmission, EvidenceAttachment
from ..models.review import ReviewerChecklist, ReviewAssignment, ReviewComment
from ..schemas.review import (
    CreateReviewRequest,
    UpdateReviewRequest,
    UpdateReviewResponse,
    ReviewOut,
    ReviewDetailOut,
    CreateCommentRequest,
    CommentOut,
    SubmitForReviewResponse,
)
from ..services import storage_service
from ..services import evidence_status as evidence_status_svc
from ..services.batch_loaders import (
    load_submissions_by_ids,
    load_users_by_ids,
    load_attachments_by_submission_ids,
    load_review_comments_by_review_ids,
    batch_sign_urls,
)

router = APIRouter()

REVIEW_LEVELS = ("L1", "L2", "L3")
LEVEL_ROLE_MAP = {"L1": "internal_reviewer", "L2": "internal_reviewer", "L3": "external_assessor"}

# DB uses enum review_level: 'l1_completeness', 'l2_quality', 'l3_assessment'
LEVEL_TO_DB = {"L1": "l1_completeness", "L2": "l2_quality", "L3": "l3_assessment"}
DB_TO_LEVEL = {"l1_completeness": "L1", "l2_quality": "L2", "l3_assessment": "L3"}


def _check_json_to_display_text(check_json: dict, level: str) -> str:
    """Build a short display string from structured L1/L2/L3 check JSON for backward compatibility."""
    # New format: { checklist: [{section, checks[]}, ...], action: {...} }
    checklist = check_json.get("checklist")
    if isinstance(checklist, list) and checklist:
        total_checks = sum(len(s.get("checks") or []) for s in checklist if isinstance(s, dict))
        first_section = checklist[0].get("section", "") if isinstance(checklist[0], dict) else ""
        return f"{first_section} — {total_checks} checks" if first_section else f"{total_checks} checks"
    # Legacy format fallback
    task = check_json.get("task") or ""
    doc = check_json.get("document") or ""
    if level == "L1":
        checks = check_json.get("checks") or []
        return f"{task}: {doc} — {len(checks)} checks" if task else doc
    if level == "L2":
        control = check_json.get("control") or ""
        return f"{task}: {doc} / {control}" if task else (control or doc)
    if level == "L3":
        control = check_json.get("control") or ""
        return f"{task}: {doc} / {control}" if task else (control or doc)
    return doc or task


# ── Review assignment policy ─────────────────────────────────
# When team/roles are assigned: L1/L2 → Internal Reviewer, L3 → External Assessor.
# When Compliance Officer skips team setup: no Internal Reviewer exists, so L1 is
# assigned to Compliance Officer (or any tenant user) so submitted evidence still
# enters the review queue and is viewable/actionable in the Review page.


def _find_reviewer_by_role(db: Session, tenant_id: UUID | None, role: str) -> User | None:
    """Find an active user with the given role in the same tenant."""
    q = db.query(User).filter(User.role == role, User.is_active == True)
    if tenant_id:
        q = q.filter(User.tenant_id == tenant_id)
    return q.first()


def _resolve_l1_reviewer(db: Session, tenant_id: UUID | None) -> User | None:
    """
    Resolve who should perform L1 review for this tenant.
    Priority: Internal Reviewer → Compliance Officer → any tenant user.
    Ensures evidence appears in the review queue and can be viewed/actioned even
    when team setup was skipped.
    """
    reviewer = _find_reviewer_by_role(db, tenant_id, "internal_reviewer")
    if reviewer:
        return reviewer
    reviewer = _find_reviewer_by_role(db, tenant_id, "compliance_officer")
    if reviewer:
        return reviewer
    if not tenant_id:
        return None
    return (
        db.query(User)
        .filter(User.tenant_id == tenant_id, User.is_active == True)
        .first()
    )


def _resolve_reviewer_for_level(db: Session, submission: EvidenceSubmission, level: str) -> User | None:
    """
    Resolve the reviewer for the given level.
    L1: Internal Reviewer → Compliance Officer → any tenant user.
    L2/L3: Prefer role from LEVEL_ROLE_MAP; if none found, use same fallback as L1 so assignments are always created.
    """
    if level == "L1":
        return _resolve_l1_reviewer(db, submission.tenant_id)
    role = LEVEL_ROLE_MAP.get(level)
    reviewer = _find_reviewer_by_role(db, submission.tenant_id, role) if role else None
    if reviewer:
        return reviewer
    return _resolve_l1_reviewer(db, submission.tenant_id)


def _ensure_review_assignment(db: Session, submission: EvidenceSubmission, level: str) -> ReviewAssignment | None:
    """
    Ensure a review assignment exists for this submission at the given level.
    level is logical "L1"/"L2"/"L3"; stored in DB as review_level enum.
    """
    reviewer = _resolve_reviewer_for_level(db, submission, level)
    if not reviewer:
        logger.warning("[REVIEW] No reviewer found for %s level=%s sub=%s", submission.evidence_item_id, level, submission.id)
        return None
    level_db = LEVEL_TO_DB.get(level, level)
    existing = (
        db.query(ReviewAssignment)
        .filter(
            ReviewAssignment.submission_id == submission.id,
            ReviewAssignment.level == level_db,
        )
        .first()
    )
    if existing:
        logger.info("[REVIEW] %s assignment already exists for sub=%s → review=%s", level, submission.id, existing.id)
        return existing
    review = ReviewAssignment(
        submission_id=submission.id,
        reviewer_id=reviewer.id,
        level=level_db,
    )
    db.add(review)
    db.flush()
    logger.info("[REVIEW] Created %s assignment for sub=%s → review=%s reviewer=%s", level, submission.id, review.id, reviewer.id)
    return review


def _advance_submission_after_approve(
    db: Session,
    submission: EvidenceSubmission,
    approved_level: str,
) -> ReviewAssignment | None:
    """
    L1 → L2 → L3 flow: after approving at a level, create the next level assignment
    and set submission status. Returns the new review assignment if created.
    """
    if approved_level == "L1":
        next_review = _ensure_review_assignment(db, submission, "L2")
        submission.status = evidence_status_svc.evidence_status_to_db("in_review_L2")
        return next_review
    if approved_level == "L2":
        next_review = _ensure_review_assignment(db, submission, "L3")
        submission.status = (
            evidence_status_svc.evidence_status_to_db("in_review_L3")
            if next_review
            else evidence_status_svc.evidence_status_to_db("approved")
        )
        return next_review
    if approved_level == "L3":
        submission.status = evidence_status_svc.evidence_status_to_db("approved")
    return None


# ── Submit evidence for review ──────────────────────────────

@router.post("/assessments/{cycle_id}/evidence/{sub_id}/submit")
def submit_for_review(
    cycle_id: UUID,
    sub_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Submit evidence for review. Creates L1 review assignment automatically."""
    if user.role not in ("compliance_officer", "it_sme", "admin"):
        raise HTTPException(status_code=403, detail="Only evidence submitters can submit for review")

    submission = (
        db.query(EvidenceSubmission)
        .filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.status = evidence_status_svc.evidence_status_to_db("submitted")
    submission.submitted_at = datetime.now(timezone.utc)

    review = _ensure_review_assignment(db, submission, "L1")
    db.commit()

    return SubmitForReviewResponse(
        submission_id=sub_id,
        status="submitted",
        review_id=review.id if review else None,
        level="L1" if review else None,
    )


# ── List reviews ────────────────────────────────────────────

@router.get("/assessments/{cycle_id}/reviews", response_model=list[ReviewOut])
def list_reviews(
    cycle_id: UUID,
    status: str | None = Query(None),
    level: str | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    logger.info("list_reviews: start cycle_id=%s", cycle_id)
    try:
        return _list_reviews_impl(cycle_id, status, level, db, user)
    except Exception as e:
        logger.exception("list_reviews failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to load reviews: {str(e)}") from e


def _list_reviews_impl(
    cycle_id: UUID,
    status: str | None,
    level: str | None,
    db: Session,
    user: User,
) -> list:
    submissions_query = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id)
    if user.role not in ("admin", "tenant_admin"):
        submissions_query = submissions_query.filter(EvidenceSubmission.tenant_id == user.tenant_id)
    submissions = submissions_query.all()
    sub_ids = [s.id for s in submissions]
    if not sub_ids:
        return []

    l1_db = LEVEL_TO_DB["L1"]
    l2_db = LEVEL_TO_DB["L2"]
    l3_db = LEVEL_TO_DB["L3"]
    changed = False
    for sub in submissions:
        if sub.status == "submitted":
            has_l1 = (
                db.query(ReviewAssignment)
                .filter(
                    ReviewAssignment.submission_id == sub.id,
                    ReviewAssignment.level == l1_db,
                )
                .first()
            )
            if not has_l1:
                _ensure_review_assignment(db, sub, "L1")
                changed = True
    for sub in submissions:
        l1 = (
            db.query(ReviewAssignment)
            .filter(
                ReviewAssignment.submission_id == sub.id,
                ReviewAssignment.level == l1_db,
                ReviewAssignment.status == "approved",
            )
            .first()
        )
        if not l1:
            continue
        has_l2 = (
            db.query(ReviewAssignment)
            .filter(
                ReviewAssignment.submission_id == sub.id,
                ReviewAssignment.level == l2_db,
            )
            .first()
        )
        if not has_l2:
            _ensure_review_assignment(db, sub, "L2")
            sub.status = evidence_status_svc.evidence_status_to_db("in_review_L2")
            changed = True
    for sub in submissions:
        l2 = (
            db.query(ReviewAssignment)
            .filter(
                ReviewAssignment.submission_id == sub.id,
                ReviewAssignment.level == l2_db,
                ReviewAssignment.status == "approved",
            )
            .first()
        )
        if not l2:
            continue
        has_l3 = (
            db.query(ReviewAssignment)
            .filter(
                ReviewAssignment.submission_id == sub.id,
                ReviewAssignment.level == l3_db,
            )
            .first()
        )
        if not has_l3:
            l3_review = _ensure_review_assignment(db, sub, "L3")
            sub.status = (
                evidence_status_svc.evidence_status_to_db("in_review_L3")
                if l3_review
                else evidence_status_svc.evidence_status_to_db("approved")
            )
            changed = True
    if changed:
        db.commit()

    q = db.query(ReviewAssignment).filter(ReviewAssignment.submission_id.in_(sub_ids))

    if user.role == "internal_reviewer":
        q = q.filter(ReviewAssignment.level.in_([LEVEL_TO_DB["L1"], LEVEL_TO_DB["L2"]]))
    elif user.role == "external_assessor":
        q = q.filter(ReviewAssignment.level == LEVEL_TO_DB["L3"])

    if status:
        q = q.filter(ReviewAssignment.status == status)
    if level:
        level_db = LEVEL_TO_DB.get(level, level)
        q = q.filter(ReviewAssignment.level == level_db)

    reviews = q.order_by(ReviewAssignment.assigned_at.desc()).all()

    review_sub_ids = list({r.submission_id for r in reviews})
    subs_map = load_submissions_by_ids(db, review_sub_ids)

    result = []
    for r in reviews:
        sub = subs_map.get(r.submission_id)
        out = ReviewOut.model_validate(r)
        if sub:
            out.evidence_item_id = sub.evidence_item_id
            out.submission_status = evidence_status_svc.evidence_display_status(sub.status, db, sub.id)
        result.append(out)
    return result


# ── CRUD ────────────────────────────────────────────────────

@router.post("/assessments/{cycle_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    cycle_id: UUID,
    req: CreateReviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = ReviewAssignment(
        submission_id=req.submission_id,
        reviewer_id=req.reviewer_id,
        level=req.level,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewOut.model_validate(review)


@router.get("/reviews/{review_id}", response_model=ReviewOut)
def get_review(
    review_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return ReviewOut.model_validate(review)


@router.get("/reviews/{review_id}/detail")
def get_review_detail(
    review_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Full review detail: submission + attachments (with signed URLs) + AI eval + comments."""
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    submission = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == review.submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user.role not in ("admin", "tenant_admin") and submission.tenant_id != user.tenant_id:
        raise HTTPException(status_code=404, detail="Review not found")

    attachments = (
        db.query(EvidenceAttachment)
        .filter(EvidenceAttachment.submission_id == submission.id)
        .all()
    )

    signed_urls = batch_sign_urls([att.storage_path for att in attachments])
    file_list = [
        {
            "id": str(att.id),
            "file_name": att.file_name,
            "file_type": att.file_type,
            "file_size_bytes": att.file_size_bytes,
            "url": signed_urls.get(att.storage_path),
        }
        for att in attachments
    ]

    comments = (
        db.query(ReviewComment)
        .filter(ReviewComment.review_id == review_id)
        .order_by(ReviewComment.created_at)
        .all()
    )

    reviewer = db.query(User).filter(User.id == review.reviewer_id).first()

    all_reviews = (
        db.query(ReviewAssignment)
        .filter(ReviewAssignment.submission_id == submission.id)
        .order_by(ReviewAssignment.assigned_at)
        .all()
    )

    level_display = DB_TO_LEVEL.get(review.level, review.level)
    level_check_col = {"L1": "l1_check", "L2": "l2_check", "L3": "l3_check"}.get(level_display, "l1_check")

    checklist_rows = (
        db.query(ReviewerChecklist)
        .filter(ReviewerChecklist.item_code == submission.evidence_item_id)
        .order_by(ReviewerChecklist.control_id)
        .all()
    )

    checklist_items = []
    for row in checklist_rows:
        check_data = getattr(row, level_check_col, None)
        if not check_data:
            continue
        # Support both legacy TEXT and JSONB (dict)
        if isinstance(check_data, dict):
            check_json = check_data
            check_text = _check_json_to_display_text(check_json, level_display)
        else:
            check_text = check_data.strip() if isinstance(check_data, str) else ""
            check_json = None
        if not check_text and not check_json:
            continue
        item = {
            "id": str(row.id),
            "control_id": row.control_id,
            "control_name": row.control_name,
            "mandatory_advisory": row.mandatory_advisory,
            "check_text": check_text or "",
        }
        if check_json is not None:
            item["check_json"] = check_json
        checklist_items.append(item)

    saved_results = getattr(review, "checklist_results", None) or {}

    return {
        "review": {
            "id": str(review.id),
            "level": level_display,
            "status": review.status,
            "decision": review.decision,
            "reviewer_id": str(review.reviewer_id),
            "reviewer_name": reviewer.name if reviewer else None,
            "assigned_at": str(review.assigned_at),
            "completed_at": str(review.completed_at) if review.completed_at else None,
            "checklist_results": saved_results,
        },
        "submission": {
            "id": str(submission.id),
            "evidence_item_id": submission.evidence_item_id,
            "status": evidence_status_svc.evidence_display_status(submission.status, db, submission.id),
            "form_data": submission.form_data or {},
            "evaluation_result": submission.evaluation_result,
            "submitted_at": str(submission.submitted_at) if submission.submitted_at else None,
        },
        "attachments": file_list,
        "checklist": checklist_items,
        "comments": [
            {
                "id": str(c.id),
                "author_id": str(c.author_id),
                "body": c.body,
                "is_resolved": c.is_resolved,
                "created_at": str(c.created_at),
            }
            for c in comments
        ],
        "review_history": [
            {
                "id": str(ra.id),
                "level": DB_TO_LEVEL.get(ra.level, ra.level),
                "status": ra.status,
                "decision": ra.decision,
                "assigned_at": str(ra.assigned_at),
                "completed_at": str(ra.completed_at) if ra.completed_at else None,
                "checklist_results": getattr(ra, "checklist_results", None) or {},
            }
            for ra in all_reviews
        ],
    }


@router.put("/reviews/{review_id}", response_model=UpdateReviewResponse)
def update_review(
    review_id: UUID,
    req: UpdateReviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    level_display = DB_TO_LEVEL.get(review.level, review.level)
    is_assignee = user.id == review.reviewer_id
    can_by_role = user.role in ("compliance_officer", "admin") or user.role == LEVEL_ROLE_MAP.get(level_display)
    if not is_assignee and not can_by_role:
        raise HTTPException(status_code=403, detail=f"Not authorized to action this {level_display} review")

    review.decision = req.decision
    review.completed_at = datetime.now(timezone.utc)
    if req.checklist_results is not None:
        review.checklist_results = req.checklist_results

    submission = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == review.submission_id).first()
    next_review: ReviewAssignment | None = None

    if req.decision == "approve":
        review.status = "approved"
        if submission:
            logger.info("[REVIEW] Approving %s review=%s for sub=%s (item=%s)", level_display, review_id, review.submission_id, submission.evidence_item_id)
            try:
                next_review = _advance_submission_after_approve(db, submission, level_display)
                logger.info("[REVIEW] Advance result: next_review=%s", next_review.id if next_review else None)
            except Exception:
                logger.exception("[REVIEW] Error advancing submission after %s approve", level_display)
                raise
    elif req.decision == "return":
        review.status = "returned"
        if submission:
            submission.status = evidence_status_svc.evidence_status_to_db("returned")
    else:
        review.status = "escalated"

    next_review_id = next_review.id if next_review else None
    try:
        db.commit()
        logger.info("[REVIEW] Committed. next_review_id=%s", next_review_id)
    except Exception:
        logger.exception("[REVIEW] Commit failed for review=%s", review_id)
        raise
    db.refresh(review)
    out = ReviewOut.model_validate(review)
    return UpdateReviewResponse(review=out, next_review_id=next_review_id)


# ── Save checklist progress (before approve/return) ─────────

@router.patch("/reviews/{review_id}/checklist")
def save_checklist_progress(
    review_id: UUID,
    body: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Save checklist tick/cross progress while reviewing (auto-save)."""
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    checklist_results = body.get("checklist_results", {})
    review.checklist_results = checklist_results
    db.commit()
    return {"ok": True}


# ── Comments ────────────────────────────────────────────────

@router.get("/reviews/{review_id}/comments", response_model=list[CommentOut])
def list_comments(
    review_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    comments = (
        db.query(ReviewComment)
        .filter(ReviewComment.review_id == review_id)
        .order_by(ReviewComment.created_at)
        .all()
    )
    return [CommentOut.model_validate(c) for c in comments]


@router.post("/reviews/{review_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    review_id: UUID,
    req: CreateCommentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    comment = ReviewComment(
        review_id=review_id,
        author_id=user.id,
        body=req.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentOut.model_validate(comment)


# ── Evidence detail (for any authenticated user) ────────────

@router.get("/assessments/{cycle_id}/evidence/{sub_id}/detail")
def get_evidence_detail(
    cycle_id: UUID,
    sub_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Full evidence detail with signed URLs, form data, AI eval, and review history."""
    submission = (
        db.query(EvidenceSubmission)
        .filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user.role not in ("admin", "tenant_admin", "approver") and submission.tenant_id != user.tenant_id:
        raise HTTPException(status_code=404, detail="Submission not found")

    attachments = (
        db.query(EvidenceAttachment)
        .filter(EvidenceAttachment.submission_id == submission.id)
        .all()
    )

    signed_urls = batch_sign_urls([att.storage_path for att in attachments])
    file_list = [
        {
            "id": str(att.id),
            "file_name": att.file_name,
            "file_type": att.file_type,
            "file_size_bytes": att.file_size_bytes,
            "url": signed_urls.get(att.storage_path),
        }
        for att in attachments
    ]

    reviews = (
        db.query(ReviewAssignment)
        .filter(ReviewAssignment.submission_id == submission.id)
        .order_by(ReviewAssignment.assigned_at)
        .all()
    )

    review_ids = [rev.id for rev in reviews]
    comments_by_review = load_review_comments_by_review_ids(db, review_ids)

    all_author_ids = list({
        c.author_id
        for comments in comments_by_review.values()
        for c in comments
    })
    if submission.submitted_by:
        all_author_ids.append(submission.submitted_by)
    authors_map = load_users_by_ids(db, all_author_ids)

    all_comments = []
    for rev in reviews:
        for c in comments_by_review.get(rev.id, []):
            author = authors_map.get(c.author_id)
            all_comments.append({
                "id": str(c.id),
                "review_id": str(c.review_id),
                "author_id": str(c.author_id),
                "author_name": author.name if author else "Unknown",
                "body": c.body,
                "is_resolved": c.is_resolved,
                "created_at": str(c.created_at),
            })

    submitter = authors_map.get(submission.submitted_by) if submission.submitted_by else None

    submission_status_display = evidence_status_svc.evidence_display_status(submission.status, db, submission.id)
    return {
        "submission": {
            "id": str(submission.id),
            "evidence_item_id": submission.evidence_item_id,
            "status": submission_status_display,
            "form_data": submission.form_data or {},
            "evaluation_result": submission.evaluation_result,
            "submitted_by": str(submission.submitted_by) if submission.submitted_by else None,
            "submitter_name": submitter.name if submitter else None,
            "submitted_at": str(submission.submitted_at) if submission.submitted_at else None,
            "completion_pct": float(submission.completion_pct or 0),
        },
        "attachments": file_list,
        "reviews": [
            {
                "id": str(r.id),
                "level": DB_TO_LEVEL.get(r.level, r.level),
                "status": r.status,
                "decision": r.decision,
                "reviewer_id": str(r.reviewer_id),
                "assigned_at": str(r.assigned_at),
                "completed_at": str(r.completed_at) if r.completed_at else None,
            }
            for r in reviews
        ],
        "comments": all_comments,
    }

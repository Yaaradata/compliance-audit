import logging
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from ..dependencies import get_db, get_db_scoped, get_db_for_review, get_current_user
from ..constants import CYCLE_SCOPED_ROLES, PLATFORM_ADMIN_ROLES, is_cycle_scoped
from ..models.tenant import User
from ..models.assessment import AssessmentCycle, EvidenceSubmission, EvidenceAttachment
from ..models.review import ReviewerChecklist, ReviewAssignment, ReviewComment
from ..schemas.review import (
    CreateReviewRequest,
    UpdateReviewRequest,
    UpdateReviewResponse,
    ReviewOut,
    ReviewDetailOut,
    CreateCommentRequest,
    CommentOut,
    SubmitForReviewRequest,
    SubmitForReviewResponse,
)
from ..services import storage_service
from ..services.assignment_constraints import get_user_cycle_ids, get_user_cycle_role
from ..services import evidence_status as evidence_status_svc
from ..services.batch_loaders import (
    load_submissions_by_ids,
    load_users_by_ids,
    load_attachments_by_submission_ids,
    load_review_comments_by_review_ids,
    batch_sign_urls,
)
from .notifications import create_notification

router = APIRouter()

REVIEW_LEVELS = ("L1", "L2", "L3")


def _require_cycle_access(cycle: AssessmentCycle | None, user: User, db: Session) -> None:
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if is_cycle_scoped(user.role):
        cycle_ids = get_user_cycle_ids(db, user.id)
        if cycle.id not in cycle_ids:
            raise HTTPException(status_code=403, detail="Access denied")
    elif user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if cycle.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
LEVEL_ROLE_MAP = {"L1": "internal_reviewer_l1", "L2": "internal_reviewer_l2", "L3": "external_assessor"}

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
    Priority: internal_reviewer_l1 → compliance_officer → any tenant user.
    """
    reviewer = _find_reviewer_by_role(db, tenant_id, "internal_reviewer_l1")
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


def _resolve_l2_reviewer(db: Session, tenant_id: UUID | None) -> User | None:
    """Resolve who should perform L2 review. Priority: internal_reviewer_l2 → L1 fallback."""
    reviewer = _find_reviewer_by_role(db, tenant_id, "internal_reviewer_l2")
    if reviewer:
        return reviewer
    return _resolve_l1_reviewer(db, tenant_id)


def _resolve_reviewer_for_level(db: Session, submission: EvidenceSubmission, level: str) -> User | None:
    """
    Resolve the reviewer for the given level.
    L1: internal_reviewer_l1 → compliance_officer → any tenant user.
    L2: internal_reviewer_l2 → L1 fallback.
    L3: external_assessor → L1 fallback.
    """
    if level == "L1":
        return _resolve_l1_reviewer(db, submission.tenant_id)
    if level == "L2":
        return _resolve_l2_reviewer(db, submission.tenant_id)
    if level == "L3":
        reviewer = _find_reviewer_by_role(db, submission.tenant_id, "external_assessor")
        if reviewer:
            return reviewer
        return _resolve_l1_reviewer(db, submission.tenant_id)
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
    req: SubmitForReviewRequest = SubmitForReviewRequest(),
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Submit evidence for review. Creates L1 review assignment automatically.
    Accepts optional evaluation_edits to persist submitter's met/note overrides so L1 reviewer sees correct counts."""
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    effective_role = get_user_cycle_role(db, user.id, cycle_id) or user.role
    can_submit = user.role in ("admin", "tenant_admin", "compliance_officer") or effective_role == "it_sme"
    if not can_submit:
        raise HTTPException(status_code=403, detail="Only evidence submitters can submit for review")

    submission = (
        db.query(EvidenceSubmission)
        .filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if req.evaluation_edits is not None:
        submission.evaluation_edits = req.evaluation_edits

    submission.status = evidence_status_svc.evidence_status_to_db("submitted")
    submission.submitted_at = datetime.now(timezone.utc)
    submission.submitted_by = user.id

    review = _ensure_review_assignment(db, submission, "L1")
    review_id = review.id if review else None
    level_out = "L1" if review else None
    db.commit()

    return SubmitForReviewResponse(
        submission_id=sub_id,
        status="submitted",
        review_id=review_id,
        level=level_out,
    )


# ── List reviews ────────────────────────────────────────────

@router.get("/assessments/{cycle_id}/reviews", response_model=list[ReviewOut])
def list_reviews(
    cycle_id: UUID,
    status: str | None = Query(None),
    level: str | None = Query(None),
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)
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
    effective_role = get_user_cycle_role(db, user.id, cycle_id) or user.role
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

    if effective_role == "internal_reviewer_l1":
        q = q.filter(ReviewAssignment.level == LEVEL_TO_DB["L1"])
    elif effective_role == "internal_reviewer_l2":
        q = q.filter(ReviewAssignment.level == LEVEL_TO_DB["L2"])
    elif effective_role == "external_assessor":
        q = q.filter(ReviewAssignment.level == LEVEL_TO_DB["L3"])

    if status:
        q = q.filter(ReviewAssignment.status == status)
        if status == "hold":
            q = q.filter(ReviewAssignment.reviewer_id == user.id)
    if level:
        level_db = LEVEL_TO_DB.get(level, level)
        q = q.filter(ReviewAssignment.level == level_db)

    reviews = q.order_by(ReviewAssignment.assigned_at.desc()).all()

    review_sub_ids = list({r.submission_id for r in reviews})
    subs_map = load_submissions_by_ids(db, review_sub_ids)
    submitter_ids = list({s.submitted_by for s in subs_map.values() if s.submitted_by})
    users_map = load_users_by_ids(db, submitter_ids) if submitter_ids else {}

    result = []
    for r in reviews:
        sub = subs_map.get(r.submission_id)
        if not sub:
            sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == r.submission_id).first()
        out = ReviewOut.model_validate(r)
        if sub:
            out.evidence_item_id = sub.evidence_item_id
            out.submission_status = evidence_status_svc.evidence_display_status(sub.status, db, sub.id)
            if sub.submitted_by:
                submitter = users_map.get(sub.submitted_by)
                out.submitter_name = submitter.name if submitter else None
        result.append(out)
    return result


# ── CRUD ────────────────────────────────────────────────────

@router.post("/assessments/{cycle_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    cycle_id: UUID,
    req: CreateReviewRequest,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

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
    db: Session = Depends(get_db_for_review),
    user: User = Depends(get_current_user),
):
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return ReviewOut.model_validate(review)


@router.get("/reviews/{review_id}/detail")
def get_review_detail(
    review_id: UUID,
    db: Session = Depends(get_db_for_review),
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

    reviewer = db.query(User).filter(User.id == review.reviewer_id).first()

    all_reviews = (
        db.query(ReviewAssignment)
        .filter(ReviewAssignment.submission_id == submission.id)
        .order_by(ReviewAssignment.assigned_at)
        .all()
    )
    review_ids_for_submission = [r.id for r in all_reviews]
    level_by_review_id = {r.id: DB_TO_LEVEL.get(r.level, r.level) for r in all_reviews}

    # Include comments from all review levels so L2 sees L1's comment, etc.
    comments = (
        db.query(ReviewComment)
        .filter(ReviewComment.review_id.in_(review_ids_for_submission))
        .order_by(ReviewComment.created_at)
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
            "cycle_id": str(submission.cycle_id),
            "evidence_item_id": submission.evidence_item_id,
            "status": evidence_status_svc.evidence_display_status(submission.status, db, submission.id),
            "form_data": submission.form_data or {},
            "evaluation_result": submission.evaluation_result,
            "evaluation_edits": getattr(submission, "evaluation_edits", None) or {},
            "submitted_at": str(submission.submitted_at) if submission.submitted_at else None,
        },
        "attachments": file_list,
        "checklist": checklist_items,
        "comments": [
            {
                "id": str(c.id),
                "review_id": str(c.review_id),
                "level": level_by_review_id.get(c.review_id),
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
    db: Session = Depends(get_db_for_review),
    user: User = Depends(get_current_user),
):
    review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    level_display = DB_TO_LEVEL.get(review.level, review.level)
    is_assignee = user.id == review.reviewer_id
    sub_for_role = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == review.submission_id).first()
    eff_role = get_user_cycle_role(db, user.id, sub_for_role.cycle_id) if sub_for_role else None
    active_role = eff_role or user.role
    can_by_role = active_role in ("compliance_officer", "admin") or active_role == LEVEL_ROLE_MAP.get(level_display)
    # When review is on hold, allow any same-tenant user who can see the review to update (hold → approve → L2)
    # (get_db_for_review already enforces same-tenant access, so if we're here they have access)
    can_act_on_hold = False
    if not is_assignee and not can_by_role and (getattr(review, "status", None) or "").lower() == "hold":
        sub_for_hold = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == review.submission_id).first()
        if sub_for_hold and (user.tenant_id is None or sub_for_hold.tenant_id == user.tenant_id):
            can_act_on_hold = True
    if not is_assignee and not can_by_role and not can_act_on_hold:
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
            if submission.submitted_by:
                latest_comment = (
                    db.query(ReviewComment)
                    .filter(ReviewComment.review_id == review_id)
                    .order_by(ReviewComment.created_at.desc())
                    .first()
                )
                body_msg = (
                    latest_comment.body[:300] + ("..." if len(latest_comment.body) > 300 else "")
                    if latest_comment and (latest_comment.body or "").strip()
                    else f"Reviewer requested changes for {submission.evidence_item_id}"
                )
                create_notification(
                    db,
                    user_id=submission.submitted_by,
                    resource_type="evidence_submission",
                    resource_id=submission.id,
                    action="evidence_returned",
                    actor_id=user.id,
                    title="Evidence returned",
                    body=body_msg,
                )
    elif req.decision == "hold":
        review.status = "hold"
        # Submission stays in current state (temp hold); no notification
    else:
        raise HTTPException(status_code=400, detail="decision must be approve, return, or hold")

    next_review_id = next_review.id if next_review else None
    # Build response from in-memory state before commit; after commit the session
    # expires the instance and any attribute access can trigger a failing refresh.
    submission_status_display = (
        evidence_status_svc.evidence_display_status(submission.status, db, submission.id)
        if submission else None
    )
    out_data = {
        "id": review.id,
        "submission_id": review.submission_id,
        "reviewer_id": review.reviewer_id,
        "level": level_display,
        "status": review.status,
        "decision": review.decision,
        "assigned_at": review.assigned_at,
        "completed_at": review.completed_at,
        "evidence_item_id": getattr(submission, "evidence_item_id", None) if submission else None,
        "submission_status": submission_status_display,
        "submitter_name": None,
    }
    try:
        db.commit()
        logger.info("[REVIEW] Committed. next_review_id=%s", next_review_id)
    except Exception:
        logger.exception("[REVIEW] Commit failed for review=%s", review_id)
        raise
    out = ReviewOut.model_validate(out_data)
    return UpdateReviewResponse(review=out, next_review_id=next_review_id)


# ── Save checklist progress (before approve/return) ─────────

@router.patch("/reviews/{review_id}/checklist")
def save_checklist_progress(
    review_id: UUID,
    body: dict,
    db: Session = Depends(get_db_for_review),
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
    db: Session = Depends(get_db_for_review),
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
    db: Session = Depends(get_db_for_review),
    user: User = Depends(get_current_user),
):
    comment = ReviewComment(
        review_id=review_id,
        author_id=user.id,
        body=req.body,
    )
    db.add(comment)
    db.flush()
    # Capture response shape before commit; db.refresh() fails with schema-scoped sessions
    out_data = {
        "id": comment.id,
        "review_id": comment.review_id,
        "author_id": comment.author_id,
        "body": comment.body,
        "is_resolved": getattr(comment, "is_resolved", False),
        "created_at": comment.created_at,
    }
    db.commit()
    return CommentOut.model_validate(out_data)


# ── Evidence detail (for any authenticated user) ────────────

@router.get("/assessments/{cycle_id}/evidence/{sub_id}/detail")
def get_evidence_detail(
    cycle_id: UUID,
    sub_id: UUID,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Full evidence detail with signed URLs, form data, AI eval, and review history."""
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    submission = (
        db.query(EvidenceSubmission)
        .filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user.role not in ("admin", "tenant_admin", "external_assessor") and submission.tenant_id != user.tenant_id:
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
            "evaluation_edits": getattr(submission, "evaluation_edits", None) or {},
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

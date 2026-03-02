"""
Delete all evidence and related data for an assessment cycle.
When a cycle is deleted, this ensures:
- All evidence files are removed from GCS (or local storage)
- All DB rows that reference the cycle or its submissions are removed in the correct order
"""

from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy.orm import Session

from ..models.assessment import EvidenceSubmission, EvidenceAttachment
from ..models.review import ReviewAssignment, ReviewComment
from ..models.sufficiency import SufficiencyScore, SufficiencyEvaluation
from ..models.approval import AssessmentReport
from ..models.vendor import VendorRegistry
from . import storage_service

logger = logging.getLogger(__name__)


def delete_cycle_evidence_and_related(db: Session, cycle_id: UUID) -> dict[str, int]:
    """
    Delete all evidence files from storage (GCS or local) and remove related DB rows
    for the given cycle. Call this before deleting the AssessmentCycle row.

    Order: review comments -> review assignments -> attachment files + attachment rows
           -> submissions -> sufficiency_scores -> reports -> vendors.

    Returns a small summary dict, e.g. {"files_deleted": 5, "attachments": 5, "submissions": 3}.
    """
    stats = {"files_deleted": 0, "files_failed": 0, "attachments": 0, "submissions": 0}

    submissions = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()
    if not submissions:
        _delete_cycle_related_only(db, cycle_id, stats)
        return stats

    submission_ids = [s.id for s in submissions]

    # 1. Review comments for reviews that belong to these submissions
    review_assignments = (
        db.query(ReviewAssignment).filter(ReviewAssignment.submission_id.in_(submission_ids)).all()
    )
    review_ids = [r.id for r in review_assignments]
    if review_ids:
        db.query(ReviewComment).filter(ReviewComment.review_id.in_(review_ids)).delete(
            synchronize_session=False
        )

    # 2. Review assignments for these submissions
    db.query(ReviewAssignment).filter(
        ReviewAssignment.submission_id.in_(submission_ids)
    ).delete(synchronize_session=False)

    # 3. Sufficiency evaluations for these submissions
    db.query(SufficiencyEvaluation).filter(
        SufficiencyEvaluation.submission_id.in_(submission_ids)
    ).delete(synchronize_session=False)

    # 4. Evidence attachments: delete file from storage then delete row
    attachments = (
        db.query(EvidenceAttachment)
        .filter(EvidenceAttachment.submission_id.in_(submission_ids))
        .all()
    )
    for att in attachments:
        if att.storage_path:
            try:
                storage_service.delete(att.storage_path)
                stats["files_deleted"] += 1
            except Exception as e:
                logger.warning(
                    "Failed to delete evidence file from storage: %s (%s)",
                    att.storage_path,
                    e,
                    exc_info=True,
                )
                stats["files_failed"] += 1
        db.delete(att)
        stats["attachments"] += 1

    db.flush()

    # 5. Evidence submissions
    for s in submissions:
        db.delete(s)
        stats["submissions"] += 1
    db.flush()

    # 6. Cycle-scoped data (no submission dependency)
    _delete_cycle_related_only(db, cycle_id, stats)

    return stats


def _delete_cycle_related_only(db: Session, cycle_id: UUID, stats: dict[str, int]) -> None:
    """Delete DB rows that reference the cycle but not submissions."""
    # SufficiencyScore
    db.query(SufficiencyScore).filter(SufficiencyScore.cycle_id == cycle_id).delete(
        synchronize_session=False
    )
    # AssessmentReport
    db.query(AssessmentReport).filter(AssessmentReport.cycle_id == cycle_id).delete(
        synchronize_session=False
    )
    # VendorRegistry
    db.query(VendorRegistry).filter(VendorRegistry.cycle_id == cycle_id).delete(
        synchronize_session=False
    )

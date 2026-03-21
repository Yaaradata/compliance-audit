"""
Delete all evidence and related data for an assessment cycle.
When a cycle is deleted, this ensures:
- All evidence files are removed from GCS (or local storage) for submissions
- All swift_2026 AWS collector evidence (DB + cycle-scoped GCS under aws_evidence/cycles/{cycle_id}/)
- Phase deadline rows in both swift_2025 and swift_2026 (FK to core.assessment_cycles)
- All DB rows that reference the cycle or its submissions are removed in the correct order

core.cycle_user_aws_config rows CASCADE when the cycle row is deleted (no extra step here).

Legacy: AWS JSON objects uploaded before cycle-scoped paths (aws_evidence/aws/... without cycles/{id})
may remain in GCS until removed manually or by a separate cleanup job; DB rows for those runs are still deleted.
"""

from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from ..models.assessment import EvidenceSubmission, EvidenceAttachment
from ..models.review import ReviewAssignment, ReviewComment
from ..models.sufficiency import SufficiencyScore, SufficiencyEvaluation
from ..models.approval import AssessmentReport
from ..models.vendor import VendorRegistry
from . import storage_service

logger = logging.getLogger(__name__)

_FRAMEWORK_SCHEMAS = ("swift_2025", "swift_2026")


def _delete_cycle_phase_deadlines_all_schemas(db: Session, cycle_id: UUID) -> None:
    """Remove timeline rows in every framework schema so FK to core.assessment_cycles does not block delete."""
    for schema in _FRAMEWORK_SCHEMAS:
        try:
            db.execute(
                text(f'DELETE FROM "{schema}"."cycle_phase_deadlines" WHERE cycle_id = :cid'),
                {"cid": cycle_id},
            )
        except Exception as e:
            logger.warning(
                "Could not delete cycle_phase_deadlines in %s for cycle %s: %s",
                schema,
                cycle_id,
                e,
            )
    db.flush()


def _delete_cycle_swift_aws_collector_data(cycle_id: UUID) -> dict[str, int]:
    """
    Remove GCS objects under aws_evidence/cycles/{cycle_id}/ and matching swift_2026 Evidence + CollectorRun rows.
    Uses a dedicated Session on the AWS evidence engine (may differ from main request DB).
    """
    stats = {"aws_gcs_objects_deleted": 0, "aws_evidence_rows": 0, "aws_collector_run_rows": 0}
    rel_prefix = f"aws_evidence/cycles/{cycle_id}/"
    try:
        stats["aws_gcs_objects_deleted"] = storage_service.delete_prefix(rel_prefix)
    except Exception as e:
        logger.warning("Failed to delete AWS evidence GCS prefix %s: %s", rel_prefix, e, exc_info=True)

    try:
        from ..aws_evidence.core.db import SessionLocal as AwsEvidenceSessionLocal
        from ..aws_evidence.services.evidence_service import delete_all_evidence_and_runs_for_cycle
    except Exception as e:
        logger.warning("AWS evidence cleanup imports failed: %s", e)
        return stats

    aws_db = AwsEvidenceSessionLocal()
    try:
        deleted = delete_all_evidence_and_runs_for_cycle(aws_db, cycle_id)
        aws_db.commit()
        stats["aws_evidence_rows"] = int(deleted.get("evidence_deleted", 0))
        stats["aws_collector_run_rows"] = int(deleted.get("collector_runs_deleted", 0))
    except Exception:
        aws_db.rollback()
        logger.exception("Failed to delete swift_2026 evidence/runs for cycle %s", cycle_id)
    finally:
        aws_db.close()

    return stats


def delete_cycle_evidence_and_related(db: Session, cycle_id: UUID) -> dict[str, int]:
    """
    Delete all evidence files from storage (GCS or local) and remove related DB rows
    for the given cycle. Call this before deleting the AssessmentCycle row.

    Order: review comments -> review assignments -> attachment files + attachment rows
           -> submissions -> sufficiency_scores -> reports -> vendors.

    Returns a small summary dict (includes AWS cleanup counts when applicable).
    """
    stats: dict[str, int] = {
        "files_deleted": 0,
        "files_failed": 0,
        "attachments": 0,
        "submissions": 0,
        "aws_gcs_objects_deleted": 0,
        "aws_evidence_rows": 0,
        "aws_collector_run_rows": 0,
    }

    _delete_cycle_phase_deadlines_all_schemas(db, cycle_id)

    submissions = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()
    if not submissions:
        _delete_cycle_related_only(db, cycle_id, stats)
        aws_stats = _delete_cycle_swift_aws_collector_data(cycle_id)
        stats.update(aws_stats)
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

    # 4. Delete all evidence from storage (files and folders) per submission, then DB rows
    #    Using prefix deletion ensures every object under evidence/{sub_id}/ is removed,
    #    including any folder-placeholder blobs, so GCS "folders" are cleaned up.
    attachments = (
        db.query(EvidenceAttachment)
        .filter(EvidenceAttachment.submission_id.in_(submission_ids))
        .all()
    )
    for sub_id in submission_ids:
        try:
            n = storage_service.delete_prefix(f"evidence/{sub_id}/")
            stats["files_deleted"] += n
        except Exception as e:
            logger.warning(
                "Failed to delete evidence prefix for submission %s: %s",
                sub_id,
                e,
                exc_info=True,
            )
            stats["files_failed"] += 1
    for att in attachments:
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

    # 7. AWS collector evidence (swift_2026 DB + GCS under aws_evidence/cycles/{cycle_id}/)
    aws_stats = _delete_cycle_swift_aws_collector_data(cycle_id)
    stats.update(aws_stats)

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

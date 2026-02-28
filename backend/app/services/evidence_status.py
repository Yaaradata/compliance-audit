"""
Map between app evidence status values and DB enum evidence_status.
DB enum: 'draft', 'submitted', 'in_review', 'returned', 'approved', 'escalated'.
App uses in_review_L2 / in_review_L3 for display; DB stores a single 'in_review'.
"""

from uuid import UUID
from sqlalchemy.orm import Session

from ..models.review import ReviewAssignment

# App -> DB (when writing to evidence_submissions.status)
EVIDENCE_STATUS_TO_DB = {
    "draft": "draft",
    "submitted": "submitted",
    "in_review_L2": "in_review",
    "in_review_L3": "in_review",
    "in_review": "in_review",
    "returned": "returned",
    "approved": "approved",
    "escalated": "escalated",
}

# DB level enum values used to derive in_review_L2 vs in_review_L3
_LEVEL_L2_DB = "l2_quality"
_LEVEL_L3_DB = "l3_assessment"


def evidence_status_to_db(status: str) -> str:
    """Convert app status to DB enum value for evidence_submissions.status."""
    return EVIDENCE_STATUS_TO_DB.get(status, status)


def evidence_display_status(status: str, db: Session, submission_id: UUID) -> str:
    """
    Convert DB status to display status for API responses.
    When DB has 'in_review', derive in_review_L2 vs in_review_L3 from review_assignments.
    """
    if status != "in_review":
        return status
    has_l3 = (
        db.query(ReviewAssignment)
        .filter(
            ReviewAssignment.submission_id == submission_id,
            ReviewAssignment.level == _LEVEL_L3_DB,
        )
        .first()
    )
    if has_l3:
        return "in_review_L3"
    has_l2 = (
        db.query(ReviewAssignment)
        .filter(
            ReviewAssignment.submission_id == submission_id,
            ReviewAssignment.level == _LEVEL_L2_DB,
        )
        .first()
    )
    if has_l2:
        return "in_review_L2"
    return "in_review"

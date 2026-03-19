"""
Cascade delete a user from core.users and all referencing records across schemas.
Used when a compliance officer deletes a user from the Users & Groups page.
"""

from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

FRAMEWORK_SCHEMAS = ("swift_2025", "swift_2026")


def delete_user_cascade(db: Session, user_id: UUID) -> None:
    """
    Delete a user and all referencing records across core and framework schemas.
    Order: nullify/delete references first, then delete core.users.
    cycle_user_assignments, cycle_role_assignments, cycle_evidence_assignments,
    and notifications (user_id) have ON DELETE CASCADE and will be auto-deleted.
    Each operation uses a savepoint so a missing table does not abort the transaction.
    """
    params = {"uid": user_id}

    # 1. core.assessment_cycles: created_by (nullable FK)
    _safe_execute(db, text("UPDATE core.assessment_cycles SET created_by = NULL WHERE created_by = :uid"), params)

    # 2–6. Framework-specific tables (swift_2025, swift_2026)
    for schema in FRAMEWORK_SCHEMAS:
        _delete_user_refs_in_schema(db, schema, user_id)

    # 7. public schema (notes, notifications may not exist)
    _delete_user_refs_in_schema(db, "public", user_id)

    # 8. Finally delete the user (CASCADE cleans cycle_* and notifications.user_id)
    db.execute(text("DELETE FROM core.users WHERE id = :uid"), params)


def _safe_execute(db: Session, stmt, params: dict | None = None) -> None:
    """Execute in a savepoint; on failure, rollback savepoint and continue."""
    try:
        with db.begin_nested():
            db.execute(stmt, params or {})
    except Exception:
        pass


def _delete_user_refs_in_schema(db: Session, schema: str, user_id: UUID) -> None:
    """Nullify or delete user references. Each op in a savepoint so one failure doesn't abort the transaction."""
    params = {"uid": user_id}

    _safe_execute(db, text(f'DELETE FROM "{schema}"."notes" WHERE author_id = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."notifications" SET actor_id = NULL WHERE actor_id = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."review_comments" SET resolved_by = NULL WHERE resolved_by = :uid'), params)
    _safe_execute(db, text(f'DELETE FROM "{schema}"."review_comments" WHERE author_id = :uid'), params)
    _safe_execute(db, text(f'DELETE FROM "{schema}"."review_assignments" WHERE reviewer_id = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."evidence_submissions" SET submitted_by = NULL WHERE submitted_by = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."evidence_attachments" SET uploaded_by = NULL WHERE uploaded_by = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."evidence_submission_history" SET changed_by = NULL WHERE changed_by = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."sufficiency_evaluations" SET evaluated_by = NULL WHERE evaluated_by = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."approval_gates" SET approved_by = NULL WHERE approved_by = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."assessment_reports" SET generated_by = NULL WHERE generated_by = :uid'), params)
    _safe_execute(db, text(f'UPDATE "{schema}"."audit_log" SET user_id = NULL WHERE user_id = :uid'), params)

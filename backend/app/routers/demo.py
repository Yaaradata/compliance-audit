"""
Demo autofill router.

POST /demo/autofill/{cycle_id}/{evidence_item_id}
  - Get-or-create a submission for the given cycle + evidence item.
  - Fill form_data from demo."2026_demo" table (same mapping as run_full_cycle.py).
  - Download the matching file from GCS demo/ prefix and attach it.
  - Returns a summary of what was filled/uploaded.

Does NOT run AI evaluation or submit the evidence.
"""

from __future__ import annotations

import hashlib
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db_scoped, get_current_user
from ..models.assessment import (
    AssessmentCycle,
    EvidenceAttachment,
    EvidenceSubmission,
    EvidenceSubmissionHistory,
)
from ..models.tenant import User
from ..services import storage_service
from ..services.demo_autofill_service import (
    match_gcs_demo_file,
    prepare_form_data_from_db,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _submission_snapshot(sub: EvidenceSubmission) -> dict:
    return {
        "status": sub.status,
        "form_data": sub.form_data or {},
        "evaluation_result": sub.evaluation_result,
        "evaluation_edits": getattr(sub, "evaluation_edits", None) or {},
    }


def _get_or_create_submission(
    cycle_id: UUID,
    evidence_item_id: str,
    user: User,
    db: Session,
) -> EvidenceSubmission:
    """Return existing submission or create a new draft."""
    q = db.query(EvidenceSubmission).filter(
        EvidenceSubmission.cycle_id == cycle_id,
        EvidenceSubmission.tenant_id == user.tenant_id,
        EvidenceSubmission.evidence_item_id == evidence_item_id.upper(),
        EvidenceSubmission.scope_key.is_(None),
    )
    existing = q.first()
    if existing:
        return existing

    sub = EvidenceSubmission(
        cycle_id=cycle_id,
        tenant_id=user.tenant_id,
        evidence_item_id=evidence_item_id.upper(),
        submitted_by=user.id,
        scope_key=None,
    )
    db.add(sub)
    db.flush()
    hist = EvidenceSubmissionHistory(
        submission_id=sub.id,
        version=1,
        changed_by=user.id,
        change_type="create",
        snapshot_before=None,
        snapshot_after=_submission_snapshot(sub),
        justification=None,
    )
    db.add(hist)
    db.flush()
    return sub


@router.post("/demo/autofill/{cycle_id}/{evidence_item_id}")
def demo_autofill(
    cycle_id: UUID,
    evidence_item_id: str,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """
    Autofill form data and upload a matching demo file for the given evidence item.
    Reads answers from demo."2026_demo" and a file from GCS demo/ prefix.
    Does not run AI evaluation or submit.
    """
    # Verify cycle exists and user can access it
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.role not in ("admin", "tenant_admin") and cycle.tenant_id != user.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")

    eid = evidence_item_id.strip().upper()

    # Step 1: get-or-create submission
    sub = _get_or_create_submission(cycle_id, eid, user, db)
    submission_id = sub.id

    # Step 2: read form data from DB
    form_data = prepare_form_data_from_db(eid, db)
    fields_filled = len(form_data)

    if form_data:
        merged = dict(sub.form_data or {})
        merged.update(form_data)
        sub.form_data = merged

        # Calculate basic completion pct: filled non-empty keys / total keys
        total_keys = len(merged)
        filled_keys = sum(1 for v in merged.values() if (v or "").strip())
        sub.completion_pct = round((filled_keys / total_keys) * 100, 2) if total_keys else 0

        # Record history snapshot
        next_ver = (
            db.query(EvidenceSubmissionHistory)
            .filter(EvidenceSubmissionHistory.submission_id == submission_id)
            .count()
        ) + 1
        hist = EvidenceSubmissionHistory(
            submission_id=submission_id,
            version=next_ver,
            changed_by=user.id,
            change_type="demo_autofill_form",
            snapshot_before=_submission_snapshot(sub),
            snapshot_after={**_submission_snapshot(sub), "form_data": merged},
            justification="Demo autofill",
        )
        db.add(hist)

    # Step 3: download + attach file from GCS demo/ prefix
    file_uploaded = False
    file_name: str | None = None

    try:
        result = match_gcs_demo_file(eid)
        if result is None:
            logger.info("demo_autofill(%s): no demo file found in GCS — skipping attachment", eid)
    except Exception as exc:
        logger.warning("match_gcs_demo_file(%s) failed: %s", eid, exc, exc_info=True)
        result = None

    if result is not None:
        file_bytes, fname, content_type = result
        sha256 = hashlib.sha256(file_bytes).hexdigest()

        attachment = EvidenceAttachment(
            submission_id=submission_id,
            file_name=fname,
            file_type=content_type,
            file_size_bytes=len(file_bytes),
            storage_path="",
            sha256_hash=sha256,
            uploaded_by=user.id,
        )
        db.add(attachment)
        db.flush()

        relative_path = f"evidence/{submission_id}/{attachment.id}/{fname}"
        storage_path = storage_service.upload(relative_path, file_bytes, content_type)
        attachment.storage_path = storage_path

        # History entry for attachment
        next_ver = (
            db.query(EvidenceSubmissionHistory)
            .filter(EvidenceSubmissionHistory.submission_id == submission_id)
            .count()
        ) + 1
        hist_file = EvidenceSubmissionHistory(
            submission_id=submission_id,
            version=next_ver,
            changed_by=user.id,
            change_type="demo_autofill_attachment",
            snapshot_before=_submission_snapshot(sub),
            snapshot_after=_submission_snapshot(sub),
            justification="Demo autofill file upload",
        )
        db.add(hist_file)

        file_uploaded = True
        file_name = fname

    db.commit()

    return {
        "submission_id": str(submission_id),
        "evidence_item_id": eid,
        "fields_filled": fields_filled,
        "file_uploaded": file_uploaded,
        "file_name": file_name,
    }

"""
Batch-loading utilities to eliminate N+1 query patterns.

Every function takes a DB session and a collection of IDs, executes a single
IN() query, and returns a dict keyed by ID for O(1) lookups in calling code.
"""

from __future__ import annotations

import concurrent.futures
from collections import defaultdict
from uuid import UUID

from sqlalchemy.orm import Session

from ..models.tenant import User
from ..models.assessment import (
    EvidenceSubmission,
    EvidenceAttachment,
    ControlApplicability,
)
from ..models.framework import (
    Control,
    ItemControlMapping,
    EvidenceSufficiencyMatrix,
)
from ..models.review import ReviewAssignment, ReviewComment
from ..models.sufficiency import SufficiencyScore
from ..services import storage_service


# ── Controls ──────────────────────────────────────────

def load_controls_by_ids(db: Session, control_ids: list[str]) -> dict[str, Control]:
    if not control_ids:
        return {}
    rows = db.query(Control).filter(Control.id.in_(control_ids)).all()
    return {r.id: r for r in rows}


# ── Sufficiency scores ────────────────────────────────

def load_sufficiency_scores(
    db: Session, cycle_id: UUID, control_ids: list[str]
) -> dict[str, SufficiencyScore]:
    if not control_ids:
        return {}
    rows = (
        db.query(SufficiencyScore)
        .filter(
            SufficiencyScore.cycle_id == cycle_id,
            SufficiencyScore.control_id.in_(control_ids),
        )
        .all()
    )
    return {r.control_id: r for r in rows}


# ── Evidence submissions ──────────────────────────────

def load_submissions_by_cycle_and_items(
    db: Session, cycle_id: UUID, item_ids: list[str]
) -> dict[str, EvidenceSubmission]:
    """Key = evidence_item_id (assumes one submission per item per cycle)."""
    if not item_ids:
        return {}
    rows = (
        db.query(EvidenceSubmission)
        .filter(
            EvidenceSubmission.cycle_id == cycle_id,
            EvidenceSubmission.evidence_item_id.in_(item_ids),
        )
        .all()
    )
    return {r.evidence_item_id: r for r in rows}


def load_submissions_by_ids(
    db: Session, submission_ids: list[UUID]
) -> dict[UUID, EvidenceSubmission]:
    if not submission_ids:
        return {}
    rows = (
        db.query(EvidenceSubmission)
        .filter(EvidenceSubmission.id.in_(submission_ids))
        .all()
    )
    return {r.id: r for r in rows}


# ── Item-control mappings ─────────────────────────────

def load_mappings_by_control_ids(
    db: Session, control_ids: list[str]
) -> dict[str, list[ItemControlMapping]]:
    if not control_ids:
        return {}
    rows = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.control_id.in_(control_ids))
        .all()
    )
    result: dict[str, list[ItemControlMapping]] = defaultdict(list)
    for r in rows:
        result[r.control_id].append(r)
    return dict(result)


def load_mappings_by_item_ids(
    db: Session, item_ids: list[str]
) -> dict[str, list[ItemControlMapping]]:
    if not item_ids:
        return {}
    rows = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.evidence_item_id.in_(item_ids))
        .all()
    )
    result: dict[str, list[ItemControlMapping]] = defaultdict(list)
    for r in rows:
        result[r.evidence_item_id].append(r)
    return dict(result)


# ── Sufficiency matrix ────────────────────────────────

def load_matrix_by_item_ids(
    db: Session, item_ids: list[str]
) -> dict[str, list[EvidenceSufficiencyMatrix]]:
    if not item_ids:
        return {}
    rows = (
        db.query(EvidenceSufficiencyMatrix)
        .filter(EvidenceSufficiencyMatrix.item_code.in_(item_ids))
        .all()
    )
    result: dict[str, list[EvidenceSufficiencyMatrix]] = defaultdict(list)
    for r in rows:
        result[r.item_code].append(r)
    return dict(result)


# ── Users ─────────────────────────────────────────────

def load_users_by_ids(db: Session, user_ids: list[UUID]) -> dict[UUID, User]:
    if not user_ids:
        return {}
    rows = db.query(User).filter(User.id.in_(user_ids)).all()
    return {r.id: r for r in rows}


# ── Attachments ───────────────────────────────────────

def load_attachments_by_submission_ids(
    db: Session, submission_ids: list[UUID]
) -> dict[UUID, list[EvidenceAttachment]]:
    if not submission_ids:
        return {}
    rows = (
        db.query(EvidenceAttachment)
        .filter(EvidenceAttachment.submission_id.in_(submission_ids))
        .all()
    )
    result: dict[UUID, list[EvidenceAttachment]] = defaultdict(list)
    for r in rows:
        result[r.submission_id].append(r)
    return dict(result)


# ── Review assignments ────────────────────────────────

def load_review_comments_by_review_ids(
    db: Session, review_ids: list[UUID]
) -> dict[UUID, list[ReviewComment]]:
    if not review_ids:
        return {}
    rows = (
        db.query(ReviewComment)
        .filter(ReviewComment.review_id.in_(review_ids))
        .order_by(ReviewComment.created_at)
        .all()
    )
    result: dict[UUID, list[ReviewComment]] = defaultdict(list)
    for r in rows:
        result[r.review_id].append(r)
    return dict(result)


# ── Signed URLs (parallel) ────────────────────────────

def batch_sign_urls(
    storage_paths: list[str], expiry_minutes: int = 15, max_workers: int = 10
) -> dict[str, str | None]:
    """Sign multiple GCS URLs concurrently. Returns {path: url_or_None}."""
    if not storage_paths:
        return {}

    def _sign(path: str) -> tuple[str, str | None]:
        try:
            return path, storage_service.get_signed_url(path, expiry_minutes)
        except Exception:
            return path, None

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as pool:
        results = pool.map(_sign, storage_paths)
    return dict(results)

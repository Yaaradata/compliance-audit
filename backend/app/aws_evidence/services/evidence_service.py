"""Evidence and control read operations for embedded SWIFT AWS evidence."""
from datetime import datetime
import json
import uuid
from uuid import UUID

from sqlalchemy import desc, text
from sqlalchemy.orm import Session

from app.aws_evidence.core import config
from app.aws_evidence.core.db import ensure_schema
from app.aws_evidence.core.hash_utils import sha256_bytes
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.models import CollectorRun, Evidence, EvidenceSufficiencyMatrix
from app.services.storage_service import upload as storage_upload


def get_runs(db: Session, limit: int = 50, tenant_id: UUID | None = None):
    q = db.query(CollectorRun).order_by(desc(CollectorRun.execution_time))
    if tenant_id is not None:
        q = q.filter(CollectorRun.tenant_id == tenant_id)
    return q.limit(limit).all()


def get_run_by_id(db: Session, run_id: UUID):
    return db.query(CollectorRun).filter(CollectorRun.run_id == run_id).first()


def run_belongs_to_tenant(run: CollectorRun | None, tenant_id: UUID | None) -> bool:
    """True if run is accessible for this tenant (run.tenant_id matches or legacy run with null tenant_id and platform admin)."""
    if not run:
        return False
    if run.tenant_id is None:
        return tenant_id is None  # legacy: only platform admin (no tenant) sees
    return tenant_id is not None and run.tenant_id == tenant_id


def evidence_belongs_to_tenant(ev: Evidence | None, tenant_id: UUID | None) -> bool:
    if not ev:
        return False
    if ev.tenant_id is None:
        return tenant_id is None
    return tenant_id is not None and ev.tenant_id == tenant_id



def get_evidence_count_by_run_id(db: Session, run_id: UUID) -> int:
    return db.query(Evidence).filter(Evidence.run_id == run_id).count()


def get_evidence_list(db: Session, limit: int = 200, tenant_id: UUID | None = None):
    q = db.query(Evidence).order_by(desc(Evidence.collected_at))
    if tenant_id is not None:
        q = q.filter(Evidence.tenant_id == tenant_id)
    return q.limit(limit).all()


def get_evidence_by_id(db: Session, evidence_id: UUID):
    return db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()


def get_evidence_for_control(db: Session, control_id: str, tenant_id: UUID | None = None):
    """Collected AWS evidence for this control (always from swift_2026.evidence)."""
    q = db.query(Evidence).filter(Evidence.control_id == control_id)
    if tenant_id is not None:
        q = q.filter(Evidence.tenant_id == tenant_id)
    return q.order_by(Evidence.collected_at.desc()).all()


def _controls_from_2026(db: Session):
    """Read distinct controls from swift_2026.controls (id, name)."""
    try:
        r = db.execute(text("SELECT id, name FROM swift_2026.controls ORDER BY id"))
        return [
            {
                "control_id": row[0],
                "control_name": row[1],
                "item_code": None,
                "mandatory_flag": None,
            }
            for row in r
        ]
    except Exception:
        return []


def _matrix_from_2026(db: Session, control_id: str | None = None):
    """Read swift_2026.evidence_sufficiency_matrix."""
    try:
        if control_id:
            r = db.execute(
                text(
                    "SELECT item_code, control_id, evidence_item_name, control_name, ma "
                    "FROM swift_2026.evidence_sufficiency_matrix "
                    "WHERE control_id = :cid ORDER BY item_code"
                ),
                {"cid": control_id},
            )
        else:
            r = db.execute(
                text(
                    "SELECT item_code, control_id, evidence_item_name, control_name, ma "
                    "FROM swift_2026.evidence_sufficiency_matrix "
                    "ORDER BY control_id, item_code"
                )
            )
        return [
            {
                "item_code": row[0],
                "control_id": row[1],
                "evidence_item_name": row[2],
                "control_name": row[3],
                "ma": row[4],
            }
            for row in r
        ]
    except Exception:
        return []


def get_controls(db: Session):
    """Return list of controls. From swift_2026 when USE_SWIFT_2026 else from evidence_sufficiency_matrix."""
    if config.USE_SWIFT_2026:
        rows = _controls_from_2026(db)
        if rows:
            return rows
    orm_rows = db.query(EvidenceSufficiencyMatrix).all()
    seen: set[str] = set()
    out: list[dict] = []
    for r in orm_rows:
        if r.control_id not in seen:
            seen.add(r.control_id)
            out.append(
                {
                    "control_id": r.control_id,
                    "control_name": r.control_name,
                    "item_code": r.item_code,
                    "mandatory_flag": getattr(r, "ma", getattr(r, "mandatory_flag", None)),
                }
            )
    return out


def get_control_matrix(db: Session):
    """All ESM rows. When USE_SWIFT_2026, returns list of dicts; else ORM rows."""
    if config.USE_SWIFT_2026:
        rows = _matrix_from_2026(db)
        if rows:
            return rows
    return db.query(EvidenceSufficiencyMatrix).all()


def get_control_matrix_for_control(db: Session, control_id: str):
    """ESM rows for one control."""
    if config.USE_SWIFT_2026:
        rows = _matrix_from_2026(db, control_id)
        for r in rows:
            r["mandatory_flag"] = r.get("ma")
        return rows
    orm_rows = (
        db.query(EvidenceSufficiencyMatrix)
        .filter(EvidenceSufficiencyMatrix.control_id == control_id)
        .all()
    )
    return [
        {
            "item_code": r.item_code,
            "control_id": r.control_id,
            "evidence_item_name": r.evidence_item_name,
            "control_name": r.control_name,
            "mandatory_flag": getattr(r, "ma", getattr(r, "mandatory_flag", None)),
        }
        for r in orm_rows
    ]


def get_control_by_id(db: Session, control_id: str):
    """Control name for this control_id."""
    if config.USE_SWIFT_2026:
        try:
            r = db.execute(
                text("SELECT id, name FROM swift_2026.controls WHERE id = :cid"),
                {"cid": control_id},
            )
            row = r.fetchone()
            if row:
                return {"control_id": row[0], "control_name": row[1]}
        except Exception:
            pass
    orm = (
        db.query(EvidenceSufficiencyMatrix)
        .filter(EvidenceSufficiencyMatrix.control_id == control_id)
        .first()
    )
    return {"control_id": control_id, "control_name": orm.control_name if orm else None}


def get_control_ids_with_evidence(db: Session, tenant_id: UUID | None = None) -> list[str]:
    """Return distinct control_ids that have at least one evidence row."""
    q = db.query(Evidence.control_id).distinct()
    if tenant_id is not None:
        q = q.filter(Evidence.tenant_id == tenant_id)
    return [row[0] for row in q.all()]


def delete_run(db: Session, run_id: UUID) -> int:
    """
    Delete a collector run and its evidence rows.
    Returns number of deleted evidence records.
    """
    deleted_evidence = db.query(Evidence).filter(Evidence.run_id == run_id).delete()
    db.query(CollectorRun).filter(CollectorRun.run_id == run_id).delete()
    db.commit()
    return deleted_evidence


def create_manual_evidence(
    db: Session,
    control_id: str,
    item_code: str,
    content: dict,
    evidence_type: str = "manual",
    source_system: str = "manual",
    tenant_id: UUID | None = None,
) -> UUID:
    """Create a collector_run (manual), upload content to GCS, insert evidence with response_json. Returns evidence_id."""
    ensure_schema()
    run_id = uuid.uuid4()
    evidence_id = uuid.uuid4()
    now = datetime.utcnow()
    run = CollectorRun(
        run_id=run_id,
        tenant_id=tenant_id,
        collector_name="manual",
        cloud_provider="n/a",
        execution_time=now,
        status="success",
        trigger_type="manual",
    )
    db.add(run)
    db.flush()
    body = json.dumps(content, indent=2).encode("utf-8")
    key = f"aws_evidence/manual/{control_id}/{item_code}/{evidence_id}.json"
    try:
        storage_upload(key, body, content_type="application/json")
    except Exception:
        pass
    file_hash = sha256_bytes(body)
    safe_content = sanitize_for_jsonb(content)
    ev = Evidence(
        evidence_id=evidence_id,
        run_id=run_id,
        tenant_id=tenant_id,
        item_code=item_code,
        control_id=control_id,
        evidence_type=evidence_type,
        source_system=source_system,
        file_hash=file_hash,
        collected_at=now,
        response_json=safe_content,
    )
    db.add(ev)
    db.commit()
    return evidence_id


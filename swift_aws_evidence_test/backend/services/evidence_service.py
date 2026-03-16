"""Evidence and control read operations for API.
When USE_SWIFT_2026 is true, controls and ESM are read from swift_2026 (same DB)
so the Control View shows the real SWIFT 2026 framework (control-wise). Collected
evidence stays in swift_2025.evidence and is joined by control_id.
"""
import json
import uuid
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import desc, text

from core import config
from core.db import ensure_schema
from models import Evidence, CollectorRun, EvidenceSufficiencyMatrix


def get_runs(db: Session, limit: int = 50):
    return db.query(CollectorRun).order_by(desc(CollectorRun.execution_time)).limit(limit).all()


def get_run_by_id(db: Session, run_id: UUID):
    return db.query(CollectorRun).filter(CollectorRun.run_id == run_id).first()


def get_evidence_count_by_run_id(db: Session, run_id: UUID) -> int:
    return db.query(Evidence).filter(Evidence.run_id == run_id).count()


def get_evidence_list(db: Session, limit: int = 200):
    return db.query(Evidence).order_by(desc(Evidence.collected_at)).limit(limit).all()


def get_evidence_by_id(db: Session, evidence_id: UUID):
    return db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()


def get_evidence_for_control(db: Session, control_id: str):
    """Collected AWS evidence for this control (always from swift_2025.evidence)."""
    return db.query(Evidence).filter(Evidence.control_id == control_id).order_by(Evidence.collected_at.desc()).all()


# ----- Control list and ESM: from swift_2025 (test seed) or swift_2026 (real framework) -----

def _controls_from_2026(db: Session):
    """Read distinct controls from swift_2026.controls (id, name)."""
    try:
        r = db.execute(text("SELECT id, name FROM swift_2026.controls ORDER BY id"))
        return [{"control_id": row[0], "control_name": row[1], "item_code": None, "mandatory_flag": None} for row in r]
    except Exception:
        return []


def _matrix_from_2026(db: Session, control_id: str | None = None):
    """Read swift_2026.evidence_sufficiency_matrix. Returns list of dicts with item_code, control_id, evidence_item_name, control_name, ma."""
    try:
        if control_id:
            r = db.execute(
                text("SELECT item_code, control_id, evidence_item_name, control_name, ma FROM swift_2026.evidence_sufficiency_matrix WHERE control_id = :cid ORDER BY item_code"),
                {"cid": control_id},
            )
        else:
            r = db.execute(text("SELECT item_code, control_id, evidence_item_name, control_name, ma FROM swift_2026.evidence_sufficiency_matrix ORDER BY control_id, item_code"))
        return [{"item_code": row[0], "control_id": row[1], "evidence_item_name": row[2], "control_name": row[3], "ma": row[4]} for row in r]
    except Exception:
        return []


def get_controls(db: Session):
    """Return list of controls. From swift_2026 when USE_SWIFT_2026 else from swift_2025 ESM."""
    if config.USE_SWIFT_2026:
        rows = _controls_from_2026(db)
        if rows:
            return rows
    # Default: from our evidence_sufficiency_matrix (swift_2025)
    orm_rows = db.query(EvidenceSufficiencyMatrix).all()
    seen = set()
    out = []
    for r in orm_rows:
        if r.control_id not in seen:
            seen.add(r.control_id)
            out.append({"control_id": r.control_id, "control_name": r.control_name, "item_code": r.item_code, "mandatory_flag": getattr(r, "ma", getattr(r, "mandatory_flag", None))})
    return out


def get_control_matrix(db: Session):
    """All ESM rows. When USE_SWIFT_2026, returns list of dicts; else ORM rows."""
    if config.USE_SWIFT_2026:
        rows = _matrix_from_2026(db)
        if rows:
            return rows
    return db.query(EvidenceSufficiencyMatrix).all()


def get_control_matrix_for_control(db: Session, control_id: str):
    """ESM rows for one control. Returns list of dicts with item_code, control_id, evidence_item_name, control_name, ma/mandatory_flag."""
    if config.USE_SWIFT_2026:
        rows = _matrix_from_2026(db, control_id)
        for r in rows:
            r["mandatory_flag"] = r.get("ma")
        return rows
    orm_rows = db.query(EvidenceSufficiencyMatrix).filter(EvidenceSufficiencyMatrix.control_id == control_id).all()
    return [{"item_code": r.item_code, "control_id": r.control_id, "evidence_item_name": r.evidence_item_name, "control_name": r.control_name, "mandatory_flag": getattr(r, "ma", getattr(r, "mandatory_flag", None))} for r in orm_rows]


def get_control_by_id(db: Session, control_id: str):
    """Control name for this control_id. Required items from get_control_matrix_for_control."""
    if config.USE_SWIFT_2026:
        try:
            r = db.execute(text("SELECT id, name FROM swift_2026.controls WHERE id = :cid"), {"cid": control_id})
            row = r.fetchone()
            if row:
                return {"control_id": row[0], "control_name": row[1]}
        except Exception:
            pass
    orm = db.query(EvidenceSufficiencyMatrix).filter(EvidenceSufficiencyMatrix.control_id == control_id).first()
    return {"control_id": control_id, "control_name": orm.control_name if orm else None}


def get_control_ids_with_evidence(db: Session) -> list[str]:
    """Return distinct control_ids that have at least one evidence row (for coverage hint)."""
    r = db.query(Evidence.control_id).distinct().all()
    return [row[0] for row in r]


def create_manual_evidence(
    db: Session,
    control_id: str,
    item_code: str,
    content: dict,
    evidence_type: str = "manual",
    source_system: str = "manual",
) -> UUID:
    """Create a collector_run (manual), upload content to S3, insert evidence. Returns evidence_id."""
    ensure_schema()
    from core import s3_storage
    run_id = uuid.uuid4()
    evidence_id = uuid.uuid4()
    now = datetime.utcnow()
    run = CollectorRun(
        run_id=run_id,
        collector_name="manual",
        cloud_provider="n/a",
        execution_time=now,
        status="success",
        trigger_type="manual",
    )
    db.add(run)
    db.flush()
    body = json.dumps(content, indent=2).encode("utf-8")
    key = f"manual/{control_id}/{item_code}/{evidence_id}.json"
    storage_uri, file_hash = s3_storage.upload_evidence_bytes(body, key)
    ev = Evidence(
        evidence_id=evidence_id,
        run_id=run_id,
        item_code=item_code,
        control_id=control_id,
        evidence_type=evidence_type,
        source_system=source_system,
        storage_uri=storage_uri,
        file_hash=file_hash,
        collected_at=now,
    )
    db.add(ev)
    db.commit()
    return evidence_id

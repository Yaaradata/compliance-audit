"""Evidence and control read operations for embedded SWIFT AWS evidence."""
from datetime import datetime
import json
import uuid
from uuid import UUID

from sqlalchemy import desc, func, text
from sqlalchemy.orm import Session

from app.aws_evidence.core import config
from app.aws_evidence.core.db import ensure_schema
from app.aws_evidence.core.hash_utils import sha256_bytes
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.models import CollectorRun, Evidence, EvidenceSufficiencyMatrix
from app.services.storage_service import upload as storage_upload


def get_runs(db: Session, limit: int = 50, tenant_id: UUID | None = None):
    # Order by most recently finished (ended_at) or started (execution_time) so "last run" is first
    order_col = func.coalesce(CollectorRun.ended_at, CollectorRun.execution_time)
    q = db.query(CollectorRun).order_by(desc(order_col))
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


def get_evidence_for_control_grouped_by_run(db: Session, control_id: str, tenant_id: UUID | None = None):
    """
    Collected AWS evidence for this control, grouped by collector run.
    Returns list of dicts: { run_id, execution_time, ended_at, status, trigger_type, evidence_count, evidence }.
    Runs ordered by most recent first; evidence within each run by collected_at desc.
    """
    evidence_list = get_evidence_for_control(db, control_id, tenant_id=tenant_id)
    if not evidence_list:
        return []
    run_ids = list({e.run_id for e in evidence_list})
    runs = {r.run_id: r for r in db.query(CollectorRun).filter(CollectorRun.run_id.in_(run_ids)).all()}
    by_run: dict[UUID, list] = {}
    for e in evidence_list:
        by_run.setdefault(e.run_id, []).append(e)
    # Build run summary with evidence, ordered by run end/start time (most recent first)
    order_col = func.coalesce(CollectorRun.ended_at, CollectorRun.execution_time)
    runs_ordered = (
        db.query(CollectorRun)
        .filter(CollectorRun.run_id.in_(run_ids))
        .order_by(desc(order_col))
        .all()
    )
    out = []
    for run in runs_ordered:
        ev_list = by_run.get(run.run_id, [])
        ev_list.sort(key=lambda x: x.collected_at or datetime.min, reverse=True)
        out.append({
            "run_id": str(run.run_id),
            "execution_time": run.execution_time.isoformat() if run.execution_time else None,
            "ended_at": run.ended_at.isoformat() if run.ended_at else None,
            "status": run.status,
            "trigger_type": run.trigger_type,
            "evidence_count": len(ev_list),
            "evidence": [
                {
                    "evidence_id": str(e.evidence_id),
                    "item_code": e.item_code,
                    "control_id": e.control_id,
                    "evidence_type": e.evidence_type,
                    "source_system": e.source_system,
                    "collected_at": e.collected_at.isoformat() if e.collected_at else None,
                }
                for e in ev_list
            ],
        })
    return out


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


def get_control_item_pairs_with_evidence(db: Session, tenant_id: UUID | None = None) -> list[dict]:
    """
    Return (control_id, control_name, item_code) for each (control_id, item_code) that has at least one evidence row.
    Used so the UI can list one sidebar entry per evidence item (e.g. A2, C2) and show only that item's evidence.
    """
    q = (
        db.query(Evidence.control_id, Evidence.item_code)
        .distinct()
    )
    if tenant_id is not None:
        q = q.filter(Evidence.tenant_id == tenant_id)
    pairs = q.all()
    if not pairs:
        return []
    control_ids = list({c for c, _ in pairs})
    control_names = {}
    for cid in control_ids:
        info = get_control_by_id(db, cid)
        control_names[cid] = info.get("control_name") or cid
    return [
        {"control_id": cid, "control_name": control_names.get(cid), "item_code": item}
        for cid, item in pairs
    ]


def delete_run(db: Session, run_id: UUID) -> int:
    """
    Delete a collector run and its evidence rows.
    Returns number of deleted evidence records.
    """
    deleted_evidence = db.query(Evidence).filter(Evidence.run_id == run_id).delete()
    db.query(CollectorRun).filter(CollectorRun.run_id == run_id).delete()
    db.commit()
    return deleted_evidence


def delete_all_evidence_and_runs_for_tenant(db: Session, tenant_id: UUID) -> dict:
    """
    Delete all evidence and collector runs for the given tenant.
    Returns {"deleted_evidence": int, "deleted_runs": int}.
    """
    deleted_evidence = db.query(Evidence).filter(Evidence.tenant_id == tenant_id).delete()
    deleted_runs = db.query(CollectorRun).filter(CollectorRun.tenant_id == tenant_id).delete()
    db.commit()
    return {"deleted_evidence": deleted_evidence, "deleted_runs": deleted_runs}


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


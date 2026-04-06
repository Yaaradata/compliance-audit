"""Evidence and control read operations for embedded SWIFT AWS evidence."""
from datetime import datetime
import json
import uuid
from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, or_, text
from sqlalchemy.orm import Session

from app.config import settings
from app.aws_evidence.core import config
from app.aws_evidence.core.db import ensure_schema
from app.aws_evidence.core.hash_utils import sha256_bytes
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.models import CollectorRun, Evidence, EvidenceSufficiencyMatrix


def _apply_scope_filter(q, model, tenant_id: UUID | None, cycle_id: UUID | None, user_id: UUID | None):
    if tenant_id is not None:
        q = q.filter(model.tenant_id == tenant_id)
    if cycle_id is not None and hasattr(model, "cycle_id"):
        q = q.filter(model.cycle_id == cycle_id)
    if user_id is not None and hasattr(model, "user_id"):
        q = q.filter(model.user_id == user_id)
    return q
from app.services.storage_service import upload as storage_upload


def _truncate_payload_for_llm(payload: Any, max_chars: int) -> Any:
    """Shrink a single collector payload so one huge snapshot cannot dominate the Vertex prompt."""
    if payload is None:
        return None
    try:
        raw = json.dumps(payload, default=str)
    except Exception:
        raw = str(payload)
    if len(raw) <= max_chars:
        return payload
    return {
        "_llm_truncated": True,
        "_original_json_chars": len(raw),
        "_preview": raw[: max(0, max_chars - 120)],
    }


def _apply_evidence_cloud_provider_filter(q, cloud_provider: str | None):
    """
    Scope evidence queries by denormalized Evidence.cloud_provider.
    Avoids ``run_id IN (SELECT ... collector_runs ...)``, which deadlocks when collects
    update collector_runs while readers hold locks on the subquery scan.
    """
    if not cloud_provider:
        return q
    return q.filter(Evidence.cloud_provider == cloud_provider)


def _apply_evidence_exclude_cloud_provider(q, exclude: str | None):
    """Exclude one provider (e.g. gcp on /cloud/aws/*). Keeps NULL for legacy AWS rows."""
    if not exclude:
        return q
    return q.filter(or_(Evidence.cloud_provider.is_(None), Evidence.cloud_provider != exclude))


def get_runs(
    db: Session,
    limit: int = 50,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    cloud_provider: str | None = None,
    exclude_cloud_provider: str | None = None,
):
    # Order by most recently finished (ended_at) or started (execution_time) so "last run" is first
    order_col = func.coalesce(CollectorRun.ended_at, CollectorRun.execution_time)
    q = db.query(CollectorRun).order_by(desc(order_col))
    q = _apply_scope_filter(q, CollectorRun, tenant_id, cycle_id, user_id)
    if cloud_provider:
        q = q.filter(CollectorRun.cloud_provider == cloud_provider)
    elif exclude_cloud_provider:
        q = q.filter(CollectorRun.cloud_provider != exclude_cloud_provider)
    return q.limit(limit).all()


def get_run_by_id(db: Session, run_id: UUID):
    return db.query(CollectorRun).filter(CollectorRun.run_id == run_id).first()


def run_belongs_to_tenant(
    run: CollectorRun | None,
    tenant_id: UUID | None,
    cycle_id: UUID | None,
    user_id: UUID | None,
) -> bool:
    """True if run is accessible for this tenant+cycle+user scope."""
    if not run:
        return False
    return (
        tenant_id is not None
        and run.tenant_id == tenant_id
        and getattr(run, "cycle_id", None) == cycle_id
        and getattr(run, "user_id", None) == user_id
    )


def evidence_belongs_to_tenant(
    ev: Evidence | None,
    tenant_id: UUID | None,
    cycle_id: UUID | None,
    user_id: UUID | None,
) -> bool:
    if not ev:
        return False
    return (
        tenant_id is not None
        and ev.tenant_id == tenant_id
        and getattr(ev, "cycle_id", None) == cycle_id
        and getattr(ev, "user_id", None) == user_id
    )



def get_evidence_count_by_run_id(db: Session, run_id: UUID) -> int:
    return db.query(Evidence).filter(Evidence.run_id == run_id).count()


def get_evidence_list(
    db: Session,
    limit: int = 200,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    cloud_provider: str | None = None,
    exclude_cloud_provider: str | None = None,
    run_id: UUID | None = None,
):
    q = db.query(Evidence).order_by(desc(Evidence.collected_at))
    q = _apply_scope_filter(q, Evidence, tenant_id, cycle_id, user_id)
    # When run_id is set, avoid `evidence.run_id IN (SELECT ... collector_runs ...)`: that shape
    # deadlocks easily if another session mutates collector_runs (collect/delete) while listing.
    if run_id is not None:
        if cloud_provider:
            run = get_run_by_id(db, run_id)
            if (
                not run
                or getattr(run, "cloud_provider", None) != cloud_provider
                or not run_belongs_to_tenant(run, tenant_id, cycle_id, user_id)
            ):
                return []
        elif exclude_cloud_provider:
            run = get_run_by_id(db, run_id)
            if (
                not run
                or not run_belongs_to_tenant(run, tenant_id, cycle_id, user_id)
                or getattr(run, "cloud_provider", None) == exclude_cloud_provider
            ):
                return []
        q = q.filter(Evidence.run_id == run_id)
    else:
        if cloud_provider:
            q = _apply_evidence_cloud_provider_filter(q, cloud_provider)
        elif exclude_cloud_provider:
            q = _apply_evidence_exclude_cloud_provider(q, exclude_cloud_provider)
    return q.limit(limit).all()


def get_evidence_by_id(db: Session, evidence_id: UUID):
    return db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()


def get_evidence_for_control(
    db: Session,
    control_id: str,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    cloud_provider: str | None = None,
    exclude_cloud_provider: str | None = None,
):
    """Collected evidence for this control (swift_2026.evidence)."""
    q = db.query(Evidence).filter(Evidence.control_id == control_id)
    q = _apply_scope_filter(q, Evidence, tenant_id, cycle_id, user_id)
    if cloud_provider:
        q = _apply_evidence_cloud_provider_filter(q, cloud_provider)
    elif exclude_cloud_provider:
        q = _apply_evidence_exclude_cloud_provider(q, exclude_cloud_provider)
    return q.order_by(Evidence.collected_at.desc()).all()


def get_evidence_for_item_code(
    db: Session,
    item_code: str,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    limit: int = 100,
    cloud_provider: str | None = None,
):
    """Collected evidence rows for a canonical evidence item (e.g. A1, B2). Scoped by tenant/cycle/user."""
    code = (item_code or "").strip().upper()
    q = db.query(Evidence).filter(Evidence.item_code == code)
    q = _apply_scope_filter(q, Evidence, tenant_id, cycle_id, user_id)
    q = _apply_evidence_cloud_provider_filter(q, cloud_provider)
    return q.order_by(desc(Evidence.collected_at)).limit(limit).all()


def scoped_evidence_provider_counts_for_item(
    db: Session,
    item_code: str,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> dict[str, int]:
    """
    Scoped row counts by ``cloud_provider`` for one evidence item (diagnostics when autofill finds no rows).
    """
    code = (item_code or "").strip().upper()
    base = db.query(Evidence).filter(Evidence.item_code == code)
    base = _apply_scope_filter(base, Evidence, tenant_id, cycle_id, user_id)
    total = base.count()
    gcp_n = (
        _apply_scope_filter(
            db.query(Evidence).filter(Evidence.item_code == code, Evidence.cloud_provider == "gcp"),
            Evidence,
            tenant_id,
            cycle_id,
            user_id,
        ).count()
    )
    aws_n = (
        _apply_scope_filter(
            db.query(Evidence).filter(Evidence.item_code == code, Evidence.cloud_provider == "aws"),
            Evidence,
            tenant_id,
            cycle_id,
            user_id,
        ).count()
    )
    azure_n = (
        _apply_scope_filter(
            db.query(Evidence).filter(Evidence.item_code == code, Evidence.cloud_provider == "azure"),
            Evidence,
            tenant_id,
            cycle_id,
            user_id,
        ).count()
    )
    null_n = (
        _apply_scope_filter(
            db.query(Evidence).filter(Evidence.item_code == code, Evidence.cloud_provider.is_(None)),
            Evidence,
            tenant_id,
            cycle_id,
            user_id,
        ).count()
    )
    return {"total": total, "gcp": gcp_n, "aws": aws_n, "azure": azure_n, "cloud_provider_null": null_n}


def build_aws_evidence_bundle_for_llm(
    rows: list,
    max_chars: int | None = None,
    row_json_max_chars: int | None = None,
) -> list[dict]:
    """
    Serialize collector rows for Vertex autofill (AWS or GCP): ``response_json`` plus stable metadata.

    Deduplicates identical payloads via ``file_hash`` (same snapshot reused across controls).
    Each chunk includes ``cloud_provider`` and ``item_code`` from the DB so prompts stay
    provider-accurate when both clouds share one schema.
    """
    cap = max_chars if max_chars is not None else settings.LLM_EVIDENCE_BUNDLE_MAX_CHARS
    row_cap = row_json_max_chars if row_json_max_chars is not None else settings.LLM_EVIDENCE_ROW_JSON_MAX_CHARS
    seen_hashes: set[str] = set()
    bundle: list[dict] = []
    for e in rows or []:
        h = getattr(e, "file_hash", None) or ""
        if h and h in seen_hashes:
            continue
        if h:
            seen_hashes.add(h)
        payload = getattr(e, "response_json", None)
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                payload = {"_truncated_text": (payload or "")[:8000]}
        payload = _truncate_payload_for_llm(payload, row_cap)
        bundle.append(
            {
                "evidence_id": str(getattr(e, "evidence_id", "") or ""),
                "run_id": str(getattr(e, "run_id", "") or ""),
                "item_code": getattr(e, "item_code", None),
                "control_id": getattr(e, "control_id", None),
                "cloud_provider": getattr(e, "cloud_provider", None),
                "source_system": getattr(e, "source_system", None),
                "evidence_type": getattr(e, "evidence_type", None),
                "collected_at": e.collected_at.isoformat() if getattr(e, "collected_at", None) else None,
                "response_json": payload,
            }
        )
    # Cap total serialized size
    text = json.dumps(bundle, default=str)
    while len(text) > cap and len(bundle) > 1:
        bundle = bundle[:-1]
        text = json.dumps(bundle, default=str)
    if len(text) > cap and bundle:
        rj = bundle[0].get("response_json")
        try:
            partial = json.dumps(rj, default=str) if not isinstance(rj, str) else rj
        except Exception:
            partial = str(rj)
        bundle[0]["response_json"] = {
            "_note": "truncated",
            "_partial": partial[: max(cap // 2, 8_000)],
        }
        bundle = bundle[:1]
    return bundle


def get_evidence_for_control_grouped_by_run(
    db: Session,
    control_id: str,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    cloud_provider: str | None = None,
    exclude_cloud_provider: str | None = None,
):
    """
    Collected evidence for this control, grouped by collector run.
    Returns list of dicts: { run_id, execution_time, ended_at, status, trigger_type, evidence_count, evidence }.
    Runs ordered by most recent first; evidence within each run by collected_at desc.
    """
    evidence_list = get_evidence_for_control(
        db,
        control_id,
        tenant_id=tenant_id,
        cycle_id=cycle_id,
        user_id=user_id,
        cloud_provider=cloud_provider,
        exclude_cloud_provider=exclude_cloud_provider,
    )
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


def get_control_ids_with_evidence(
    db: Session,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    cloud_provider: str | None = None,
    exclude_cloud_provider: str | None = None,
) -> list[str]:
    """Return distinct control_ids that have at least one evidence row."""
    q = db.query(Evidence.control_id).distinct()
    q = _apply_scope_filter(q, Evidence, tenant_id, cycle_id, user_id)
    if cloud_provider:
        q = _apply_evidence_cloud_provider_filter(q, cloud_provider)
    elif exclude_cloud_provider:
        q = _apply_evidence_exclude_cloud_provider(q, exclude_cloud_provider)
    return [row[0] for row in q.all()]


def get_control_item_pairs_with_evidence(
    db: Session,
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    cloud_provider: str | None = None,
    exclude_cloud_provider: str | None = None,
) -> list[dict]:
    """
    Return (control_id, control_name, item_code) for each (control_id, item_code) that has at least one evidence row.
    Used so the UI can list one sidebar entry per evidence item (e.g. A2, C2) and show only that item's evidence.
    """
    q = (
        db.query(Evidence.control_id, Evidence.item_code)
        .distinct()
    )
    q = _apply_scope_filter(q, Evidence, tenant_id, cycle_id, user_id)
    if cloud_provider:
        q = _apply_evidence_cloud_provider_filter(q, cloud_provider)
    elif exclude_cloud_provider:
        q = _apply_evidence_exclude_cloud_provider(q, exclude_cloud_provider)
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


def delete_all_evidence_and_runs_for_tenant(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    cloud_provider: str | None = None,
) -> dict:
    """
    Delete evidence and collector runs for the given tenant scope.
    When cloud_provider is \"aws\", all runs except GCP (includes manual / \"n/a\" runs) are removed so GCP evidence stays intact.
    Returns {\"deleted_evidence\": int, \"deleted_runs\": int}.
    """
    run_q = (
        db.query(CollectorRun.run_id)
        .filter(CollectorRun.tenant_id == tenant_id)
        .filter(CollectorRun.cycle_id == cycle_id)
        .filter(CollectorRun.user_id == user_id)
    )
    if cloud_provider == "aws":
        # Keep GCP-only runs; remove AWS collector runs and legacy manual ("n/a") runs from the AWS workflow.
        run_q = run_q.filter(CollectorRun.cloud_provider != "gcp")
    elif cloud_provider is not None:
        run_q = run_q.filter(CollectorRun.cloud_provider == cloud_provider)
    run_ids = [row[0] for row in run_q.all()]
    if not run_ids:
        return {"deleted_evidence": 0, "deleted_runs": 0}
    deleted_evidence = db.query(Evidence).filter(Evidence.run_id.in_(run_ids)).delete(synchronize_session=False)
    deleted_runs = db.query(CollectorRun).filter(CollectorRun.run_id.in_(run_ids)).delete(synchronize_session=False)
    db.commit()
    return {"deleted_evidence": deleted_evidence, "deleted_runs": deleted_runs}


def delete_all_evidence_and_runs_for_cycle(db: Session, cycle_id: UUID) -> dict[str, int]:
    """
    Delete all swift_2026 Evidence and CollectorRun rows for an assessment cycle (all users).
    Evidence rows must be removed first (FK to collector_runs). Caller commits the session.

    Used when deleting an assessment cycle so AWS collector DB state does not outlive the cycle.
    """
    ensure_schema()
    deleted_evidence = db.query(Evidence).filter(Evidence.cycle_id == cycle_id).delete(synchronize_session=False)
    deleted_runs = db.query(CollectorRun).filter(CollectorRun.cycle_id == cycle_id).delete(synchronize_session=False)
    return {"evidence_deleted": deleted_evidence, "collector_runs_deleted": deleted_runs}


def create_manual_evidence(
    db: Session,
    control_id: str,
    item_code: str,
    content: dict,
    evidence_type: str = "manual",
    source_system: str = "manual",
    tenant_id: UUID | None = None,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> UUID:
    """Create a collector_run (manual), upload content to GCS, insert evidence with response_json. Returns evidence_id."""
    ensure_schema()
    run_id = uuid.uuid4()
    evidence_id = uuid.uuid4()
    now = datetime.utcnow()
    run = CollectorRun(
        run_id=run_id,
        tenant_id=tenant_id,
        cycle_id=cycle_id,
        user_id=user_id,
        collector_name="manual",
        cloud_provider="n/a",
        execution_time=now,
        status="success",
        trigger_type="manual",
    )
    db.add(run)
    db.flush()
    body = json.dumps(content, indent=2).encode("utf-8")
    if cycle_id:
        key = f"aws_evidence/cycles/{cycle_id}/manual/{control_id}/{item_code}/{evidence_id}.json"
    else:
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
        cycle_id=cycle_id,
        user_id=user_id,
        item_code=item_code,
        control_id=control_id,
        evidence_type=evidence_type,
        source_system=source_system,
        file_hash=file_hash,
        collected_at=now,
        response_json=safe_content,
        cloud_provider=getattr(run, "cloud_provider", None) or "aws",
    )
    db.add(ev)
    db.commit()
    return evidence_id


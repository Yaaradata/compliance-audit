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

DIAGRAM_COMPARE_SOURCE_SYSTEMS = frozenset({"aws-ec2", "aws-encryption"})
DIAGRAM_GCP_COMPARE_SOURCE_SYSTEMS = frozenset({"gcp-inventory", "gcp-cloudasset"})
DIAGRAM_AZURE_COMPARE_SOURCE_SYSTEMS = frozenset({"azure_component_inventory"})


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


def _apply_evidence_cloud_provider_filter_for_autofill(q, cloud_provider: str | None):
    """
    Evidence rows for Vertex autofill (per-item).

    For **aws**, include ``cloud_provider IS NULL`` rows: legacy collectors wrote evidence before
    denormalization, or backfill did not run; those rows are AWS-only in practice. For **gcp** /
    **azure**, require an explicit match so NULL rows are not mis-attributed.
    """
    if not cloud_provider:
        return q
    if cloud_provider == "aws":
        return q.filter(or_(Evidence.cloud_provider == "aws", Evidence.cloud_provider.is_(None)))
    return q.filter(Evidence.cloud_provider == cloud_provider)


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
    q = _apply_evidence_cloud_provider_filter_for_autofill(q, cloud_provider)
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


def _tag_pairs_from_list(tags: Any) -> list[dict[str, str]]:
    if not isinstance(tags, list):
        return []
    out: list[dict[str, str]] = []
    for t in tags:
        if not isinstance(t, dict):
            continue
        k = t.get("Key")
        if k is None and t.get("key") is not None:
            k = t.get("key")
        v = t.get("Value") if "Value" in t else t.get("value", "")
        ks = str(k or "").strip()
        if ks:
            out.append({"key": ks, "value": str(v or "")})
    return out


def _norm_tag_map_from_pairs(tag_pairs: list[dict[str, str]]) -> dict[str, str]:
    return {p["key"].strip().lower(): p["value"] for p in tag_pairs if p.get("key")}


def _app_env_service(tags_norm: dict[str, str]) -> tuple[str | None, str | None, str | None]:
    app = tags_norm.get("application") or tags_norm.get("app")
    env = tags_norm.get("environment") or tags_norm.get("env")
    svc = tags_norm.get("service")

    def _s(x: Any) -> str | None:
        if x is None:
            return None
        t = str(x).strip()
        return t or None

    return (_s(app), _s(env), _s(svc))


def _append_resources_from_compare_payload(payload: dict, out: list[dict]) -> None:
    if payload.get("error"):
        return
    region = str(payload.get("region") or "")
    collector = str(payload.get("collector") or "")

    if collector == "ec2":
        for inst in payload.get("instances") or []:
            if not isinstance(inst, dict) or inst.get("error"):
                continue
            iid = str(inst.get("InstanceId") or "").strip()
            pairs = _tag_pairs_from_list(inst.get("Tags"))
            tags_norm = _norm_tag_map_from_pairs(pairs)
            app, env, svc = _app_env_service(tags_norm)
            name = (tags_norm.get("name") or iid or "ec2-instance").strip()
            out.append({
                "resource_type": "ec2_instance",
                "id": iid or name,
                "display_name": name,
                "region": region,
                "application": app,
                "environment": env,
                "service": svc,
                "tag_pairs": pairs,
            })
        return

    if collector == "encryption":
        for db in payload.get("rds_encryption") or []:
            if not isinstance(db, dict) or db.get("error"):
                continue
            ident = str(db.get("DBInstanceIdentifier") or "").strip()
            pairs = _tag_pairs_from_list(db.get("Tags"))
            tags_norm = _norm_tag_map_from_pairs(pairs)
            app, env, svc = _app_env_service(tags_norm)
            name = (tags_norm.get("name") or ident or "rds").strip()
            out.append({
                "resource_type": "rds_instance",
                "id": ident or name,
                "display_name": name,
                "region": region,
                "application": app,
                "environment": env,
                "service": svc,
                "tag_pairs": pairs,
            })
        for lb in payload.get("load_balancers") or []:
            if not isinstance(lb, dict) or lb.get("error"):
                continue
            arn = str(lb.get("LoadBalancerArn") or "").strip()
            dns = str(lb.get("DNSName") or "").strip()
            lb_name = str(lb.get("LoadBalancerName") or "").strip()
            pairs = _tag_pairs_from_list(lb.get("Tags"))
            tags_norm = _norm_tag_map_from_pairs(pairs)
            app, env, svc = _app_env_service(tags_norm)
            arn_tail = arn.split("/")[-1] if arn and "/" in arn else arn
            name = (tags_norm.get("name") or lb_name or dns or arn_tail or "load-balancer").strip()
            rid = arn or lb_name or dns or name
            out.append({
                "resource_type": "elastic_load_balancer",
                "id": rid,
                "display_name": name,
                "region": region,
                "application": app,
                "environment": env,
                "service": svc,
                "tag_pairs": pairs,
            })


def _gcp_labels_to_tag_pairs(labels: Any) -> list[dict[str, str]]:
    if not isinstance(labels, dict):
        return []
    out: list[dict[str, str]] = []
    for k, v in labels.items():
        ks = str(k).strip()
        if ks:
            out.append({"key": ks, "value": str(v if v is not None else "")})
    return out


def _append_resources_from_gcp_compare_payload(payload: dict, out: list[dict]) -> None:
    if payload.get("error") and not payload.get("instances") and not payload.get("assets"):
        return
    collector = str(payload.get("collector") or "")
    project_hint = str(payload.get("project_id") or "")

    if collector == "swift_component_inventory":
        for inst in payload.get("instances") or []:
            if not isinstance(inst, dict):
                continue
            name = str(inst.get("name") or "").strip()
            zone = str(inst.get("zone") or "").strip()
            pairs = _gcp_labels_to_tag_pairs(inst.get("labels"))
            tags_norm = _norm_tag_map_from_pairs(pairs)
            app, env, svc = _app_env_service(tags_norm)
            disp = (tags_norm.get("name") or name or "gce-instance").strip()
            out.append({
                "resource_type": "gce_instance",
                "id": name or disp,
                "display_name": disp,
                "region": zone or project_hint,
                "application": app,
                "environment": env,
                "service": svc,
                "tag_pairs": pairs,
            })
        for sql in payload.get("cloud_sql_instances") or []:
            if not isinstance(sql, dict):
                continue
            name = str(sql.get("name") or "").strip()
            reg = str(sql.get("region") or "").strip()
            if name:
                out.append({
                    "resource_type": "cloud_sql_instance",
                    "id": name,
                    "display_name": name,
                    "region": reg or project_hint,
                    "application": None,
                    "environment": None,
                    "service": None,
                    "tag_pairs": [],
                })
        for fr in payload.get("forwarding_rules") or []:
            if not isinstance(fr, dict):
                continue
            fn = str(fr.get("name") or "").strip()
            if fn:
                out.append({
                    "resource_type": "forwarding_rule",
                    "id": fn,
                    "display_name": fn,
                    "region": str(fr.get("region") or "") or project_hint,
                    "application": None,
                    "environment": None,
                    "service": None,
                    "tag_pairs": [],
                })
        for rs in payload.get("run_services") or []:
            if not isinstance(rs, dict) or rs.get("error"):
                continue
            nm = str(rs.get("name") or "").strip()
            if nm:
                out.append({
                    "resource_type": "cloud_run_service",
                    "id": nm,
                    "display_name": nm,
                    "region": str(rs.get("location") or "") or project_hint,
                    "application": None,
                    "environment": None,
                    "service": None,
                    "tag_pairs": [],
                })
        return

    if collector == "cloud_asset_inventory":
        for a in payload.get("assets") or []:
            if not isinstance(a, dict):
                continue
            aname = str(a.get("display_name") or "").strip()
            raw_name = str(a.get("name") or "").strip()
            loc = str(a.get("location") or "").strip()
            atype = str(a.get("asset_type") or "").strip()
            rid = raw_name or aname
            if not rid:
                continue
            short_type = atype.split("/")[-1] if "/" in atype else (atype or "asset")
            safe_type = "".join(c if c.isalnum() or c in "_-" else "_" for c in short_type)[:72]
            out.append({
                "resource_type": f"gcp_{safe_type}" if safe_type else "gcp_asset",
                "id": rid[-512:],
                "display_name": aname or rid.split("/")[-1],
                "region": loc or project_hint,
                "application": None,
                "environment": None,
                "service": None,
                "tag_pairs": [],
            })


def _azure_tags_to_tag_pairs(tags: Any) -> list[dict[str, str]]:
    if not isinstance(tags, dict):
        return []
    out: list[dict[str, str]] = []
    for k, v in tags.items():
        ks = str(k).strip()
        if ks:
            out.append({"key": ks, "value": str(v if v is not None else "")})
    return out


def _append_resources_from_azure_compare_payload(payload: dict, out: list[dict]) -> None:
    collector = str(payload.get("collector") or "")
    if collector != "azure_component_inventory":
        return
    if payload.get("error") and not payload.get("resources"):
        return
    sub = str(payload.get("subscription_id") or "")
    for res in payload.get("resources") or []:
        if not isinstance(res, dict):
            continue
        rid = str(res.get("id") or "").strip()
        name = str(res.get("name") or "").strip()
        rtype = str(res.get("type") or "").strip()
        loc = str(res.get("location") or "").strip()
        pairs = _azure_tags_to_tag_pairs(res.get("tags"))
        tags_norm = _norm_tag_map_from_pairs(pairs)
        app, env, svc = _app_env_service(tags_norm)
        tail = rid.split("/")[-1] if rid else ""
        disp = (tags_norm.get("name") or name or tail or "resource").strip()
        short_type = rtype.split("/")[-1].lower().replace(".", "_") if rtype else "resource"
        st = "".join(c if c.isalnum() or c in "_-" else "_" for c in short_type)[:72]
        out.append({
            "resource_type": st or "azure_resource",
            "id": rid or name or disp,
            "display_name": disp,
            "region": loc or sub,
            "application": app,
            "environment": env,
            "service": svc,
            "tag_pairs": pairs,
        })


def get_latest_provider_run_for_compare(
    db: Session,
    tenant_id: UUID | None,
    cycle_id: UUID | None,
    user_id: UUID | None,
    cloud_provider: str,
):
    p = (cloud_provider or "aws").strip().lower()
    if p == "aws":
        runs = get_runs(
            db,
            limit=40,
            tenant_id=tenant_id,
            cycle_id=cycle_id,
            user_id=user_id,
            exclude_cloud_provider="gcp",
        )
    else:
        runs = get_runs(
            db,
            limit=40,
            tenant_id=tenant_id,
            cycle_id=cycle_id,
            user_id=user_id,
            cloud_provider=p,
        )
    for r in runs:
        if getattr(r, "collector_name", "") != "all":
            continue
        if getattr(r, "status", "") not in ("success", "partial"):
            continue
        rp = getattr(r, "cloud_provider", None)
        if p == "aws":
            if rp not in (None, "aws", ""):
                continue
        else:
            if (rp or "").lower() != p:
                continue
        return r
    return None


def build_cloud_diagram_compare_inventory(
    db: Session,
    tenant_id: UUID | None,
    cycle_id: UUID | None,
    user_id: UUID | None,
    cloud_provider: str = "aws",
) -> dict[str, Any]:
    p = (cloud_provider or "aws").strip().lower()
    if p not in ("aws", "gcp", "azure"):
        p = "aws"

    no_run_msgs = {
        "aws": "No completed AWS collector run found for this cycle. Run AWS evidence collection first.",
        "gcp": "No completed GCP collector run found for this cycle. Run GCP evidence collection first.",
        "azure": "No completed Azure collector run found for this cycle. Run Azure evidence collection first.",
    }
    empty_msgs = {
        "aws": "Latest run has no EC2 or encryption snapshots. Re-run AWS evidence collection.",
        "gcp": "Latest run has no component inventory or cloud asset snapshots. Re-run GCP evidence collection.",
        "azure": "Latest run has no Azure component inventory snapshot. Re-run Azure evidence collection.",
    }
    source_sets = {
        "aws": DIAGRAM_COMPARE_SOURCE_SYSTEMS,
        "gcp": DIAGRAM_GCP_COMPARE_SOURCE_SYSTEMS,
        "azure": DIAGRAM_AZURE_COMPARE_SOURCE_SYSTEMS,
    }

    run = get_latest_provider_run_for_compare(db, tenant_id, cycle_id, user_id, p)
    if not run:
        return {"run_id": None, "resources": [], "message": no_run_msgs[p], "cloud_provider": p}

    q = db.query(Evidence).filter(Evidence.run_id == run.run_id)
    q = _apply_scope_filter(q, Evidence, tenant_id, cycle_id, user_id)
    q = q.filter(Evidence.source_system.in_(source_sets[p]))
    rows = list(q.all())
    if not rows:
        return {
            "run_id": str(run.run_id),
            "resources": [],
            "message": empty_msgs[p],
            "cloud_provider": p,
        }

    seen_hashes: set[str] = set()
    unique_rows: list = []
    for e in sorted(rows, key=lambda x: x.collected_at or datetime.min, reverse=True):
        h = getattr(e, "file_hash", None) or ""
        if h:
            if h in seen_hashes:
                continue
            seen_hashes.add(h)
        unique_rows.append(e)

    resources: list[dict] = []
    for e in unique_rows:
        raw = getattr(e, "response_json", None)
        if isinstance(raw, str):
            try:
                raw = json.loads(raw)
            except Exception:
                continue
        if isinstance(raw, dict):
            if p == "aws":
                _append_resources_from_compare_payload(raw, resources)
            elif p == "gcp":
                _append_resources_from_gcp_compare_payload(raw, resources)
            else:
                _append_resources_from_azure_compare_payload(raw, resources)

    return {"run_id": str(run.run_id), "resources": resources, "message": None, "cloud_provider": p}


def build_aws_diagram_compare_inventory(
    db: Session,
    tenant_id: UUID | None,
    cycle_id: UUID | None,
    user_id: UUID | None,
) -> dict[str, Any]:
    """Backward-compatible alias for AWS-only diagram compare inventory."""
    return build_cloud_diagram_compare_inventory(db, tenant_id, cycle_id, user_id, "aws")


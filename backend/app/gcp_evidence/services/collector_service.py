"""Orchestrate GCP collector runs into swift_2026.evidence (cloud_provider=gcp)."""
from __future__ import annotations

import inspect
import json
import uuid
from datetime import datetime
from pathlib import Path
from uuid import UUID

from app.aws_evidence.core.db import SessionLocal, ensure_schema
from app.database import SessionLocal as CoreSessionLocal
from app.gcp_evidence.credentials_context import gcp_user_credentials_scope
from app.gcp_evidence.services.gcp_credentials_resolver import resolve_optional_user_credentials
from app.aws_evidence.core.hash_utils import sha256_bytes
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.models import CollectorRun, Evidence
from app.gcp_evidence.collectors import COLLECTORS, expected_total_evidence_rows
from app.gcp_evidence.schemas.standard_evidence import EvidenceStatus, StandardEvidenceResult
from app.gcp_evidence.services.structured_results import (
    CollectorOutcome,
    build_standard_evidence_results,
)
from app.gcp_evidence.workbook.excel_spec import load_workbook_evidence_mapping, resolve_workbook_path


def _invoke_collector(collect_fn, project_id: str):
    try:
        sig = inspect.signature(collect_fn)
        if len(sig.parameters) >= 1:
            return collect_fn(project_id)
        return collect_fn()
    except TypeError:
        return collect_fn(project_id)


def _load_workbook_rows():
    path = resolve_workbook_path()
    if not path:
        return []
    try:
        return load_workbook_evidence_mapping(path)
    except Exception:
        return []


def _execute_gcp_collection_run(
    db,
    run_id: uuid.UUID,
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    project_id: str,
) -> tuple[list[str], dict[str, CollectorOutcome], int, int]:
    """Run all collectors, persist evidence, return (error_messages, outcomes, attempted, successful)."""
    errors: list[str] = []
    outcomes: dict[str, CollectorOutcome] = {}
    attempted = 0
    successful = 0
    expected_rows = expected_total_evidence_rows()

    def _insert_rows(ts: datetime, rows: list, payload_hash_cache: dict[str, str]) -> None:
        for raw_payload, item_code, control_id, evidence_type, source_system in rows:
            payload = sanitize_for_jsonb(raw_payload) if raw_payload else raw_payload
            payload_bytes = json.dumps(payload or {}, sort_keys=True, default=str).encode("utf-8")
            payload_key = payload_bytes.decode("utf-8", errors="replace")
            if payload_key not in payload_hash_cache:
                payload_hash_cache[payload_key] = sha256_bytes(payload_bytes)
            ev = Evidence(
                evidence_id=uuid.uuid4(),
                run_id=run_id,
                tenant_id=tenant_id,
                cycle_id=cycle_id,
                user_id=user_id,
                item_code=item_code,
                control_id=control_id,
                evidence_type=evidence_type,
                source_system=source_system,
                file_hash=payload_hash_cache[payload_key],
                collected_at=ts,
                response_json=payload,
                cloud_provider="gcp",
            )
            db.add(ev)

    def _placeholder_rows(name: str, module, exc: Exception, ts: datetime) -> list[tuple]:
        cm = getattr(module, "CONTROL_MAPPINGS", None) or []
        et = getattr(module, "EVIDENCE_TYPE", "config")
        src = getattr(module, "SOURCE_SYSTEM", name)
        payload = sanitize_for_jsonb(
            {
                "collector": name,
                "project_id": project_id,
                "collected_at": ts.isoformat(),
                "error": str(exc),
                "placeholder": True,
                "note": "Collector failed; placeholder row kept for SWIFT mapping alignment.",
            }
        )
        return [(payload, ic, cid, et, src) for ic, cid in cm]

    def _first_payload(rows: list) -> dict | None:
        if not rows:
            return None
        raw = rows[0][0]
        return sanitize_for_jsonb(raw) if raw else None

    for name, module in COLLECTORS:
        try:
            collect_fn = getattr(module, "collect", None)
            if collect_fn is None:
                continue
            attempted += 1
            ts = datetime.utcnow()
            payload_hash_cache: dict[str, str] = {}
            results = _invoke_collector(collect_fn, project_id)
            if not results:
                raise RuntimeError("collector returned no rows")
            _insert_rows(ts, results, payload_hash_cache)
            db.commit()
            successful += 1
            outcomes[name] = CollectorOutcome(name=name, ok=True, error=None, payload=_first_payload(results))
        except Exception as e:
            db.rollback()
            errors.append(f"{name}: {e}")
            outcomes[name] = CollectorOutcome(name=name, ok=False, error=str(e), payload=None)
            ts = datetime.utcnow()
            payload_hash_cache = {}
            try:
                ph_rows = _placeholder_rows(name, module, e, ts)
                if ph_rows:
                    _insert_rows(ts, ph_rows, payload_hash_cache)
                    db.commit()
            except Exception as pe:
                db.rollback()
                errors.append(f"{name} (placeholder insert): {pe}")

    run = db.query(CollectorRun).filter(CollectorRun.run_id == run_id).first()
    if run:
        run.ended_at = datetime.utcnow()
        if errors:
            run.status = "partial" if successful > 0 else "failed"
            run.error_message = (
                f"{successful}/{attempted} GCP collectors succeeded without exception. "
                f"Expected {expected_rows} evidence rows when all succeed. "
                f"Failures: {'; '.join(errors)}"
            )
        else:
            run.status = "success"
            run.error_message = None
        db.commit()

    return errors, outcomes, attempted, successful


def run_all_gcp_collectors(
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    project_id: str,
    trigger_type: str = "manual",
) -> uuid.UUID:
    """
    Run all GCP collectors using Application Default Credentials.
    Persists rows into the same schema as AWS evidence with cloud_provider=gcp.
    """
    project_id = (project_id or "").strip()
    if not project_id:
        raise ValueError("GCP project_id is required")

    core_db = CoreSessionLocal()
    try:
        creds, qp = resolve_optional_user_credentials(core_db, tenant_id, cycle_id, user_id)
    finally:
        core_db.close()

    ensure_schema()
    db = SessionLocal()
    run_id = uuid.uuid4()
    run = CollectorRun(
        run_id=run_id,
        tenant_id=tenant_id,
        cycle_id=cycle_id,
        user_id=user_id,
        collector_name="all",
        cloud_provider="gcp",
        execution_time=datetime.utcnow(),
        status="running",
        trigger_type=trigger_type,
    )
    db.add(run)
    db.commit()

    try:
        with gcp_user_credentials_scope(creds, qp):
            _execute_gcp_collection_run(db, run_id, tenant_id, cycle_id, user_id, project_id)
    finally:
        db.close()

    return run_id


def run_all_gcp_collectors_structured(
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    project_id: str,
    trigger_type: str = "manual",
) -> tuple[uuid.UUID, list[StandardEvidenceResult], list[str]]:
    """
    Same persistence as run_all_gcp_collectors, plus workbook-aligned StandardEvidenceResult list.
    Returns (run_id, results, collector_error_messages).
    """
    project_id = (project_id or "").strip()
    if not project_id:
        raise ValueError("GCP project_id is required")

    core_db = CoreSessionLocal()
    try:
        creds, qp = resolve_optional_user_credentials(core_db, tenant_id, cycle_id, user_id)
    finally:
        core_db.close()

    ensure_schema()
    workbook_rows = _load_workbook_rows()
    db = SessionLocal()
    run_id = uuid.uuid4()
    run = CollectorRun(
        run_id=run_id,
        tenant_id=tenant_id,
        cycle_id=cycle_id,
        user_id=user_id,
        collector_name="all",
        cloud_provider="gcp",
        execution_time=datetime.utcnow(),
        status="running",
        trigger_type=trigger_type,
    )
    db.add(run)
    db.commit()

    try:
        with gcp_user_credentials_scope(creds, qp):
            errors, outcomes, _, _ = _execute_gcp_collection_run(
                db, run_id, tenant_id, cycle_id, user_id, project_id
            )
        if workbook_rows:
            results = build_standard_evidence_results(workbook_rows, {k: v for k, v in outcomes.items()})
        else:
            results = build_standard_evidence_results_from_outcomes_only(outcomes)
        return run_id, results, errors
    finally:
        db.close()


def build_standard_evidence_results_from_outcomes_only(
    outcomes: dict[str, CollectorOutcome],
) -> list[StandardEvidenceResult]:
    """When no workbook file is available, emit one PASS/ERROR row per collector (debug fallback)."""
    out: list[StandardEvidenceResult] = []
    for name, o in outcomes.items():
        st = EvidenceStatus.PASS if o.ok and o.payload else EvidenceStatus.ERROR
        out.append(
            StandardEvidenceResult(
                evidence_id=name,
                status=st,
                data={name: o.payload} if o.payload else {},
                errors=[] if o.ok else [o.error or "failed"],
            )
        )
    return out

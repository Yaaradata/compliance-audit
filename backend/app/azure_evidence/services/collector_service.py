"""Orchestrate Azure collector runs into swift_2026.evidence (cloud_provider=azure)."""
from __future__ import annotations

import json
import uuid
from datetime import datetime
from uuid import UUID

from app.aws_evidence.core.db import SessionLocal, ensure_schema
from app.database import SessionLocal as CoreSessionLocal
from app.aws_evidence.core.hash_utils import sha256_bytes
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.models import CollectorRun, Evidence
from app.azure_evidence.collectors import COLLECTORS, expected_total_evidence_rows
from app.azure_evidence.platform.credentials import resolve_azure_credential


def _invoke_collector(collect_fn, subscription_id: str, credential):
    return collect_fn(subscription_id, credential)


def _execute_azure_collection_run(
    db,
    run_id: uuid.UUID,
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    subscription_id: str,
    credential,
) -> tuple[list[str], int, int]:
    errors: list[str] = []
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
                cloud_provider="azure",
            )
            db.add(ev)

    def _placeholder_rows(name: str, module, exc: Exception, ts: datetime) -> list[tuple]:
        cm = getattr(module, "CONTROL_MAPPINGS", None) or []
        et = getattr(module, "EVIDENCE_TYPE", "config")
        src = getattr(module, "SOURCE_SYSTEM", name)
        payload = sanitize_for_jsonb(
            {
                "collector": name,
                "subscription_id": subscription_id,
                "collected_at": ts.isoformat(),
                "error": str(exc),
                "placeholder": True,
                "note": "Collector failed; placeholder row kept for SWIFT mapping alignment.",
            }
        )
        return [(payload, ic, cid, et, src) for ic, cid in cm]

    for name, module in COLLECTORS:
        try:
            collect_fn = getattr(module, "collect", None)
            if collect_fn is None:
                continue
            attempted += 1
            ts = datetime.utcnow()
            payload_hash_cache: dict[str, str] = {}
            results = _invoke_collector(collect_fn, subscription_id, credential)
            if not results:
                raise RuntimeError("collector returned no rows")
            _insert_rows(ts, results, payload_hash_cache)
            db.commit()
            successful += 1
        except Exception as e:
            db.rollback()
            errors.append(f"{name}: {e}")
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
                f"{successful}/{attempted} Azure collectors succeeded without exception. "
                f"Expected {expected_rows} evidence rows when all succeed. "
                f"Failures: {'; '.join(errors)}"
            )
        else:
            run.status = "success"
            run.error_message = None
        db.commit()

    return errors, attempted, successful


def run_all_azure_collectors(
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    trigger_type: str = "manual",
) -> uuid.UUID:
    core_db = CoreSessionLocal()
    try:
        credential, subscription_id, _tid = resolve_azure_credential(core_db, tenant_id, cycle_id, user_id)
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
        cloud_provider="azure",
        execution_time=datetime.utcnow(),
        status="running",
        trigger_type=trigger_type,
    )
    db.add(run)
    db.commit()

    try:
        _execute_azure_collection_run(db, run_id, tenant_id, cycle_id, user_id, subscription_id, credential)
    finally:
        db.close()

    return run_id

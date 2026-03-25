"""Orchestrate collector runs for embedded SWIFT AWS evidence."""
import inspect
import json
import uuid
from datetime import datetime
from uuid import UUID

import boto3

from app.aws_evidence.core.db import SessionLocal, ensure_schema
from app.aws_evidence.core.hash_utils import sha256_bytes
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.models import CollectorRun, Evidence
from app.aws_evidence.collectors import COLLECTORS, expected_total_evidence_rows


def _invoke_collector(collect_fn, region: str, account_id: str, session):
    """Call collect(region, account_id, session) when the function accepts 3 params (reliable vs co_argcount)."""
    try:
        sig = inspect.signature(collect_fn)
        if len(sig.parameters) >= 3:
            return collect_fn(region, account_id, session)
        return collect_fn(region, account_id)
    except TypeError:
        return collect_fn(region, account_id, session)


def _session_from_credentials(credentials: dict):
    """Build boto3 session from access_key_id, secret_access_key, region; supports session_token for SSO temp creds."""
    kwargs = {
        "aws_access_key_id": credentials.get("access_key_id"),
        "aws_secret_access_key": credentials.get("secret_access_key"),
        "region_name": credentials.get("region") or "us-east-1",
    }
    if credentials.get("session_token"):
        kwargs["aws_session_token"] = credentials["session_token"]
    return boto3.Session(**kwargs)


def run_all_collectors(
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    credentials: dict,
    trigger_type: str = "manual",
) -> uuid.UUID:
    """
    Create collector_runs record, run all collectors with tenant credentials,
    and insert evidence (response_json) in DB. Per-collector errors recorded.
    credentials: dict with access_key_id, secret_access_key, region, account_id (optional).
    """
    ensure_schema()
    db = SessionLocal()
    run_id = uuid.uuid4()
    run = CollectorRun(
        run_id=run_id,
        tenant_id=tenant_id,
        cycle_id=cycle_id,
        user_id=user_id,
        collector_name="all",
        cloud_provider="aws",
        execution_time=datetime.utcnow(),
        status="running",
        trigger_type=trigger_type,
    )
    db.add(run)
    db.commit()

    region = credentials.get("region") or "us-east-1"
    account_id = credentials.get("account_id") or ""
    session = _session_from_credentials(credentials)
    errors: list[str] = []
    attempted_collectors = 0
    successful_collectors = 0
    expected_rows = expected_total_evidence_rows()

    def _insert_rows(
        ts: datetime,
        rows: list,
        payload_hash_cache: dict[str, str],
    ) -> None:
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
            )
            db.add(ev)

    def _placeholder_rows_for_module(name: str, module, exc: Exception, ts: datetime) -> list[tuple]:
        """One row per CONTROL_MAPPINGS so total evidence count stays aligned with SWIFT coverage (41) even when AWS calls fail."""
        cm = getattr(module, "CONTROL_MAPPINGS", None) or []
        et = getattr(module, "EVIDENCE_TYPE", "config")
        src = getattr(module, "SOURCE_SYSTEM", name)
        payload = sanitize_for_jsonb(
            {
                "collector": name,
                "account_id": account_id,
                "region": region,
                "collected_at": ts.isoformat(),
                "error": str(exc),
                "placeholder": True,
                "note": "Collector failed; placeholder row kept so control coverage and row count match the SWIFT matrix.",
            }
        )
        return [(payload, ic, cid, et, src) for ic, cid in cm]

    try:
        for name, module in COLLECTORS:
            try:
                collect_fn = getattr(module, "collect", None)
                if collect_fn is None:
                    continue
                attempted_collectors += 1
                ts = datetime.utcnow()
                payload_hash_cache: dict[str, str] = {}
                # Collectors return: (payload_json, item_code, control_id, evidence_type, source_system)
                results = _invoke_collector(collect_fn, region, account_id, session)
                if not results:
                    raise RuntimeError("collector returned no rows")
                _insert_rows(ts, results, payload_hash_cache)
                db.commit()
                successful_collectors += 1
            except Exception as e:
                db.rollback()
                errors.append(f"{name}: {e}")
                ts = datetime.utcnow()
                payload_hash_cache = {}
                try:
                    ph_rows = _placeholder_rows_for_module(name, module, e, ts)
                    if ph_rows:
                        _insert_rows(ts, ph_rows, payload_hash_cache)
                        db.commit()
                except Exception as pe:
                    db.rollback()
                    errors.append(f"{name} (placeholder insert): {pe}")
        run.ended_at = datetime.utcnow()
        if errors:
            # partial = at least one collector succeeded; failed = every attempted collector raised
            run.status = "partial" if successful_collectors > 0 else "failed"
            run.error_message = (
                f"{successful_collectors}/{attempted_collectors} collectors succeeded without exception. "
                f"Expected {expected_rows} evidence rows when all collectors succeed. "
                f"Failures: {'; '.join(errors)}"
            )
        else:
            run.status = "success"
            run.error_message = None
        db.commit()
    finally:
        db.close()

    return run_id


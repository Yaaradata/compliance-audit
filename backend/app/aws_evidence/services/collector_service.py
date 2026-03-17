"""Orchestrate collector runs for embedded SWIFT AWS evidence."""
import json
import uuid
from datetime import datetime
from pathlib import Path
from uuid import UUID

import boto3

from app.aws_evidence.core.db import SessionLocal, ensure_schema
from app.aws_evidence.core.hash_utils import sha256_file
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.models import CollectorRun, Evidence
from app.aws_evidence.collectors import COLLECTORS
from app.services.storage_service import upload as storage_upload


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
    credentials: dict,
    trigger_type: str = "manual",
) -> uuid.UUID:
    """
    Create collector_runs record, run all collectors with tenant credentials,
    upload to GCS, insert evidence (response_json). Per-collector errors recorded.
    credentials: dict with access_key_id, secret_access_key, region, account_id (optional).
    """
    ensure_schema()
    db = SessionLocal()
    run_id = uuid.uuid4()
    run = CollectorRun(
        run_id=run_id,
        tenant_id=tenant_id,
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
    output_dir = Path(__file__).resolve().parents[2] / "evidence_out"
    output_dir.mkdir(parents=True, exist_ok=True)
    errors: list[str] = []

    try:
        for name, module in COLLECTORS:
            try:
                collect_fn = getattr(module, "collect", None)
                if collect_fn is None:
                    continue
                # Collectors accept (region, account_id, output_dir, session=None)
                if getattr(collect_fn, "__code__", None) and collect_fn.__code__.co_argcount >= 4:
                    results = collect_fn(region, account_id, output_dir, session)
                else:
                    results = collect_fn(region, account_id, output_dir)
                ts = datetime.utcnow()
                path_to_hash: dict[Path, str] = {}
                path_to_json: dict[Path, dict] = {}
                date_str = ts.strftime("%Y-%m-%d")
                gcs_prefix = f"aws_evidence/aws/{account_id or 'local'}/{name}/{date_str}"
                for local_path, item_code, control_id, evidence_type, source_system in results:
                    if local_path not in path_to_hash and local_path.exists():
                        file_hash = sha256_file(local_path)
                        path_to_hash[local_path] = file_hash
                        try:
                            body = local_path.read_bytes()
                            gcs_key = f"{gcs_prefix}/{local_path.name}"
                            storage_upload(gcs_key, body, content_type="application/json")
                        except Exception:
                            pass
                    if local_path not in path_to_json and local_path.exists():
                        try:
                            path_to_json[local_path] = json.loads(local_path.read_text(encoding="utf-8"))
                        except Exception:
                            path_to_json[local_path] = {}
                    file_hash = path_to_hash.get(local_path, "")
                    raw_json = path_to_json.get(local_path)
                    response_json = sanitize_for_jsonb(raw_json) if raw_json else raw_json
                    ev = Evidence(
                        evidence_id=uuid.uuid4(),
                        run_id=run_id,
                        tenant_id=tenant_id,
                        item_code=item_code,
                        control_id=control_id,
                        evidence_type=evidence_type,
                        source_system=source_system,
                        file_hash=file_hash,
                        collected_at=ts,
                        response_json=response_json,
                    )
                    db.add(ev)
                db.commit()
            except Exception as e:
                db.rollback()
                errors.append(f"{name}: {e}")
        run.ended_at = datetime.utcnow()
        run.status = "partial" if errors else "success"
        run.error_message = "; ".join(errors) if errors else None
        db.commit()
    finally:
        db.close()

    return run_id


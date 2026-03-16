"""Orchestrates collector runs: create run, execute collectors, upload to S3, insert evidence."""
import uuid
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session

from core.db import SessionLocal, ensure_schema
from core import config
from core import s3_storage
from core.hash_utils import sha256_file
from models import CollectorRun, Evidence
from collectors import COLLECTORS


def run_all_collectors(trigger_type: str = "manual") -> uuid.UUID:
    """
    Create collector_runs record, run all collectors, upload to S3, insert evidence, update status.
    Returns run_id.
    """
    ensure_schema()
    db = SessionLocal()
    run_id = uuid.uuid4()
    run = CollectorRun(
        run_id=run_id,
        collector_name="all",
        cloud_provider="aws",
        execution_time=datetime.utcnow(),
        status="running",
        trigger_type=trigger_type,
    )
    db.add(run)
    db.commit()

    region = config.AWS_DEFAULT_REGION
    account_id = config.AWS_ACCOUNT_ID
    output_dir = Path(__file__).resolve().parent.parent / "evidence_out"
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        for name, module in COLLECTORS:
            try:
                results = module.collect(region, account_id, output_dir)
                ts = datetime.utcnow()
                # Upload each unique path once; reuse (s3_uri, file_hash) for all results with that path
                path_to_uri_hash: dict = {}
                for local_path, item_code, control_id, evidence_type, source_system in results:
                    if local_path not in path_to_uri_hash:
                        path_to_uri_hash[local_path] = s3_storage.upload_evidence_file(local_path, name, ts)
                    s3_uri, file_hash = path_to_uri_hash[local_path]
                    ev = Evidence(
                        evidence_id=uuid.uuid4(),
                        run_id=run_id,
                        item_code=item_code,
                        control_id=control_id,
                        evidence_type=evidence_type,
                        source_system=source_system,
                        storage_uri=s3_uri,
                        file_hash=file_hash,
                        collected_at=ts,
                    )
                    db.add(ev)
                db.commit()
            except Exception as e:
                db.rollback()
                run.status = "failed"
                run.ended_at = datetime.utcnow()
                run.trigger_type = trigger_type
                db.commit()
                raise RuntimeError(f"Collector {name} failed: {e}") from e
        run.status = "success"
        run.ended_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()

    return run_id

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.aws_evidence.core.db import get_db as get_aws_db
from app.aws_evidence.core import s3_storage
from app.aws_evidence.services import (
    get_evidence_list,
    get_evidence_by_id,
    get_runs,
    get_evidence_count_by_run_id,
    run_all_collectors,
)


router = APIRouter(prefix="/aws")


@router.get("/runs")
def list_runs(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_aws_db),
) -> list[dict]:
    """
    List recent collector runs (execution history) with evidence counts.
    """
    try:
        runs = get_runs(db, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    run_ids = [r.run_id for r in runs]
    counts = {}
    if run_ids:
        for rid in run_ids:
            counts[str(rid)] = get_evidence_count_by_run_id(db, rid)
    return [
        {
            "run_id": str(r.run_id),
            "collector_name": r.collector_name,
            "cloud_provider": r.cloud_provider,
            "execution_time": r.execution_time.isoformat() if r.execution_time else None,
            "ended_at": r.ended_at.isoformat() if r.ended_at else None,
            "status": r.status,
            "trigger_type": r.trigger_type,
            "evidence_count": counts.get(str(r.run_id), 0),
        }
        for r in runs
    ]


@router.post("/runs/collect")
def trigger_collect() -> dict:
    """
    Trigger AWS evidence collection directly using the embedded SWIFT collectors.
    """
    try:
        run_id = run_all_collectors(trigger_type="manual")
        return {"run_id": str(run_id), "status": "success"}
    except Exception as exc:  # pragma: no cover - surfaced as HTTP 502
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/evidence")
def list_evidence(
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_aws_db),
) -> list[dict]:
    """
    List AWS evidence rows from the local SWIFT evidence schema.
    """
    try:
        items = get_evidence_list(db, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return [
        {
            "evidence_id": str(e.evidence_id),
            "item_code": e.item_code,
            "control_id": e.control_id,
            "evidence_type": e.evidence_type,
            "source_system": e.source_system,
            "collected_at": e.collected_at.isoformat() if e.collected_at else None,
        }
        for e in items
    ]


@router.get("/evidence/{evidence_id}/content")
def get_evidence_content(
    evidence_id: UUID,
    db: Session = Depends(get_aws_db),
) -> dict:
    """
    Fetch AWS evidence content JSON for a single evidence_id from S3.
    """
    try:
        e = get_evidence_by_id(db, evidence_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not e:
        raise HTTPException(status_code=404, detail="Evidence not found")

    try:
        raw = s3_storage.get_evidence_content(e.storage_uri)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err)) from err
    except Exception as err:
        raise HTTPException(status_code=502, detail=f"Failed to fetch from S3: {err}") from err

    import json

    try:
        return json.loads(raw.decode("utf-8"))
    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Failed to parse evidence JSON: {err}") from err


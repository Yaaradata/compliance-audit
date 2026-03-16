from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.aws_evidence.core.db import get_db as get_aws_db
from app.aws_evidence.core import s3_storage
from app.aws_evidence.services import (
    get_evidence_list,
    get_evidence_by_id,
    get_runs,
    get_run_by_id,
    get_evidence_count_by_run_id,
    get_controls,
    get_control_matrix_for_control,
    get_control_by_id,
    get_evidence_for_control,
    get_control_ids_with_evidence,
    create_manual_evidence,
    run_all_collectors,
)
from app.aws_evidence.collectors.evidence_mapping import get_apis_for_control as get_apis_for_control_items
from app.aws_evidence.collectors.aws_api_catalog import get_apis_for_run as get_run_aws_calls


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
            "in_time": r.execution_time.isoformat() if r.execution_time else None,
            "ended_at": r.ended_at.isoformat() if r.ended_at else None,
            "status": r.status,
            "trigger_type": r.trigger_type,
            "evidence_count": counts.get(str(r.run_id), 0),
        }
        for r in runs
    ]


@router.get("/runs/{run_id}")
def get_run_detail(
    run_id: UUID,
    db: Session = Depends(get_aws_db),
) -> dict:
    """Run detail with evidence count and AWS API calls by collector."""
    run = get_run_by_id(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    count = get_evidence_count_by_run_id(db, run_id)
    aws_calls = get_run_aws_calls(run.collector_name or "all")
    return {
        "run_id": str(run.run_id),
        "collector_name": run.collector_name,
        "cloud_provider": run.cloud_provider,
        "execution_time": run.execution_time.isoformat() if run.execution_time else None,
        "in_time": run.execution_time.isoformat() if run.execution_time else None,
        "ended_at": run.ended_at.isoformat() if run.ended_at else None,
        "status": run.status,
        "trigger_type": run.trigger_type,
        "evidence_count": count,
        "aws_calls": aws_calls,
    }


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


# ─── Controls (for Control View UI) ─────────────────────────────────────────

@router.get("/controls")
def list_controls(db: Session = Depends(get_aws_db)) -> list[dict]:
    """List controls from evidence_sufficiency_matrix (or swift_2026.controls when USE_SWIFT_2026)."""
    try:
        rows = get_controls(db)
        return [{"control_id": r.get("control_id"), "control_name": r.get("control_name"), "item_code": r.get("item_code"), "mandatory_flag": r.get("mandatory_flag")} for r in rows]
    except Exception:
        return []


@router.get("/controls/coverage")
def controls_coverage(db: Session = Depends(get_aws_db)) -> dict:
    """Control IDs that have at least one evidence row."""
    try:
        ids = get_control_ids_with_evidence(db)
        return {"control_ids_with_evidence": ids}
    except Exception:
        return {"control_ids_with_evidence": []}


@router.get("/control/{control_id}")
def get_control_detail(control_id: str, db: Session = Depends(get_aws_db)) -> dict:
    """Control detail with required evidence items, collected evidence, and AWS calls."""
    try:
        control = get_control_by_id(db, control_id)
        matrix = get_control_matrix_for_control(db, control_id)
        collected = get_evidence_for_control(db, control_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    item_codes = [m.get("item_code") for m in matrix if m.get("item_code")]
    aws_calls = get_apis_for_control_items(item_codes) if item_codes else {"aws_apis": [], "by_evidence_item": []}
    required = [{"item_code": m.get("item_code"), "evidence_item_name": m.get("evidence_item_name")} for m in matrix]
    return {
        "control_id": control.get("control_id") or control_id,
        "control_name": control.get("control_name"),
        "required_evidence_items": required,
        "collected_evidence": [
            {
                "evidence_id": str(e.evidence_id),
                "item_code": e.item_code,
                "control_id": e.control_id,
                "evidence_type": e.evidence_type,
                "source_system": e.source_system,
                "collected_at": e.collected_at.isoformat() if e.collected_at else None,
            }
            for e in collected
        ],
        "aws_calls": aws_calls,
    }


class ManualEvidenceCreate(BaseModel):
    control_id: str
    item_code: str
    content: dict
    evidence_type: str = "manual"
    source_system: str = "manual"


@router.post("/evidence", status_code=201)
def create_manual_evidence_endpoint(
    body: ManualEvidenceCreate,
    db: Session = Depends(get_aws_db),
) -> dict:
    """Submit manual evidence for a control."""
    try:
        evidence_id = create_manual_evidence(
            db,
            control_id=body.control_id,
            item_code=body.item_code,
            content=body.content,
            evidence_type=body.evidence_type or "manual",
            source_system=body.source_system or "manual",
        )
        return {"evidence_id": str(evidence_id), "control_id": body.control_id, "item_code": body.item_code}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


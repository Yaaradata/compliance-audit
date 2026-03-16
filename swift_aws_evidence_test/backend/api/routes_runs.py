"""GET /runs — collector execution history. GET /runs/{run_id} — run detail + AWS calls. POST /runs/collect — trigger collection."""
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from sqlalchemy.orm import Session
from core.db import get_db
from services import get_runs, get_run_by_id, get_evidence_count_by_run_id, run_all_collectors
from collectors.aws_api_catalog import get_apis_for_run

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("")
def list_runs(limit: int = 50, db: Session = Depends(get_db)):
    runs = get_runs(db, limit=limit)
    return [
        {
            "run_id": str(r.run_id),
            "collector_name": r.collector_name,
            "cloud_provider": r.cloud_provider,
            "in_time": r.execution_time.isoformat() if r.execution_time else None,
            "out_time": r.ended_at.isoformat() if r.ended_at else None,
            "execution_time": r.execution_time.isoformat() if r.execution_time else None,
            "status": r.status,
            "trigger_type": r.trigger_type,
        }
        for r in runs
    ]


@router.get("/{run_id}")
def get_run_detail(run_id: UUID, db: Session = Depends(get_db)):
    """Return run details plus evidence count and AWS API calls made for this run."""
    run = get_run_by_id(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    evidence_count = get_evidence_count_by_run_id(db, run_id)
    aws_calls = get_apis_for_run(run.collector_name or "all")
    return {
        "run_id": str(run.run_id),
        "collector_name": run.collector_name,
        "cloud_provider": run.cloud_provider,
        "in_time": run.execution_time.isoformat() if run.execution_time else None,
        "out_time": run.ended_at.isoformat() if run.ended_at else None,
        "execution_time": run.execution_time.isoformat() if run.execution_time else None,
        "status": run.status,
        "trigger_type": run.trigger_type,
        "evidence_count": evidence_count,
        "aws_calls": aws_calls,
    }


@router.post("/collect")
def trigger_collect():
    """Run AWS evidence collectors (IAM, EC2, CloudTrail, Config, SSM). Use the Fetch button on a control to collect fresh data."""
    try:
        run_id = run_all_collectors(trigger_type="manual")
        return {"run_id": str(run_id), "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

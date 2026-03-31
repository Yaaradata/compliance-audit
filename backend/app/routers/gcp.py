"""GCP evidence collection (SWIFT 2026) using backend env project + Application Default Credentials."""
import json
import logging
from dataclasses import dataclass
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from google.api_core import exceptions as gcp_exceptions
from google.cloud.resourcemanager_v3 import ProjectsClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.aws_evidence.core.db import get_swift_evidence_db
from app.aws_evidence.core.json_utils import sanitize_for_jsonb
from app.aws_evidence.services import (
    get_evidence_list,
    get_evidence_by_id,
    get_runs,
    get_run_by_id,
    get_evidence_count_by_run_id,
    get_controls,
    get_control_matrix_for_control,
    get_evidence_for_control_grouped_by_run,
    get_control_by_id,
    get_control_ids_with_evidence,
    get_control_item_pairs_with_evidence,
    delete_run,
    delete_all_evidence_and_runs_for_tenant,
    run_belongs_to_tenant,
    evidence_belongs_to_tenant,
)
from app.config import settings
from app.constants import PLATFORM_ADMIN_ROLES
from app.dependencies import get_current_user
from app.gcp_evidence.collectors import COLLECTORS as GCP_COLLECTORS
from app.gcp_evidence.collectors.gcp_api_catalog import (
    COLLECTOR_GCP_APIS,
    api_matrix_for_docs,
    get_apis_for_run as get_gcp_apis_for_run,
)
from app.gcp_evidence.services import run_all_gcp_collectors, run_all_gcp_collectors_structured
from app.gcp_evidence.services.precheck import precheck_gcp_collection
from app.gcp_evidence.workbook.excel_spec import load_workbook_evidence_mapping, resolve_workbook_path
from app.models.tenant import User

logger = logging.getLogger(__name__)

router = APIRouter()


@dataclass(frozen=True)
class GcpScope:
    tenant_id: UUID
    cycle_id: UUID
    user_id: UUID


def get_effective_gcp_tenant(
    tenant_id: UUID | None = Query(None, description="For platform admin: tenant to act on"),
    user: User = Depends(get_current_user),
) -> UUID:
    if user.tenant_id is not None:
        return user.tenant_id
    if user.tenant_id is None and user.role in PLATFORM_ADMIN_ROLES and tenant_id is not None:
        return tenant_id
    raise HTTPException(
        status_code=403,
        detail="Tenant context required for GCP operations. Sign in with a tenant account or, as platform admin, pass ?tenant_id=.",
    )


def get_effective_gcp_scope(
    cycle_id: UUID = Query(..., description="Cycle scope for GCP operations"),
    tenant_id: UUID = Depends(get_effective_gcp_tenant),
    user: User = Depends(get_current_user),
) -> GcpScope:
    if not user.id:
        raise HTTPException(status_code=403, detail="User context required for GCP operations.")
    return GcpScope(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user.id)


def _project_id() -> str:
    pid = (settings.GCP_EVIDENCE_PROJECT_ID or "").strip()
    if not pid:
        raise HTTPException(
            status_code=503,
            detail="GCP evidence is not configured. Set GCP_EVIDENCE_PROJECT_ID in backend environment and use ADC (e.g. GOOGLE_APPLICATION_CREDENTIALS or gcloud auth application-default login).",
        )
    return pid


@router.get("/config")
def gcp_config_public(scope: GcpScope = Depends(get_effective_gcp_scope)) -> dict:
    """Non-secret: whether collection is configured and which project id (from env)."""
    _ = scope
    pid = (settings.GCP_EVIDENCE_PROJECT_ID or "").strip()
    return {
        "configured": bool(pid),
        "project_id": pid if pid else None,
    }


@router.post("/credentials/test")
def test_gcp_access(scope: GcpScope = Depends(get_effective_gcp_scope)) -> dict:
    _ = scope
    pid = _project_id()
    try:
        client = ProjectsClient()
        client.get_iam_policy(request={"resource": f"projects/{pid}"})
        return {"ok": True, "project_id": pid, "message": "Can read project IAM policy with current credentials."}
    except gcp_exceptions.PermissionDenied as e:
        raise HTTPException(
            status_code=403,
            detail=f"Permission denied for project {pid}: {e.message}. Grant roles/resourcemanager.projectIamViewer (or broader) to the runtime service account.",
        ) from e
    except Exception as e:
        logger.exception("GCP test connection failed")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/runs/collect")
def trigger_gcp_collect(scope: GcpScope = Depends(get_effective_gcp_scope)) -> dict:
    """Run all GCP collectors; credentials from ADC, project from GCP_EVIDENCE_PROJECT_ID."""
    pid = _project_id()
    try:
        run_id = run_all_gcp_collectors(
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
            project_id=pid,
            trigger_type="manual",
        )
        return {"run_id": str(run_id), "status": "success", "project_id": pid}
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("GCP collect failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/runs/collect-structured")
def trigger_gcp_collect_structured(scope: GcpScope = Depends(get_effective_gcp_scope)) -> dict:
    """
    Run all collectors (same DB persistence as /runs/collect) and return workbook-aligned
    StandardEvidenceResult rows (PASS | FAIL | ERROR) for each evidence item in the Excel mapping.
    """
    pid = _project_id()
    try:
        run_id, results, collector_errors = run_all_gcp_collectors_structured(
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
            project_id=pid,
            trigger_type="manual",
        )
        return {
            "run_id": str(run_id),
            "project_id": pid,
            "collector_errors": collector_errors,
            "results": [r.model_dump() for r in results],
        }
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("GCP structured collect failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/collectors/api-matrix")
def gcp_collectors_api_matrix(scope: GcpScope = Depends(get_effective_gcp_scope)) -> dict:
    """
    GCP API methods used per collector, per SWIFT evidence item (A1, …), and per CSCF control id.
    Aligned with ``COLLECTOR_GCP_APIS`` and live collector code; use for IAM roles and API enablement.
    """
    _ = scope
    return api_matrix_for_docs()


@router.get("/workbook/mapping")
def gcp_workbook_mapping(scope: GcpScope = Depends(get_effective_gcp_scope)) -> dict:
    """Parse GCP_Evidence_CollectionforSWIFT_v2026_Updated.xlsx sheet 1 (requires file on server path)."""
    _ = scope
    path = resolve_workbook_path()
    if not path:
        raise HTTPException(
            status_code=503,
            detail="Workbook not found. Set GCP_EVIDENCE_WORKBOOK_PATH or place GCP_Evidence_CollectionforSWIFT_v2026_Updated.xlsx at the repository root.",
        )
    try:
        rows = load_workbook_evidence_mapping(path)
    except Exception as exc:
        logger.exception("Failed to parse GCP workbook")
        raise HTTPException(status_code=502, detail=f"Workbook parse error: {exc}") from exc
    return {
        "workbook_path": str(path),
        "row_count": len(rows),
        "rows": [
            {
                "swift_domain": r.swift_domain,
                "evidence_item": r.evidence_item_raw,
                "evidence_id": r.item_code,
                "gcp_service": r.gcp_service,
                "api_data_source": r.api_data_source,
                "automation_feasibility": r.automation_feasibility,
            }
            for r in rows
        ],
    }


@router.get("/validation/precheck")
def gcp_validation_precheck(scope: GcpScope = Depends(get_effective_gcp_scope)) -> dict:
    """Credential and permission checks before collection (non-fatal; structured)."""
    _ = scope
    pid = _project_id()
    try:
        return precheck_gcp_collection(pid)
    except Exception as exc:
        logger.exception("GCP precheck failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/runs")
def list_gcp_runs(
    limit: int = Query(50, ge=1, le=200),
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> list[dict]:
    runs = get_runs(
        db,
        limit=limit,
        tenant_id=scope.tenant_id,
        cycle_id=scope.cycle_id,
        user_id=scope.user_id,
        cloud_provider="gcp",
    )
    out: list[dict] = []
    for r in runs:
        c = get_evidence_count_by_run_id(db, r.run_id)
        out.append(
            {
                "run_id": str(r.run_id),
                "collector_name": r.collector_name,
                "cloud_provider": r.cloud_provider,
                "execution_time": r.execution_time.isoformat() if r.execution_time else None,
                "in_time": r.execution_time.isoformat() if r.execution_time else None,
                "ended_at": r.ended_at.isoformat() if r.ended_at else None,
                "status": r.status,
                "trigger_type": r.trigger_type,
                "evidence_count": c,
                "error_message": getattr(r, "error_message", None),
            }
        )
    return out


@router.get("/runs/{run_id}")
def get_gcp_run_detail(
    run_id: UUID,
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> dict:
    run = get_run_by_id(db, run_id)
    if not run or run.cloud_provider != "gcp":
        raise HTTPException(status_code=404, detail="Run not found")
    if not run_belongs_to_tenant(run, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Run not found")
    count = get_evidence_count_by_run_id(db, run_id)
    gcp_calls = get_gcp_apis_for_run(run.collector_name or "all")
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
        "gcp_apis": gcp_calls,
        "error_message": getattr(run, "error_message", None),
    }


@router.delete("/runs/{run_id}")
def delete_gcp_run(
    run_id: UUID,
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> dict:
    run = get_run_by_id(db, run_id)
    if not run or run.cloud_provider != "gcp":
        raise HTTPException(status_code=404, detail="Run not found")
    if not run_belongs_to_tenant(run, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Run not found")
    deleted = delete_run(db, run_id)
    return {"run_id": str(run_id), "deleted_evidence": deleted}


@router.get("/evidence")
def list_gcp_evidence(
    limit: int = Query(200, ge=1, le=5000),
    run_id: UUID | None = Query(None, description="Optional: limit evidence to one run"),
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> list[dict]:
    try:
        items = get_evidence_list(
            db,
            limit=limit,
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
            cloud_provider="gcp",
            run_id=run_id,
        )
    except OperationalError as e:
        if "deadlock" in str(e).lower():
            raise HTTPException(
                status_code=503,
                detail="Database temporarily busy (deadlock detected). Retry in a few seconds.",
            ) from e
        logger.exception("GCP evidence list query failed")
        raise HTTPException(
            status_code=503,
            detail="Database error while loading evidence. Retry the request.",
        ) from e
    return [
        {
            "evidence_id": str(e.evidence_id),
            "run_id": str(e.run_id),
            "item_code": e.item_code,
            "control_id": e.control_id,
            "evidence_type": e.evidence_type,
            "source_system": e.source_system,
            "collected_at": e.collected_at.isoformat() if e.collected_at else None,
        }
        for e in items
    ]


@router.delete("/evidence")
def delete_all_gcp_evidence_for_cycle(
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> dict:
    """Remove all GCP collector runs and evidence rows for this tenant, cycle, and user (same scope as list/collect)."""
    result = delete_all_evidence_and_runs_for_tenant(
        db,
        tenant_id=scope.tenant_id,
        cycle_id=scope.cycle_id,
        user_id=scope.user_id,
        cloud_provider="gcp",
    )
    return {
        "deleted_evidence": result["deleted_evidence"],
        "deleted_runs": result["deleted_runs"],
    }


@router.get("/evidence/{evidence_id}/content")
def get_gcp_evidence_content(
    evidence_id: UUID,
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_swift_evidence_db),
):
    e = get_evidence_by_id(db, evidence_id)
    if not e:
        raise HTTPException(status_code=404, detail="Evidence not found")
    if not evidence_belongs_to_tenant(e, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Evidence not found")
    # Use denormalized evidence.cloud_provider only — avoids SELECT on collector_runs here,
    # which deadlocked against in-flight GCP collects (many parallel /content requests vs run updates).
    if getattr(e, "cloud_provider", None) != "gcp":
        raise HTTPException(status_code=404, detail="Evidence not found")
    if e.response_json is None:
        raise HTTPException(status_code=404, detail="Evidence content not available")
    raw = e.response_json
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return {"_note": "Evidence payload is not valid JSON text", "_preview": raw[:4000]}
    # Re-sanitize on read so HTTP JSON encoding never fails (NaN/inf floats, UUID, etc.).
    return sanitize_for_jsonb(raw)


@router.get("/controls")
def list_gcp_controls(scope: GcpScope = Depends(get_effective_gcp_scope), db: Session = Depends(get_swift_evidence_db)):
    _ = scope
    rows = get_controls(db)
    return [{"control_id": r.get("control_id"), "control_name": r.get("control_name"), "item_code": r.get("item_code"), "mandatory_flag": r.get("mandatory_flag")} for r in rows]


@router.get("/controls/coverage")
def gcp_controls_coverage(scope: GcpScope = Depends(get_effective_gcp_scope), db: Session = Depends(get_swift_evidence_db)):
    ids = get_control_ids_with_evidence(
        db, tenant_id=scope.tenant_id, cycle_id=scope.cycle_id, user_id=scope.user_id, cloud_provider="gcp"
    )
    return {"control_ids_with_evidence": ids}


@router.get("/controls/coverage/items")
def gcp_controls_coverage_items(scope: GcpScope = Depends(get_effective_gcp_scope), db: Session = Depends(get_swift_evidence_db)):
    return get_control_item_pairs_with_evidence(
        db, tenant_id=scope.tenant_id, cycle_id=scope.cycle_id, user_id=scope.user_id, cloud_provider="gcp"
    )


@router.get("/control/{control_id}")
def get_gcp_control_detail(
    control_id: str,
    item_code: str | None = Query(None),
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_swift_evidence_db),
):
    control = get_control_by_id(db, control_id)
    matrix = get_control_matrix_for_control(db, control_id)
    if item_code:
        matrix = [row for row in matrix if (row.get("item_code") or "") == item_code]
    evidence_by_run = get_evidence_for_control_grouped_by_run(
        db,
        control_id,
        tenant_id=scope.tenant_id,
        cycle_id=scope.cycle_id,
        user_id=scope.user_id,
        cloud_provider="gcp",
    )
    if item_code:
        ic = item_code.strip().upper()
        for block in evidence_by_run:
            block["evidence"] = [e for e in block.get("evidence", []) if (e.get("item_code") or "").upper() == ic]
            block["evidence_count"] = len(block["evidence"])
        evidence_by_run = [b for b in evidence_by_run if b.get("evidence_count", 0) > 0]
    by_evidence_item: list[dict] = []
    for row in matrix:
        ic = row.get("item_code")
        apis: list[str] = []
        for name, mod in GCP_COLLECTORS:
            cm = getattr(mod, "CONTROL_MAPPINGS", []) or []
            if any(pair[0] == ic for pair in cm):
                apis.extend(COLLECTOR_GCP_APIS.get(name, []))
        by_evidence_item.append(
            {
                "item_code": ic,
                "evidence_item_name": row.get("evidence_item_name"),
                "apis": sorted(set(apis)),
            }
        )
    return {
        "control_id": control_id,
        "control_name": control.get("control_name") if control else None,
        "item_code": item_code,
        "required_evidence_items": [{"item_code": r.get("item_code"), "evidence_item_name": r.get("evidence_item_name")} for r in matrix],
        "evidence_by_run": evidence_by_run,
        "gcp_calls": {"by_evidence_item": by_evidence_item},
    }

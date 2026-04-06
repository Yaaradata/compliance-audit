"""Azure evidence collection: subscription + tenant; optional SP secret; Resource Graph collectors."""
import json
import logging
from dataclasses import dataclass
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
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
from app.dependencies import get_current_user, get_db
from app.models.tenant import User
from app.azure_evidence.collectors import COLLECTORS as AZURE_COLLECTORS
from app.azure_evidence.services import run_all_azure_collectors
from app.azure_evidence.platform.credentials import resolve_azure_credential
from app.azure_evidence.services.precheck import precheck_azure_collection
from app.services.cycle_user_azure_config import (
    delete_cycle_user_azure_config,
    get_row,
    mark_connect_api_test_passed,
    save_azure_context,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@dataclass(frozen=True)
class AzureScope:
    tenant_id: UUID
    cycle_id: UUID
    user_id: UUID


def get_effective_azure_tenant(
    tenant_id: UUID | None = Query(None, description="For platform admin: tenant to act on"),
    user: User = Depends(get_current_user),
) -> UUID:
    if user.tenant_id is not None:
        return user.tenant_id
    if user.tenant_id is None and user.role in PLATFORM_ADMIN_ROLES and tenant_id is not None:
        return tenant_id
    raise HTTPException(
        status_code=403,
        detail="Tenant context required for Azure operations. Sign in with a tenant account or, as platform admin, pass ?tenant_id=.",
    )


def get_effective_azure_scope(
    cycle_id: UUID = Query(..., description="Cycle scope for Azure operations"),
    tenant_id: UUID = Depends(get_effective_azure_tenant),
    user: User = Depends(get_current_user),
) -> AzureScope:
    if not user.id:
        raise HTTPException(status_code=403, detail="User context required for Azure operations.")
    return AzureScope(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user.id)


class AzureContextBody(BaseModel):
    azure_subscription_id: str
    azure_tenant_id: str
    azure_client_id: str | None = None
    client_secret: str | None = None


@router.post("/context")
def save_azure_context_endpoint(
    body: AzureContextBody,
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_db),
) -> dict:
    """Save target subscription and Microsoft Entra tenant; optional app registration secret (encrypted)."""
    raw = body.model_dump(exclude_unset=True)
    try:
        save_azure_context(
            db,
            scope.tenant_id,
            scope.cycle_id,
            scope.user_id,
            body.azure_subscription_id,
            body.azure_tenant_id,
            azure_client_id=raw.get("azure_client_id"),
            client_secret=raw.get("client_secret"),
            set_client_id="azure_client_id" in raw,
            set_client_secret="client_secret" in raw,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return {"ok": True, "message": "Azure scope saved. Run Test connection, then collect evidence."}


@router.get("/config")
def azure_config_public(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_db)) -> dict:
    row = get_row(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    sub = (row.azure_subscription_id or "").strip() if row else ""
    tid = (row.azure_tenant_id or "").strip() if row else ""
    has_sp = bool(row and (row.azure_client_id or "").strip() and (row.encrypted_client_secret or "").strip())
    env_sp = bool(
        (getattr(settings, "AZURE_CLIENT_ID", None) or "").strip()
        and (getattr(settings, "AZURE_CLIENT_SECRET", None) or "").strip()
    )
    test_ok = bool(row and row.connect_api_test_passed_at is not None)
    return {
        "configured": bool(sub and tid and test_ok),
        "dashboard_unlocked": bool(sub and tid and test_ok),
        "azure_subscription_id": sub or None,
        "azure_tenant_id": tid or None,
        "service_principal_saved": has_sp,
        "env_service_principal_available": env_sp,
        "connect_api_test_passed": test_ok,
    }


@router.post("/credentials/test")
def test_azure_access(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_db)) -> dict:
    try:
        credential, subscription_id, directory_tenant = resolve_azure_credential(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    try:
        check = precheck_azure_collection(credential, subscription_id)
    except Exception as e:
        logger.exception("Azure test connection failed")
        raise HTTPException(status_code=502, detail=str(e)) from e
    if not check.get("ok"):
        raise HTTPException(
            status_code=403,
            detail=check.get("error") or "Resource Graph query failed. Check subscription ID and RBAC (Reader + Resource Graph access).",
        )
    mark_connect_api_test_passed(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    return {
        "ok": True,
        "subscription_id": subscription_id,
        "directory_tenant_id": directory_tenant,
        "message": "Azure Resource Graph responded successfully.",
    }


@router.post("/runs/collect")
def trigger_azure_collect(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_db)) -> dict:
    try:
        run_id = run_all_azure_collectors(
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
            trigger_type="manual",
        )
        row = get_row(db, scope.tenant_id, scope.cycle_id, scope.user_id)
        sub = (row.azure_subscription_id or "").strip() if row else ""
        return {"run_id": str(run_id), "status": "success", "subscription_id": sub}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Azure collect failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/validation/precheck")
def azure_validation_precheck(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_db)) -> dict:
    try:
        credential, subscription_id, _ = resolve_azure_credential(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    try:
        return precheck_azure_collection(credential, subscription_id)
    except Exception as exc:
        logger.exception("Azure precheck failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/runs")
def list_azure_runs(
    limit: int = Query(50, ge=1, le=200),
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> list[dict]:
    runs = get_runs(
        db,
        limit=limit,
        tenant_id=scope.tenant_id,
        cycle_id=scope.cycle_id,
        user_id=scope.user_id,
        cloud_provider="azure",
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
def get_azure_run_detail(
    run_id: UUID,
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> dict:
    run = get_run_by_id(db, run_id)
    if not run or run.cloud_provider != "azure":
        raise HTTPException(status_code=404, detail="Run not found")
    if not run_belongs_to_tenant(run, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Run not found")
    count = get_evidence_count_by_run_id(db, run_id)
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
        "error_message": getattr(run, "error_message", None),
    }


@router.delete("/runs/{run_id}")
def delete_azure_run(
    run_id: UUID,
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> dict:
    run = get_run_by_id(db, run_id)
    if not run or run.cloud_provider != "azure":
        raise HTTPException(status_code=404, detail="Run not found")
    if not run_belongs_to_tenant(run, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Run not found")
    deleted = delete_run(db, run_id)
    return {"run_id": str(run_id), "deleted_evidence": deleted}


@router.get("/evidence")
def list_azure_evidence(
    limit: int = Query(200, ge=1, le=5000),
    run_id: UUID | None = Query(None),
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> list[dict]:
    try:
        items = get_evidence_list(
            db,
            limit=limit,
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
            cloud_provider="azure",
            run_id=run_id,
        )
    except OperationalError as e:
        if "deadlock" in str(e).lower():
            raise HTTPException(
                status_code=503,
                detail="Database temporarily busy (deadlock detected). Retry in a few seconds.",
            ) from e
        logger.exception("Azure evidence list query failed")
        raise HTTPException(status_code=503, detail="Database error while loading evidence. Retry the request.") from e
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
def delete_all_azure_evidence_for_cycle(
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_swift_evidence_db),
    core_db: Session = Depends(get_db),
) -> dict:
    result = delete_all_evidence_and_runs_for_tenant(
        db,
        tenant_id=scope.tenant_id,
        cycle_id=scope.cycle_id,
        user_id=scope.user_id,
        cloud_provider="azure",
    )
    delete_cycle_user_azure_config(core_db, scope.tenant_id, scope.cycle_id, scope.user_id)
    return {
        "deleted_evidence": result["deleted_evidence"],
        "deleted_runs": result["deleted_runs"],
        "connect_config_cleared": True,
    }


@router.get("/evidence/{evidence_id}/content")
def get_azure_evidence_content(
    evidence_id: UUID,
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_swift_evidence_db),
):
    e = get_evidence_by_id(db, evidence_id)
    if not e:
        raise HTTPException(status_code=404, detail="Evidence not found")
    if not evidence_belongs_to_tenant(e, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Evidence not found")
    if getattr(e, "cloud_provider", None) != "azure":
        raise HTTPException(status_code=404, detail="Evidence not found")
    if e.response_json is None:
        raise HTTPException(status_code=404, detail="Evidence content not available")
    raw = e.response_json
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return {"_note": "Evidence payload is not valid JSON text", "_preview": raw[:4000]}
    return sanitize_for_jsonb(raw)


@router.get("/controls")
def list_azure_controls(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_swift_evidence_db)):
    _ = scope
    rows = get_controls(db)
    return [
        {"control_id": r.get("control_id"), "control_name": r.get("control_name"), "item_code": r.get("item_code"), "mandatory_flag": r.get("mandatory_flag")}
        for r in rows
    ]


@router.get("/controls/coverage")
def azure_controls_coverage(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_swift_evidence_db)):
    ids = get_control_ids_with_evidence(
        db, tenant_id=scope.tenant_id, cycle_id=scope.cycle_id, user_id=scope.user_id, cloud_provider="azure"
    )
    return {"control_ids_with_evidence": ids}


@router.get("/controls/coverage/items")
def azure_controls_coverage_items(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_swift_evidence_db)):
    return get_control_item_pairs_with_evidence(
        db, tenant_id=scope.tenant_id, cycle_id=scope.cycle_id, user_id=scope.user_id, cloud_provider="azure"
    )


@router.get("/control/{control_id}")
def get_azure_control_detail(
    control_id: str,
    item_code: str | None = Query(None),
    scope: AzureScope = Depends(get_effective_azure_scope),
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
        cloud_provider="azure",
    )
    if item_code:
        ic = item_code.strip().upper()
        for block in evidence_by_run:
            block["evidence"] = [e for e in block.get("evidence", []) if (e.get("item_code") or "").upper() == ic]
            block["evidence_count"] = len(block["evidence"])
        evidence_by_run = [b for b in evidence_by_run if b.get("evidence_count", 0) > 0]
    return {
        "control_id": control_id,
        "control_name": control.get("control_name") if control else None,
        "item_code": item_code,
        "required_evidence_items": [{"item_code": r.get("item_code"), "evidence_item_name": r.get("evidence_item_name")} for r in matrix],
        "evidence_by_run": evidence_by_run,
        "azure_collectors": [{"name": n, "evidence_items": [p[0] for p in (getattr(m, "CONTROL_MAPPINGS", []) or [])]} for n, m in AZURE_COLLECTORS],
    }

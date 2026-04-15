"""Azure evidence collection: subscription + tenant; optional SP secret; Resource Graph collectors."""
import json
import logging
from dataclasses import dataclass
from urllib.parse import quote
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
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
    build_cloud_diagram_compare_inventory,
)
from app.config import settings
from app.constants import PLATFORM_ADMIN_ROLES
from app.dependencies import get_current_user, get_db
from app.models.tenant import User
from app.azure_evidence.collectors import COLLECTORS as AZURE_COLLECTORS
from app.azure_evidence.collectors.azure_api_catalog import api_matrix_for_docs as azure_api_matrix_for_docs
from app.azure_evidence.services import run_all_azure_collectors
from app.azure_evidence.platform.credentials import resolve_azure_credential
from app.azure_evidence.services.precheck import precheck_azure_collection
from app.services.azure_delegated_arm import list_arm_subscriptions, resolve_subscription_and_tenant_after_oauth
from app.services.azure_entra_oauth import (
    azure_oauth_env_configured,
    build_authorization_url,
    display_name_from_token_result,
    exchange_code_for_token_result,
    oauth_authority_tenant_segment,
)
from app.services.cycle_user_azure_config import (
    begin_azure_oauth_state,
    clear_azure_oauth_connection,
    complete_azure_oauth,
    delete_cycle_user_azure_config,
    get_row,
    get_row_by_azure_oauth_state,
    mark_connect_api_test_passed,
    save_azure_context,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _frontend_azure_oauth_success_url() -> str:
    custom = (getattr(settings, "AZURE_OAUTH_FRONTEND_REDIRECT_URL", None) or "").strip()
    if custom:
        sep = "&" if "?" in custom else "?"
        return f"{custom}{sep}azure_oauth=success"
    origins = settings.CORS_ORIGINS or []
    base = origins[0].rstrip("/") if origins else "http://localhost:3000"
    # Land on dashboard so users can fetch evidence immediately after Microsoft redirects back.
    return f"{base}/azure/dashboard?azure_oauth=success"


def _frontend_azure_oauth_error_url(message: str) -> str:
    q = quote(message[:500], safe="")
    custom = (getattr(settings, "AZURE_OAUTH_FRONTEND_REDIRECT_URL", None) or "").strip()
    if custom:
        sep = "&" if "?" in custom else "?"
        return f"{custom}{sep}azure_oauth=error&message={q}"
    origins = settings.CORS_ORIGINS or []
    base = origins[0].rstrip("/") if origins else "http://localhost:3000"
    return f"{base}/azure/sign-in?azure_oauth=error&message={q}"


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


@router.post("/auth/oauth/start")
def azure_oauth_start(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_db)) -> dict:
    """Returns Microsoft authorization URL. Subscription and tenant are discovered after sign-in unless already saved."""
    if not azure_oauth_env_configured():
        raise HTTPException(
            status_code=400,
            detail="Microsoft Entra OAuth is not configured. Set AZURE_OAUTH_CLIENT_ID, AZURE_OAUTH_CLIENT_SECRET, "
            "and AZURE_OAUTH_REDIRECT_URI on the API server.",
        )
    try:
        _row, state = begin_azure_oauth_state(db, scope.tenant_id, scope.cycle_id, scope.user_id)
        segment = oauth_authority_tenant_segment(
            saved_directory_tenant_id=(_row.azure_tenant_id or ""),
            settings_login_tenant=(getattr(settings, "AZURE_OAUTH_LOGIN_TENANT", None) or ""),
        )
        url = build_authorization_url(state=state, authority_tenant_segment=segment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Azure OAuth URL build failed")
        raise HTTPException(status_code=500, detail=str(e)) from e
    return {"authorization_url": url}


@router.get("/auth/oauth/callback")
def azure_oauth_callback(
    code: str = Query(""),
    state: str = Query(""),
    db: Session = Depends(get_db),
):
    """OAuth redirect target (no Bearer token; validated via state)."""
    row = get_row_by_azure_oauth_state(db, state)
    if not row:
        return RedirectResponse(url=_frontend_azure_oauth_error_url("invalid_or_expired_state"))
    segment = oauth_authority_tenant_segment(
        saved_directory_tenant_id=(row.azure_tenant_id or ""),
        settings_login_tenant=(getattr(settings, "AZURE_OAUTH_LOGIN_TENANT", None) or ""),
    )
    saved_sub_for_resolve = (row.azure_subscription_id or "").strip()
    try:
        result = exchange_code_for_token_result(code=code, authority_tenant_segment=segment)
        rt = (result.get("refresh_token") or "").strip()
        if not rt:
            return RedirectResponse(
                url=_frontend_azure_oauth_error_url(
                    "No refresh token returned. Try again and accept consent, or ensure offline_access is allowed for this app."
                )
            )
        access = (result.get("access_token") or "").strip()
        if not access:
            return RedirectResponse(url=_frontend_azure_oauth_error_url("No access token returned from Microsoft."))
        arm_list, arm_err = list_arm_subscriptions(access)
        if arm_err:
            return RedirectResponse(
                url=_frontend_azure_oauth_error_url(
                    f"Could not list Azure subscriptions for this account: {arm_err}. "
                    "Ensure the app has Azure Service Management delegated permission user_impersonation and admin consent if required."
                )
            )
        picked = resolve_subscription_and_tenant_after_oauth(
            saved_subscription_id=saved_sub_for_resolve,
            arm_subscriptions=arm_list,
        )
        if not picked:
            if saved_sub_for_resolve:
                return RedirectResponse(
                    url=_frontend_azure_oauth_error_url(
                        "This Microsoft account does not have access to the saved subscription, or the subscription is not enabled. "
                        "Check the subscription ID, sign in with an account that has Reader on that subscription, or clear saved scope and sign in again."
                    )
                )
            return RedirectResponse(
                url=_frontend_azure_oauth_error_url(
                    "No enabled Azure subscriptions were found for this account. Use a work or school account with an Azure subscription."
                )
            )
        sub_id, ten_id = picked
        name = display_name_from_token_result(result) or "Microsoft account"
        complete_azure_oauth(
            db,
            row,
            refresh_token=rt,
            entra_username=name,
            azure_subscription_id=sub_id,
            azure_tenant_id=ten_id,
        )
        row = get_row(db, row.tenant_id, row.cycle_id, row.user_id)
        sub = (row.azure_subscription_id or "").strip() if row else ""
        if sub:
            try:
                cred, sid, _ = resolve_azure_credential(db, row.tenant_id, row.cycle_id, row.user_id)
                check = precheck_azure_collection(cred, sid)
                if check.get("ok"):
                    mark_connect_api_test_passed(db, row.tenant_id, row.cycle_id, row.user_id)
                    logger.info("Azure OAuth Resource Graph precheck OK subscription=%s", sid)
                else:
                    logger.warning(
                        "Azure OAuth OK but Resource Graph precheck failed: %s",
                        check.get("error"),
                    )
            except Exception as ex:
                logger.warning("Azure OAuth callback post-precheck failed: %s", ex)
    except Exception as e:
        logger.exception("Azure OAuth callback failed")
        return RedirectResponse(url=_frontend_azure_oauth_error_url(str(e)))
    return RedirectResponse(url=_frontend_azure_oauth_success_url())


@router.post("/auth/oauth/disconnect")
def azure_oauth_disconnect(scope: AzureScope = Depends(get_effective_azure_scope), db: Session = Depends(get_db)) -> dict:
    if not azure_oauth_env_configured():
        return {"ok": True, "message": "Microsoft OAuth mode not enabled on server."}
    clear_azure_oauth_connection(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    return {"ok": True, "message": "Microsoft sign-in disconnected for this cycle."}


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
    oauth_on = azure_oauth_env_configured()
    has_oauth = bool(row and (row.encrypted_oauth_refresh_token or "").strip())
    entra_user = (row.entra_signin_username or "").strip() if row else ""
    test_ok = bool(row and row.connect_api_test_passed_at is not None)
    return {
        "configured": bool(sub and tid and test_ok),
        "dashboard_unlocked": bool(sub and tid and test_ok),
        "azure_subscription_id": sub or None,
        "azure_tenant_id": tid or None,
        "service_principal_saved": has_sp,
        "env_service_principal_available": env_sp,
        "azure_oauth_env_configured": oauth_on,
        "entra_oauth_connected": has_oauth,
        "entra_signin_username": entra_user or None,
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


@router.get("/collectors/api-matrix")
def azure_collectors_api_matrix(scope: AzureScope = Depends(get_effective_azure_scope)) -> dict:
    """Azure API methods used per collector for dashboard/run-history API breakdown."""
    _ = scope
    return azure_api_matrix_for_docs()


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


@router.get("/diagram-compare/inventory")
def azure_diagram_compare_inventory(
    scope: AzureScope = Depends(get_effective_azure_scope),
    db: Session = Depends(get_swift_evidence_db),
) -> dict:
    """
    VMs, SQL, load balancers, and related resources from the latest Azure Resource Graph component-inventory snapshot,
    with tags for diagram comparison.
    """
    try:
        return build_cloud_diagram_compare_inventory(
            db,
            scope.tenant_id,
            scope.cycle_id,
            scope.user_id,
            "azure",
        )
    except Exception as exc:
        logger.exception("GET /cloud/azure/diagram-compare/inventory failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc


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

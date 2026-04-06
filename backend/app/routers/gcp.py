"""GCP evidence collection (SWIFT 2026): env ADC, or per-cycle Google OAuth + project id."""
import json
import logging
from dataclasses import dataclass
from urllib.parse import quote
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from google.api_core import exceptions as gcp_exceptions
from google.cloud.resourcemanager_v3 import ProjectsClient
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
from app.gcp_evidence.credentials_context import gcp_user_credentials_scope
from app.gcp_evidence.services.gcp_credentials_resolver import (
    resolve_optional_user_credentials,
    resolve_optional_user_credentials_or_adc,
    resolve_project_id,
)
from app.services.cycle_user_gcp_config import (
    begin_oauth_state,
    clear_oauth_connection,
    complete_oauth,
    delete_cycle_user_gcp_config,
    gcp_oauth_env_configured,
    get_row,
    get_row_by_oauth_state,
    mark_connect_api_test_passed,
    save_gcp_context_with_access_email,
    store_iam_access_check_result,
)
from app.services.gcp_iam_email_check import check_user_email_in_project_iam
from app.services.gcp_google_oauth import authorization_url, email_from_credentials, exchange_code_for_credentials
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


def _frontend_oauth_success_url() -> str:
    custom = (settings.GCP_OAUTH_FRONTEND_REDIRECT_URL or "").strip()
    if custom:
        sep = "&" if "?" in custom else "?"
        return f"{custom}{sep}gcp_oauth=success"
    origins = settings.CORS_ORIGINS or []
    base = origins[0].rstrip("/") if origins else "http://localhost:3000"
    return f"{base}/gcp?gcp_oauth=success"


def _frontend_oauth_error_url(message: str) -> str:
    q = quote(message[:500], safe="")
    custom = (settings.GCP_OAUTH_FRONTEND_REDIRECT_URL or "").strip()
    if custom:
        sep = "&" if "?" in custom else "?"
        return f"{custom}{sep}gcp_oauth=error&message={q}"
    origins = settings.CORS_ORIGINS or []
    base = origins[0].rstrip("/") if origins else "http://localhost:3000"
    return f"{base}/gcp?gcp_oauth=error&message={q}"


class GcpContextBody(BaseModel):
    gcp_project_id: str
    access_verification_email: str


@router.post("/context")
def save_gcp_context(
    body: GcpContextBody,
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_db),
) -> dict:
    """
    Save GCP project ID and team member email, then check IAM policy for a direct ``user:email`` binding
    (does not expand Google Groups).
    """
    try:
        row = save_gcp_context_with_access_email(
            db,
            scope.tenant_id,
            scope.cycle_id,
            scope.user_id,
            body.gcp_project_id,
            body.access_verification_email,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    pid = resolve_project_id(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    creds, qp = resolve_optional_user_credentials_or_adc(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    iam_payload: dict
    try:
        with gcp_user_credentials_scope(creds, qp):
            iam_payload = check_user_email_in_project_iam(pid, body.access_verification_email)
    except Exception as e:
        logger.exception("IAM email check failed after save")
        d = f"Could not read IAM policy: {e}. Ensure the API identity has resourcemanager.projects.getIamPolicy on the project."
        store_iam_access_check_result(db, row, verified=False, detail=d)
        raise HTTPException(
            status_code=403,
            detail="Invalid authorization: cannot read this project's IAM policy. Check the project ID and that credentials can call resourcemanager.projects.getIamPolicy.",
        ) from e

    ok = bool(iam_payload.get("ok"))
    found = bool(iam_payload.get("found"))
    detail = (iam_payload.get("detail") or "").strip() or "IAM check completed."
    roles = list(iam_payload.get("roles") or [])

    if not ok:
        store_iam_access_check_result(db, row, verified=False, detail=detail)
        raise HTTPException(status_code=403, detail=f"Invalid authorization: {detail}")

    store_iam_access_check_result(db, row, verified=found, detail=detail)

    if not found:
        raise HTTPException(
            status_code=403,
            detail=(
                "Invalid authorization: this email has no direct user:… binding on the project IAM policy "
                "(access via Google Groups only is not verified). Use an email that appears on the policy, or ask a "
                "project admin to grant a role to this user."
            ),
        )

    # Policy read succeeded and team email is directly bound — same as POST /credentials/test.
    mark_connect_api_test_passed(db, scope.tenant_id, scope.cycle_id, scope.user_id)

    if gcp_oauth_env_configured():
        return {
            "ok": True,
            "message": "Project and email verified. Continue with Sign in with Google; we confirm API access after sign-in.",
            "iam_access_verified": True,
            "iam_access_detail": detail,
            "iam_roles": roles,
        }
    return {
        "ok": True,
        "message": "Project and email verified. You can open the dashboard.",
        "iam_access_verified": True,
        "iam_access_detail": detail,
        "iam_roles": roles,
    }


@router.post("/auth/oauth/start")
def gcp_oauth_start(scope: GcpScope = Depends(get_effective_gcp_scope), db: Session = Depends(get_db)) -> dict:
    """Returns Google authorization URL; user must have saved project id first."""
    if not gcp_oauth_env_configured():
        raise HTTPException(status_code=400, detail="Google OAuth is not configured on this server.")
    try:
        row, state = begin_oauth_state(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    if row.iam_access_verified is not True:
        raise HTTPException(
            status_code=400,
            detail="Save and verify project and team email on the Connect page first. A direct user IAM binding is required before Google sign-in.",
        )
    try:
        url = authorization_url(state)
    except Exception as e:
        logger.exception("GCP OAuth URL build failed")
        raise HTTPException(status_code=500, detail=str(e)) from e
    return {"authorization_url": url}


@router.get("/auth/oauth/callback")
def gcp_oauth_callback(
    code: str = Query(""),
    state: str = Query(""),
    db: Session = Depends(get_db),
):
    """OAuth redirect target (no Bearer token; validated via state)."""
    row = get_row_by_oauth_state(db, state)
    if not row:
        return RedirectResponse(url=_frontend_oauth_error_url("invalid_or_expired_state"))
    try:
        creds = exchange_code_for_credentials(code)
        rt = getattr(creds, "refresh_token", None) or ""
        if not rt:
            return RedirectResponse(url=_frontend_oauth_error_url("no_refresh_token_re_consent"))
        email = email_from_credentials(creds)
        if not email:
            return RedirectResponse(url=_frontend_oauth_error_url("could_not_read_email"))
        complete_oauth(db, row, refresh_token=rt, google_user_email=email)
        row = get_row(db, row.tenant_id, row.cycle_id, row.user_id)
        try:
            pid = resolve_project_id(db, row.tenant_id, row.cycle_id, row.user_id)
            creds, qp = resolve_optional_user_credentials(db, row.tenant_id, row.cycle_id, row.user_id)
            acc = (row.access_verification_email or "").strip() if row else ""
            with gcp_user_credentials_scope(creds, qp):
                iam_payload = check_user_email_in_project_iam(pid, acc)
            if iam_payload.get("ok") and iam_payload.get("found"):
                detail = (iam_payload.get("detail") or "").strip() or None
                store_iam_access_check_result(db, row, verified=True, detail=detail)
                mark_connect_api_test_passed(db, row.tenant_id, row.cycle_id, row.user_id)
            else:
                d = (iam_payload.get("detail") or "Could not verify team email on project IAM.").strip()
                store_iam_access_check_result(db, row, verified=False, detail=d)
        except Exception as ex:
            logger.warning("GCP OAuth connected but IAM verify failed: %s", ex)
    except Exception as e:
        logger.exception("GCP OAuth callback failed")
        return RedirectResponse(url=_frontend_oauth_error_url(str(e)))
    return RedirectResponse(url=_frontend_oauth_success_url())


@router.post("/auth/oauth/disconnect")
def gcp_oauth_disconnect(scope: GcpScope = Depends(get_effective_gcp_scope), db: Session = Depends(get_db)) -> dict:
    if not gcp_oauth_env_configured():
        return {"ok": True, "message": "OAuth mode not enabled."}
    clear_oauth_connection(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    return {"ok": True}


@router.get("/config")
def gcp_config_public(scope: GcpScope = Depends(get_effective_gcp_scope), db: Session = Depends(get_db)) -> dict:
    """Non-secret: project, team email, IAM check result, OAuth status."""
    row = get_row(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    oauth_on = gcp_oauth_env_configured()
    row_pid = (row.gcp_project_id or "").strip() if row else ""
    acc_em = (row.access_verification_email or "").strip() if row else ""
    iam_done = bool(row and row.iam_access_checked_at is not None) if row else False
    test_done = bool(row and row.connect_api_test_passed_at is not None) if row else False

    def _access_fields() -> dict:
        if not row:
            return {
                "access_verification_email": None,
                "iam_access_verified": None,
                "iam_access_detail": None,
            }
        return {
            "access_verification_email": acc_em or None,
            "iam_access_verified": row.iam_access_verified,
            "iam_access_detail": (row.iam_access_detail or "").strip() or None,
        }

    strict_iam = bool(getattr(settings, "GCP_REQUIRE_IAM_USER_FOUND_FOR_CONNECT", False))

    def _gate_configured_by_iam(configured: bool) -> bool:
        """When strict mode is on, team email must have a direct user:… binding on the project IAM policy."""
        if not strict_iam or not row or not acc_em:
            return configured
        if row.iam_access_verified is not True:
            return False
        return configured

    def _connect_ready_base() -> bool:
        return bool(row and row_pid and acc_em and iam_done and test_done)

    if oauth_on:
        has_oauth_tokens = bool(
            row
            and row_pid
            and acc_em
            and (row.google_user_email or "").strip()
            and (row.encrypted_refresh_token or "").strip()
        )
        connect_ready = bool(has_oauth_tokens and _connect_ready_base())
        configured = _gate_configured_by_iam(connect_ready)
        out = {
            "configured": configured,
            # True when project + email + IAM check ran + test passed (+ OAuth tokens if OAuth). Not gated by strict user:email IAM.
            "dashboard_unlocked": connect_ready,
            "project_id": row_pid or None,
            "connection_mode": "oauth",
            "oauth_enabled": True,
            "google_user_email": (row.google_user_email or "").strip() or None if row else None,
            "project_saved": bool(row_pid and acc_em),
            "iam_check_complete": iam_done,
            "connect_api_test_passed": test_done,
            "iam_strict_required": strict_iam,
        }
        out.update(_access_fields())
        return out

    connect_ready = _connect_ready_base()
    configured = _gate_configured_by_iam(connect_ready)
    out = {
        "configured": configured,
        "dashboard_unlocked": connect_ready,
        "project_id": row_pid or None,
        "connection_mode": "adc",
        "oauth_enabled": False,
        "google_user_email": None,
        "project_saved": bool(row_pid and acc_em) if row else False,
        "iam_check_complete": iam_done,
        "connect_api_test_passed": test_done,
        "iam_strict_required": strict_iam,
    }
    out.update(_access_fields())
    return out


@router.post("/credentials/test")
def test_gcp_access(scope: GcpScope = Depends(get_effective_gcp_scope), db: Session = Depends(get_db)) -> dict:
    row = get_row(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    if not row or not (row.access_verification_email or "").strip():
        raise HTTPException(status_code=400, detail="Save project ID and team email on the Connect page first.")
    pid = resolve_project_id(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    creds, qp = resolve_optional_user_credentials(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    try:
        with gcp_user_credentials_scope(creds, qp):
            iam_payload = check_user_email_in_project_iam(pid, row.access_verification_email)
    except gcp_exceptions.PermissionDenied as e:
        raise HTTPException(
            status_code=403,
            detail=f"Invalid authorization: permission denied for project {pid}: {e.message}.",
        ) from e
    except Exception as e:
        logger.exception("GCP test connection failed")
        raise HTTPException(status_code=502, detail=str(e)) from e

    if not iam_payload.get("ok"):
        raise HTTPException(
            status_code=403,
            detail=f"Invalid authorization: {iam_payload.get('detail') or 'Could not read IAM policy.'}",
        )
    if not iam_payload.get("found"):
        raise HTTPException(
            status_code=403,
            detail=(
                "Invalid authorization: this email has no direct user:… binding on the project IAM policy "
                "(access via Google Groups only is not verified)."
            ),
        )
    detail = (iam_payload.get("detail") or "").strip() or None
    store_iam_access_check_result(db, row, verified=True, detail=detail)
    mark_connect_api_test_passed(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    return {"ok": True, "project_id": pid, "message": "Team email verified on project IAM policy."}


@router.post("/runs/collect")
def trigger_gcp_collect(
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_db),
) -> dict:
    """Run all GCP collectors (ADC or per-cycle user OAuth)."""
    pid = resolve_project_id(db, scope.tenant_id, scope.cycle_id, scope.user_id)
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
def trigger_gcp_collect_structured(
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_db),
) -> dict:
    """
    Run all collectors (same DB persistence as /runs/collect) and return workbook-aligned
    StandardEvidenceResult rows (PASS | FAIL | ERROR) for each evidence item in the Excel mapping.
    """
    pid = resolve_project_id(db, scope.tenant_id, scope.cycle_id, scope.user_id)
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
def gcp_validation_precheck(
    scope: GcpScope = Depends(get_effective_gcp_scope),
    db: Session = Depends(get_db),
) -> dict:
    """Credential and permission checks before collection (non-fatal; structured)."""
    pid = resolve_project_id(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    creds, qp = resolve_optional_user_credentials(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    try:
        with gcp_user_credentials_scope(creds, qp):
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
    core_db: Session = Depends(get_db),
) -> dict:
    """Remove all GCP collector runs and evidence rows; clears Connect config so project + email + test must be redone."""
    result = delete_all_evidence_and_runs_for_tenant(
        db,
        tenant_id=scope.tenant_id,
        cycle_id=scope.cycle_id,
        user_id=scope.user_id,
        cloud_provider="gcp",
    )
    delete_cycle_user_gcp_config(core_db, scope.tenant_id, scope.cycle_id, scope.user_id)
    return {
        "deleted_evidence": result["deleted_evidence"],
        "deleted_runs": result["deleted_runs"],
        "connect_config_cleared": True,
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

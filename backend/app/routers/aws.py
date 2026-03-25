import logging
from dataclasses import dataclass
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.aws_evidence.core.db import get_db as get_aws_db, ensure_schema as ensure_aws_schema
from app.constants import PLATFORM_ADMIN_ROLES
from app.dependencies import get_current_user, get_db
from app.models.tenant import User
from app.services.tenant_aws_config import (
    delete_connection as delete_aws_connection,
    get_config_public,
    get_credentials_for_collect,
    save_config,
    save_context,
    save_connection_assume_role,
    test_connection as test_connection_service,
)
from app.services.aws_sso_oauth import start_device_authorization, poll_device_token

logger = logging.getLogger(__name__)
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
    get_evidence_for_control_grouped_by_run,
    get_control_ids_with_evidence,
    get_control_item_pairs_with_evidence,
    create_manual_evidence,
    run_all_collectors,
    delete_run,
    delete_all_evidence_and_runs_for_tenant,
    run_belongs_to_tenant,
    evidence_belongs_to_tenant,
)
from app.aws_evidence.collectors.evidence_mapping import get_apis_for_control as get_apis_for_control_items
from app.aws_evidence.collectors.aws_api_catalog import get_apis_for_run as get_run_aws_calls


router = APIRouter(prefix="/aws")


@dataclass(frozen=True)
class AwsScope:
    tenant_id: UUID
    cycle_id: UUID
    user_id: UUID


def get_effective_aws_tenant(
    tenant_id: UUID | None = Query(None, description="For platform admin: tenant to act on"),
    user: User = Depends(get_current_user),
) -> UUID:
    """
    Resolve effective tenant for AWS operations.
    Tenant user: use their tenant_id. Platform admin: may pass ?tenant_id= to view/manage that tenant.
    """
    if user.tenant_id is not None:
        return user.tenant_id
    if user.tenant_id is None and user.role in PLATFORM_ADMIN_ROLES and tenant_id is not None:
        return tenant_id
    raise HTTPException(
        status_code=403,
        detail="Tenant context required for AWS operations. Sign in with a tenant account or, as platform admin, pass ?tenant_id=.",
    )


def get_effective_aws_scope(
    cycle_id: UUID = Query(..., description="Cycle scope for AWS operations"),
    tenant_id: UUID = Depends(get_effective_aws_tenant),
    user: User = Depends(get_current_user),
) -> AwsScope:
    if not user.id:
        raise HTTPException(status_code=403, detail="User context required for AWS operations.")
    return AwsScope(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user.id)


class AwsCredentialsBody(BaseModel):
    access_key_id: str
    secret_access_key: str
    aws_region: str = "us-east-1"
    aws_account_id: str | None = None


class AwsContextBody(BaseModel):
    """Account ID and Region only — enter the system without credentials."""
    aws_account_id: str
    aws_region: str = "us-east-1"


class AwsConnectBody(BaseModel):
    """Role ARN + Region only. Backend uses configured External ID (e.g. Swift-Audit)."""
    role_arn: str
    region: str = "us-east-1"


@router.post("/connect")
def connect_validate_and_save(
    body: AwsConnectBody,
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
) -> dict:
    """
    Validate connection by calling STS AssumeRole with Role ARN and platform External ID; if success, save role_arn, region.
    Tenant role trust policy must allow your platform account and use the same External ID (set via AWS_ASSUME_ROLE_EXTERNAL_ID, default Swift-Audit).
    """
    try:
        save_connection_assume_role(
            db,
            scope.tenant_id,
            scope.cycle_id,
            scope.user_id,
            role_arn=body.role_arn.strip(),
            region=(body.region or "us-east-1").strip() or "us-east-1",
        )
        return {"ok": True, "message": "Validated and connected. You can run audits from the Dashboard."}
    except ValueError as e:
        logger.warning(
            "AWS connect validation failed (tenant=%s cycle=%s user=%s): %s",
            scope.tenant_id,
            scope.cycle_id,
            scope.user_id,
            str(e),
        )
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/connect")
def disconnect_and_delete_all(
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
    aws_db: Session = Depends(get_aws_db),
) -> dict:
    """
    Disconnect the current AWS account: delete all evidence and collector runs for this tenant,
    then remove the AWS connection config. Cannot be undone.
    """
    try:
        ensure_aws_schema()
        result = delete_all_evidence_and_runs_for_tenant(
            aws_db, scope.tenant_id, scope.cycle_id, scope.user_id
        )
        delete_aws_connection(db, scope.tenant_id, scope.cycle_id, scope.user_id)
        return {
            "ok": True,
            "message": "Connection and all evidence data have been deleted.",
            "deleted_evidence": result["deleted_evidence"],
            "deleted_runs": result["deleted_runs"],
        }
    except Exception as exc:
        logger.exception("DELETE /aws/connect failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc


def _validate_sso_start_url(url: str) -> str:
    """Validate IAM Identity Center start URL format (https, awsapps.com/start)."""
    u = (url or "").strip()
    if not u:
        raise ValueError("sso_start_url is required")
    if not u.startswith("https://"):
        raise ValueError("sso_start_url must use HTTPS")
    if "awsapps.com" not in u and ".awsapps.com" not in u:
        raise ValueError("sso_start_url should be your IAM Identity Center URL (e.g. https://my-company.awsapps.com/start)")
    if len(u) > 512:
        raise ValueError("sso_start_url is too long")
    return u


class OAuthStartBody(BaseModel):
    sso_start_url: str
    sso_region: str = "us-east-1"


class OAuthPollBody(BaseModel):
    device_code: str


@router.post("/auth/oauth/start")
def oauth_start(
    body: OAuthStartBody,
    scope: AwsScope = Depends(get_effective_aws_scope),
) -> dict:
    """
    Start AWS SSO device authorization (IAM Identity Center).
    Returns verification_uri, verification_uri_complete, user_code, device_code, expires_in, interval.
    Frontend shows URL + code to user and polls POST /aws/auth/oauth/poll with device_code until success.
    """
    try:
        start_url = _validate_sso_start_url(body.sso_start_url)
        return start_device_authorization(
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
            sso_start_url=start_url,
            sso_region=(body.sso_region or "us-east-1").strip() or "us-east-1",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/auth/oauth/poll")
def oauth_poll(
    body: OAuthPollBody,
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
) -> dict:
    """
    Poll device code: exchange for tokens and save SSO connection.
    Call after user has completed browser sign-in. Respect interval from start response (e.g. 5s).
    On success: stores encrypted refresh token only (no long-lived access keys); returns account_id, role_name.
    """
    device_code = (body.device_code or "").strip()
    if not device_code:
        raise HTTPException(status_code=400, detail="device_code is required")
    try:
        return poll_device_token(device_code, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/credentials")
def get_credentials(
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
) -> dict:
    """Get AWS connection config for the effective tenant (no secrets)."""
    return get_config_public(db, scope.tenant_id, scope.cycle_id, scope.user_id)


@router.post("/context")
def save_aws_context(
    body: AwsContextBody,
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
) -> dict:
    """Save only Account ID and Region to enter the system. No credentials required."""
    account_id = (body.aws_account_id or "").strip()
    if not account_id:
        raise HTTPException(status_code=400, detail="AWS Account ID is required.")
    save_context(
        db,
        scope.tenant_id,
        scope.cycle_id,
        scope.user_id,
        aws_account_id=account_id,
        aws_region=(body.aws_region or "us-east-1").strip() or "us-east-1",
    )
    return {"ok": True, "message": "Connected. You can use Dashboard, Evidence, and Controls."}


@router.post("/credentials")
def save_credentials(
    body: AwsCredentialsBody,
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
) -> dict:
    """Save encrypted AWS credentials for the effective tenant."""
    try:
        save_config(
            db,
            scope.tenant_id,
            scope.cycle_id,
            scope.user_id,
            access_key_id=body.access_key_id,
            secret_access_key=body.secret_access_key,
            aws_region=body.aws_region or "us-east-1",
            aws_account_id=body.aws_account_id,
        )
        return {"ok": True, "message": "Credentials saved. You can now fetch AWS evidence from the Dashboard."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/credentials/test")
def test_credentials(
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
) -> dict:
    """Test saved AWS credentials with STS GetCallerIdentity. No secrets in response."""
    try:
        return test_connection_service(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/runs")
def list_runs(
    limit: int = Query(20, ge=1, le=100),
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> list[dict]:
    """
    List recent collector runs (execution history) with evidence counts for the current tenant.
    """
    try:
        runs = get_runs(
            db,
            limit=limit,
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
        )
    except Exception as exc:
        logger.exception("GET /aws/runs failed: %s", exc)
        db.rollback()
        try:
            ensure_aws_schema()
            runs = get_runs(
                db,
                limit=limit,
                tenant_id=scope.tenant_id,
                cycle_id=scope.cycle_id,
                user_id=scope.user_id,
            )
        except Exception as retry_exc:
            logger.exception("GET /aws/runs retry after ensure_schema failed: %s", retry_exc)
            raise HTTPException(status_code=502, detail=str(retry_exc)) from retry_exc
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
            "error_message": getattr(r, "error_message", None),
        }
        for r in runs
    ]


@router.get("/runs/{run_id}")
def get_run_detail(
    run_id: UUID,
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> dict:
    """Run detail with evidence count and AWS API calls by collector."""
    run = get_run_by_id(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if not run_belongs_to_tenant(run, scope.tenant_id, scope.cycle_id, scope.user_id):
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
        "error_message": getattr(run, "error_message", None),
    }


@router.delete("/runs/{run_id}")
def delete_run_history(
    run_id: UUID,
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> dict:
    """
    Delete a collector run and all associated evidence rows.
    """
    run = get_run_by_id(db, run_id)
    if not run or not run_belongs_to_tenant(run, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Run not found")
    try:
        deleted = delete_run(db, run_id)
    except Exception as exc:
        logger.exception("DELETE /aws/runs/%s failed: %s", run_id, exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"run_id": str(run_id), "deleted_evidence": deleted}


@router.post("/runs/collect")
def trigger_collect(
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_db),
) -> dict:
    """
    Trigger AWS evidence collection using the tenant's saved credentials.
    Returns run_id on success.
    """
    creds = get_credentials_for_collect(db, scope.tenant_id, scope.cycle_id, scope.user_id)
    if not creds:
        raise HTTPException(
            status_code=400,
            detail="No AWS connection configured. Go to AWS → Connect and enter Account ID and Region (backend uses env AWS credentials), or add Access Key and Secret in Credentials.",
        )
    try:
        run_id = run_all_collectors(
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
            credentials=creds,
            trigger_type="manual",
        )
        return {"run_id": str(run_id), "status": "success"}
    except Exception as exc:  # pragma: no cover
        msg = str(exc) if str(exc) else "Collection failed"
        raise HTTPException(status_code=502, detail=msg) from exc


@router.get("/evidence")
def list_evidence(
    limit: int = Query(200, ge=1, le=1000),
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> list[dict]:
    """
    List AWS evidence rows for the current tenant.
    """
    try:
        items = get_evidence_list(
            db,
            limit=limit,
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

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


@router.get("/evidence/{evidence_id}/content")
def get_evidence_content(
    evidence_id: UUID,
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> dict:
    """
    Fetch AWS evidence content JSON from DB (response_json).
    """
    try:
        e = get_evidence_by_id(db, evidence_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not e:
        raise HTTPException(status_code=404, detail="Evidence not found")
    if not evidence_belongs_to_tenant(e, scope.tenant_id, scope.cycle_id, scope.user_id):
        raise HTTPException(status_code=404, detail="Evidence not found")

    if e.response_json is None:
        raise HTTPException(status_code=404, detail="Evidence content not available (no response_json)")

    return e.response_json


# ─── Controls (for Control View UI) ─────────────────────────────────────────

@router.get("/controls")
def list_controls(
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> list[dict]:
    """List controls from evidence_sufficiency_matrix (or swift_2026.controls when USE_SWIFT_2026)."""
    try:
        rows = get_controls(db)
        return [{"control_id": r.get("control_id"), "control_name": r.get("control_name"), "item_code": r.get("item_code"), "mandatory_flag": r.get("mandatory_flag")} for r in rows]
    except Exception:
        return []


@router.get("/controls/coverage")
def controls_coverage(
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> dict:
    """Control IDs that have at least one evidence row for the current tenant."""
    try:
        ids = get_control_ids_with_evidence(
            db, tenant_id=scope.tenant_id, cycle_id=scope.cycle_id, user_id=scope.user_id
        )
        return {"control_ids_with_evidence": ids}
    except Exception:
        return {"control_ids_with_evidence": []}


@router.get("/controls/coverage/items")
def controls_coverage_items(
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> list:
    """(control_id, control_name, item_code) for each evidence item that has at least one evidence row. Use for sidebar so clicking A2 shows only A2 evidence."""
    try:
        return get_control_item_pairs_with_evidence(
            db, tenant_id=scope.tenant_id, cycle_id=scope.cycle_id, user_id=scope.user_id
        )
    except Exception:
        return []


@router.get("/control/{control_id}")
def get_control_detail(
    control_id: str,
    item_code: str | None = Query(None, description="Filter to this evidence item only (e.g. A2). When set, only that item's evidence and required items are returned."),
    scope: AwsScope = Depends(get_effective_aws_scope),
    db: Session = Depends(get_aws_db),
) -> dict:
    """Control detail with required evidence items, evidence grouped by run, and AWS calls. Optional item_code filters to a single evidence item (e.g. A2) so the panel shows only that item's data."""
    try:
        control = get_control_by_id(db, control_id)
        matrix = get_control_matrix_for_control(db, control_id)
        evidence_by_run = get_evidence_for_control_grouped_by_run(
            db,
            control_id,
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if item_code and item_code.strip():
        item_code = item_code.strip()
        required = [m for m in matrix if (m.get("item_code") or "").strip() == item_code]
        item_codes = [item_code]
        # Filter evidence_by_run to only evidence rows with this item_code
        filtered_runs = []
        for run in evidence_by_run:
            run_evidence = [e for e in run.get("evidence", []) if (e.get("item_code") or "").strip() == item_code]
            if run_evidence:
                filtered_runs.append({
                    **run,
                    "evidence": run_evidence,
                    "evidence_count": len(run_evidence),
                })
        evidence_by_run = filtered_runs
    else:
        required = [{"item_code": m.get("item_code"), "evidence_item_name": m.get("evidence_item_name")} for m in matrix]
        item_codes = [m.get("item_code") for m in matrix if m.get("item_code")]

    aws_calls = get_apis_for_control_items(item_codes) if item_codes else {"aws_apis": [], "by_evidence_item": []}
    return {
        "control_id": control.get("control_id") or control_id,
        "control_name": control.get("control_name"),
        "item_code": item_code if item_code else None,
        "required_evidence_items": required,
        "evidence_by_run": evidence_by_run,
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
    scope: AwsScope = Depends(get_effective_aws_scope),
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
            tenant_id=scope.tenant_id,
            cycle_id=scope.cycle_id,
            user_id=scope.user_id,
        )
        return {"evidence_id": str(evidence_id), "control_id": body.control_id, "item_code": body.item_code}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


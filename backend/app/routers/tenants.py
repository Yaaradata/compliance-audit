from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..constants import PLATFORM_ADMIN_ROLES
from ..dependencies import get_db, get_platform_admin, get_current_user
from ..middleware.auth import hash_password
from ..models.tenant import Tenant, User
from ..schemas.tenant import TenantCreate, TenantUpdate, TenantOut, TenantUserCreate
from ..services.tenant_aws_config import get_config_public, save_config

router = APIRouter(prefix="/tenants")


def _can_manage_tenant_aws(tenant_id: UUID, user: User, db: Session) -> None:
    """Raise 404 if tenant not found, 403 if user cannot manage this tenant's AWS config."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if user.tenant_id is None and user.role in PLATFORM_ADMIN_ROLES:
        return
    if user.tenant_id == tenant_id and user.role in ("tenant_admin", "compliance_officer"):
        return
    raise HTTPException(status_code=403, detail="Not authorized to manage this tenant's AWS config.")


@router.get("", response_model=list[TenantOut])
def list_tenants(db: Session = Depends(get_db), user: User = Depends(get_platform_admin)):
    return db.query(Tenant).order_by(Tenant.created_at.desc()).all()


@router.post("", response_model=TenantOut, status_code=201)
def create_tenant(req: TenantCreate, db: Session = Depends(get_db), user: User = Depends(get_platform_admin)):
    if db.query(Tenant).filter(Tenant.slug == req.slug).first():
        raise HTTPException(status_code=400, detail="Slug already in use")

    tenant = Tenant(name=req.name, slug=req.slug, bic_code=req.bic_code)
    db.add(tenant)
    db.flush()

    # New: initial_users with password and role (tenant roles only; platform admin does not login as Compliance Officer).
    if req.initial_users:
        for u in req.initial_users:
            if db.query(User).filter(User.email == u.email).first():
                raise HTTPException(status_code=400, detail=f"User with email {u.email} already exists")
            new_user = User(
                email=u.email,
                name=u.name,
                password_hash=hash_password(u.password),
                role=u.role,
                tenant_id=tenant.id,
            )
            db.add(new_user)

    # Legacy: bank_admins without password (default password, compliance_officer).
    if req.bank_admins:
        for admin_data in req.bank_admins:
            email = (admin_data or {}).get("email")
            if not email:
                continue
            if db.query(User).filter(User.email == email).first():
                continue
            admin_user = User(
                email=email,
                name=(admin_data or {}).get("name", email),
                password_hash=hash_password("changeme123"),
                role="compliance_officer",
                tenant_id=tenant.id,
            )
            db.add(admin_user)

    db.commit()
    db.refresh(tenant)
    return tenant


@router.get("/{tenant_id}", response_model=TenantOut)
def get_tenant(tenant_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_platform_admin)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantOut)
def update_tenant(tenant_id: UUID, req: TenantUpdate, db: Session = Depends(get_db), user: User = Depends(get_platform_admin)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(tenant, field, value)

    db.commit()
    db.refresh(tenant)
    return tenant


class TenantAwsConfigBody(BaseModel):
    access_key_id: str
    secret_access_key: str
    aws_region: str = "us-east-1"
    aws_account_id: str | None = None


@router.get("/{tenant_id}/aws-config")
def get_tenant_aws_config(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Get AWS connection config for a tenant (no secrets). Platform admin or tenant_admin/compliance_officer for own tenant."""
    _can_manage_tenant_aws(tenant_id, user, db)
    return get_config_public(db, tenant_id)


@router.put("/{tenant_id}/aws-config")
def put_tenant_aws_config(
    tenant_id: UUID,
    body: TenantAwsConfigBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Create or update AWS credentials for a tenant. Platform admin or tenant_admin/compliance_officer for own tenant."""
    _can_manage_tenant_aws(tenant_id, user, db)
    try:
        save_config(
            db,
            tenant_id,
            access_key_id=body.access_key_id,
            secret_access_key=body.secret_access_key,
            aws_region=body.aws_region or "us-east-1",
            aws_account_id=body.aws_account_id,
        )
        return {"ok": True, "message": "AWS credentials saved for this tenant."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{tenant_id}/users", response_model=dict, status_code=201)
def add_tenant_user(
    tenant_id: UUID,
    req: TenantUserCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    """Platform admin adds a user to a tenant with email, name, password, and role (Compliance Officer, etc.)."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail=f"User with email {req.email} already exists")

    new_user = User(
        email=req.email,
        name=req.name,
        password_hash=hash_password(req.password),
        role=req.role,
        tenant_id=tenant.id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": str(new_user.id), "email": new_user.email, "name": new_user.name, "role": new_user.role}

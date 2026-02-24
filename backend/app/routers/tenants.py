from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, role_required
from ..models.tenant import Tenant, User
from ..schemas.tenant import TenantCreate, TenantUpdate, TenantOut

router = APIRouter(prefix="/tenants")


@router.get("", response_model=list[TenantOut])
def list_tenants(db: Session = Depends(get_db), user: User = Depends(role_required("admin"))):
    return db.query(Tenant).order_by(Tenant.created_at.desc()).all()


@router.post("", response_model=TenantOut, status_code=201)
def create_tenant(req: TenantCreate, db: Session = Depends(get_db), user: User = Depends(role_required("admin"))):
    if db.query(Tenant).filter(Tenant.slug == req.slug).first():
        raise HTTPException(status_code=400, detail="Slug already in use")

    tenant = Tenant(name=req.name, slug=req.slug, bic_code=req.bic_code)
    db.add(tenant)
    db.flush()

    if req.bank_admins:
        from ..middleware.auth import hash_password
        for admin_data in req.bank_admins:
            admin_user = User(
                email=admin_data["email"],
                name=admin_data.get("name", admin_data["email"]),
                password_hash=hash_password("changeme123"),
                role="compliance_officer",
                tenant_id=tenant.id,
            )
            db.add(admin_user)

    db.commit()
    db.refresh(tenant)
    return tenant


@router.get("/{tenant_id}", response_model=TenantOut)
def get_tenant(tenant_id: UUID, db: Session = Depends(get_db), user: User = Depends(role_required("admin"))):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantOut)
def update_tenant(tenant_id: UUID, req: TenantUpdate, db: Session = Depends(get_db), user: User = Depends(role_required("admin"))):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(tenant, field, value)

    db.commit()
    db.refresh(tenant)
    return tenant

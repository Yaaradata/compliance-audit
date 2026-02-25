from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..middleware.auth import hash_password, verify_password, create_access_token
from ..models.tenant import User, Tenant
from ..schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserOut
from ..constants import PLATFORM_ADMIN_ROLES, TENANT_ROLES

router = APIRouter(prefix="/auth")


@router.post("/signup", response_model=TokenResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Platform admin: must have no tenant. Tenant users: must have a tenant.
    if req.role in PLATFORM_ADMIN_ROLES:
        if req.tenant_id is not None:
            raise HTTPException(status_code=400, detail="Platform admin must not be associated with a tenant")
        tenant_id = None
    elif req.role in TENANT_ROLES:
        if not req.tenant_id:
            raise HTTPException(
                status_code=400,
                detail="Tenant is required for this role. Ask your platform admin to add you to a tenant.",
            )
        tenant = db.query(Tenant).filter(Tenant.id == req.tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        tenant_id = req.tenant_id
    else:
        # Unknown role: require tenant and create under it (or auto-create default tenant for backward compat)
        tenant_id = req.tenant_id
        if tenant_id:
            tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
            if not tenant:
                raise HTTPException(status_code=404, detail="Tenant not found")
        else:
            slug = req.email.split("@")[0]
            existing_tenant = db.query(Tenant).filter(Tenant.slug == slug).first()
            if existing_tenant:
                tenant_id = existing_tenant.id
            else:
                tenant = Tenant(name="Default Tenant", slug=slug)
                db.add(tenant)
                db.flush()
                tenant_id = tenant.id

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        name=req.name,
        role=req.role,
        tenant_id=tenant_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role, "tenantId": str(user.tenant_id) if user.tenant_id else None})
    return TokenResponse(token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role, "tenantId": str(user.tenant_id) if user.tenant_id else None})
    return TokenResponse(token=token, user=UserOut.model_validate(user))


@router.post("/logout")
def logout():
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)

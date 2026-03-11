from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, field_validator


# Allowed roles when platform admin creates tenant users (not platform_admin).
TENANT_ROLE_OPTIONS = [
    "compliance_officer",
    "tenant_admin",
    "it_sme",
    "internal_reviewer_l1",
    "internal_reviewer_l2",
    "external_assessor",
]


class TenantUserCreate(BaseModel):
    """Single user to create under a tenant (with password and role)."""
    email: str
    name: str
    password: str
    role: str = "compliance_officer"

    @field_validator("role")
    @classmethod
    def role_must_be_tenant_role(cls, v: str) -> str:
        if v not in TENANT_ROLE_OPTIONS:
            raise ValueError(f"Role must be one of: {TENANT_ROLE_OPTIONS}")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class TenantCreate(BaseModel):
    name: str
    slug: str
    bic_code: str | None = None
    details: str | None = None
    # New: users with password and role (replaces bank_admins without password).
    initial_users: list[TenantUserCreate] | None = None
    # Legacy: still supported for backward compatibility; creates users with default password and compliance_officer.
    bank_admins: list[dict] | None = None


class TenantUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    bic_code: str | None = None


class TenantOut(BaseModel):
    id: UUID
    name: str
    slug: str
    bic_code: str | None = None
    architecture: str | None = None
    subscription: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

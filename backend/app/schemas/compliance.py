"""
Schemas for compliance officer user and group management.
Stored in core.users; group_name nullable = individual.
"""

from uuid import UUID

from pydantic import BaseModel, field_validator

from .tenant import TENANT_ROLE_OPTIONS


class ComplianceUserOut(BaseModel):
    """User as returned to compliance officer (tenant-scoped)."""
    id: UUID
    email: str
    name: str
    role: str
    group_name: str | None = None

    model_config = {"from_attributes": True}


class ComplianceUserCreate(BaseModel):
    """Create a user in the officer's tenant; optional group or individual."""
    email: str
    name: str = ""
    password: str
    role: str = "it_sme"
    group_name: str | None = None

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


class ComplianceUserUpdateGroup(BaseModel):
    """Update only the user's group assignment (null = individual)."""
    group_name: str | None = None

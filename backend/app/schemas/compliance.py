"""
Schemas for compliance officer user and group management.
Stored in core.users; group_name nullable = individual.
"""

from uuid import UUID

from pydantic import BaseModel, field_validator

class ComplianceUserOut(BaseModel):
    """User as returned to compliance officer (tenant-scoped)."""
    id: UUID
    email: str
    name: str
    role: str | None = None
    group_name: str | None = None
    is_external: bool = False

    model_config = {"from_attributes": True}


class ComplianceUserCreate(BaseModel):
    """Create a user in the officer's tenant; optional group or individual. Role is assigned per cycle."""
    email: str
    name: str = ""
    password: str
    is_external: bool = False
    group_name: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class ComplianceUserUpdateGroup(BaseModel):
    """Update the user's group assignment (null = individual) and/or is_external (for L3 eligibility)."""
    group_name: str | None = None
    is_external: bool | None = None

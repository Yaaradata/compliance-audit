"""Schemas for cycle role and evidence assignments."""

from uuid import UUID
from pydantic import BaseModel, field_validator

CYCLE_ROLES = ("it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor")
ASSIGNMENT_TYPES = ("group", "user")


class RoleAssignmentItem(BaseModel):
    role: str
    assignment_type: str
    group_name: str | None = None
    user_id: UUID | None = None

    @field_validator("role")
    @classmethod
    def role_valid(cls, v: str) -> str:
        if v not in CYCLE_ROLES:
            raise ValueError(f"Role must be one of: {CYCLE_ROLES}")
        return v

    @field_validator("assignment_type")
    @classmethod
    def assignment_type_valid(cls, v: str) -> str:
        if v not in ASSIGNMENT_TYPES:
            raise ValueError(f"assignment_type must be one of: {ASSIGNMENT_TYPES}")
        return v


class RoleAssignmentsPut(BaseModel):
    assignments: list[RoleAssignmentItem]


class EvidenceAssignmentItem(BaseModel):
    evidence_item_id: str
    assignment_type: str
    group_name: str | None = None
    user_id: UUID | None = None

    @field_validator("assignment_type")
    @classmethod
    def assignment_type_valid(cls, v: str) -> str:
        if v not in ASSIGNMENT_TYPES:
            raise ValueError(f"assignment_type must be one of: {ASSIGNMENT_TYPES}")
        return v


class EvidenceAssignmentsPut(BaseModel):
    assignments: list[EvidenceAssignmentItem]


class ConflictOut(BaseModel):
    uid: str
    name: str
    roles: list[str]
    msg: str

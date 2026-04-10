"""Schemas for cycle role and evidence assignments."""

from uuid import UUID
from datetime import date
from pydantic import BaseModel, field_validator, model_validator

CYCLE_ROLES = ("it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor")
ASSIGNMENT_TYPES = ("group", "user")


class RoleAssignmentItem(BaseModel):
    role: str
    assignment_type: str
    group_name: str | None = None
    user_id: UUID | None = None
    role_start_date: date | None = None
    role_end_date: date | None = None

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

    @model_validator(mode="after")
    def role_end_on_or_after_start(self):
        if (
            self.role_start_date
            and self.role_end_date
            and self.role_end_date < self.role_start_date
        ):
            raise ValueError("role_end_date must be on or after role_start_date")
        return self


class RoleAssignmentsPut(BaseModel):
    assignments: list[RoleAssignmentItem]
    apply_cycle_dates_if_missing: bool = False


class EvidenceAssignmentItem(BaseModel):
    evidence_item_id: str
    assignment_type: str
    group_name: str | None = None
    user_id: UUID | None = None
    evidence_start_date: date | None = None
    evidence_end_date: date | None = None

    @field_validator("assignment_type")
    @classmethod
    def assignment_type_valid(cls, v: str) -> str:
        if v not in ASSIGNMENT_TYPES:
            raise ValueError(f"assignment_type must be one of: {ASSIGNMENT_TYPES}")
        return v

    @field_validator("evidence_end_date")
    @classmethod
    def evidence_date_range_valid(cls, v: date | None, info) -> date | None:
        start = info.data.get("evidence_start_date")
        if (start and not v) or (v and not start):
            raise ValueError("Both evidence_start_date and evidence_end_date must be provided together")
        if start and v and v < start:
            raise ValueError("evidence_end_date must be on or after evidence_start_date")
        return v


class EvidenceAssignmentsPut(BaseModel):
    assignments: list[EvidenceAssignmentItem]
    apply_it_expert_dates_if_missing: bool = False


class ConflictOut(BaseModel):
    uid: str
    name: str
    roles: list[str]
    msg: str

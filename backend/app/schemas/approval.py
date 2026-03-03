from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class GateOut(BaseModel):
    id: UUID
    cycle_id: UUID
    gate: str
    status: str
    approved_by: UUID | None = None
    approved_at: datetime | None = None
    mfa_verified: bool = False
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApproveGateRequest(BaseModel):
    notes: str | None = None
    mfa_token: str | None = None


class ReportOut(BaseModel):
    id: UUID
    cycle_id: UUID
    report_kind: str
    sections: list = []
    snapshot_data: dict = {}
    finalized_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CreateReportRequest(BaseModel):
    report_kind: str = "draft"


class UpdateReportRequest(BaseModel):
    sections: list | None = None

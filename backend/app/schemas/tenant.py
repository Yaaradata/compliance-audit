from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class TenantCreate(BaseModel):
    name: str
    slug: str
    bic_code: str | None = None
    details: str | None = None
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

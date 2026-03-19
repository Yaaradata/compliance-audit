from uuid import UUID
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "compliance_officer"
    tenant_id: UUID | None = None


class TokenResponse(BaseModel):
    token: str
    user: "UserOut"


class UserOut(BaseModel):
    id: UUID
    email: str
    name: str
    role: str | None = None
    tenant_id: UUID | None = None
    is_active: bool = True

    model_config = {"from_attributes": True}

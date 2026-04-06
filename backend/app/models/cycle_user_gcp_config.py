"""Per-tenant, per-cycle, per-user Google Cloud connection (OAuth refresh token encrypted at rest)."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from .tenant import Tenant, User
from .assessment import AssessmentCycle


class CycleUserGcpConfig(Base):
    __tablename__ = "cycle_user_gcp_config"
    __table_args__ = {"schema": "core"}

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(Tenant.__table__.c.id, ondelete="CASCADE"),
        primary_key=True,
    )
    cycle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(AssessmentCycle.__table__.c.id, ondelete="CASCADE"),
        primary_key=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(User.__table__.c.id, ondelete="CASCADE"),
        primary_key=True,
    )
    gcp_project_id: Mapped[str] = mapped_column(String(255), nullable=False, server_default="")
    access_verification_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    iam_access_verified: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    iam_access_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    iam_access_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    google_user_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    encrypted_refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    oauth_state: Mapped[str | None] = mapped_column(String(128), nullable=True)
    oauth_state_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    connected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    connect_api_test_passed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

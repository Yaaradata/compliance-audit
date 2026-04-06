"""Per-cycle Azure subscription + optional service principal (secret encrypted at rest)."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from .tenant import Tenant, User
from .assessment import AssessmentCycle


class CycleUserAzureConfig(Base):
    __tablename__ = "cycle_user_azure_config"
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
    azure_subscription_id: Mapped[str] = mapped_column(String(64), nullable=False, server_default="")
    azure_tenant_id: Mapped[str] = mapped_column(String(64), nullable=False, server_default="")
    azure_client_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    encrypted_client_secret: Mapped[str | None] = mapped_column(Text, nullable=True)
    connect_api_test_passed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

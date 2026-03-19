"""Per-tenant AWS connection config (credentials stored encrypted)."""
import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from ..models.tenant import Tenant


class TenantAwsConfig(Base):
    __tablename__ = "tenant_aws_config"
    __table_args__ = {"schema": "core"}

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(Tenant.__table__.c.id, ondelete="CASCADE"),
        primary_key=True,
    )
    aws_account_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    aws_region: Mapped[str] = mapped_column(String(32), nullable=False, server_default="us-east-1")
    connection_type: Mapped[str] = mapped_column(String(32), nullable=False, server_default="access_key")
    encrypted_access_key_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    encrypted_secret_access_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    sso_start_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    sso_region: Mapped[str | None] = mapped_column(String(32), nullable=True)
    encrypted_refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    sso_account_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sso_role_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    connected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    tenant = relationship("Tenant", backref="aws_config", foreign_keys=[tenant_id])

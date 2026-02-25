import uuid
from datetime import datetime, date

from sqlalchemy import String, Integer, Boolean, Date, DateTime, ForeignKey, Numeric, Text, text, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class AssessmentCycle(Base):
    __tablename__ = "assessment_cycles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    framework_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("audit_frameworks.id"))
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    cycle_year: Mapped[int] = mapped_column(Integer, nullable=False)
    phase: Mapped[str] = mapped_column(String(20), nullable=False, server_default="setup")
    architecture_type: Mapped[str | None] = mapped_column(String(5))
    start_date: Mapped[date | None] = mapped_column(Date)
    target_submission_date: Mapped[date | None] = mapped_column(Date)
    snapshot_data: Mapped[dict] = mapped_column(JSONB, server_default="{}")
    previous_cycle_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    tenant = relationship("Tenant", back_populates="assessment_cycles", foreign_keys=[tenant_id])
    control_applicabilities = relationship("ControlApplicability", back_populates="cycle", cascade="all, delete-orphan")
    approval_gates = relationship("ApprovalGate", back_populates="cycle", cascade="all, delete-orphan")


class ControlApplicability(Base):
    __tablename__ = "control_applicability"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("assessment_cycles.id"), nullable=False)
    control_id: Mapped[str] = mapped_column(String(10), nullable=False)
    applicability: Mapped[str] = mapped_column(String(20), nullable=False)
    is_overridden: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    override_reason: Mapped[str | None] = mapped_column(Text)
    score: Mapped[float] = mapped_column(Numeric(5, 2), server_default="0")
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="not_started")
    evidence_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    cycle = relationship("AssessmentCycle", back_populates="control_applicabilities", foreign_keys=[cycle_id])


class EvidenceSubmission(Base):
    __tablename__ = "evidence_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    evidence_item_id: Mapped[str] = mapped_column(String(5), nullable=False)
    submitted_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="draft")
    scope_key: Mapped[str | None] = mapped_column(String(255))
    form_data: Mapped[dict] = mapped_column(JSONB, server_default="{}")
    completion_pct: Mapped[float] = mapped_column(Numeric(5, 2), server_default="0")
    version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")
    ai_summary: Mapped[str | None] = mapped_column(Text)
    ai_confidence: Mapped[float | None] = mapped_column(Numeric(5, 2))
    evaluation_result: Mapped[dict | None] = mapped_column(JSONB)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class EvidenceAttachment(Base):
    __tablename__ = "evidence_attachments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, server_default="0")
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    sha256_hash: Mapped[str | None] = mapped_column(String(64))
    upload_status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="uploaded")
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

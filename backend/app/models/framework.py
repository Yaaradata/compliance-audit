import uuid
from datetime import datetime, date

from sqlalchemy import String, Integer, Boolean, Date, DateTime, Numeric, Text, text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class AuditFramework(Base):
    __tablename__ = "audit_frameworks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    effective_date: Mapped[date | None] = mapped_column(Date)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, server_default="{}")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    schema_name: Mapped[str] = mapped_column(String(20), nullable=False, server_default="swift_2025")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class Control(Base):
    __tablename__ = "controls"

    id: Mapped[str] = mapped_column(String(10), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    control_type: Mapped[str] = mapped_column(String(20), nullable=False)
    objective: Mapped[int] = mapped_column(Integer, nullable=False)
    architecture_applicability: Mapped[list] = mapped_column(ARRAY(Text), server_default="{}")
    description: Mapped[str | None] = mapped_column(Text)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class EvidenceDomain(Base):
    __tablename__ = "evidence_domains"

    id: Mapped[str] = mapped_column(String(1), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    color: Mapped[str | None] = mapped_column(String(10))
    accent_color: Mapped[str | None] = mapped_column(String(10))
    item_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class CanonicalEvidenceItem(Base):
    __tablename__ = "canonical_evidence_items"

    id: Mapped[str] = mapped_column(String(5), primary_key=True)
    domain_id: Mapped[str] = mapped_column(String(1), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, server_default="medium")
    evidence_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reduction_note: Mapped[str | None] = mapped_column(Text)
    control_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    collection_model: Mapped[str] = mapped_column(String(20), nullable=False, server_default="standard")
    reuse_tier: Mapped[str] = mapped_column(String(30), nullable=False, server_default="control_specific")
    input_schema: Mapped[list] = mapped_column(JSONB, server_default="[]")
    sufficiency_dimensions: Mapped[list] = mapped_column(JSONB, server_default="[]")
    per_system: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    per_zone: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    per_quarter: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    per_access_point: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_advisory: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_conditional: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class ItemControlMapping(Base):
    __tablename__ = "item_control_mappings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    evidence_item_id: Mapped[str] = mapped_column(String(5), nullable=False)
    control_id: Mapped[str] = mapped_column(String(10), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    weight: Mapped[float] = mapped_column(Numeric(5, 2), server_default="1.0")
    sufficiency_requirement: Mapped[str | None] = mapped_column(Text)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class EvidenceSufficiencyMatrix(Base):
    __tablename__ = "evidence_sufficiency_matrix"

    item_code: Mapped[str] = mapped_column(String(5), primary_key=True)
    control_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    evidence_item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    control_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ma: Mapped[str] = mapped_column(String(1), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(100), nullable=False)
    sufficiency_criteria: Mapped[str | None] = mapped_column(Text)
    evaluation_criteria: Mapped[str | None] = mapped_column(Text)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class CrossDomainDependency(Base):
    __tablename__ = "cross_domain_dependencies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    source_item_id: Mapped[str] = mapped_column(String(5), nullable=False)
    target_item_id: Mapped[str] = mapped_column(String(5), nullable=False)
    dependency_type: Mapped[str] = mapped_column(String(50), nullable=False, server_default="validates")
    description: Mapped[str | None] = mapped_column(Text)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

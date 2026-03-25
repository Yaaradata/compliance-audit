import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Boolean, DateTime, Integer, Float, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Artifact(Base):
    __tablename__ = "artifacts"
    __table_args__ = {"schema": "artifact_registry"}

    artifact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    artifact_type: Mapped[str] = mapped_column(String(30), nullable=False)
    evidence_item_id: Mapped[str] = mapped_column(String(10), nullable=False)
    framework_schema: Mapped[str] = mapped_column(String(50), nullable=False)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    file_path: Mapped[str | None] = mapped_column(String(1000))
    file_hash_sha256: Mapped[str | None] = mapped_column(String(64))
    file_size_bytes: Mapped[int | None] = mapped_column()
    mime_type: Mapped[str | None] = mapped_column(String(200))
    original_filename: Mapped[str | None] = mapped_column(String(500))
    form_data_json: Mapped[dict | None] = mapped_column(JSONB)
    submission_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.assessment_cycles.id", ondelete="CASCADE"), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.tenants.id", ondelete="CASCADE"), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    parent_artifact_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"))
    reuse_source_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"))
    reuse_source_cycle_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    aws_metadata: Mapped[dict | None] = mapped_column(JSONB)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class ArtifactControlLink(Base):
    __tablename__ = "artifact_control_links"
    __table_args__ = {"schema": "artifact_registry"}

    link_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id", ondelete="CASCADE"), nullable=False)
    control_id: Mapped[str] = mapped_column(String(10), nullable=False)
    evidence_item_id: Mapped[str] = mapped_column(String(10), nullable=False)
    cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.assessment_cycles.id", ondelete="CASCADE"), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.tenants.id", ondelete="CASCADE"), nullable=False)
    framework_schema: Mapped[str] = mapped_column(String(50), nullable=False)
    link_type: Mapped[str] = mapped_column(String(20), nullable=False, default="primary")
    sufficiency_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    ai_score: Mapped[float | None] = mapped_column(Float)
    ai_evaluation_json: Mapped[dict | None] = mapped_column(JSONB)
    sufficiency_evaluation_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    reviewer_status: Mapped[str] = mapped_column(String(30), nullable=False, default="not_started")
    l1_reviewer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"))
    l1_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    l1_comment: Mapped[str | None] = mapped_column(Text)
    l2_reviewer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"))
    l2_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    l2_comment: Mapped[str | None] = mapped_column(Text)
    approver_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approver_comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CrossCheck(Base):
    __tablename__ = "cross_checks"
    __table_args__ = {"schema": "artifact_registry"}

    cross_check_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    source_link_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifact_control_links.link_id", ondelete="CASCADE"), nullable=False)
    source_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"), nullable=False)
    source_evidence_item: Mapped[str] = mapped_column(String(10), nullable=False)
    source_control_id: Mapped[str] = mapped_column(String(10), nullable=False)
    target_evidence_item: Mapped[str] = mapped_column(String(10), nullable=False)
    check_description: Mapped[str] = mapped_column(Text, nullable=False)
    target_artifact_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    resolution_detail: Mapped[str | None] = mapped_column(Text)
    ai_check_result: Mapped[dict | None] = mapped_column(JSONB)
    cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.assessment_cycles.id", ondelete="CASCADE"), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.tenants.id", ondelete="CASCADE"), nullable=False)
    framework_schema: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ReuseRule(Base):
    __tablename__ = "reuse_rules"
    __table_args__ = {"schema": "artifact_registry"}

    rule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    evidence_item_id: Mapped[str] = mapped_column(String(10), nullable=False)
    framework_schema: Mapped[str] = mapped_column(String(50), nullable=False)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False)
    reuse_category: Mapped[str] = mapped_column(String(30), nullable=False)
    max_age_days: Mapped[int | None] = mapped_column(Integer)
    requires_reconfirmation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_version_delta: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    version_delta_description: Mapped[str | None] = mapped_column(Text)
    rules_metadata: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ReuseRecord(Base):
    __tablename__ = "reuse_records"
    __table_args__ = {"schema": "artifact_registry"}

    reuse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    target_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"), nullable=False)
    target_cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.assessment_cycles.id", ondelete="CASCADE"), nullable=False)
    source_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"), nullable=False)
    source_cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.assessment_cycles.id", ondelete="CASCADE"), nullable=False)
    source_cscf_version: Mapped[str] = mapped_column(String(10), nullable=False)
    reuse_type: Mapped[str] = mapped_column(String(50), nullable=False)
    reused_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"), nullable=False)
    validity_check: Mapped[dict | None] = mapped_column(JSONB)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.tenants.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ArtifactAuditTrail(Base):
    __tablename__ = "audit_trail"
    __table_args__ = {"schema": "artifact_registry"}

    trail_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"), nullable=False)
    control_id: Mapped[str | None] = mapped_column(String(10))
    cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.assessment_cycles.id", ondelete="CASCADE"), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.tenants.id", ondelete="CASCADE"), nullable=False)
    action: Mapped[str] = mapped_column(String(30), nullable=False)
    from_status: Mapped[str | None] = mapped_column(String(50))
    to_status: Mapped[str | None] = mapped_column(String(50))
    performed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    action_metadata: Mapped[dict | None] = mapped_column(JSONB)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(500))
    performed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ArtifactComment(Base):
    __tablename__ = "comments"
    __table_args__ = {"schema": "artifact_registry"}

    comment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.artifacts.artifact_id"), nullable=False)
    control_id: Mapped[str | None] = mapped_column(String(10))
    parent_comment_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("artifact_registry.comments.comment_id"))
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"), nullable=False)
    author_role: Mapped[str] = mapped_column(String(50), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    tagged_question_keys: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core.tenants.id", ondelete="CASCADE"), nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("core.users.id"))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

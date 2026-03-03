import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class ReviewerChecklist(Base):
    __tablename__ = "reviewer_checklist"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    item_code: Mapped[str] = mapped_column(String(5), nullable=False)
    evidence_item: Mapped[str] = mapped_column(String(500), nullable=False)
    control_id: Mapped[str] = mapped_column(String(20), nullable=False)
    control_name: Mapped[str] = mapped_column(String(500), nullable=False)
    mandatory_advisory: Mapped[str] = mapped_column(String(10), nullable=False, server_default="M")
    l1_check: Mapped[dict | None] = mapped_column(JSONB)
    l2_check: Mapped[dict | None] = mapped_column(JSONB)
    l3_check: Mapped[dict | None] = mapped_column(JSONB)
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class ReviewAssignment(Base):
    __tablename__ = "review_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    reviewer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    level: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="assigned")
    decision: Mapped[str | None] = mapped_column(String(20))
    """Per-item checklist results: { "<checklist_id>": { "checked": bool, "note": str|null }, ... }"""
    checklist_results: Mapped[dict] = mapped_column(JSONB, server_default="{}")
    sla_due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class ReviewComment(Base):
    __tablename__ = "review_comments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    review_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    body: Mapped[str] = mapped_column(Text, nullable=False)
    mentions: Mapped[list] = mapped_column(ARRAY(UUID(as_uuid=True)), server_default="{}")
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    cscf_version: Mapped[str] = mapped_column(String(10), nullable=False, server_default="2025v")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

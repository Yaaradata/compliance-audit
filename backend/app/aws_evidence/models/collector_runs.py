"""collector_runs table in the SWIFT evidence schema."""
from datetime import datetime
import uuid

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.aws_evidence.core.db import Base
from app.aws_evidence.core.config import SWIFT_SCHEMA


class CollectorRun(Base):
    __tablename__ = "collector_runs"
    __table_args__ = {"schema": SWIFT_SCHEMA}

    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=True)
    collector_name = Column(String, nullable=False)
    cloud_provider = Column(String, nullable=False, default="aws")
    execution_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    status = Column(String, nullable=False)
    trigger_type = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)


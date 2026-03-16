"""collector_runs table in swift_2026 schema."""
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from core.db import Base
from core.config import SWIFT_SCHEMA


class CollectorRun(Base):
    __tablename__ = "collector_runs"
    __table_args__ = {"schema": SWIFT_SCHEMA}

    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    collector_name = Column(String, nullable=False)
    cloud_provider = Column(String, nullable=False, default="aws")
    execution_time = Column(DateTime, nullable=False, default=datetime.utcnow)  # In time (start)
    ended_at = Column(DateTime, nullable=True)  # Out time (end)
    status = Column(String, nullable=False)  # running, success, failed
    trigger_type = Column(String, nullable=True)  # manual, scheduled

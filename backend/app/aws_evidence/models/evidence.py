"""evidence table in the SWIFT evidence schema."""
from datetime import datetime
import uuid

from sqlalchemy import Column, DateTime, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.aws_evidence.core.db import Base
from app.aws_evidence.core.config import SWIFT_SCHEMA


class Evidence(Base):
    __tablename__ = "evidence"
    __table_args__ = {"schema": SWIFT_SCHEMA}

    evidence_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey(f"{SWIFT_SCHEMA}.collector_runs.run_id"), nullable=False)
    item_code = Column(String, nullable=False)
    control_id = Column(String, nullable=False)
    evidence_type = Column(String, nullable=False)
    source_system = Column(String, nullable=False)
    storage_uri = Column(Text, nullable=False)
    file_hash = Column(String, nullable=False)
    collected_at = Column(DateTime, nullable=False, default=datetime.utcnow)


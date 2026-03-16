"""evidence table in swift_2026 schema."""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from core.db import Base
from core.config import SWIFT_SCHEMA


class Evidence(Base):
    __tablename__ = "evidence"
    __table_args__ = {"schema": SWIFT_SCHEMA}

    evidence_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey(f"{SWIFT_SCHEMA}.collector_runs.run_id"), nullable=False)
    item_code = Column(String, nullable=False)   # SWIFT CEI e.g. A2
    control_id = Column(String, nullable=False) # e.g. 1.1
    evidence_type = Column(String, nullable=False)
    source_system = Column(String, nullable=False)
    storage_uri = Column(Text, nullable=False)
    file_hash = Column(String, nullable=False)
    collected_at = Column(DateTime, nullable=False, default=datetime.utcnow)

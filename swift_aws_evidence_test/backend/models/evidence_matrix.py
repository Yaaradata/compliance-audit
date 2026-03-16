"""evidence_sufficiency_matrix table in swift_2026 schema."""
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from core.db import Base
from core.config import SWIFT_SCHEMA


class EvidenceSufficiencyMatrix(Base):
    __tablename__ = "evidence_sufficiency_matrix"
    __table_args__ = {"schema": SWIFT_SCHEMA}

    item_code = Column(String, primary_key=True)
    control_id = Column(String, primary_key=True)
    evidence_item_name = Column(String, nullable=True)
    control_name = Column(String, nullable=True)
    ma = Column("ma", String(8), nullable=True)  # M/A; exposed as mandatory_flag in API
    evidence_type = Column(String, nullable=True)
    sufficiency_criteria = Column(Text, nullable=True)
    evaluation_criteria = Column(Text, nullable=True)
    cscf_version = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.utcnow)

"""evidence_sufficiency_matrix table in the SWIFT evidence schema."""
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from app.aws_evidence.core.db import Base
from app.aws_evidence.core.config import SWIFT_SCHEMA


class EvidenceSufficiencyMatrix(Base):
    __tablename__ = "evidence_sufficiency_matrix"
    __table_args__ = {"schema": SWIFT_SCHEMA}

    item_code = Column(String, primary_key=True)
    control_id = Column(String, primary_key=True)
    evidence_item_name = Column(String, nullable=True)
    control_name = Column(String, nullable=True)
    ma = Column("ma", String(8), nullable=True)
    evidence_type = Column(String, nullable=True)
    sufficiency_criteria = Column(Text, nullable=True)
    evaluation_criteria = Column(Text, nullable=True)
    cscf_version = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.utcnow)


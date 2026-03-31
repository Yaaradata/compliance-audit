"""Standard API-facing evidence result (workbook-aligned)."""
from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EvidenceStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    ERROR = "ERROR"


class StandardEvidenceResult(BaseModel):
    """One row per SWIFT evidence item (e.g. A1) after collection."""

    evidence_id: str = Field(..., description="SWIFT evidence item code, e.g. A1, B3")
    status: EvidenceStatus
    data: dict[str, Any] = Field(default_factory=dict, description="Normalized collector payloads keyed by collector id")
    errors: list[str] = Field(default_factory=list)

    model_config = {"extra": "forbid"}

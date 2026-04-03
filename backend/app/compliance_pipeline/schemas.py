from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ── Request schemas ──────────────────────────────────────────

class PipelineCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    schema_name: str = Field(..., min_length=1, max_length=50, pattern=r"^[a-z][a-z0-9_]*$")


class StageOutputUpdate(BaseModel):
    output_data: dict[str, Any]


class ChatMessageIn(BaseModel):
    content: str = Field(..., min_length=1)


# ── Response schemas ─────────────────────────────────────────

class PipelineOut(BaseModel):
    id: uuid.UUID
    name: str
    schema_name: str
    pdf_storage_path: str | None = None
    status: str
    current_stage: int
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    max_nav_stage: int = Field(
        1,
        description="Highest stage tab (1–4) the user may open, from confirmed stage outputs.",
    )

    model_config = {"from_attributes": True}


class StageOutputOut(BaseModel):
    id: uuid.UUID
    pipeline_id: uuid.UUID
    stage: int
    version: int
    output_data: dict[str, Any]
    status: str
    created_at: datetime
    updated_at: datetime


class ChatMessageOut(BaseModel):
    id: uuid.UUID
    pipeline_id: uuid.UUID
    stage: int
    role: str
    content: str
    created_at: datetime

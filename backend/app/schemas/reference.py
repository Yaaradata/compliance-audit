from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class FrameworkOut(BaseModel):
    id: UUID
    code: str
    name: str
    version: str
    effective_date: str | None = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class DomainOut(BaseModel):
    id: str
    name: str
    color: str | None = None
    accent_color: str | None = None
    item_count: int = 0
    sort_order: int

    model_config = {"from_attributes": True}


class ControlOut(BaseModel):
    id: str
    name: str
    control_type: str
    objective: int
    architecture_applicability: list[str] = []

    model_config = {"from_attributes": True}


class EvidenceItemOut(BaseModel):
    id: str
    domain_id: str
    sort_order: int
    name: str
    priority: str
    evidence_type: str
    description: str
    reduction_note: str | None = None
    control_count: int = 0
    per_system: bool = False
    per_zone: bool = False
    per_quarter: bool = False
    per_access_point: bool = False
    is_advisory: bool = False
    is_conditional: bool = False
    evidence_description: str | None = None
    sufficiency_definition: str | None = None
    evaluation_criteria: str | None = None

    model_config = {"from_attributes": True}


class MappingOut(BaseModel):
    evidence_item_id: str
    control_id: str
    is_primary: bool = False

    model_config = {"from_attributes": True}


class ControlRefOut(BaseModel):
    """Control reference with id and M/A type for evidence item."""
    control_id: str
    ma: str  # "M" or "A" from control_type


class EvidenceItemWithControlsOut(EvidenceItemOut):
    """Evidence item with its control mappings for domain view."""
    controls: list[ControlRefOut] = []


class DependencyOut(BaseModel):
    source_item_id: str
    target_item_id: str
    dependency_type: str
    description: str | None = None

    model_config = {"from_attributes": True}


class VendorOut(BaseModel):
    id: UUID
    name: str
    classification: str
    access_type: str
    swift_components: str | None = None
    risk_rating: str | None = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class VendorCreate(BaseModel):
    name: str
    classification: str = "it_provider"
    access_type: str = "none"
    swift_components: str | None = None
    risk_rating: str | None = None

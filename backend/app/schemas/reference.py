import json
from datetime import date
from uuid import UUID
from pydantic import BaseModel, field_validator


def _normalize_json_field(v: str | dict | list | None) -> str | None:
    """Normalize JSONB/dict to JSON string for API response."""
    if v is None:
        return None
    if isinstance(v, str):
        return v
    if isinstance(v, (dict, list)):
        return json.dumps(v)
    return str(v)


class FrameworkOut(BaseModel):
    id: UUID
    code: str
    name: str
    version: str
    schema_name: str | None = None
    effective_date: str | None = None
    is_active: bool = True

    model_config = {"from_attributes": True}

    @field_validator("effective_date", mode="before")
    @classmethod
    def coerce_effective_date(cls, v: date | str | None) -> str | None:
        if v is None:
            return None
        if isinstance(v, str):
            return v
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v)


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


class EvidenceSufficiencyMatrixOut(BaseModel):
    """One row from evidence_sufficiency_matrix (item + control criteria)."""
    item_code: str
    control_id: str
    evidence_item_name: str
    control_name: str
    ma: str
    evidence_type: str
    sufficiency_criteria: str | None = None
    evaluation_criteria: str | None = None

    model_config = {"from_attributes": True}

    @field_validator("sufficiency_criteria", "evaluation_criteria", mode="before")
    @classmethod
    def normalize_json_fields(cls, v: str | dict | list | None) -> str | None:
        return _normalize_json_field(v)


class EvidenceFormMetadataOut(BaseModel):
    """Form metadata derived from evidence_based_questions: labels, order, spreadsheet column labels."""
    field_labels: dict[str, str] = {}
    key_order: list[str] = []
    table_column_labels: dict[str, dict[str, str]] = {}


class EvidenceQuestionOut(BaseModel):
    """One row from evidence_based_questions for DB-driven form."""
    id: UUID
    evidence_item_id: str
    question_key: str
    label: str
    question_type: str
    required: bool = True
    placeholder: str | None = None
    options: list = []
    sort_order: int = 0
    control_id: str | None = None
    rows: int | None = None
    accept: str | None = None
    upload_label: str | None = None
    guide: str | None = None
    show_when_question: str | None = None
    show_when_values: list[str] = []

    model_config = {"from_attributes": True}

    @field_validator("options", mode="before")
    @classmethod
    def normalize_options(cls, v) -> list:
        if v is None:
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                return json.loads(v) if v else []
            except json.JSONDecodeError:
                return []
        return []

    @field_validator("show_when_values", mode="before")
    @classmethod
    def normalize_show_when_values(cls, v) -> list:
        if v is None:
            return []
        if isinstance(v, list):
            return [str(x) for x in v]
        if isinstance(v, str):
            try:
                out = json.loads(v) if v else []
                return [str(x) for x in out] if isinstance(out, list) else []
            except json.JSONDecodeError:
                return []
        return []


class EvidenceItemWithControlsOut(EvidenceItemOut):
    """Evidence item with its control mappings and per-control criteria matrix for domain view."""
    controls: list[ControlRefOut] = []
    matrix: list[EvidenceSufficiencyMatrixOut] = []


class ArchitectureTypeOut(BaseModel):
    """Architecture type metadata for display (id, name, subtitle, description)."""
    id: str
    name: str
    subtitle: str
    description: str


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

"""GET /controls, GET /control/{control_id}, GET /controls/coverage."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db import get_db
from services import get_controls, get_control_matrix_for_control, get_evidence_for_control, get_control_by_id, get_control_ids_with_evidence

router = APIRouter(tags=["controls"])


@router.get("/controls/coverage")
def controls_coverage(db: Session = Depends(get_db)):
    """Return control_ids that have at least one evidence (so UI can show which controls have fetchable content)."""
    return {"control_ids_with_evidence": get_control_ids_with_evidence(db)}


def _control_out(c):
    """Normalize control to dict (c may be dict or ORM)."""
    if isinstance(c, dict):
        return {"control_id": c.get("control_id"), "control_name": c.get("control_name"), "item_code": c.get("item_code"), "mandatory_flag": c.get("mandatory_flag")}
    return {"control_id": c.control_id, "control_name": c.control_name, "item_code": getattr(c, "item_code", None), "mandatory_flag": getattr(c, "mandatory_flag", None)}


@router.get("/controls")
def list_controls(db: Session = Depends(get_db)):
    controls = get_controls(db)
    return [_control_out(c) for c in controls]


@router.get("/control/{control_id}")
def get_control(control_id: str, db: Session = Depends(get_db)):
    control_info = get_control_by_id(db, control_id)
    evidence = get_evidence_for_control(db, control_id)
    items_for_control = get_control_matrix_for_control(db, control_id)
    return {
        "control_id": control_id,
        "control_name": control_info.get("control_name") if isinstance(control_info, dict) else (control_info.control_name if control_info else None),
        "required_evidence_items": [
            {"item_code": m.get("item_code"), "evidence_item_name": m.get("evidence_item_name")}
            for m in items_for_control
        ],
        "collected_evidence": [
            {
                "evidence_id": str(e.evidence_id),
                "item_code": e.item_code,
                "source_system": e.source_system,
                "file_hash": e.file_hash,
                "storage_uri": e.storage_uri,
                "collected_at": e.collected_at.isoformat() if e.collected_at else None,
            }
            for e in evidence
        ],
    }

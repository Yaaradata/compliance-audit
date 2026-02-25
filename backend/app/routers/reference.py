import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db

logger = logging.getLogger(__name__)
from ..models.framework import (
    AuditFramework, Control, EvidenceDomain, CanonicalEvidenceItem,
    ItemControlMapping, CrossDomainDependency,
)
from ..schemas.reference import FrameworkOut, DomainOut, ControlOut, EvidenceItemOut, EvidenceItemWithControlsOut, MappingOut, ControlRefOut, DependencyOut

router = APIRouter(prefix="/ref")


@router.get("/frameworks", response_model=list[FrameworkOut])
def list_frameworks(db: Session = Depends(get_db)):
    return db.query(AuditFramework).filter(AuditFramework.is_active == True).all()


@router.get("/domains", response_model=list[DomainOut])
def list_domains(db: Session = Depends(get_db)):
    return db.query(EvidenceDomain).order_by(EvidenceDomain.sort_order).all()


@router.get("/domains/{domain_id}")
def get_domain(domain_id: str, db: Session = Depends(get_db)):
    # Normalize: take first char only (handles "A:1" from devtools), uppercase, default to "A"
    raw = (domain_id or "").strip()
    domain_id_clean = (raw.split(":")[0] or raw or "A")[:1].upper() or "A"

    try:
        domain = db.query(EvidenceDomain).filter(EvidenceDomain.id == domain_id_clean).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error loading domain: {str(e)}")

    if not domain:
        return {"domain": None, "evidence_items": []}

    try:
        items = db.query(CanonicalEvidenceItem).filter(
            CanonicalEvidenceItem.domain_id == domain_id_clean
        ).order_by(CanonicalEvidenceItem.sort_order).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error loading evidence items: {str(e)}")

    evidence_with_controls = []
    for i in items:
        try:
            mappings = db.query(ItemControlMapping).filter(
                ItemControlMapping.evidence_item_id == i.id
            ).all()
            control_refs = []
            for m in mappings:
                ctrl = db.query(Control).filter(Control.id == m.control_id).first()
                ma = "M" if ctrl and ctrl.control_type and str(ctrl.control_type).lower() == "mandatory" else "A"
                control_refs.append(ControlRefOut(control_id=m.control_id, ma=ma))
            base = EvidenceItemOut.model_validate(i).model_dump()
            evidence_with_controls.append(EvidenceItemWithControlsOut(**base, controls=control_refs))
        except Exception as e:
            logger.warning("Skipping evidence item %s: %s", getattr(i, "id", "?"), str(e))
            continue

    try:
        return {
            "domain": DomainOut.model_validate(domain),
            "evidence_items": evidence_with_controls,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Serialization error: {str(e)}")


@router.get("/controls", response_model=list[ControlOut])
def list_controls(db: Session = Depends(get_db)):
    return db.query(Control).order_by(Control.id).all()


@router.get("/controls/{control_id}")
def get_control(control_id: str, db: Session = Depends(get_db)):
    ctrl = db.query(Control).filter(Control.id == control_id).first()
    mappings = db.query(ItemControlMapping).filter(ItemControlMapping.control_id == control_id).all()
    return {
        "control": ControlOut.model_validate(ctrl) if ctrl else None,
        "evidence_items": [m.evidence_item_id for m in mappings],
    }


@router.get("/evidence-items", response_model=list[EvidenceItemOut])
def list_evidence_items(db: Session = Depends(get_db)):
    return db.query(CanonicalEvidenceItem).order_by(CanonicalEvidenceItem.domain_id, CanonicalEvidenceItem.sort_order).all()


@router.get("/evidence-items/{item_id}")
def get_evidence_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(CanonicalEvidenceItem).filter(CanonicalEvidenceItem.id == item_id).first()
    mappings = db.query(ItemControlMapping).filter(ItemControlMapping.evidence_item_id == item_id).all()
    return {
        "item": EvidenceItemOut.model_validate(item) if item else None,
        "controls": [MappingOut.model_validate(m) for m in mappings],
    }


@router.get("/dependencies", response_model=list[DependencyOut])
def list_dependencies(db: Session = Depends(get_db)):
    return db.query(CrossDomainDependency).all()

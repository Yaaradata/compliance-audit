from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models.framework import (
    AuditFramework, Control, EvidenceDomain, CanonicalEvidenceItem,
    ItemControlMapping, CrossDomainDependency,
)
from ..schemas.reference import FrameworkOut, DomainOut, ControlOut, EvidenceItemOut, MappingOut, DependencyOut

router = APIRouter(prefix="/ref")


@router.get("/frameworks", response_model=list[FrameworkOut])
def list_frameworks(db: Session = Depends(get_db)):
    return db.query(AuditFramework).filter(AuditFramework.is_active == True).all()


@router.get("/domains", response_model=list[DomainOut])
def list_domains(db: Session = Depends(get_db)):
    return db.query(EvidenceDomain).order_by(EvidenceDomain.sort_order).all()


@router.get("/domains/{domain_id}")
def get_domain(domain_id: str, db: Session = Depends(get_db)):
    domain = db.query(EvidenceDomain).filter(EvidenceDomain.id == domain_id).first()
    items = db.query(CanonicalEvidenceItem).filter(CanonicalEvidenceItem.domain_id == domain_id).order_by(CanonicalEvidenceItem.sort_order).all()
    return {
        "domain": DomainOut.model_validate(domain) if domain else None,
        "evidence_items": [EvidenceItemOut.model_validate(i) for i in items],
    }


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

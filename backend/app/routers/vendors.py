from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.vendor import VendorRegistry
from ..schemas.reference import VendorOut, VendorCreate

router = APIRouter()


@router.get("/assessments/{cycle_id}/vendors", response_model=list[VendorOut])
def list_vendors(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(VendorRegistry).filter(VendorRegistry.cycle_id == cycle_id).order_by(VendorRegistry.created_at.desc()).all()


@router.post("/assessments/{cycle_id}/vendors", response_model=VendorOut, status_code=201)
def create_vendor(cycle_id: UUID, req: VendorCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    vendor = VendorRegistry(
        cycle_id=cycle_id,
        tenant_id=user.tenant_id,
        name=req.name,
        classification=req.classification,
        access_type=req.access_type,
        swift_components=req.swift_components,
        risk_rating=req.risk_rating,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.put("/assessments/{cycle_id}/vendors/{vendor_id}", response_model=VendorOut)
def update_vendor(cycle_id: UUID, vendor_id: UUID, req: VendorCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    vendor = db.query(VendorRegistry).filter(VendorRegistry.id == vendor_id, VendorRegistry.cycle_id == cycle_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.delete("/assessments/{cycle_id}/vendors/{vendor_id}", status_code=204)
def delete_vendor(cycle_id: UUID, vendor_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    vendor = db.query(VendorRegistry).filter(VendorRegistry.id == vendor_id, VendorRegistry.cycle_id == cycle_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()

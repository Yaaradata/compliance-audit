"""GET /evidence, GET /evidence/{id}, GET /evidence/{id}/content, POST /evidence (manual)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from uuid import UUID
from core.db import get_db
from services import get_evidence_list, get_evidence_by_id, create_manual_evidence

router = APIRouter(prefix="/evidence", tags=["evidence"])


class ManualEvidenceCreate(BaseModel):
    control_id: str
    item_code: str
    content: dict
    evidence_type: str = "manual"
    source_system: str = "manual"


@router.post("", status_code=201)
def create_evidence(body: ManualEvidenceCreate, db: Session = Depends(get_db)):
    """Submit evidence for any control (manual). Content is stored in S3 and metadata in DB; then you can fetch content for all controls."""
    try:
        evidence_id = create_manual_evidence(
            db,
            control_id=body.control_id,
            item_code=body.item_code,
            content=body.content,
            evidence_type=body.evidence_type or "manual",
            source_system=body.source_system or "manual",
        )
        return {"evidence_id": str(evidence_id), "control_id": body.control_id, "item_code": body.item_code}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
def list_evidence(limit: int = 200, db: Session = Depends(get_db)):
    items = get_evidence_list(db, limit=limit)
    return [
        {
            "evidence_id": str(e.evidence_id),
            "run_id": str(e.run_id),
            "item_code": e.item_code,
            "control_id": e.control_id,
            "evidence_type": e.evidence_type,
            "source_system": e.source_system,
            "storage_uri": e.storage_uri,
            "file_hash": e.file_hash,
            "collected_at": e.collected_at.isoformat() if e.collected_at else None,
        }
        for e in items
    ]


@router.get("/{evidence_id}")
def get_evidence(evidence_id: UUID, db: Session = Depends(get_db)):
    e = get_evidence_by_id(db, evidence_id)
    if not e:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return {
        "evidence_id": str(e.evidence_id),
        "run_id": str(e.run_id),
        "item_code": e.item_code,
        "control_id": e.control_id,
        "evidence_type": e.evidence_type,
        "source_system": e.source_system,
        "storage_uri": e.storage_uri,
        "file_hash": e.file_hash,
        "collected_at": e.collected_at.isoformat() if e.collected_at else None,
    }


@router.get("/{evidence_id}/content")
def get_evidence_content_endpoint(evidence_id: UUID, db: Session = Depends(get_db)):
    """Return the actual JSON content of the evidence file from S3 (for display in UI)."""
    from core import s3_storage
    e = get_evidence_by_id(db, evidence_id)
    if not e:
        raise HTTPException(status_code=404, detail="Evidence not found")
    try:
        raw = s3_storage.get_evidence_content(e.storage_uri)
        import json
        data = json.loads(raw.decode("utf-8"))
        return data
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as err:
        raise HTTPException(status_code=502, detail=f"Failed to fetch from S3: {err}")

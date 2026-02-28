import hashlib
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import EvidenceAttachment
from ..services import storage_service

router = APIRouter()


@router.post("/evidence/{sub_id}/files", status_code=201)
def upload_file(
    sub_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    contents = file.file.read()
    sha256 = hashlib.sha256(contents).hexdigest()

    attachment = EvidenceAttachment(
        submission_id=sub_id,
        file_name=file.filename or "unknown",
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=len(contents),
        storage_path="",
        sha256_hash=sha256,
        uploaded_by=user.id,
    )
    db.add(attachment)
    db.flush()

    relative_path = f"evidence/{sub_id}/{attachment.id}/{attachment.file_name}"
    storage_path = storage_service.upload(
        relative_path, contents, attachment.file_type
    )
    attachment.storage_path = storage_path
    db.commit()
    db.refresh(attachment)

    return {
        "id": str(attachment.id),
        "file_name": attachment.file_name,
        "file_size_bytes": attachment.file_size_bytes,
    }


@router.get("/evidence/{sub_id}/files")
def list_files(
    sub_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    files = (
        db.query(EvidenceAttachment)
        .filter(EvidenceAttachment.submission_id == sub_id)
        .all()
    )
    return [
        {
            "id": str(f.id),
            "file_name": f.file_name,
            "file_type": f.file_type,
            "file_size_bytes": f.file_size_bytes,
            "uploaded_at": str(f.uploaded_at),
        }
        for f in files
    ]


@router.get("/evidence/{sub_id}/files/{file_id}/url")
def get_file_url(
    sub_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return a short-lived signed URL for inline viewing / download."""
    attachment = (
        db.query(EvidenceAttachment)
        .filter(
            EvidenceAttachment.id == file_id,
            EvidenceAttachment.submission_id == sub_id,
        )
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="File not found")
    url = storage_service.get_signed_url(attachment.storage_path, expiry_minutes=15)
    return {"url": url, "file_name": attachment.file_name, "file_type": attachment.file_type}


@router.get("/evidence/{sub_id}/files/{file_id}")
def download_file(
    sub_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Redirect to a signed URL for the file, or return bytes for local storage."""
    attachment = (
        db.query(EvidenceAttachment)
        .filter(
            EvidenceAttachment.id == file_id,
            EvidenceAttachment.submission_id == sub_id,
        )
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="File not found")

    if attachment.storage_path.startswith("gs://"):
        url = storage_service.get_signed_url(attachment.storage_path, expiry_minutes=15)
        return RedirectResponse(url=url)
    else:
        from fastapi.responses import FileResponse
        import os
        if not os.path.exists(attachment.storage_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        return FileResponse(
            attachment.storage_path,
            filename=attachment.file_name,
            media_type=attachment.file_type,
        )


@router.delete("/evidence/{sub_id}/files/{file_id}", status_code=204)
def delete_file(
    sub_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    attachment = (
        db.query(EvidenceAttachment)
        .filter(
            EvidenceAttachment.id == file_id,
            EvidenceAttachment.submission_id == sub_id,
        )
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        storage_service.delete(attachment.storage_path)
    except Exception:
        pass
    db.delete(attachment)
    db.commit()

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_db_for_notes, get_current_user, resolve_schema_for_notes_resource
from ..models.tenant import User
from ..models.notes import Note
from ..models.assessment import EvidenceSubmission
from ..models.review import ReviewAssignment
from ..schemas.notes import CreateNoteRequest, NoteOut
from .notifications import create_notification

router = APIRouter(prefix="/notes")

VALID_RESOURCE_TYPES = frozenset({"evidence_submission", "review", "approval_gate", "gap"})


def _check_resource_access(db: Session, user: User, resource_type: str, resource_id: UUID) -> None:
    """Ensure user has access to the resource (same tenant or admin). Call after schema is set via get_db_for_notes for evidence_submission/review."""
    if user.role == "admin":
        return
    if resource_type == "evidence_submission":
        sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == resource_id).first()
        if not sub:
            raise HTTPException(status_code=404, detail="Resource not found")
        if sub.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return
    if resource_type == "review":
        rev = db.query(ReviewAssignment).filter(ReviewAssignment.id == resource_id).first()
        if not rev:
            raise HTTPException(status_code=404, detail="Resource not found")
        submission = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == rev.submission_id).first()
        if submission and submission.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return
    if resource_type not in VALID_RESOURCE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid resource_type")


@router.post("", response_model=NoteOut, status_code=201)
def create_note(
    req: CreateNoteRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if req.resource_type not in VALID_RESOURCE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid resource_type")
    if req.resource_type in ("evidence_submission", "review"):
        resolve_schema_for_notes_resource(db, req.resource_type, req.resource_id, user)
    else:
        _check_resource_access(db, user, req.resource_type, req.resource_id)

    if req.parent_id:
        parent = db.query(Note).filter(Note.id == req.parent_id).first()
        if not parent or parent.resource_type != req.resource_type or str(parent.resource_id) != str(req.resource_id):
            raise HTTPException(status_code=400, detail="Invalid parent_id")
        tenant_id = parent.tenant_id
    else:
        if req.resource_type == "evidence_submission":
            sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == req.resource_id).first()
            tenant_id = sub.tenant_id if sub else user.tenant_id
        else:
            tenant_id = user.tenant_id

    note = Note(
        tenant_id=tenant_id,
        resource_type=req.resource_type,
        resource_id=req.resource_id,
        criterion_id=(req.criterion_id.strip() or None) if (req.criterion_id and req.criterion_id.strip()) else None,
        parent_id=req.parent_id,
        author_id=user.id,
        body=req.body.strip(),
    )
    db.add(note)
    db.flush()
    note_id = note.id  # Capture before commit
    # Expunge so the session does not touch this instance on commit (avoids ObjectDeletedError when session expires it)
    db.expunge(note)

    # Create notification: for reply, notify parent author; for root note, we could notify resource owner (e.g. submitter)
    if req.parent_id:
        create_notification(
            db,
            user_id=parent.author_id,
            resource_type=req.resource_type,
            resource_id=req.resource_id,
            action="reply_added",
            actor_id=user.id,
            title="New reply",
            body=req.body[:200] + ("..." if len(req.body) > 200 else ""),
        )
    else:
        # Root note: notify submitter if resource is evidence_submission
        if req.resource_type == "evidence_submission":
            sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == req.resource_id).first()
            if sub and sub.submitted_by and sub.submitted_by != user.id:
                create_notification(
                    db,
                    user_id=sub.submitted_by,
                    resource_type=req.resource_type,
                    resource_id=req.resource_id,
                    action="note_added",
                    actor_id=user.id,
                    title="New note on evidence",
                    body=req.body[:200] + ("..." if len(req.body) > 200 else ""),
                )

    db.commit()
    # Re-set schema after commit (connection may have reset search_path) and re-query for response
    if req.resource_type in ("evidence_submission", "review"):
        resolve_schema_for_notes_resource(db, req.resource_type, req.resource_id, user)
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=500, detail="Could not load created note")
    out = NoteOut.model_validate(note)
    out.author_name = user.name
    out.author_role = user.role
    return out


@router.delete("/by-criterion", status_code=204)
def delete_notes_by_criterion(
    resource_type: str = Query(...),
    resource_id: UUID = Query(...),
    criterion_id: str = Query(...),
    db: Session = Depends(get_db_for_notes),
    user: User = Depends(get_current_user),
):
    """
    Delete all notes for a given criterion. Used when removing a criterion from "Edited"
    so it moves back to "Not met". Requires resource_type, resource_id, and criterion_id.
    """
    if not criterion_id or not criterion_id.strip():
        raise HTTPException(status_code=400, detail="criterion_id is required")
    q = (
        db.query(Note)
        .filter(
            Note.resource_type == resource_type,
            Note.resource_id == resource_id,
            Note.criterion_id == criterion_id.strip(),
        )
    )
    notes = q.all()
    for note in notes:
        db.delete(note)
    db.commit()
    return None


@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: UUID,
    resource_type: str = Query(...),
    resource_id: UUID = Query(...),
    db: Session = Depends(get_db_for_notes),
    user: User = Depends(get_current_user),
):
    """
    Permanently delete a note from the database.
    - Requires resource_type and resource_id (query params) for tenant schema resolution.
    - Only the note author or an admin can delete.
    - The row is removed from the notes table; any replies (child notes) are cascade-deleted by the DB.
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if user.role != "admin" and note.author_id != user.id:
        raise HTTPException(status_code=403, detail="Only the note author or an admin can delete it")

    # Permanently remove the note from the database (and cascade-delete replies via FK)
    db.delete(note)
    db.commit()
    return None


@router.get("", response_model=list[NoteOut])
def list_notes(
    resource_type: str = Query(...),
    resource_id: UUID = Query(...),
    criterion_id: str | None = Query(None),
    db: Session = Depends(get_db_for_notes),
    user: User = Depends(get_current_user),
):
    if resource_type not in VALID_RESOURCE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid resource_type")
    if resource_type not in ("evidence_submission", "review"):
        _check_resource_access(db, user, resource_type, resource_id)

    q = (
        db.query(Note)
        .filter(Note.resource_type == resource_type, Note.resource_id == resource_id)
    )
    if criterion_id is not None and criterion_id.strip():
        q = q.filter(Note.criterion_id == criterion_id.strip())
    else:
        q = q.filter(Note.criterion_id.is_(None))
    notes = q.order_by(Note.created_at.asc()).all()

    user_ids = {n.author_id for n in notes}
    users_map = {}
    if user_ids:
        from ..models.tenant import User as U
        for u in db.query(U).filter(U.id.in_(user_ids)).all():
            users_map[u.id] = (u.name, u.role)

    result = []
    for n in notes:
        o = NoteOut.model_validate(n)
        name_role = users_map.get(n.author_id)
        o.author_name = name_role[0] if name_role else None
        o.author_role = name_role[1] if name_role else None
        result.append(o)
    return result

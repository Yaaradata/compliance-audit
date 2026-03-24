from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from ..dependencies import get_current_user, get_db
from ..models.artifact_registry import (
    Artifact,
    ArtifactAuditTrail,
    ArtifactComment,
    ArtifactControlLink,
    CrossCheck,
)
from ..models.assessment import AssessmentCycle
from ..models.tenant import User
from ..schemas.artifact_registry import (
    ArtifactCommentCreateRequest,
    ArtifactCommentOut,
    ArtifactControlLinkOut,
    ArtifactCreateRequest,
    ArtifactFormDataUpdateRequest,
    ArtifactOut,
    ArtifactReuseRequest,
    ArtifactReviewRequest,
    ArtifactStatusTransitionRequest,
    ArtifactUploadFileRequest,
    AuditTrailOut,
    CrossCheckOut,
)
from ..services import artifact_registry_service as svc

router = APIRouter(prefix="/artifact-registry")


def _assert_tenant_access(user: User, tenant_id: UUID) -> None:
    if user.role == "admin":
        return
    if user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")


def _get_artifact_or_404(db: Session, artifact_id: UUID) -> Artifact:
    a = db.query(Artifact).filter(Artifact.artifact_id == artifact_id, Artifact.is_active.is_(True)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return a


@router.post("/artifacts", response_model=ArtifactOut, status_code=201)
def create_artifact(req: ArtifactCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == req.cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    _assert_tenant_access(user, cycle.tenant_id)
    try:
        artifact = svc.create_artifact(db, req.model_dump(), created_by=user.id, tenant_id=cycle.tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return artifact


@router.get("/artifacts/{artifact_id}", response_model=ArtifactOut)
def get_artifact(artifact_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    return a


@router.patch("/artifacts/{artifact_id}/form-data", response_model=ArtifactOut)
def update_form_data(artifact_id: UUID, req: ArtifactFormDataUpdateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    try:
        svc.enforce_mutable_or_raise(a)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    a.form_data_json = req.form_data_json
    db.commit()
    db.refresh(a)
    return a


@router.post("/artifacts/{artifact_id}/upload-file", response_model=ArtifactOut)
def upload_file_meta(artifact_id: UUID, req: ArtifactUploadFileRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    try:
        svc.enforce_mutable_or_raise(a)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    a.file_path = req.file_path
    a.file_hash_sha256 = req.file_hash_sha256
    a.file_size_bytes = req.file_size_bytes
    a.mime_type = req.mime_type
    a.original_filename = req.original_filename
    db.commit()
    db.refresh(a)
    return a


@router.post("/artifacts/{artifact_id}/submit", response_model=ArtifactOut)
def submit_artifact(artifact_id: UUID, req: ArtifactStatusTransitionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    return svc.transition_status(db, a, req.status or "submitted", performed_by=user.id, comment=req.comment)


@router.post("/artifacts/{artifact_id}/new-version", response_model=ArtifactOut)
def new_version(artifact_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    old = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, old.tenant_id)
    new_art = Artifact(
        artifact_type=old.artifact_type,
        evidence_item_id=old.evidence_item_id,
        framework_schema=old.framework_schema,
        cscf_version=old.cscf_version,
        title=old.title,
        description=old.description,
        file_path=old.file_path,
        file_hash_sha256=old.file_hash_sha256,
        file_size_bytes=old.file_size_bytes,
        mime_type=old.mime_type,
        original_filename=old.original_filename,
        form_data_json=old.form_data_json,
        submission_id=old.submission_id,
        cycle_id=old.cycle_id,
        tenant_id=old.tenant_id,
        created_by=user.id,
        status="draft",
        version=old.version + 1,
        parent_artifact_id=old.artifact_id,
        aws_metadata=old.aws_metadata,
        tags=old.tags,
        metadata_=old.metadata_,
        is_active=True,
    )
    db.add(new_art)
    db.commit()
    db.refresh(new_art)
    return new_art


@router.get("/artifacts/{artifact_id}/control-links", response_model=list[ArtifactControlLinkOut])
def get_control_links(artifact_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    return db.query(ArtifactControlLink).filter(ArtifactControlLink.artifact_id == artifact_id).all()


@router.get("/cycles/{cycle_id}/controls/{control_id}/evidence", response_model=list[ArtifactOut])
def get_artifacts_for_control(cycle_id: UUID, control_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    links = db.query(ArtifactControlLink).filter(ArtifactControlLink.cycle_id == cycle_id, ArtifactControlLink.control_id == control_id).all()
    artifact_ids = [l.artifact_id for l in links]
    if not artifact_ids:
        return []
    arts = db.query(Artifact).filter(Artifact.artifact_id.in_(artifact_ids), Artifact.is_active.is_(True)).all()
    if arts:
        _assert_tenant_access(user, arts[0].tenant_id)
    return arts


@router.post("/control-links/{link_id}/review", response_model=ArtifactControlLinkOut)
def review_link(link_id: UUID, req: ArtifactReviewRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    link = db.query(ArtifactControlLink).filter(ArtifactControlLink.link_id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Control link not found")
    _assert_tenant_access(user, link.tenant_id)
    decision = (req.decision or "").lower()
    if decision in {"l1_approved", "approve_l1", "approved_l1"}:
        link.reviewer_status = "l1_approved"
        link.l1_reviewer_id = user.id
        link.l1_comment = req.comment
    elif decision in {"l1_rejected", "reject_l1", "rejected_l1"}:
        link.reviewer_status = "l1_rejected"
        link.l1_reviewer_id = user.id
        link.l1_comment = req.comment
    elif decision in {"l2_approved", "approve_l2", "approved_l2"}:
        link.reviewer_status = "l2_approved"
        link.l2_reviewer_id = user.id
        link.l2_comment = req.comment
    elif decision in {"l2_rejected", "reject_l2", "rejected_l2"}:
        link.reviewer_status = "l2_rejected"
        link.l2_reviewer_id = user.id
        link.l2_comment = req.comment
    else:
        raise HTTPException(status_code=400, detail="Unsupported decision")
    db.commit()
    db.refresh(link)
    return link


@router.post("/control-links/{link_id}/approve", response_model=ArtifactControlLinkOut)
def approve_link(link_id: UUID, req: ArtifactReviewRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    link = db.query(ArtifactControlLink).filter(ArtifactControlLink.link_id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Control link not found")
    _assert_tenant_access(user, link.tenant_id)
    link.reviewer_status = "approved" if req.decision.lower().startswith("approve") else "rejected"
    link.approver_id = user.id
    link.approver_comment = req.comment
    db.commit()
    db.refresh(link)
    return link


@router.get("/reuse/candidates/{evidence_item_id}")
def reuse_candidates(
    evidence_item_id: str,
    cycle_id: UUID = Query(...),
    framework_schema: str = Query(...),
    cscf_version: str = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not user.tenant_id:
        raise HTTPException(status_code=400, detail="User has no tenant context")
    return svc.get_reuse_candidates(db, user.tenant_id, evidence_item_id, cycle_id, framework_schema, cscf_version)


@router.post("/reuse", response_model=ArtifactOut)
def reuse(req: ArtifactReuseRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    source = _get_artifact_or_404(db, req.source_artifact_id)
    _assert_tenant_access(user, source.tenant_id)
    return svc.execute_reuse(db, source, req.target_cycle_id, performed_by=user.id, reconfirmation_note=req.reconfirmation_note)


@router.get("/artifacts/{artifact_id}/cross-checks", response_model=list[CrossCheckOut])
def get_artifact_cross_checks(artifact_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    return db.query(CrossCheck).filter(or_(CrossCheck.source_artifact_id == artifact_id, CrossCheck.target_artifact_id == artifact_id)).all()


@router.get("/cycles/{cycle_id}/cross-checks", response_model=list[CrossCheckOut])
def get_cycle_cross_checks(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(CrossCheck).filter(CrossCheck.cycle_id == cycle_id).all()
    if rows:
        _assert_tenant_access(user, rows[0].tenant_id)
    return rows


@router.get("/cycles/{cycle_id}/dashboard")
def cycle_dashboard(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(
            ArtifactControlLink.control_id,
            func.count(ArtifactControlLink.link_id).label("artifact_count"),
            func.avg(ArtifactControlLink.ai_score).label("avg_ai_score"),
        )
        .filter(ArtifactControlLink.cycle_id == cycle_id)
        .group_by(ArtifactControlLink.control_id)
        .all()
    )
    return [{"control_id": r.control_id, "artifact_count": r.artifact_count, "avg_ai_score": float(r.avg_ai_score or 0)} for r in rows]


@router.get("/cycles/{cycle_id}/readiness")
def cycle_readiness(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    total = db.query(ArtifactControlLink).filter(ArtifactControlLink.cycle_id == cycle_id).count()
    sufficient = (
        db.query(ArtifactControlLink)
        .filter(ArtifactControlLink.cycle_id == cycle_id, ArtifactControlLink.sufficiency_status == "sufficient")
        .count()
    )
    return {
        "cycle_id": cycle_id,
        "total_control_links": total,
        "sufficient_links": sufficient,
        "readiness_pct": round((sufficient / total * 100), 1) if total else 0,
    }


@router.get("/artifacts/{artifact_id}/audit-trail", response_model=list[AuditTrailOut])
def get_audit_trail(artifact_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    return (
        db.query(ArtifactAuditTrail)
        .filter(ArtifactAuditTrail.artifact_id == artifact_id)
        .order_by(ArtifactAuditTrail.performed_at.asc())
        .all()
    )


@router.get("/artifacts/{artifact_id}/versions", response_model=list[ArtifactOut])
def get_versions(artifact_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    root = a.parent_artifact_id or a.artifact_id
    return (
        db.query(Artifact)
        .filter(or_(Artifact.artifact_id == root, Artifact.parent_artifact_id == root))
        .order_by(Artifact.version.asc())
        .all()
    )


@router.post("/artifacts/{artifact_id}/comments", response_model=ArtifactCommentOut, status_code=201)
def add_comment(artifact_id: UUID, req: ArtifactCommentCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    return svc.create_comment(
        db,
        artifact=a,
        author_id=user.id,
        author_role=user.role or "unknown",
        body=req.body,
        control_id=req.control_id,
        parent_comment_id=req.parent_comment_id,
        tagged_question_keys=req.tagged_question_keys,
    )


@router.get("/artifacts/{artifact_id}/comments", response_model=list[ArtifactCommentOut])
def list_comments(artifact_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = _get_artifact_or_404(db, artifact_id)
    _assert_tenant_access(user, a.tenant_id)
    return (
        db.query(ArtifactComment)
        .filter(ArtifactComment.artifact_id == artifact_id)
        .order_by(ArtifactComment.created_at.asc())
        .all()
    )


@router.get("/search", response_model=list[ArtifactOut])
def search(
    q: str = Query(""),
    cycle_id: UUID | None = Query(None),
    evidence_item_id: str | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    qry = db.query(Artifact).filter(Artifact.is_active.is_(True))
    if user.role != "admin":
        qry = qry.filter(Artifact.tenant_id == user.tenant_id)
    if cycle_id:
        qry = qry.filter(Artifact.cycle_id == cycle_id)
    if evidence_item_id:
        qry = qry.filter(Artifact.evidence_item_id == evidence_item_id.upper())
    if q:
        like = f"%{q}%"
        qry = qry.filter(or_(Artifact.title.ilike(like), Artifact.description.ilike(like)))
    return qry.order_by(Artifact.created_at.desc()).limit(100).all()

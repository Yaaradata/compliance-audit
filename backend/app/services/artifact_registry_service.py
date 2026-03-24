import json
import re
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from ..models.artifact_registry import (
    Artifact,
    ArtifactAuditTrail,
    ArtifactComment,
    ArtifactControlLink,
    CrossCheck,
    ReuseRecord,
    ReuseRule,
)
from ..models.assessment import AssessmentCycle, EvidenceSubmission
from ..models.framework import CanonicalEvidenceItem

ALLOWED_FRAMEWORK_SCHEMAS = {"swift_2025", "swift_2026", "soc2", "pcidss"}
IMMUTABLE_STATUSES = {
    "submitted",
    "ai_evaluated",
    "pending_l1_review",
    "l1_approved",
    "l1_rejected",
    "pending_l2_review",
    "l2_approved",
    "l2_rejected",
    "pending_approval",
    "approved",
    "rejected",
    "archived",
}


def get_framework_table(framework_schema: str, table_name: str) -> str:
    if framework_schema not in ALLOWED_FRAMEWORK_SCHEMAS:
        raise ValueError(f"Invalid framework_schema: {framework_schema}")
    if not re.match(r"^[a-z_][a-z0-9_]*$", table_name):
        raise ValueError(f"Invalid table_name: {table_name}")
    return f"{framework_schema}.{table_name}"


def _log(
    db: Session,
    artifact_id: UUID,
    cycle_id: UUID,
    tenant_id: UUID,
    action: str,
    performed_by: UUID,
    from_status: str | None = None,
    to_status: str | None = None,
    comment: str | None = None,
    action_metadata: dict | None = None,
    control_id: str | None = None,
) -> None:
    db.add(
        ArtifactAuditTrail(
            artifact_id=artifact_id,
            control_id=control_id,
            cycle_id=cycle_id,
            tenant_id=tenant_id,
            action=action,
            from_status=from_status,
            to_status=to_status,
            performed_by=performed_by,
            comment=comment,
            action_metadata=action_metadata,
            performed_at=datetime.now(timezone.utc),
        )
    )


def _parse_cross_check_targets(raw_criteria: str | dict | None) -> list[tuple[str, str]]:
    if raw_criteria is None:
        return []
    obj: dict | None = None
    if isinstance(raw_criteria, dict):
        obj = raw_criteria
    elif isinstance(raw_criteria, str):
        s = raw_criteria.strip()
        if not s:
            return []
        try:
            parsed = json.loads(s)
            if isinstance(parsed, dict):
                obj = parsed
        except Exception:
            # fallback regex for plain text
            pass
    checks: list[tuple[str, str]] = []
    if obj and isinstance(obj.get("cross_checks"), list):
        for entry in obj["cross_checks"]:
            line = str(entry or "").strip()
            if not line:
                continue
            m = re.search(r"\b([A-Z][0-9]{1,2})\b", line)
            if m:
                checks.append((m.group(1), line))
        return checks
    txt = raw_criteria if isinstance(raw_criteria, str) else ""
    for line in txt.splitlines():
        m = re.search(r"\b([A-Z][0-9]{1,2})\b", line)
        if m:
            checks.append((m.group(1), line.strip()))
    return checks


def create_artifact(db: Session, payload: dict, created_by: UUID, tenant_id: UUID) -> Artifact:
    schema = payload["framework_schema"]
    get_framework_table(schema, "item_control_mappings")
    artifact = Artifact(
        artifact_type=payload["artifact_type"],
        evidence_item_id=payload["evidence_item_id"].upper(),
        framework_schema=schema,
        cscf_version=payload["cscf_version"],
        title=payload["title"],
        description=payload.get("description"),
        file_path=payload.get("file_path"),
        file_hash_sha256=payload.get("file_hash_sha256"),
        file_size_bytes=payload.get("file_size_bytes"),
        mime_type=payload.get("mime_type"),
        original_filename=payload.get("original_filename"),
        form_data_json=payload.get("form_data_json"),
        submission_id=payload.get("submission_id"),
        cycle_id=payload["cycle_id"],
        tenant_id=tenant_id,
        created_by=created_by,
        status="draft",
        aws_metadata=payload.get("aws_metadata"),
        tags=payload.get("tags"),
        metadata_=payload.get("metadata"),
    )
    db.add(artifact)
    db.flush()

    mappings_table = get_framework_table(schema, "item_control_mappings")
    control_rows = db.execute(
        text(f"SELECT control_id FROM {mappings_table} WHERE evidence_item_id = :item_id"),
        {"item_id": artifact.evidence_item_id},
    ).fetchall()
    links_by_control: dict[str, ArtifactControlLink] = {}
    for row in control_rows:
        link = ArtifactControlLink(
            artifact_id=artifact.artifact_id,
            control_id=str(row[0]),
            evidence_item_id=artifact.evidence_item_id,
            cycle_id=artifact.cycle_id,
            tenant_id=artifact.tenant_id,
            framework_schema=schema,
            link_type="primary",
            sufficiency_status="pending",
            reviewer_status="not_started",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(link)
        db.flush()
        links_by_control[link.control_id] = link

    matrix_table = get_framework_table(schema, "evidence_sufficiency_matrix")
    matrix_rows = db.execute(
        text(f"SELECT control_id, evaluation_criteria FROM {matrix_table} WHERE item_code = :item_id"),
        {"item_id": artifact.evidence_item_id},
    ).fetchall()
    for row in matrix_rows:
        control_id = str(row[0])
        link = links_by_control.get(control_id)
        if not link:
            continue
        for target_item, description in _parse_cross_check_targets(row[1]):
            db.add(
                CrossCheck(
                    source_link_id=link.link_id,
                    source_artifact_id=artifact.artifact_id,
                    source_evidence_item=artifact.evidence_item_id,
                    source_control_id=control_id,
                    target_evidence_item=target_item,
                    check_description=description,
                    status="pending",
                    cycle_id=artifact.cycle_id,
                    tenant_id=artifact.tenant_id,
                    framework_schema=schema,
                    created_at=datetime.now(timezone.utc),
                )
            )

    pending = (
        db.query(CrossCheck)
        .filter(
            CrossCheck.target_evidence_item == artifact.evidence_item_id,
            CrossCheck.cycle_id == artifact.cycle_id,
            CrossCheck.tenant_id == artifact.tenant_id,
            CrossCheck.status == "pending",
            CrossCheck.source_artifact_id != artifact.artifact_id,
        )
        .all()
    )
    for check in pending:
        check.target_artifact_id = artifact.artifact_id
        check.status = "passed"
        check.resolution_detail = "Target artifact uploaded and linked."
        check.resolved_at = datetime.now(timezone.utc)

    _log(
        db,
        artifact.artifact_id,
        artifact.cycle_id,
        artifact.tenant_id,
        action="created",
        performed_by=created_by,
        to_status="draft",
    )
    db.commit()
    db.refresh(artifact)
    return artifact


def enforce_mutable_or_raise(artifact: Artifact) -> None:
    if artifact.status in IMMUTABLE_STATUSES:
        raise ValueError("Artifact is immutable after submission. Create a new version.")


def write_per_control_evaluations(db: Session, artifact_id: UUID, evaluation_results: dict, performed_by: UUID) -> None:
    links = db.query(ArtifactControlLink).filter(ArtifactControlLink.artifact_id == artifact_id).all()
    for link in links:
        ctrl_result = evaluation_results.get(link.control_id, {})
        score = float(ctrl_result.get("score", 0) or 0)
        link.ai_score = score
        link.ai_evaluation_json = ctrl_result
        link.sufficiency_status = "sufficient" if score >= 0.7 else "insufficient"
        _log(
            db,
            link.artifact_id,
            link.cycle_id,
            link.tenant_id,
            action="ai_evaluated",
            performed_by=performed_by,
            to_status="ai_evaluated",
            action_metadata={"ai_score": score, "control_id": link.control_id},
            control_id=link.control_id,
        )
    db.commit()


def transition_status(db: Session, artifact: Artifact, to_status: str, performed_by: UUID, comment: str | None = None) -> Artifact:
    from_status = artifact.status
    artifact.status = to_status
    _log(
        db,
        artifact.artifact_id,
        artifact.cycle_id,
        artifact.tenant_id,
        action=to_status if to_status in {"approved", "rejected", "submitted", "archived"} else "submitted",
        performed_by=performed_by,
        from_status=from_status,
        to_status=to_status,
        comment=comment,
    )
    db.commit()
    db.refresh(artifact)
    return artifact


def create_comment(db: Session, artifact: Artifact, author_id: UUID, author_role: str, body: str, control_id: str | None, parent_comment_id: UUID | None, tagged_question_keys: list[str] | None) -> ArtifactComment:
    c = ArtifactComment(
        artifact_id=artifact.artifact_id,
        control_id=control_id,
        parent_comment_id=parent_comment_id,
        author_id=author_id,
        author_role=author_role or "unknown",
        body=body,
        tagged_question_keys=tagged_question_keys,
        tenant_id=artifact.tenant_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(c)
    _log(
        db,
        artifact.artifact_id,
        artifact.cycle_id,
        artifact.tenant_id,
        action="comment_added",
        performed_by=author_id,
        action_metadata={"comment_id": str(c.comment_id) if c.comment_id else None},
    )
    db.commit()
    db.refresh(c)
    return c


def get_reuse_candidates(db: Session, tenant_id: UUID, evidence_item_id: str, current_cycle_id: UUID, framework_schema: str, cscf_version: str) -> list[dict]:
    candidates = (
        db.query(Artifact)
        .filter(
            Artifact.evidence_item_id == evidence_item_id.upper(),
            Artifact.tenant_id == tenant_id,
            Artifact.cycle_id != current_cycle_id,
            Artifact.status.in_(["approved", "archived"]),
            Artifact.is_active.is_(True),
        )
        .order_by(Artifact.created_at.desc())
        .all()
    )
    rule = (
        db.query(ReuseRule)
        .filter(
            ReuseRule.evidence_item_id == evidence_item_id.upper(),
            ReuseRule.framework_schema == framework_schema,
            ReuseRule.cscf_version == cscf_version,
        )
        .first()
    )
    now = datetime.now(timezone.utc)
    out: list[dict] = []
    for c in candidates:
        age_days = (now - c.created_at).days if c.created_at else 0
        warnings: list[str] = []
        eligible = True
        if rule:
            if rule.reuse_category == "never_reuse":
                eligible = False
                warnings.append("This evidence type must be collected fresh each cycle")
            if rule.max_age_days and age_days > rule.max_age_days:
                eligible = False
                warnings.append(f"Artifact is {age_days} days old (limit: {rule.max_age_days})")
            if rule.has_version_delta and c.cscf_version != cscf_version and rule.version_delta_description:
                warnings.append(f"Version delta: {rule.version_delta_description}")
        scores = db.query(ArtifactControlLink).filter(ArtifactControlLink.artifact_id == c.artifact_id).all()
        out.append(
            {
                "artifact_id": c.artifact_id,
                "title": c.title,
                "cscf_version": c.cscf_version,
                "created_at": c.created_at,
                "age_days": age_days,
                "eligible": eligible,
                "reuse_category": rule.reuse_category if rule else None,
                "requires_reconfirmation": bool(rule.requires_reconfirmation) if rule else False,
                "warnings": warnings,
                "prior_scores": {s.control_id: s.ai_score for s in scores},
            }
        )
    return out


def execute_reuse(db: Session, source: Artifact, target_cycle_id: UUID, performed_by: UUID, reconfirmation_note: str | None = None) -> Artifact:
    clone = Artifact(
        artifact_type=source.artifact_type,
        evidence_item_id=source.evidence_item_id,
        framework_schema=source.framework_schema,
        cscf_version=source.cscf_version,
        title=source.title,
        description=source.description,
        file_path=source.file_path,
        file_hash_sha256=source.file_hash_sha256,
        file_size_bytes=source.file_size_bytes,
        mime_type=source.mime_type,
        original_filename=source.original_filename,
        form_data_json=source.form_data_json,
        cycle_id=target_cycle_id,
        tenant_id=source.tenant_id,
        created_by=performed_by,
        status="draft",
        version=1,
        reuse_source_id=source.artifact_id,
        reuse_source_cycle_id=source.cycle_id,
        metadata_={"reconfirmation_note": reconfirmation_note} if reconfirmation_note else None,
        is_active=True,
    )
    db.add(clone)
    db.flush()
    src_links = db.query(ArtifactControlLink).filter(ArtifactControlLink.artifact_id == source.artifact_id).all()
    for l in src_links:
        db.add(
            ArtifactControlLink(
                artifact_id=clone.artifact_id,
                control_id=l.control_id,
                evidence_item_id=l.evidence_item_id,
                cycle_id=target_cycle_id,
                tenant_id=source.tenant_id,
                framework_schema=source.framework_schema,
                link_type=l.link_type,
                sufficiency_status="pending",
                reviewer_status="not_started",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
        )
    db.add(
        ReuseRecord(
            target_artifact_id=clone.artifact_id,
            target_cycle_id=target_cycle_id,
            source_artifact_id=source.artifact_id,
            source_cycle_id=source.cycle_id,
            source_cscf_version=source.cscf_version,
            reuse_type="cross_cycle",
            reused_by=performed_by,
            validity_check={"reconfirmed": bool(reconfirmation_note), "reconfirmation_note": reconfirmation_note},
            tenant_id=source.tenant_id,
            created_at=datetime.now(timezone.utc),
        )
    )
    _log(
        db,
        clone.artifact_id,
        clone.cycle_id,
        clone.tenant_id,
        action="reused_from_prior",
        performed_by=performed_by,
        to_status="draft",
        action_metadata={"source_artifact_id": str(source.artifact_id), "source_cycle_id": str(source.cycle_id)},
    )
    db.commit()
    db.refresh(clone)
    return clone


def get_or_create_from_submission(
    db: Session,
    cycle: AssessmentCycle,
    submission: EvidenceSubmission,
    created_by: UUID,
    framework_schema: str,
    cscf_version: str,
    aws_metadata: dict | None = None,
) -> Artifact:
    existing = (
        db.query(Artifact)
        .filter(Artifact.submission_id == submission.id, Artifact.is_active.is_(True))
        .order_by(Artifact.version.desc())
        .first()
    )
    if existing:
        if existing.status not in IMMUTABLE_STATUSES:
            existing.form_data_json = submission.form_data or {}
            if aws_metadata:
                existing.aws_metadata = aws_metadata
            db.commit()
            db.refresh(existing)
        return existing

    cei = db.query(CanonicalEvidenceItem).filter(CanonicalEvidenceItem.id == submission.evidence_item_id).first()
    title = f"{submission.evidence_item_id} - {cei.name if cei else submission.evidence_item_id}"
    payload = {
        "artifact_type": "composite",
        "evidence_item_id": submission.evidence_item_id,
        "framework_schema": framework_schema,
        "cscf_version": cscf_version,
        "title": title,
        "description": None,
        "form_data_json": submission.form_data or {},
        "submission_id": submission.id,
        "cycle_id": cycle.id,
        "aws_metadata": aws_metadata,
    }
    return create_artifact(db, payload, created_by=created_by, tenant_id=cycle.tenant_id)


def update_aws_metadata_for_submission(
    db: Session,
    submission_id: UUID,
    aws_metadata: dict,
    performed_by: UUID,
) -> None:
    artifact = (
        db.query(Artifact)
        .filter(Artifact.submission_id == submission_id, Artifact.is_active.is_(True))
        .order_by(Artifact.version.desc())
        .first()
    )
    if not artifact:
        return
    if artifact.status in IMMUTABLE_STATUSES:
        return
    artifact.aws_metadata = aws_metadata
    _log(
        db,
        artifact.artifact_id,
        artifact.cycle_id,
        artifact.tenant_id,
        action="aws_auto_filled",
        performed_by=performed_by,
        action_metadata=aws_metadata,
    )
    db.commit()

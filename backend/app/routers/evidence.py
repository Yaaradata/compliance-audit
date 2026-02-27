from uuid import UUID
import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import EvidenceSubmission, EvidenceAttachment
from ..models.framework import CanonicalEvidenceItem, ItemControlMapping, EvidenceSufficiencyMatrix
from ..models.sufficiency import SufficiencyEvaluation, SufficiencyScore
from ..schemas.evidence import (
    CreateSubmissionRequest,
    UpdateSubmissionRequest,
    SubmissionOut,
    EvaluateEvidenceRequest,
    EvaluateEvidenceResponse,
    AiCriterionResultOut,
)
from ..services import ai_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _submission_to_out(sub: EvidenceSubmission) -> SubmissionOut:
    """Build SubmissionOut with last_evaluation from stored evaluation_result."""
    last_evaluation = None
    if getattr(sub, "evaluation_result", None):
        try:
            last_evaluation = EvaluateEvidenceResponse.model_validate(sub.evaluation_result)
        except Exception:
            pass
    return SubmissionOut(
        id=sub.id,
        cycle_id=sub.cycle_id,
        evidence_item_id=sub.evidence_item_id,
        submitted_by=sub.submitted_by,
        status=sub.status,
        scope_key=sub.scope_key,
        form_data=sub.form_data or {},
        completion_pct=float(sub.completion_pct or 0),
        version=sub.version,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        last_evaluation=last_evaluation,
    )


@router.get("/assessments/{cycle_id}/evidence", response_model=list[SubmissionOut])
def list_evidence(
    cycle_id: UUID,
    domain: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id)
    if user.role != "admin":
        q = q.filter(EvidenceSubmission.tenant_id == user.tenant_id)
    if domain:
        q = q.filter(EvidenceSubmission.evidence_item_id.like(f"{domain}%"))
    if status:
        q = q.filter(EvidenceSubmission.status == status)
    subs = q.order_by(EvidenceSubmission.created_at.desc()).all()
    return [_submission_to_out(s) for s in subs]


@router.post("/assessments/{cycle_id}/evidence", response_model=SubmissionOut, status_code=201)
def create_evidence(cycle_id: UUID, req: CreateSubmissionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = EvidenceSubmission(
        cycle_id=cycle_id,
        tenant_id=user.tenant_id,
        evidence_item_id=req.evidence_item_id,
        submitted_by=user.id,
        scope_key=req.scope_key,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return _submission_to_out(sub)


@router.get("/assessments/{cycle_id}/evidence/{sub_id}", response_model=SubmissionOut)
def get_evidence(cycle_id: UUID, sub_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _submission_to_out(sub)


@router.put("/assessments/{cycle_id}/evidence/{sub_id}", response_model=SubmissionOut)
def update_evidence(cycle_id: UUID, sub_id: UUID, req: UpdateSubmissionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if req.status:
        sub.status = req.status
    if req.form_data is not None:
        sub.form_data = req.form_data

    db.commit()
    db.refresh(sub)
    return _submission_to_out(sub)


@router.delete("/assessments/{cycle_id}/evidence/{sub_id}", status_code=204)
def delete_evidence(cycle_id: UUID, sub_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft submissions can be deleted")
    db.delete(sub)
    db.commit()


def _parse_numbered_json(value: str | dict | None) -> list[tuple[str, str]]:
    """Return [(id, label), ...] from JSON string or dict. Keys sorted numerically."""
    if value is None:
        return []
    if isinstance(value, dict):
        obj = value
    elif isinstance(value, str):
        value = value.strip()
        if not value:
            return []
        try:
            obj = json.loads(value)
        except Exception:
            return []
    else:
        return []
    if not isinstance(obj, dict):
        return []
    keys = sorted(obj.keys(), key=lambda k: (int(k) if str(k).isdigit() else 999, k))
    return [(k, str(obj[k]).strip()) for k in keys if str(obj[k]).strip()]


def _build_submission_context(evidence_item_id: str, form_data: dict | None) -> str | None:
    """Build structured text context from submission form_data for AI evaluation."""
    if not form_data:
        return None

    fd = form_data or {}
    parts: list[str] = []

    if evidence_item_id == "A5":
        if fd.get("architecture_type"):
            parts.append(f"Declared architecture type: {fd['architecture_type']}")
        if fd.get("selected_diagram"):
            parts.append(f"Selected diagram: {fd['selected_diagram']}")
        if fd.get("decision_rationale"):
            parts.append(f"Decision rationale: {fd['decision_rationale']}")
        if fd.get("infrastructure_characteristics"):
            parts.append(f"Key infrastructure characteristics: {fd['infrastructure_characteristics']}")
        if fd.get("bics"):
            parts.append(f"SWIFT BIC(s) in scope: {fd['bics']}")
        if fd.get("changes_from_previous"):
            parts.append(f"Changes from previous architecture: {fd['changes_from_previous']}")
        if fd.get("multiple_architectures"):
            parts.append(f"Multiple architectures: {fd['multiple_architectures']}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "A1":
        labels = {
            "diagram_date": "Diagram version/date",
            "internet_exposure_confirmation": "Any direct internet path from secure zone",
            "internet_exposure_justification": "Internet exposure justification and compensating controls",
            "connector_zone_statement": "Customer connector zone statement",
            "backoffice_path_summary": "Back-office connectivity summary",
            "protocol_encryption_notes": "Protocol/encryption clarifications",
            "known_gaps_and_plan": "Known documentation gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "A2":
        labels = {
            "exclusion_justification": "Systems excluded from zone with justification",
            "co_hosting_notes": "Co-hosting decisions (non-SWIFT in zone)",
            "customer_zone_notes": "Customer connectivity zone details",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        inv = fd.get("inventory_rows")
        if inv:
            parts.append(f"Component inventory (JSON rows): {inv}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "A3":
        labels = {
            "flow_inventory_notes": "Data flow inventory clarifications",
            "unprotected_legacy_flows": "Unprotected/legacy flows and risk status",
            "hsm_flow_details": "HSM connection flow details",
            "encryption_method_summary": "Encryption method summary per flow type",
            "cross_environment_details": "Cross-environment flow details",
            "known_gaps": "Known documentation gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "A4":
        labels = {
            "firewall_inventory": "Firewalls at secure zone boundaries",
            "deny_default_confirmation": "Deny-by-default posture",
            "allow_any_exceptions": "Permissive rule exceptions",
            "internet_deny_confirmation": "Outbound internet deny status",
            "jump_server_internet_status": "Jump server internet access",
            "annual_review_date": "Last annual review date",
            "annual_review_reviewer": "Reviewer",
            "shared_firewall_notes": "Shared firewall status",
            "customer_zone_rule_summary": "Customer zone firewall rules",
            "known_exceptions": "Known exceptions and remediation",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "A6":
        labels = {
            "zone_boundary_rationale": "Zone boundary rationale",
            "swift_guidance_reference": "SWIFT guidance references",
            "segmentation_approach": "Segmentation approach",
            "auth_separation_rationale": "Auth separation rationale",
            "shared_component_risk": "Shared component risk assessment",
            "co_hosting_justification": "Co-hosting justification",
            "customer_zone_rationale": "Customer zone design rationale",
            "customer_zone_equivalence": "Customer zone equivalent protection",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B1":
        labels = {
            "hardening_baseline_name": "Hardening baseline applied",
            "builtin_admin_status": "Built-in administrator account status",
            "individual_admin_confirmed": "Individual admin accounts with escalation",
            "privilege_elevation_logging": "Privilege elevation logging enabled",
            "password_storage_zone_local": "Admin passwords in zone-local directory",
            "network_device_admin_access": "Network device admin access method",
            "default_passwords_changed": "Default passwords changed on all systems",
            "autolock_configured": "Auto-lock configured",
            "usb_ports_restricted": "USB/physical ports restricted",
            "hardening_check_dates": "Last two hardening check dates",
            "deviations_documented": "Deviations from baseline with justification",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B2":
        labels = {
            "tls_version_enforced": "TLS version enforced for operator sessions",
            "cipher_suites_configured": "Cipher suites in use",
            "session_timeout_value": "Application-level session timeout (minutes)",
            "weak_protocols_disabled": "Weak/deprecated protocols disabled",
            "weak_protocols_remaining": "Remaining weak protocols",
            "jump_server_encryption": "Jump server to application encryption",
            "swift_hardening_applied": "SWIFT app hardened per Alliance Security Guidance",
            "default_app_passwords_changed": "Default application passwords changed",
            "unnecessary_components_disabled": "Unnecessary components/adaptors disabled",
            "app_deviations_documented": "Application deviations from hardening guidance",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B3":
        labels = {
            "internal_flow_summary": "Internal SWIFT component flow encryption summary",
            "tls_version_per_flow": "TLS version and cipher suite per flow type",
            "lau_configuration": "LAU configuration details",
            "cross_environment_encryption": "Cross-environment flow encryption",
            "backoffice_flow_protection": "Back-office to secure zone flow protection",
            "external_transmission_encryption": "External transmission encryption config",
            "backup_encryption": "Backup encryption method and key management",
            "at_rest_encryption": "At-rest encryption for SWIFT data outside secure zone",
            "key_management_approach": "Key management approach per flow",
            "operator_session_transport": "Operator session transport-level encryption",
            "unprotected_flows": "Unprotected/legacy flows with risk assessment",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B4":
        labels = {
            "platform_type": "Virtualisation/cloud platform type",
            "platform_location": "Platform in secure zone",
            "vm_isolation_configured": "VM isolation configured",
            "network_flow_filtering": "Network flow filtering for SWIFT VMs",
            "privileged_access_restrictions": "Privileged access restrictions on platform",
            "platform_password_policy": "Platform admin password policy applied",
            "security_update_status": "Hypervisor/platform security update status",
            "mfa_for_vm_access": "MFA for interactive VM access",
            "physical_protection": "Physical protection of underlying hardware",
            "container_isolation": "Container isolation configuration",
            "third_party_hosted": "Third-party hosted",
            "third_party_comfort": "Third-party comfort evidence",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B5":
        labels = {
            "password_length_min": "Minimum password length configured",
            "complexity_enabled": "Password complexity requirements enabled",
            "expiration_period": "Password expiration period",
            "history_enforced": "Password history/reuse prevention",
            "lockout_threshold": "Account lockout threshold and duration",
            "pin_settings": "PIN settings for tokens/mobile second factors",
            "admin_policy_stricter": "Stricter policy for privileged accounts",
            "app_to_app_accounts": "Application-to-application account password policy",
            "zone_local_auth": "Passwords in zone-local auth only",
            "nolmhash_enabled": "NoLMHash registry configured on Windows",
            "policy_review_date": "Last password policy review date",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B6":
        labels = {
            "baseline_name_version": "Hardening baseline name and version",
            "scan_date": "Last scan date",
            "scan_frequency": "Scan frequency",
            "system_types_covered": "System types covered in scan",
            "deviation_summary": "Deviation summary with justifications",
            "remediation_plan": "Remediation plan for high-risk deviations",
            "swift_app_comparison": "SWIFT app settings compared to Alliance Security Guidance",
            "app_deviations": "Application-specific deviations documented",
            "authorized_software_baseline": "Authorized software baseline established",
            "software_baseline_version_controlled": "Software baseline version-controlled",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B7":
        labels = {
            "os_admin_mfa": "MFA for OS administrators at zone boundary",
            "os_admin_mfa_method": "OS admin MFA method",
            "end_user_mfa": "MFA for end users accessing SWIFT application",
            "end_user_mfa_method": "End user MFA method",
            "remote_vpn_mfa": "MFA for remote VPN access",
            "virtualisation_console_mfa": "MFA for virtualisation/cloud management console",
            "hsm_mfa": "MFA for HSM access",
            "service_provider_mfa": "MFA for service provider access",
            "separate_device_confirmed": "Second factor on separate device from first factor",
            "credentials_in_zone": "MFA credentials stored within secure zone",
            "individual_assignment": "Authentication factors individually assigned",
            "sso_mfa_status": "SSO with MFA second factor status",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    if evidence_item_id == "B8":
        labels = {
            "app_timeout_configured": "Application-level timeout on SWIFT applications",
            "app_timeout_value": "Application timeout value (minutes)",
            "os_screen_lock": "OS-level screen lock on operator PCs and jump servers",
            "os_lock_timeout": "OS screen lock timeout (minutes)",
            "remote_session_timeout": "Remote session timeout configured",
            "remote_timeout_value": "Remote session timeout value (minutes)",
            "reauth_after_timeout": "Re-authentication required after timeout",
            "session_recording": "Session recording for privileged accounts",
            "concurrent_session_restrictions": "Concurrent session restrictions configured",
            "known_gaps": "Known gaps and remediation plan",
        }
        for key, label in labels.items():
            val = fd.get(key)
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else None

    # Fallback for other items if future forms are added.
    for key, val in fd.items():
        if val:
            parts.append(f"{key.replace('_', ' ').title()}: {val}")
    return "\n".join(parts) if parts else None


def _persist_ai_results(
    db: Session,
    submission: EvidenceSubmission,
    result: dict,
    user_id: UUID,
) -> None:
    """Step 3: write sufficiency_evaluations rows, update submission summary, store last evaluation for tick status on revisit."""
    for dim in result.get("dimensions", []):
        db.add(SufficiencyEvaluation(
            submission_id=submission.id,
            dimension_code=dim.get("code", "unknown"),
            score=dim.get("score", 0),
            rationale=dim.get("rationale"),
            source="ai",
            evaluated_by=user_id,
        ))

    submission.ai_summary = result.get("summary")
    submission.ai_confidence = result.get("confidence")
    submission.completion_pct = result.get("overall_score", 0)
    # Persist full evaluation so tick/cross status shows when user revisits
    submission.evaluation_result = {
        "evidence_item_id": submission.evidence_item_id,
        "overall_met": result.get("overall_met", False),
        "sufficiency_results": result.get("sufficiency_results", []),
        "criteria": result.get("criteria", []),
        "summary": result.get("summary"),
    }


def _recalculate_control_sufficiency(
    db: Session,
    cycle_id: UUID,
    evidence_item_id: str,
) -> None:
    """Step 4: aggregate all evidence submissions' scores per control."""
    mappings = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.evidence_item_id == evidence_item_id)
        .all()
    )

    affected_control_ids = {m.control_id for m in mappings}

    for control_id in affected_control_ids:
        all_mappings = (
            db.query(ItemControlMapping)
            .filter(ItemControlMapping.control_id == control_id)
            .all()
        )

        weighted_sum = 0.0
        weight_total = 0.0
        for m in all_mappings:
            sub = (
                db.query(EvidenceSubmission)
                .filter(
                    EvidenceSubmission.cycle_id == cycle_id,
                    EvidenceSubmission.evidence_item_id == m.evidence_item_id,
                )
                .first()
            )
            if sub and float(sub.completion_pct or 0) > 0:
                weighted_sum += float(sub.completion_pct) * float(m.weight)
                weight_total += float(m.weight)

        score = weighted_sum / weight_total if weight_total > 0 else 0
        if score == 0:
            status = "not_started"
        elif score < 40:
            status = "insufficient"
        elif score < 80:
            status = "partial"
        else:
            status = "sufficient"

        existing = (
            db.query(SufficiencyScore)
            .filter(
                SufficiencyScore.cycle_id == cycle_id,
                SufficiencyScore.control_id == control_id,
            )
            .first()
        )
        if existing:
            existing.overall_score = score
            existing.status = status
            existing.last_evaluated_at = datetime.utcnow()
        else:
            db.add(SufficiencyScore(
                cycle_id=cycle_id,
                control_id=control_id,
                overall_score=score,
                status=status,
                last_evaluated_at=datetime.utcnow(),
            ))


@router.post("/assessments/{cycle_id}/evidence/evaluate", response_model=EvaluateEvidenceResponse)
def evaluate_evidence(
    cycle_id: UUID,
    req: EvaluateEvidenceRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Evaluate uploaded evidence files against canonical criteria using Vertex AI.

    When *submission_id* is provided the backend loads the associated file
    attachments from disk and sends them alongside the canonical evidence
    description / sufficiency definition / evaluation criteria to the AI model.
    Falls back to a lightweight placeholder when no files are available.
    """
    canonical = (
        db.query(CanonicalEvidenceItem)
        .filter(CanonicalEvidenceItem.id == req.evidence_item_id)
        .first()
    )
    if not canonical:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    control_mappings = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.evidence_item_id == req.evidence_item_id)
        .all()
    )
    matrix_rows = (
        db.query(EvidenceSufficiencyMatrix)
        .filter(EvidenceSufficiencyMatrix.item_code == req.evidence_item_id)
        .all()
    )
    # A5 uses canonical item sufficiency/evaluation criteria (single set), not per-control matrix
    if req.evidence_item_id == "A5":
        matrix_rows = []

    # --- If submission_id present, try real AI evaluation ---
    submission: EvidenceSubmission | None = None
    attachments: list = []
    if req.submission_id:
        submission = (
            db.query(EvidenceSubmission)
            .filter(
                EvidenceSubmission.id == req.submission_id,
                EvidenceSubmission.cycle_id == cycle_id,
            )
            .first()
        )
        if submission:
            attachments = (
                db.query(EvidenceAttachment)
                .filter(EvidenceAttachment.submission_id == submission.id)
                .all()
            )

    submission_context: str | None = None
    if submission and getattr(submission, "form_data", None):
        submission_context = _build_submission_context(req.evidence_item_id, submission.form_data)

    if attachments:
        import os

        file_parts = []
        for att in attachments:
            if not os.path.exists(att.storage_path):
                logger.warning("Attachment file missing: %s", att.storage_path)
                continue
            file_parts.append(ai_service.prepare_file_part(att.storage_path, att.file_type))

        if not file_parts:
            raise HTTPException(status_code=400, detail="No readable attachment files found on disk")

        try:
            result = ai_service.evaluate_evidence(
                file_parts,
                canonical,
                control_mappings,
                matrix_rows=matrix_rows or None,
                submission_context=submission_context,
            )
        except Exception as exc:
            logger.exception("AI evaluation failed")
            raise HTTPException(status_code=502, detail=f"AI evaluation error: {exc}") from exc

        sufficiency_results = [
            AiCriterionResultOut(
                id=s.get("id", str(i + 1)),
                label=s.get("label", f"Sufficiency {i + 1}"),
                met=s.get("met", False),
                description=s.get("description"),
            )
            for i, s in enumerate(result.get("sufficiency_results", []))
        ]
        criteria_results = [
            AiCriterionResultOut(
                id=c.get("id", str(i + 1)),
                label=c.get("label", f"Criterion {i + 1}"),
                met=c.get("met", False),
                description=c.get("description"),
            )
            for i, c in enumerate(result.get("criteria", []))
        ]

        # Persist results (Steps 3 & 4)
        if submission:
            _persist_ai_results(db, submission, result, user.id)
            _recalculate_control_sufficiency(db, cycle_id, req.evidence_item_id)
            db.commit()

        return EvaluateEvidenceResponse(
            evidence_item_id=req.evidence_item_id,
            overall_met=result.get("overall_met", False),
            sufficiency_results=sufficiency_results,
            criteria=criteria_results,
            summary=result.get("summary"),
        )

    # --- Fallback: placeholder when no files uploaded yet ---
    # Use per-control criteria from evidence_sufficiency_matrix
    sufficiency_items: list[tuple[str, str]] = []
    criteria_items: list[tuple[str, str]] = []
    for row in matrix_rows:
        prefix = f"[{row.control_id}] "
        for id_, label in _parse_numbered_json(getattr(row, "sufficiency_criteria", None)):
            sufficiency_items.append((f"{row.control_id}_{id_}", prefix + label))
        for id_, label in _parse_numbered_json(getattr(row, "evaluation_criteria", None)):
            criteria_items.append((f"{row.control_id}_{id_}", prefix + label))

    sufficiency_results = [
        AiCriterionResultOut(
            id=id_,
            label=label,
            met=(i < 3),
            description=None if i < 3 else "Evidence does not yet demonstrate this requirement.",
        )
        for i, (id_, label) in enumerate(sufficiency_items)
    ]
    criteria_results = [
        AiCriterionResultOut(
            id=id_,
            label=label,
            met=(i < 2),
            description=None
            if i < 2
            else "AI: Evidence does not clearly address this check. Provide explicit confirmation or supporting detail.",
        )
        for i, (id_, label) in enumerate(criteria_items)
    ]
    if not criteria_results and not sufficiency_results:
        criteria_results = [
            AiCriterionResultOut(id="1", label="Criterion 1 (placeholder)", met=True, description=None),
            AiCriterionResultOut(
                id="2",
                label="Criterion 2 (placeholder)",
                met=False,
                description="Upload evidence files to enable AI evaluation.",
            ),
        ]

    return EvaluateEvidenceResponse(
        evidence_item_id=req.evidence_item_id,
        overall_met=all(c.met for c in criteria_results) and all(s.met for s in sufficiency_results),
        sufficiency_results=sufficiency_results,
        criteria=criteria_results,
        summary="Upload evidence files and re-evaluate to get AI-powered analysis.",
    )

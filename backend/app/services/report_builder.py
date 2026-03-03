"""
Snapshot builder for AI report generation.

Aggregates all 6 data layers into a single structured JSON dict that is:
  1. Stored in AssessmentReport.snapshot_data for reproducibility
  2. Sent (in slices) to Vertex AI for section-by-section narrative generation
"""

from __future__ import annotations

import logging
from collections import defaultdict
from uuid import UUID

from sqlalchemy.orm import Session

from ..models.tenant import Tenant, User
from ..models.assessment import AssessmentCycle, ControlApplicability, EvidenceSubmission
from ..models.framework import Control, ItemControlMapping
from ..models.review import ReviewAssignment
from ..models.approval import ApprovalGate

logger = logging.getLogger(__name__)

DB_LEVEL_MAP = {"l1_completeness": "L1", "l2_quality": "L2", "l3_assessment": "L3"}

DOMAIN_NAMES = {
    "A": "Network & Architecture",
    "B": "System Hardening & Config",
    "C": "Access Management",
    "D": "Vulnerability & Patch Mgmt",
    "E": "Monitoring & Detection",
    "F": "Third-Party & Outsourcing",
    "G": "Physical Security",
    "H": "Policies & Governance",
}


def _score_to_risk(score: float) -> str:
    if score < 40:
        return "high"
    if score < 70:
        return "medium"
    return "low"


def _score_to_compliance_status(score: float) -> str:
    if score >= 90:
        return "compliant"
    if score >= 50:
        return "partially_compliant"
    if score > 0:
        return "non_compliant"
    return "not_assessed"


def build_report_snapshot(db: Session, cycle_id: UUID) -> dict:
    """Build the full structured snapshot for AI report generation."""

    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    if not cycle:
        raise ValueError(f"Cycle {cycle_id} not found")

    tenant = db.query(Tenant).filter(Tenant.id == cycle.tenant_id).first()

    # ── Layer 1: Metadata ──────────────────────────────────────
    arch = cycle.architecture_type or (tenant.architecture if tenant else None) or "Unknown"
    period_start = str(cycle.start_date) if cycle.start_date else "N/A"
    period_end = str(cycle.target_submission_date) if cycle.target_submission_date else "N/A"

    metadata = {
        "bank_name": tenant.name if tenant else "Unknown",
        "bic_code": (tenant.bic_code if tenant else None) or "N/A",
        "assessment_year": cycle.cycle_year,
        "architecture_type": arch,
        "assessment_period": f"{period_start} to {period_end}",
        "cycle_label": cycle.label,
        "cscf_version": cycle.cscf_version,
    }

    # ── Layer 3: Controls + evidence ───────────────────────────
    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    control_ids = [ca.control_id for ca in cas]

    controls_map: dict[str, Control] = {}
    if control_ids:
        for ctrl in db.query(Control).filter(Control.id.in_(control_ids)).all():
            controls_map[ctrl.id] = ctrl

    # Evidence → control mapping
    mappings = db.query(ItemControlMapping).all() if control_ids else []
    control_to_items: dict[str, list[str]] = defaultdict(list)
    for m in mappings:
        if m.control_id in control_ids:
            control_to_items[m.control_id].append(m.evidence_item_id)

    subs = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()
    subs_by_item: dict[str, EvidenceSubmission] = {}
    for s in subs:
        subs_by_item[s.evidence_item_id] = s

    reviews = (
        db.query(ReviewAssignment)
        .filter(ReviewAssignment.submission_id.in_([s.id for s in subs]))
        .all()
    ) if subs else []
    reviews_by_sub: dict[str, dict[str, ReviewAssignment]] = defaultdict(dict)
    for r in reviews:
        level = DB_LEVEL_MAP.get(r.level, r.level)
        reviews_by_sub[str(r.submission_id)][level] = r

    controls_data = []
    for ca in cas:
        ctrl = controls_map.get(ca.control_id)
        item_ids = control_to_items.get(ca.control_id, [])

        evidence_items = []
        for eid in item_ids:
            sub = subs_by_item.get(eid)
            if not sub:
                continue
            eval_res = sub.evaluation_result or {}
            sub_reviews = reviews_by_sub.get(str(sub.id), {})

            failed_criteria = [
                {"id": c.get("id", ""), "label": c.get("label", ""), "description": c.get("description")}
                for c in (eval_res.get("criteria") or []) + (eval_res.get("sufficiency_results") or [])
                if not c.get("met")
            ]

            evidence_items.append({
                "evidence_item_id": eid,
                "status": sub.status,
                "overall_met": eval_res.get("overall_met"),
                "eval_summary": eval_res.get("summary"),
                "failed_criteria": failed_criteria,
                "remediation": sub.evaluation_remediation,
                "l1_decision": sub_reviews.get("L1", None) and sub_reviews["L1"].decision,
                "l2_decision": sub_reviews.get("L2", None) and sub_reviews["L2"].decision,
                "l3_decision": sub_reviews.get("L3", None) and sub_reviews["L3"].decision,
            })

        score = float(ca.score or 0)
        controls_data.append({
            "control_id": ca.control_id,
            "control_name": ctrl.name if ctrl else ca.control_id,
            "control_type": "M" if (ca.applicability or "").lower() == "mandatory" else "A",
            "objective": ctrl.description or "" if ctrl else "",
            "architecture_applicability": list(ctrl.architecture_applicability or []) if ctrl else [],
            "status": ca.status,
            "score": score,
            "risk_level": _score_to_risk(score),
            "compliance_status": _score_to_compliance_status(score),
            "evidence_items": evidence_items,
            "domain": ca.control_id.split(".")[0] if "." in ca.control_id else "?",
        })

    # Map controls to domains via evidence_item_id prefix
    for cd in controls_data:
        items = cd.get("evidence_items", [])
        if items:
            cd["domain"] = items[0]["evidence_item_id"][0] if items[0]["evidence_item_id"] else "?"

    # ── Layer 2: Overall summary ───────────────────────────────
    mandatory_controls = [c for c in controls_data if c["control_type"] == "M"]
    advisory_controls = [c for c in controls_data if c["control_type"] == "A"]

    compliant = sum(1 for c in controls_data if c["compliance_status"] == "compliant")
    partially = sum(1 for c in controls_data if c["compliance_status"] == "partially_compliant")
    non_comp = sum(1 for c in controls_data if c["compliance_status"] == "non_compliant")
    not_assessed = sum(1 for c in controls_data if c["compliance_status"] == "not_assessed")
    total_controls = len(controls_data)
    compliance_pct = round(compliant / total_controls * 100, 1) if total_controls > 0 else 0

    overall_summary = {
        "total_controls": total_controls,
        "mandatory_controls": len(mandatory_controls),
        "advisory_controls": len(advisory_controls),
        "compliant": compliant,
        "partially_compliant": partially,
        "non_compliant": non_comp,
        "not_assessed": not_assessed,
        "overall_compliance_pct": compliance_pct,
        "total_evidence_items": len(subs),
        "approved_evidence_items": sum(1 for s in subs if s.status == "approved"),
    }

    # ── Layer 4: Risk summary ──────────────────────────────────
    high_risk = [c for c in controls_data if c["risk_level"] == "high"]
    medium_risk = [c for c in controls_data if c["risk_level"] == "medium"]
    low_risk = [c for c in controls_data if c["risk_level"] == "low"]

    critical_observations = []
    for c in high_risk:
        for ev in c.get("evidence_items", []):
            if ev.get("eval_summary"):
                critical_observations.append(f"Control {c['control_id']} ({c['control_name']}): {ev['eval_summary']}")
                break

    risk_summary = {
        "high_risk_count": len(high_risk),
        "medium_risk_count": len(medium_risk),
        "low_risk_count": len(low_risk),
        "critical_observations": critical_observations[:10],
    }

    # ── Layer 5: Attestation ───────────────────────────────────
    gates = db.query(ApprovalGate).filter(ApprovalGate.cycle_id == cycle_id).all()
    final_gate = next((g for g in gates if g.gate in ("final_attestation",)), None)
    all_approved = all(g.status == "approved" for g in gates)

    approver_name = None
    approver_role = None
    if final_gate and final_gate.approved_by:
        approver = db.query(User).filter(User.id == final_gate.approved_by).first()
        if approver:
            approver_name = approver.name
            approver_role = approver.role

    attestation = {
        "approver_name": approver_name,
        "approver_role": approver_role,
        "approval_date": str(final_gate.approved_at) if final_gate and final_gate.approved_at else None,
        "mfa_verified": final_gate.mfa_verified if final_gate else False,
        "attestation_notes": final_gate.notes if final_gate else None,
        "all_gates_approved": all_approved,
    }

    return {
        "metadata": metadata,
        "overall_summary": overall_summary,
        "controls": controls_data,
        "risk_summary": risk_summary,
        "attestation": attestation,
    }

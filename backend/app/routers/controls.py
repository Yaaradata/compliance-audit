from uuid import UUID
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_db_scoped, get_current_user
from ..constants import PLATFORM_ADMIN_ROLES
from ..models.tenant import User
from ..models.assessment import AssessmentCycle, ControlApplicability, EvidenceSubmission
from ..models.framework import Control, ItemControlMapping, EvidenceSufficiencyMatrix, CanonicalEvidenceItem
from ..models.sufficiency import SufficiencyScore
from ..schemas.assessment import ControlScore
from ..services.batch_loaders import (
    load_controls_by_ids,
    load_sufficiency_scores,
    load_mappings_by_control_ids,
    load_submissions_by_cycle_and_items,
)

router = APIRouter()

# Synthetic control "ALL" (ESM/scoping only). Excluded from list and matrix so UI matches v2025.
CONTROL_ID_ALL = "ALL"


def _require_cycle_access(cycle: AssessmentCycle | None, user: User) -> None:
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if cycle.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")


@router.get("/assessments/{cycle_id}/controls", response_model=list[ControlScore])
def list_controls(cycle_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    control_ids = [ca.control_id for ca in cas]

    controls_map = load_controls_by_ids(db, control_ids)
    scores_map = load_sufficiency_scores(db, cycle_id, control_ids)

    result = []
    for ca in cas:
        if (ca.control_id or "").strip().upper() == CONTROL_ID_ALL:
            continue
        if (getattr(ca, "scoping_decision", None) or "applicable") != "applicable":
            continue
        ctrl = controls_map.get(ca.control_id)
        suf = scores_map.get(ca.control_id)
        score_val = (suf.overall_score if suf else ca.score) if (suf or ca) else 0
        score = float(score_val) if score_val is not None else 0.0
        status = (suf.status if suf else ca.status) or "not_started"
        result.append(ControlScore(
            id=ca.control_id or "",
            name=(ctrl.name if ctrl else ca.control_id) or ca.control_id or "",
            type="M" if (ca.applicability or "").lower() == "mandatory" else "A",
            score=score,
            status=status,
            evidence_count=ca.evidence_count if ca.evidence_count is not None else 0,
        ))
    return result


@router.get("/assessments/{cycle_id}/control-matrix")
def control_matrix(cycle_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    control_ids = [ca.control_id for ca in cas]

    controls_map = load_controls_by_ids(db, control_ids)
    mappings_map = load_mappings_by_control_ids(db, control_ids)

    result = []
    for ca in cas:
        if (ca.control_id or "").strip().upper() == CONTROL_ID_ALL:
            continue
        if (getattr(ca, "scoping_decision", None) or "applicable") != "applicable":
            continue
        ctrl = controls_map.get(ca.control_id)
        mappings = mappings_map.get(ca.control_id, [])
        result.append({
            "control_id": ca.control_id,
            "name": ctrl.name if ctrl else ca.control_id,
            "type": "M" if ca.applicability == "mandatory" else "A",
            "score": float(ca.score or 0),
            "evidence_items": [m.evidence_item_id for m in mappings],
        })
    return result


# ---------------------------------------------------------------------------
# Sufficiency detail – weighted per-evidence-item breakdown
# ---------------------------------------------------------------------------

def _count_numbered_criteria(text: str | None) -> int:
    """Count numbered criteria lines like '1. ...' or '1) ...' in a text block."""
    if not text:
        return 0
    count = len(re.findall(r"^\s*\d+[\.\)]\s", text, re.MULTILINE))
    return count if count else (1 if text.strip() else 0)


def _label_prefix(label: str | None) -> str:
    """Return 'PASS', 'FAIL', 'ONLY_APPLICABLE', or '' from criterion label."""
    if not label or not isinstance(label, str):
        return ""
    u = label.strip().upper()
    if u.startswith("PASS:"):
        return "PASS"
    if u.startswith("FAIL:"):
        return "FAIL"
    if u.startswith("ONLY APPLICABLE:") or u.startswith("ONLY_APPLICABLE:"):
        return "ONLY_APPLICABLE"
    return ""


def _count_criteria_by_pass_fail(control_id: str, criteria_list: list[dict]) -> tuple[int, int]:
    """Count criteria for this control by label prefix: (pass_count, fail_count).
    Only PASS: and FAIL: are counted; ONLY APPLICABLE: is excluded. If no prefix, use met=true -> PASS, met=false -> FAIL."""
    cid_prefix = f"{control_id}_"
    pass_count = 0
    fail_count = 0
    for c in criteria_list:
        cid = c.get("id", "")
        if not (cid.startswith(cid_prefix) or cid == control_id):
            continue
        label = c.get("label") or ""
        pref = _label_prefix(label)
        if pref == "PASS":
            pass_count += 1
        elif pref == "FAIL":
            fail_count += 1
        elif pref == "ONLY_APPLICABLE":
            continue
        else:
            if c.get("met"):
                pass_count += 1
            else:
                fail_count += 1
    return pass_count, fail_count


def get_sufficiency_detail(cycle_id: UUID, db: Session, user: User):
    """Per-control sufficiency with weighted scoring across evidence items.

    Each control appears in N evidence items. Each item contributes equal weight (100/N %).
    Within each item, score = criteria_met / criteria_total.
    Overall control score = sum(item_score * weight / 100).
    """
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    cas_applicable = [ca for ca in cas if (getattr(ca, "scoping_decision", None) or "applicable") == "applicable"]
    control_ids = [ca.control_id for ca in cas_applicable if (ca.control_id or "").strip().upper() != CONTROL_ID_ALL]
    if not control_ids:
        return []

    # Matrix: which evidence items map to which controls, with criteria text
    matrix_rows = (
        db.query(EvidenceSufficiencyMatrix)
        .filter(EvidenceSufficiencyMatrix.control_id.in_(control_ids))
        .all()
    )

    # Build per-control -> list of items with expected criteria counts from matrix text
    control_item_matrix: dict[str, list[dict]] = {}
    for row in matrix_rows:
        suf_count = _count_numbered_criteria(row.sufficiency_criteria)
        eval_count = _count_numbered_criteria(row.evaluation_criteria)
        control_item_matrix.setdefault(row.control_id, []).append({
            "item_code": row.item_code,
            "item_name": row.evidence_item_name or row.item_code,
            "expected_sufficiency": suf_count,
            "expected_evaluation": eval_count,
        })

    # Fetch all relevant submissions in one query
    all_item_ids = {
        entry["item_code"]
        for items in control_item_matrix.values()
        for entry in items
    }
    subs_by_item: dict[str, EvidenceSubmission] = {}
    if all_item_ids:
        subs = (
            db.query(EvidenceSubmission)
            .filter(
                EvidenceSubmission.cycle_id == cycle_id,
                EvidenceSubmission.evidence_item_id.in_(all_item_ids),
            )
            .all()
        )
        for s in subs:
            subs_by_item[s.evidence_item_id] = s

    # Item names from canonical_evidence_items for nice display
    item_names: dict[str, str] = {}
    if all_item_ids:
        ceis = db.query(CanonicalEvidenceItem).filter(CanonicalEvidenceItem.id.in_(all_item_ids)).all()
        for cei in ceis:
            item_names[cei.id] = cei.name

    # Control names — single batch query
    controls_map = load_controls_by_ids(db, control_ids)
    ctrl_name_map: dict[str, str] = {}
    for ca in cas_applicable:
        ctrl = controls_map.get(ca.control_id)
        ctrl_name_map[ca.control_id] = (ctrl.name if ctrl else ca.control_id) or ca.control_id or ""

    result = []
    for ca in cas_applicable:
        cid = ca.control_id
        if (cid or "").strip().upper() == CONTROL_ID_ALL:
            continue
        items_info = control_item_matrix.get(cid, [])
        total_items = len(items_info)
        weight_per_item = round(100.0 / total_items, 2) if total_items > 0 else 0

        evidence_items = []
        overall_score = 0.0

        for entry in items_info:
            item_id = entry["item_code"]
            sub = subs_by_item.get(item_id)
            has_evidence = sub is not None and sub.status != "draft"
            eval_result = (sub.evaluation_result if sub else None) or {}
            is_evaluated = bool(eval_result.get("sufficiency_results") or eval_result.get("criteria"))

            suf_results = eval_result.get("sufficiency_results", [])
            crit_results = eval_result.get("criteria", [])

            # Count by label prefix: only PASS and FAIL (exclude ONLY APPLICABLE)
            suf_pass, suf_fail = _count_criteria_by_pass_fail(cid, suf_results)
            eval_pass, eval_fail = _count_criteria_by_pass_fail(cid, crit_results)

            pass_total = suf_pass + eval_pass
            fail_total = suf_fail + eval_fail
            # Item score = correct (PASS) / (correct + wrong) when we have any PASS or FAIL
            total_counted = pass_total + fail_total
            item_score = round(pass_total / total_counted * 100, 1) if total_counted > 0 else 0.0
            weighted_contribution = round(item_score * weight_per_item / 100, 2)
            overall_score += weighted_contribution

            display_name = item_names.get(item_id, entry.get("item_name", item_id))

            evidence_items.append({
                "item_id": item_id,
                "item_name": display_name,
                "weight_pct": weight_per_item,
                "sufficiency_pass": suf_pass,
                "sufficiency_fail": suf_fail,
                "evaluation_pass": eval_pass,
                "evaluation_fail": eval_fail,
                "pass_total": pass_total,
                "fail_total": fail_total,
                "total_criteria": pass_total + fail_total,
                "met_criteria": pass_total,
                "item_score": item_score,
                "weighted_contribution": weighted_contribution,
                "has_evidence": has_evidence,
                "is_evaluated": is_evaluated,
            })

        overall_score = round(overall_score, 1)

        result.append({
            "control_id": cid,
            "control_name": ctrl_name_map.get(cid, cid),
            "total_items": total_items,
            "weight_per_item": weight_per_item,
            "overall_score": overall_score,
            "evidence_items": evidence_items,
        })

    return result

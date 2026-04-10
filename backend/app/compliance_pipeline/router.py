"""API routes for the compliance pipeline (platform admin only)."""

from __future__ import annotations

import json
import logging
import re
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Body, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..dependencies import get_db, get_platform_admin
from ..models.tenant import User
from ..services import storage_service
from . import service as ai_service
from .db_utils import (
    create_full_schema_tables,
    create_pipeline_schema,
    ensure_dynamic_schema_control_ids,
    ensure_dynamic_schema_text_columns,
    register_framework,
    seed_stage1_data,
    seed_stage2_data,
    seed_stage3_data,
    seed_stage4_data,
    seed_stage5_data,
)
from .schemas import (
    ChatMessageIn,
    ChatMessageOut,
    PipelineOut,
    RunStageRequest,
    StageOutputUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance-pipeline", tags=["compliance-pipeline"])
RUNNING_STAGE_STALE_AFTER_MINUTES = 10


def _get_pipeline(db: Session, pipeline_id: uuid.UUID) -> dict[str, Any]:
    row = db.execute(
        text("SELECT * FROM core.compliance_pipelines WHERE id = :id"),
        {"id": str(pipeline_id)},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return dict(row)


def _write_stage_draft_output(
    db: Session,
    schema_name: str,
    pipeline_id: uuid.UUID,
    stage: int,
    out_data: dict[str, Any],
) -> None:
    """Persist JSON on the latest row for this stage (draft only). Raises HTTPException if no row or confirmed."""
    existing = _get_stage_output(db, schema_name, pipeline_id, stage)
    if not existing:
        raise HTTPException(status_code=404, detail=f"No output for stage {stage}")
    if existing.get("status") == "confirmed":
        raise HTTPException(status_code=400, detail="Cannot edit a confirmed stage output")

    if stage == 2:
        s1 = _get_stage_output(db, schema_name, pipeline_id, 1)
        if s1 and s1.get("status") == "confirmed" and isinstance(s1.get("output_data"), dict):
            ai_service.normalize_stage2_catalog(out_data, s1["output_data"])

    db.execute(
        text(f"""
            UPDATE "{schema_name}".pipeline_stage_outputs
            SET output_data = CAST(:data AS jsonb), updated_at = now()
            WHERE id = :id
        """),
        {"data": json.dumps(out_data), "id": str(existing["id"])},
    )


def _get_stage_output(db: Session, schema_name: str, pipeline_id: uuid.UUID, stage: int) -> dict[str, Any] | None:
    row = db.execute(
        text(f'SELECT * FROM "{schema_name}".pipeline_stage_outputs WHERE pipeline_id = :pid AND stage = :stage ORDER BY version DESC LIMIT 1'),
        {"pid": str(pipeline_id), "stage": stage},
    ).mappings().first()
    return dict(row) if row else None


def _recover_stale_running_pipeline(db: Session, row: dict[str, Any]) -> dict[str, Any]:
    """Recover pipelines stuck in stage_N_running when worker is gone."""
    status = str(row.get("status") or "")
    m = re.fullmatch(r"stage_(\d+)_running", status)
    if not m:
        return row

    updated_at = row.get("updated_at")
    if not isinstance(updated_at, datetime):
        return row
    age = datetime.now(timezone.utc) - updated_at.astimezone(timezone.utc)
    if age < timedelta(minutes=RUNNING_STAGE_STALE_AFTER_MINUTES):
        return row

    pid = uuid.UUID(str(row["id"]))
    stage = int(m.group(1))
    out = _get_stage_output(db, str(row["schema_name"]), pid, stage)
    if out and out.get("status") == "confirmed":
        recovered_status = f"stage_{stage}_confirmed"
    elif out:
        recovered_status = f"stage_{stage}_review"
    else:
        recovered_status = "failed"

    logger.warning(
        "Recovered stale pipeline %s from %s to %s (age=%ss)",
        pid,
        status,
        recovered_status,
        int(age.total_seconds()),
    )
    db.execute(
        text("UPDATE core.compliance_pipelines SET status = :s, updated_at = now() WHERE id = :id"),
        {"s": recovered_status, "id": str(pid)},
    )
    db.commit()
    return _get_pipeline(db, pid)


def _compute_max_nav_stage(db: Session, schema_name: str, pipeline_id: uuid.UUID) -> int:
    """
    Linear gating: open stage N+1 only after stage N is confirmed.
    Returns 1..6 (6 = Finalize tab when stage 5 is confirmed).
    """
    max_nav = 1
    for s in (1, 2, 3, 4, 5):
        out = _get_stage_output(db, schema_name, pipeline_id, s)
        if not out:
            return max_nav
        max_nav = s
        if out["status"] != "confirmed":
            return max_nav
        max_nav = s + 1
    return min(max_nav, 6)


def _enrich_pipeline_row(db: Session, row: dict[str, Any]) -> dict[str, Any]:
    d = _recover_stale_running_pipeline(db, dict(row))
    pid = uuid.UUID(str(d["id"]))
    d["max_nav_stage"] = _compute_max_nav_stage(db, d["schema_name"], pid)
    return d


def _validate_stage_output(
    db: Session, schema_name: str, pipeline_id: uuid.UUID, stage: int, output_data: dict[str, Any]
) -> dict[str, Any]:
    blocking: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    def add_issue(path: str, problem: str, impact: str, fix: str, is_blocking: bool = True) -> None:
        target = blocking if is_blocking else warnings
        target.append({"path": path, "problem": problem, "impact": impact, "fix": fix})

    if not isinstance(output_data, dict):
        add_issue("", "Stage output is not a JSON object.", "Confirm/finalize will fail.", "Replace output with a valid JSON object.")
        return {"stage": stage, "ok": False, "blocking": blocking, "warnings": warnings}

    s1 = _get_stage_output(db, schema_name, pipeline_id, 1)
    s1_data = (s1 or {}).get("output_data") or {}
    s1_control_ids = {
        str(c.get("id") or "").strip()
        for c in (s1_data.get("controls") or [])
        if isinstance(c, dict) and str(c.get("id") or "").strip()
    }
    s1_domain_ids = {
        str(d.get("id") or "").strip()
        for d in (s1_data.get("evidence_domains") or [])
        if isinstance(d, dict) and str(d.get("id") or "").strip()
    }

    s2 = _get_stage_output(db, schema_name, pipeline_id, 2)
    s2_data = (s2 or {}).get("output_data") or {}
    s2_items = s2_data.get("canonical_evidence_items") or []
    s2_item_codes = {
        str(i.get("item_code") or "").strip()
        for i in s2_items
        if isinstance(i, dict) and str(i.get("item_code") or "").strip()
    }

    if stage == 1:
        domains = output_data.get("evidence_domains") or []
        controls = output_data.get("controls") or []
        if not isinstance(domains, list):
            add_issue("evidence_domains", "Expected array.", "Domain insert can fail.", "Use an array of domains.")
            domains = []
        if not isinstance(controls, list):
            add_issue("controls", "Expected array.", "Control insert can fail.", "Use an array of controls.")
            controls = []
        seen_d: set[str] = set()
        domain_ids_ordered: list[str] = []
        for i, d in enumerate(domains):
            did = str((d or {}).get("id") or "").strip() if isinstance(d, dict) else ""
            if not did:
                add_issue(f"evidence_domains[{i}].id", "Missing id.", "Domain references will break.", "Set non-empty domain id.")
                continue
            if not re.fullmatch(r"[A-Z]", did):
                add_issue(
                    f"evidence_domains[{i}].id",
                    f"Domain id '{did}' must be a single uppercase letter.",
                    "Invalid domain key for DB.",
                    "Use A, B, C, ... only.",
                )
            if did in seen_d:
                add_issue(f"evidence_domains[{i}].id", f"Duplicate domain id '{did}'.", "Conflicting references.", "Use unique ids.")
            seen_d.add(did)
            domain_ids_ordered.append(did)
        if len(controls) < 5:
            add_issue("controls", "Fewer than 5 controls.", "Likely incomplete extraction.", "Re-run stage or fix JSON.")
        seen_c: set[str] = set()
        for i, c in enumerate(controls):
            cid = str((c or {}).get("id") or "").strip() if isinstance(c, dict) else ""
            if not cid:
                add_issue(f"controls[{i}].id", "Missing control id.", "Mappings/FKs can fail.", "Provide control id.")
                continue
            if cid in seen_c:
                add_issue(f"controls[{i}].id", f"Duplicate control id '{cid}'.", "PK conflicts.", "Use unique control ids.")
            seen_c.add(cid)
            ct = str((c or {}).get("control_type") or "").strip().lower()
            if ct not in ("mandatory", "advisory"):
                add_issue(
                    f"controls[{i}].control_type",
                    f"Invalid control_type '{(c or {}).get('control_type')}'.",
                    "DB enum insert may fail.",
                    "Use mandatory or advisory.",
                )
        if domain_ids_ordered:
            sorted_ids = sorted(domain_ids_ordered)
            expected = [chr(ord("A") + j) for j in range(len(sorted_ids))]
            if sorted_ids != expected:
                add_issue(
                    "evidence_domains",
                    "Domain letter ids are not contiguous A, B, C, ...",
                    "May confuse reviewers.",
                    "Renumber domains as single letters starting at A.",
                    is_blocking=False,
                )

    elif stage == 2:
        rows = output_data.get("canonical_evidence_items") or []
        if not isinstance(rows, list):
            add_issue("canonical_evidence_items", "Expected array.", "Stage 2 seed insert cannot run.", "Use an array of items.")
            rows = []
        allowed_priority = {"CRITICAL", "HIGH", "STANDARD", "CONDITIONAL"}
        allowed_collection = {"singleton", "per_zone", "per_system", "per_access_point", "per_quarter"}
        seen_codes: set[str] = set()
        covered_controls: set[str] = set()
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                add_issue(f"canonical_evidence_items[{i}]", "Row is not an object.", "Item insert can fail.", "Use object rows.")
                continue
            item_code = str(row.get("item_code") or "").strip()
            domain_id = str(row.get("domain_id") or "").strip()
            name = str(row.get("name") or "").strip()
            served = row.get("controls_served") or []
            pr = str(row.get("priority") or "").strip().upper()
            if pr and pr not in allowed_priority:
                add_issue(
                    f"canonical_evidence_items[{i}].priority",
                    f"Invalid priority '{row.get('priority')}'.",
                    "Unexpected catalog value.",
                    f"Use one of {sorted(allowed_priority)}.",
                )
            cm = str(row.get("collection_model") or "").strip().lower()
            if cm and cm not in allowed_collection:
                add_issue(
                    f"canonical_evidence_items[{i}].collection_model",
                    f"Invalid collection_model '{row.get('collection_model')}'.",
                    "Coercion may map unexpectedly.",
                    f"Use one of {sorted(allowed_collection)}.",
                )
            if not item_code:
                add_issue(f"canonical_evidence_items[{i}].item_code", "Missing item_code.", "Mapping to UUID later will fail.", "Provide item_code like A1.")
            elif item_code in seen_codes:
                add_issue(f"canonical_evidence_items[{i}].item_code", f"Duplicate item_code '{item_code}'.", "Unique mapping conflicts.", "Use unique item_codes.")
            seen_codes.add(item_code)
            if not name:
                add_issue(f"canonical_evidence_items[{i}].name", "Missing name.", "UI and seeds need a label.", "Provide a short item name.")
            if domain_id and s1_domain_ids and domain_id not in s1_domain_ids:
                add_issue(f"canonical_evidence_items[{i}].domain_id", f"Unknown domain_id '{domain_id}'.", "Invalid domain reference.", "Use Stage 1 domain id.")
            if not isinstance(served, list):
                add_issue(f"canonical_evidence_items[{i}].controls_served", "Expected array.", "Stage 3 generation will be invalid.", "Use control id array.")
                served = []
            if not served:
                add_issue(f"canonical_evidence_items[{i}].controls_served", "Empty controls_served.", "Mappings cannot be built.", "List at least one control id.")
            cc_raw = row.get("control_count")
            try:
                cc = int(cc_raw) if cc_raw is not None else -1
            except (TypeError, ValueError):
                cc = -1
            n_served = len([x for x in served if str(x or "").strip()])
            if cc != n_served:
                add_issue(
                    f"canonical_evidence_items[{i}].control_count",
                    f"control_count ({cc_raw}) != len(controls_served) ({n_served}).",
                    "Catalog inconsistency.",
                    "Set control_count to match controls_served length.",
                )
            for cid in served:
                c = str(cid or "").strip()
                if not c:
                    continue
                covered_controls.add(c)
                if s1_control_ids and c not in s1_control_ids:
                    add_issue(f"canonical_evidence_items[{i}].controls_served", f"Unknown control id '{c}'.", "Later FK failures.", "Use Stage 1 control IDs.")
        if s1_control_ids and not s1_control_ids.issubset(covered_controls):
            missing = sorted(s1_control_ids - covered_controls)[:20]
            add_issue("canonical_evidence_items.controls_served", "Not all controls are covered.", "Coverage gaps across controls.", f"Map all controls. Missing sample: {missing}")

    elif stage == 3:
        rows = output_data.get("item_control_mappings") or []
        if not isinstance(rows, list):
            add_issue("item_control_mappings", "Expected array.", "Stage 3 seed insert cannot run.", "Use an array of mappings.")
            rows = []
        seen_pairs: set[tuple[str, str]] = set()
        primary_count: dict[str, int] = {}
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                add_issue(f"item_control_mappings[{i}]", "Row is not an object.", "Insert can fail.", "Use mapping objects.")
                continue
            code = str(row.get("evidence_item_code") or "").strip()
            cid = str(row.get("control_id") or "").strip()
            if code and s2_item_codes and code not in s2_item_codes:
                add_issue(f"item_control_mappings[{i}].evidence_item_code", f"Unknown item_code '{code}'.", "Cannot resolve UUID.", "Use Stage 2 item_code.")
            if cid and s1_control_ids and cid not in s1_control_ids:
                add_issue(f"item_control_mappings[{i}].control_id", f"Unknown control_id '{cid}'.", "FK can fail.", "Use Stage 1 control_id.")
            if code and cid:
                p = (code, cid)
                if p in seen_pairs:
                    add_issue(f"item_control_mappings[{i}]", f"Duplicate pair ({code}, {cid}).", "Unique conflicts.", "Keep one mapping row.", False)
                seen_pairs.add(p)
            if bool(row.get("is_primary")) and cid:
                primary_count[cid] = primary_count.get(cid, 0) + 1
            try:
                w = float(row.get("weight", 0))
                if not (0.10 <= w <= 1.00):
                    add_issue(
                        f"item_control_mappings[{i}].weight",
                        f"Weight {row.get('weight')} out of allowed range.",
                        "Invalid scoring weight.",
                        "Use a number between 0.10 and 1.00.",
                    )
            except (TypeError, ValueError):
                add_issue(f"item_control_mappings[{i}].weight", "Invalid weight.", "Not numeric.", "Use a float between 0.10 and 1.00.")
        for cid, cnt in primary_count.items():
            if cnt != 1:
                add_issue("item_control_mappings.is_primary", f"Control '{cid}' has {cnt} primary mappings.", "Primary assignment is ambiguous.", "Keep exactly one primary mapping per control.")

    elif stage == 4:
        rows = output_data.get("evidence_sufficiency_matrix") or []
        if not isinstance(rows, list):
            add_issue("evidence_sufficiency_matrix", "Expected array.", "Stage 4 seed insert cannot run.", "Use an array of matrix rows.")
            rows = []
        expected_pairs_s2: set[tuple[str, str]] = set()
        for it in s2_items:
            if not isinstance(it, dict):
                continue
            icode = str(it.get("item_code") or "").strip()
            for cid in it.get("controls_served") or []:
                c = str(cid or "").strip()
                if icode and c:
                    expected_pairs_s2.add((icode, c))
        s3 = _get_stage_output(db, schema_name, pipeline_id, 3)
        s3_rows = ((s3 or {}).get("output_data") or {}).get("item_control_mappings") or []
        valid_pairs_s3 = {
            (str(r.get("evidence_item_code") or "").strip(), str(r.get("control_id") or "").strip())
            for r in s3_rows
            if isinstance(r, dict)
        }
        seen_pairs: set[tuple[str, str]] = set()
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                add_issue(f"evidence_sufficiency_matrix[{i}]", "Row is not an object.", "Insert can fail.", "Use object rows.")
                continue
            code = str(row.get("item_code") or "").strip()
            cid = str(row.get("control_id") or "").strip()
            ma = str(row.get("ma") or "").strip().upper()
            if ma and ma not in ("M", "A"):
                add_issue(f"evidence_sufficiency_matrix[{i}].ma", f"Invalid ma '{ma}'.", "Invalid matrix row.", "Use M or A.")
            ev = row.get("evaluation_criteria")
            if not isinstance(ev, dict):
                add_issue(
                    f"evidence_sufficiency_matrix[{i}].evaluation_criteria",
                    "evaluation_criteria must be an object.",
                    "Scoring structure invalid.",
                    "Include pass_if, fail_if, cross_checks, notes.",
                )
            else:
                pf = ev.get("pass_if") or []
                ff = ev.get("fail_if") or []
                if not isinstance(pf, list) or len(pf) < 2:
                    add_issue(
                        f"evidence_sufficiency_matrix[{i}].evaluation_criteria.pass_if",
                        "pass_if must be an array with at least 2 items.",
                        "Brief / evaluator needs pass rules.",
                        "Add at least two pass_if strings.",
                    )
                if not isinstance(ff, list) or len(ff) < 2:
                    add_issue(
                        f"evidence_sufficiency_matrix[{i}].evaluation_criteria.fail_if",
                        "fail_if must be an array with at least 2 items.",
                        "Brief / evaluator needs fail rules.",
                        "Add at least two fail_if strings.",
                    )
                if "notes" not in ev:
                    add_issue(
                        f"evidence_sufficiency_matrix[{i}].evaluation_criteria",
                        "Missing notes key.",
                        "Schema expectation.",
                        "Add notes: null or a string.",
                    )
            if code and cid:
                if expected_pairs_s2 and (code, cid) not in expected_pairs_s2:
                    add_issue(
                        f"evidence_sufficiency_matrix[{i}]",
                        f"Pair ({code}, {cid}) is not in Stage 2 controls_served.",
                        "Matrix out of sync with catalog.",
                        "Only emit rows for item×control pairs from Stage 2.",
                    )
                if valid_pairs_s3 and (code, cid) not in valid_pairs_s3:
                    add_issue(
                        f"evidence_sufficiency_matrix[{i}]",
                        f"Pair ({code}, {cid}) not in confirmed Stage 3 mappings.",
                        "May diverge from algorithmic mapping.",
                        "Align matrix rows with Stage 3 or re-run Stage 3.",
                        is_blocking=False,
                    )
                if (code, cid) in seen_pairs:
                    add_issue(f"evidence_sufficiency_matrix[{i}]", f"Duplicate pair ({code}, {cid}).", "PK conflicts.", "Keep one row per pair.", False)
                seen_pairs.add((code, cid))
        for pair in expected_pairs_s2:
            if pair not in seen_pairs:
                add_issue(
                    "evidence_sufficiency_matrix",
                    f"Missing matrix row for expected pair {pair}.",
                    "Incomplete coverage.",
                    "Add a row for every Stage 2 item×control pair.",
                )

    elif stage == 5:
        rows = output_data.get("evidence_based_questions") or []
        if not isinstance(rows, list):
            add_issue("evidence_based_questions", "Expected array.", "Stage 5 seed insert cannot run.", "Use an array of question rows.")
            rows = []
        valid_types = {"file", "date", "select", "textarea", "text", "spreadsheet"}
        valid_evidence_raw = {
            "Document/File Upload",
            "Date confirmation",
            "Configuration state confirmation (Yes/No/Status)",
            "Free-text narrative / explanation",
            "Structured Inventory/Spreadsheet",
            "Short text / identifier / value",
        }
        seen_ids: set[str] = set()
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                add_issue(f"evidence_based_questions[{i}]", "Row is not an object.", "Insert can fail.", "Use question object rows.")
                continue
            qid = str(row.get("id") or "").strip()
            item = str(row.get("evidence_item_id") or "").strip()
            qtype = str(row.get("question_type") or "").strip().lower()
            raw_ev = row.get("evidence_required_raw")
            if raw_ev is not None and str(raw_ev) not in valid_evidence_raw:
                add_issue(
                    f"evidence_based_questions[{i}].evidence_required_raw",
                    f"Invalid evidence_required_raw value.",
                    "Downstream categorization breaks.",
                    f"Use one of the six allowed literals.",
                )
            if qid:
                if qid in seen_ids:
                    add_issue(f"evidence_based_questions[{i}].id", f"Duplicate UUID '{qid}'.", "PK conflict.", "Use unique UUID per row.")
                seen_ids.add(qid)
            if item and s2_item_codes and item not in s2_item_codes:
                add_issue(f"evidence_based_questions[{i}].evidence_item_id", f"Unknown item_code '{item}'.", "Question item linkage breaks.", "Use Stage 2 item_codes.")
            if qtype and qtype not in valid_types:
                add_issue(f"evidence_based_questions[{i}].question_type", f"Unsupported type '{qtype}'.", "UI rendering may break.", f"Use one of {sorted(valid_types)}.", False)
            if qtype == "textarea":
                r = row.get("rows")
                if r is None or (isinstance(r, (int, float)) and int(r) < 1):
                    add_issue(
                        f"evidence_based_questions[{i}].rows",
                        "textarea requires a positive rows value.",
                        "UI layout breaks.",
                        "Set rows to e.g. 4.",
                    )
            elif row.get("rows") is not None:
                add_issue(
                    f"evidence_based_questions[{i}].rows",
                    "rows should be null for non-textarea questions.",
                    "Validator expectation.",
                    "Set rows to null.",
                    is_blocking=False,
                )
            if qtype == "file":
                if not str(row.get("accept") or "").strip():
                    add_issue(f"evidence_based_questions[{i}].accept", "file question needs accept.", "Upload UI needs extensions.", "Set accept string.")
                if not str(row.get("upload_label") or "").strip():
                    add_issue(f"evidence_based_questions[{i}].upload_label", "file question needs upload_label.", "User guidance missing.", "Set upload_label text.")
            else:
                if str(row.get("accept") or "").strip():
                    add_issue(
                        f"evidence_based_questions[{i}].accept",
                        "accept should be null unless question_type is file.",
                        "Cleaner payload.",
                        "Set accept to null.",
                        is_blocking=False,
                    )
                if str(row.get("upload_label") or "").strip():
                    add_issue(
                        f"evidence_based_questions[{i}].upload_label",
                        "upload_label should be null unless question_type is file.",
                        "Cleaner payload.",
                        "Set upload_label to null.",
                        is_blocking=False,
                    )
        by_item: dict[str, list[tuple[int, dict[str, Any]]]] = defaultdict(list)
        for row in rows:
            if not isinstance(row, dict):
                continue
            item = str(row.get("evidence_item_id") or "").strip()
            if not item:
                continue
            try:
                so = int(row.get("sort_order", -1))
            except (TypeError, ValueError):
                so = -1
            by_item[item].append((so, row))
        for item_id, pairs in by_item.items():
            pairs.sort(key=lambda x: x[0])
            for idx, (so, q) in enumerate(pairs):
                if so != idx:
                    add_issue(
                        f"evidence_item:{item_id}",
                        f"sort_order must be 0..n-1 contiguous; expected {idx} at position {idx}, got {so}.",
                        "Form ordering breaks.",
                        "Renumber sort_order per item starting at 0.",
                    )
            if not pairs:
                continue
            ordered = [p[1] for p in pairs]
            first_t = str(ordered[0].get("question_type") or "").strip().lower()
            if first_t not in ("file", "spreadsheet"):
                add_issue(
                    f"evidence_item:{item_id}",
                    f"First question must be file or spreadsheet, got '{first_t}'.",
                    "Brief structure violated.",
                    "Put primary upload or spreadsheet at sort_order 0.",
                )
            last_key = str(ordered[-1].get("question_key") or "").strip()
            if last_key != "known_gaps_and_plan":
                add_issue(
                    f"evidence_item:{item_id}",
                    f"Last question must be known_gaps_and_plan, got '{last_key}'.",
                    "Brief structure violated.",
                    "End each item block with known_gaps_and_plan textarea.",
                )
        for code in s2_item_codes:
            if code not in by_item:
                add_issue(
                    "evidence_based_questions",
                    f"No questions for evidence item '{code}'.",
                    "Incomplete question bank.",
                    "Generate questions for every Stage 2 item_code.",
                )

    return {
        "stage": stage,
        "ok": len(blocking) == 0,
        "blocking_issue_count": len(blocking),
        "warning_count": len(warnings),
        "issues": [{"blocking": True, **x} for x in blocking] + [{"blocking": False, **x} for x in warnings],
        "blocking": blocking,
        "warnings": warnings,
    }


def _derive_schema_name(db: Session, compliance_name: str) -> str:
    """
    Build a safe, unique schema name from compliance name.
    Example: "PCI-DSS v4.0" -> "pci_dss_v4_0"
    """
    base = re.sub(r"[^a-z0-9]+", "_", (compliance_name or "").strip().lower()).strip("_")
    if not base:
        base = "compliance"
    if not base[0].isalpha():
        base = f"c_{base}"
    base = base[:45]

    candidate = base
    suffix = 1
    while True:
        exists = db.execute(
            text("SELECT 1 FROM core.compliance_pipelines WHERE schema_name = :sn LIMIT 1"),
            {"sn": candidate},
        ).first()
        if not exists:
            return candidate
        suffix += 1
        suffix_part = f"_{suffix}"
        candidate = f"{base[:max(1, 50 - len(suffix_part))]}{suffix_part}"


# ── CRUD ─────────────────────────────────────────────────────

@router.post("", response_model=PipelineOut, status_code=201)
async def create_pipeline(
    name: str = Form(...),
    pdf: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    clean_name = (name or "").strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Compliance name is required")
    sn = _derive_schema_name(db, clean_name)

    pdf_bytes = await pdf.read()
    storage_path = storage_service.upload(
        f"compliance-pipelines/{sn}/{pdf.filename}",
        pdf_bytes,
        content_type=pdf.content_type or "application/pdf",
    )

    pipeline_id = str(uuid.uuid4())
    db.execute(
        text("""
            INSERT INTO core.compliance_pipelines (id, name, schema_name, pdf_storage_path, status, current_stage, created_by)
            VALUES (:id, :name, :schema_name, :pdf_storage_path, 'created', 0, :created_by)
        """),
        {"id": pipeline_id, "name": clean_name, "schema_name": sn, "pdf_storage_path": storage_path, "created_by": str(user.id)},
    )

    create_pipeline_schema(db, sn)
    db.commit()

    return _enrich_pipeline_row(db, _get_pipeline(db, uuid.UUID(pipeline_id)))


@router.get("", response_model=list[PipelineOut])
def list_pipelines(db: Session = Depends(get_db), user: User = Depends(get_platform_admin)):
    rows = db.execute(text("SELECT * FROM core.compliance_pipelines ORDER BY created_at DESC")).mappings().all()
    return [_enrich_pipeline_row(db, dict(r)) for r in rows]


@router.get("/{pipeline_id}", response_model=PipelineOut)
def get_pipeline(pipeline_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_platform_admin)):
    return _enrich_pipeline_row(db, _get_pipeline(db, pipeline_id))


def _delete_pipeline_with_schema(db: Session, pipeline_id: uuid.UUID) -> dict[str, str]:
    """Shared delete routine used by DELETE and POST fallback endpoints."""
    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]
    pid = str(pipeline_id)

    if pipeline.get("pdf_storage_path"):
        try:
            storage_service.delete(pipeline["pdf_storage_path"])
        except Exception as e:
            logger.warning("Could not delete pipeline PDF from storage: %s", e)

    try:
        db.execute(text("DELETE FROM core.audit_frameworks WHERE schema_name = :sn"), {"sn": sn})
        db.execute(text(f'DROP SCHEMA IF EXISTS "{sn}" CASCADE'))
        db.execute(text("DELETE FROM core.compliance_pipelines WHERE id = :id"), {"id": pid})
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("delete_pipeline failed for %s", pipeline_id)
        raise HTTPException(status_code=500, detail="Failed to delete pipeline / drop schema")
    return {"status": "deleted", "schema_name": sn}


@router.delete("/{pipeline_id}")
def delete_pipeline(
    pipeline_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    """Remove pipeline row, framework registration, and DROP SCHEMA ... CASCADE (all framework + staging tables)."""
    return _delete_pipeline_with_schema(db, pipeline_id)


@router.post("/{pipeline_id}/delete")
def delete_pipeline_post(
    pipeline_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    """POST fallback for environments that block/strip HTTP DELETE."""
    return _delete_pipeline_with_schema(db, pipeline_id)


@router.post("/{pipeline_id}")
def delete_pipeline_post_same_path(
    pipeline_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    """
    Extra fallback on same path:
    some proxies only allow GET/POST and may drop a trailing '/delete' variant.
    """
    return _delete_pipeline_with_schema(db, pipeline_id)


# ── Run stage ────────────────────────────────────────────────


def _repair_bundle_for_rerun(
    db: Session,
    schema_name: str,
    pipeline_id: uuid.UUID,
    stage: int,
) -> dict[str, Any] | None:
    """
    When re-running an LLM stage, pass the latest draft output plus validator output
    so the model can fix blocking issues and re-check consistency.
    """
    existing = _get_stage_output(db, schema_name, pipeline_id, stage)
    if not existing or existing.get("status") == "confirmed":
        return None
    od = existing.get("output_data")
    if not isinstance(od, dict) or not od:
        return None
    validation = _validate_stage_output(db, schema_name, pipeline_id, stage, od)
    return {"previous_output": od, "validation": validation}


def _execute_stage_job(pipeline_id: str, stage: int) -> None:
    """Run a stage in background with an isolated DB session."""
    db = SessionLocal()
    try:
        pid = uuid.UUID(pipeline_id)
        pipeline = _get_pipeline(db, pid)
        sn = pipeline["schema_name"]

        if stage == 1:
            pdf_bytes = storage_service.download(pipeline["pdf_storage_path"])
            repair = _repair_bundle_for_rerun(db, sn, pid, 1)
            output_data = ai_service.run_stage_1(pdf_bytes, repair=repair)
        elif stage == 2:
            s1 = _get_stage_output(db, sn, pid, 1)
            if not s1 or s1["status"] != "confirmed":
                raise ValueError("Stage 1 must be confirmed first")
            repair = _repair_bundle_for_rerun(db, sn, pid, 2)
            pdf_bytes = (
                b""
                if repair
                else storage_service.download(pipeline["pdf_storage_path"])
            )
            output_data = ai_service.run_stage_2(pdf_bytes, s1["output_data"], repair=repair)
        elif stage == 3:
            s1 = _get_stage_output(db, sn, pid, 1)
            s2 = _get_stage_output(db, sn, pid, 2)
            if not s1 or s1["status"] != "confirmed":
                raise ValueError("Stage 1 must be confirmed first")
            if not s2 or s2["status"] != "confirmed":
                raise ValueError("Stage 2 must be confirmed first")
            output_data = ai_service.run_stage_3(s1["output_data"], s2["output_data"])
        elif stage == 4:
            s1 = _get_stage_output(db, sn, pid, 1)
            s2 = _get_stage_output(db, sn, pid, 2)
            s3 = _get_stage_output(db, sn, pid, 3)
            if not s1 or s1["status"] != "confirmed":
                raise ValueError("Stage 1 must be confirmed first")
            if not s2 or s2["status"] != "confirmed":
                raise ValueError("Stage 2 must be confirmed first")
            if not s3 or s3["status"] != "confirmed":
                raise ValueError("Stage 3 must be confirmed first")
            repair = _repair_bundle_for_rerun(db, sn, pid, 4)
            pdf_bytes = (
                b""
                if repair
                else storage_service.download(pipeline["pdf_storage_path"])
            )
            output_data = ai_service.run_stage_4(pdf_bytes, s1["output_data"], s2["output_data"], repair=repair)
        elif stage == 5:
            s1 = _get_stage_output(db, sn, pid, 1)
            s2 = _get_stage_output(db, sn, pid, 2)
            s3 = _get_stage_output(db, sn, pid, 3)
            s4 = _get_stage_output(db, sn, pid, 4)
            if not s1 or s1["status"] != "confirmed":
                raise ValueError("Stage 1 must be confirmed first")
            if not s2 or s2["status"] != "confirmed":
                raise ValueError("Stage 2 must be confirmed first")
            if not s3 or s3["status"] != "confirmed":
                raise ValueError("Stage 3 must be confirmed first")
            if not s4 or s4["status"] != "confirmed":
                raise ValueError("Stage 4 must be confirmed first")
            repair = _repair_bundle_for_rerun(db, sn, pid, 5)
            pdf_bytes = (
                b""
                if repair
                else storage_service.download(pipeline["pdf_storage_path"])
            )
            output_data = ai_service.run_stage_5(
                pdf_bytes,
                s1["output_data"],
                s2["output_data"],
                s4["output_data"],
                repair=repair,
            )
        else:
            raise ValueError("Invalid stage")

        existing = _get_stage_output(db, sn, pid, stage)
        new_version = (existing["version"] + 1) if existing else 1
        db.execute(
            text(f"""
                INSERT INTO "{sn}".pipeline_stage_outputs (id, pipeline_id, stage, version, output_data, status)
                VALUES (:id, :pid, :stage, :version, CAST(:output_data AS jsonb), 'draft')
            """),
            {
                "id": str(uuid.uuid4()),
                "pid": str(pid),
                "stage": stage,
                "version": new_version,
                "output_data": json.dumps(output_data),
            },
        )
        db.execute(
            text("UPDATE core.compliance_pipelines SET status = :s, updated_at = now() WHERE id = :id"),
            {"s": f"stage_{stage}_review", "id": str(pid)},
        )
        db.commit()
    except Exception as e:
        logger.exception("Pipeline stage %d failed for %s", stage, pipeline_id)
        db.rollback()
        try:
            db.execute(
                text("UPDATE core.compliance_pipelines SET status = 'failed', updated_at = now() WHERE id = :id"),
                {"id": pipeline_id},
            )
            db.commit()
        except Exception:
            db.rollback()
    finally:
        db.close()

@router.post("/{pipeline_id}/run-stage/{stage}")
def run_stage(
    pipeline_id: uuid.UUID,
    stage: int,
    background_tasks: BackgroundTasks,
    body: RunStageRequest = Body(default_factory=RunStageRequest),
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    if stage not in (1, 2, 3, 4, 5):
        raise HTTPException(status_code=400, detail="Stage must be 1, 2, 3, 4, or 5")

    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]

    # Optional: persist in-flight UI draft so repair uses the same JSON as the browser (then validate on server).
    if body.output_data is not None:
        existing = _get_stage_output(db, sn, pipeline_id, stage)
        if existing and existing.get("status") != "confirmed":
            _write_stage_draft_output(db, sn, pipeline_id, stage, body.output_data)

    # Prevent duplicate clicks from starting the same running stage.
    if pipeline["status"] == f"stage_{stage}_running":
        return {"status": "already_running", "stage": stage}

    # Fast-fail stage dependency checks before enqueueing.
    if stage == 2:
        s1 = _get_stage_output(db, sn, pipeline_id, 1)
        if not s1 or s1["status"] != "confirmed":
            raise HTTPException(status_code=400, detail="Stage 1 must be confirmed first")
    if stage == 3:
        s1 = _get_stage_output(db, sn, pipeline_id, 1)
        s2 = _get_stage_output(db, sn, pipeline_id, 2)
        if not s1 or s1["status"] != "confirmed":
            raise HTTPException(status_code=400, detail="Stage 1 must be confirmed first")
        if not s2 or s2["status"] != "confirmed":
            raise HTTPException(status_code=400, detail="Stage 2 must be confirmed first")
    if stage == 4:
        s3 = _get_stage_output(db, sn, pipeline_id, 3)
        if not s3 or s3["status"] != "confirmed":
            raise HTTPException(status_code=400, detail="Stage 3 must be confirmed first")
    if stage == 5:
        s4 = _get_stage_output(db, sn, pipeline_id, 4)
        if not s4 or s4["status"] != "confirmed":
            raise HTTPException(status_code=400, detail="Stage 4 must be confirmed first")

    db.execute(
        text("UPDATE core.compliance_pipelines SET status = :s, current_stage = :cs, updated_at = now() WHERE id = :id"),
        {"s": f"stage_{stage}_running", "cs": stage, "id": str(pipeline_id)},
    )
    db.commit()
    background_tasks.add_task(_execute_stage_job, str(pipeline_id), stage)
    return {"status": "started", "stage": stage}


# ── Stage output CRUD ────────────────────────────────────────

@router.get("/{pipeline_id}/stage/{stage}/output")
def get_stage_output(
    pipeline_id: uuid.UUID,
    stage: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    pipeline = _get_pipeline(db, pipeline_id)
    output = _get_stage_output(db, pipeline["schema_name"], pipeline_id, stage)
    if not output:
        raise HTTPException(status_code=404, detail=f"No output for stage {stage}")
    return output


@router.get("/{pipeline_id}/stage/{stage}/validation")
def validate_stage_output(
    pipeline_id: uuid.UUID,
    stage: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    if stage not in (1, 2, 3, 4, 5):
        raise HTTPException(status_code=400, detail="Stage must be 1, 2, 3, 4, or 5")
    pipeline = _get_pipeline(db, pipeline_id)
    output = _get_stage_output(db, pipeline["schema_name"], pipeline_id, stage)
    if not output:
        raise HTTPException(status_code=404, detail=f"No output for stage {stage}")
    return _validate_stage_output(db, pipeline["schema_name"], pipeline_id, stage, output["output_data"] or {})


@router.put("/{pipeline_id}/stage/{stage}/output")
def update_stage_output(
    pipeline_id: uuid.UUID,
    stage: int,
    body: StageOutputUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]
    _write_stage_draft_output(db, sn, pipeline_id, stage, body.output_data)
    db.commit()
    return {"status": "ok"}


# ── Confirm stage ────────────────────────────────────────────

@router.post("/{pipeline_id}/stage/{stage}/confirm")
def confirm_stage(
    pipeline_id: uuid.UUID,
    stage: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]
    existing = _get_stage_output(db, sn, pipeline_id, stage)
    if not existing:
        raise HTTPException(status_code=404, detail=f"No output for stage {stage}")

    db.execute(
        text(f'UPDATE "{sn}".pipeline_stage_outputs SET status = \'confirmed\', updated_at = now() WHERE id = :id'),
        {"id": str(existing["id"])},
    )

    validation = _validate_stage_output(db, sn, pipeline_id, stage, existing["output_data"] or {})
    if not validation["ok"]:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Stage has blocking validation issues and cannot be confirmed.",
                "validation": validation,
            },
        )

    next_status = {
        1: "stage_1_confirmed",
        2: "stage_2_confirmed",
        3: "stage_3_confirmed",
        4: "stage_4_confirmed",
        5: "stage_5_confirmed",
    }
    db.execute(
        text("UPDATE core.compliance_pipelines SET status = :s, updated_at = now() WHERE id = :id"),
        {"s": next_status.get(stage, pipeline["status"]), "id": str(pipeline_id)},
    )
    db.commit()
    return {"status": "ok", "stage": stage, "confirmed": True}


# ── Chat ─────────────────────────────────────────────────────

@router.get("/{pipeline_id}/stage/{stage}/chat", response_model=list[ChatMessageOut])
def get_chat_history(
    pipeline_id: uuid.UUID,
    stage: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]
    rows = db.execute(
        text(f'SELECT * FROM "{sn}".pipeline_chat_messages WHERE pipeline_id = :pid AND stage = :stage ORDER BY created_at ASC'),
        {"pid": str(pipeline_id), "stage": stage},
    ).mappings().all()
    return [dict(r) for r in rows]


@router.post("/{pipeline_id}/stage/{stage}/chat")
def send_chat_message(
    pipeline_id: uuid.UUID,
    stage: int,
    body: ChatMessageIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]

    current_output = _get_stage_output(db, sn, pipeline_id, stage)
    if not current_output:
        raise HTTPException(status_code=400, detail=f"No stage {stage} output to refine")

    history_rows = db.execute(
        text(f'SELECT role, content FROM "{sn}".pipeline_chat_messages WHERE pipeline_id = :pid AND stage = :stage ORDER BY created_at ASC'),
        {"pid": str(pipeline_id), "stage": stage},
    ).mappings().all()
    chat_history = [{"role": r["role"], "content": r["content"]} for r in history_rows]

    db.execute(
        text(f'INSERT INTO "{sn}".pipeline_chat_messages (id, pipeline_id, stage, role, content) VALUES (:id, :pid, :stage, \'user\', :content)'),
        {"id": str(uuid.uuid4()), "pid": str(pipeline_id), "stage": stage, "content": body.content},
    )

    try:
        reply_text, updated_data = ai_service.chat_refine(
            stage=stage,
            current_output=current_output["output_data"],
            chat_history=chat_history,
            user_message=body.content,
        )
    except ai_service.VertexAIRateLimitError as e:
        db.rollback()
        raise HTTPException(status_code=503, detail=str(e)) from e

    db.execute(
        text(f'INSERT INTO "{sn}".pipeline_chat_messages (id, pipeline_id, stage, role, content) VALUES (:id, :pid, :stage, \'assistant\', :content)'),
        {"id": str(uuid.uuid4()), "pid": str(pipeline_id), "stage": stage, "content": reply_text},
    )

    if updated_data:
        if stage == 2:
            s1 = _get_stage_output(db, sn, pipeline_id, 1)
            if s1 and s1.get("status") == "confirmed" and isinstance(s1.get("output_data"), dict):
                ai_service.normalize_stage2_catalog(updated_data, s1["output_data"])
        db.execute(
            text(f'UPDATE "{sn}".pipeline_stage_outputs SET output_data = CAST(:data AS jsonb), updated_at = now() WHERE id = :id'),
            {"data": json.dumps(updated_data), "id": str(current_output["id"])},
        )

    db.commit()
    return {
        "reply": reply_text,
        "output_updated": updated_data is not None,
    }


# ── Finalize ─────────────────────────────────────────────────

@router.post("/{pipeline_id}/finalize")
def finalize_pipeline(
    pipeline_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]

    for s in (1, 2, 3, 4, 5):
        out = _get_stage_output(db, sn, pipeline_id, s)
        if not out or out["status"] != "confirmed":
            raise HTTPException(status_code=400, detail=f"Stage {s} must be confirmed before finalizing")

    db.execute(
        text("UPDATE core.compliance_pipelines SET status = 'finalizing', updated_at = now() WHERE id = :id"),
        {"id": str(pipeline_id)},
    )
    db.commit()

    try:
        s1 = _get_stage_output(db, sn, pipeline_id, 1)
        s2 = _get_stage_output(db, sn, pipeline_id, 2)
        s3 = _get_stage_output(db, sn, pipeline_id, 3)
        s4 = _get_stage_output(db, sn, pipeline_id, 4)
        s5 = _get_stage_output(db, sn, pipeline_id, 5)

        create_full_schema_tables(db, sn)
        ensure_dynamic_schema_control_ids(db, sn)
        ensure_dynamic_schema_text_columns(db, sn)

        seed_stage1_data(db, sn, s1["output_data"])
        seed_stage2_data(db, sn, s2["output_data"])
        seed_stage3_data(db, sn, s3["output_data"])
        seed_stage4_data(db, sn, s4["output_data"])
        seed_stage5_data(db, sn, s5["output_data"])

        version = s1["output_data"].get("framework_version", sn)
        register_framework(db, str(pipeline_id), pipeline["name"], sn, version)

        db.execute(
            text("UPDATE core.compliance_pipelines SET status = 'finalized', updated_at = now() WHERE id = :id"),
            {"id": str(pipeline_id)},
        )
        db.commit()
        return {"status": "finalized", "schema_name": sn}

    except Exception as e:
        logger.exception("Finalization failed for pipeline %s", pipeline_id)
        db.rollback()
        db.execute(
            text("UPDATE core.compliance_pipelines SET status = 'failed', updated_at = now() WHERE id = :id"),
            {"id": str(pipeline_id)},
        )
        db.commit()
        raise HTTPException(status_code=500, detail=f"Finalization failed: {str(e)}")

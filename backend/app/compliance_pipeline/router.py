"""API routes for the compliance pipeline (platform admin only)."""

from __future__ import annotations

import json
import logging
import re
import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
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
)
from .schemas import (
    ChatMessageIn,
    ChatMessageOut,
    PipelineOut,
    StageOutputUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance-pipeline", tags=["compliance-pipeline"])


def _get_pipeline(db: Session, pipeline_id: uuid.UUID) -> dict[str, Any]:
    row = db.execute(
        text("SELECT * FROM core.compliance_pipelines WHERE id = :id"),
        {"id": str(pipeline_id)},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return dict(row)


def _get_stage_output(db: Session, schema_name: str, pipeline_id: uuid.UUID, stage: int) -> dict[str, Any] | None:
    row = db.execute(
        text(f'SELECT * FROM "{schema_name}".pipeline_stage_outputs WHERE pipeline_id = :pid AND stage = :stage ORDER BY version DESC LIMIT 1'),
        {"pid": str(pipeline_id), "stage": stage},
    ).mappings().first()
    return dict(row) if row else None


def _compute_max_nav_stage(db: Session, schema_name: str, pipeline_id: uuid.UUID) -> int:
    """
    Linear gating: open stage N+1 only after stage N is confirmed.
    Returns 1..4 (4 = Finalize tab when stage 3 is confirmed).
    """
    max_nav = 1
    for s in (1, 2, 3):
        out = _get_stage_output(db, schema_name, pipeline_id, s)
        if not out:
            return max_nav
        max_nav = s
        if out["status"] != "confirmed":
            return max_nav
        max_nav = s + 1
    return min(max_nav, 4)


def _enrich_pipeline_row(db: Session, row: dict[str, Any]) -> dict[str, Any]:
    d = dict(row)
    pid = uuid.UUID(str(d["id"]))
    d["max_nav_stage"] = _compute_max_nav_stage(db, d["schema_name"], pid)
    return d


def _validate_stage_output(
    db: Session, schema_name: str, pipeline_id: uuid.UUID, stage: int, output_data: dict[str, Any]
) -> dict[str, Any]:
    issues: list[dict[str, Any]] = []

    def add_issue(path: str, problem: str, impact: str, fix: str, blocking: bool = True) -> None:
        issues.append(
            {
                "path": path,
                "problem": problem,
                "impact": impact,
                "fix": fix,
                "blocking": blocking,
            }
        )

    if not isinstance(output_data, dict):
        add_issue(
            "",
            "Stage output is not a JSON object.",
            "Confirm/finalize cannot safely process this payload.",
            "Replace output with a valid JSON object for this stage.",
            True,
        )
        blocking_count = sum(1 for i in issues if i["blocking"])
        return {
            "stage": stage,
            "ok": blocking_count == 0,
            "blocking_issue_count": blocking_count,
            "warning_count": len(issues) - blocking_count,
            "issues": issues,
        }

    if stage == 1:
        controls = output_data.get("controls") or []
        mappings = output_data.get("item_control_mappings") or []
        items = output_data.get("canonical_evidence_items") or []
        domains = output_data.get("evidence_domains") or []

        if not isinstance(controls, list):
            add_issue("controls", "Expected array.", "Control seed insert can fail.", "Use an array of control objects.", True)
            controls = []
        if not isinstance(items, list):
            add_issue(
                "canonical_evidence_items",
                "Expected array.",
                "Item seed insert can fail.",
                "Use an array of canonical evidence item objects.",
                True,
            )
            items = []
        if not isinstance(mappings, list):
            add_issue(
                "item_control_mappings",
                "Expected array.",
                "Mapping insert can fail.",
                "Use an array of mapping objects.",
                True,
            )
            mappings = []
        if not isinstance(domains, list):
            domains = []

        domain_ids = set()
        for idx, d in enumerate(domains):
            if not isinstance(d, dict):
                add_issue(
                    f"evidence_domains[{idx}]",
                    "Domain row is not an object.",
                    "Domain inserts can fail.",
                    "Convert to an object with at least id and name.",
                    True,
                )
                continue
            did = str(d.get("id") or "").strip()
            if not did:
                add_issue(
                    f"evidence_domains[{idx}].id",
                    "Missing domain id.",
                    "Items referencing this domain cannot be resolved.",
                    "Provide a short non-empty id.",
                    True,
                )
            if did in domain_ids:
                add_issue(
                    f"evidence_domains[{idx}].id",
                    f"Duplicate domain id '{did}'.",
                    "Conflicts can cause inconsistent references.",
                    "Use unique domain ids.",
                    True,
                )
            if did:
                domain_ids.add(did)

        control_ids = {
            str(c.get("id")).strip()
            for c in controls
            if isinstance(c, dict) and str(c.get("id") or "").strip()
        }
        item_ids = {
            str(i.get("id")).strip()
            for i in items
            if isinstance(i, dict) and str(i.get("id") or "").strip()
        }
        seen_control_ids: set[str] = set()
        for idx, c in enumerate(controls):
            if not isinstance(c, dict):
                add_issue(
                    f"controls[{idx}]",
                    "Control row is not an object.",
                    "Control inserts can fail.",
                    "Convert this row to an object with id and name.",
                    True,
                )
                continue
            cid = str(c.get("id") or "").strip()
            if not cid:
                add_issue(
                    f"controls[{idx}].id",
                    "Missing control id.",
                    "Mappings and FKs will fail.",
                    "Provide a non-empty control id like '1.3'.",
                    True,
                )
            elif cid in seen_control_ids:
                add_issue(
                    f"controls[{idx}].id",
                    f"Duplicate control id '{cid}'.",
                    "Duplicate PKs will be dropped/ignored and cause mismatch.",
                    "Use unique control ids.",
                    True,
                )
            else:
                seen_control_ids.add(cid)

        seen_item_ids: set[str] = set()
        for idx, i in enumerate(items):
            if not isinstance(i, dict):
                add_issue(
                    f"canonical_evidence_items[{idx}]",
                    "Item row is not an object.",
                    "Item inserts can fail.",
                    "Convert this row to an object with id/domain_id/name.",
                    True,
                )
                continue
            iid = str(i.get("id") or "").strip()
            domain_id = str(i.get("domain_id") or "").strip()
            if not iid:
                add_issue(
                    f"canonical_evidence_items[{idx}].id",
                    "Missing evidence item id.",
                    "Mappings and stage joins can fail.",
                    "Provide a non-empty item id like 'A1'.",
                    True,
                )
            elif iid in seen_item_ids:
                add_issue(
                    f"canonical_evidence_items[{idx}].id",
                    f"Duplicate evidence item id '{iid}'.",
                    "Duplicate PKs will conflict.",
                    "Use unique evidence item ids.",
                    True,
                )
            else:
                seen_item_ids.add(iid)
            if domain_id and domain_ids and domain_id not in domain_ids:
                add_issue(
                    f"canonical_evidence_items[{idx}].domain_id",
                    f"Unknown domain_id '{domain_id}'.",
                    "Item references a non-existent domain.",
                    "Set domain_id to an existing evidence_domains id.",
                    True,
                )

        for idx, m in enumerate(mappings):
            if not isinstance(m, dict):
                add_issue(
                    f"item_control_mappings[{idx}]",
                    "Mapping row is not an object.",
                    "Finalize can fail when inserting invalid mapping rows.",
                    "Convert this row to a JSON object with evidence_item_id and control_id.",
                    True,
                )
                continue
            eid = str(m.get("evidence_item_id") or "").strip()
            cid = str(m.get("control_id") or "").strip()
            if eid and eid not in item_ids:
                add_issue(
                    f"item_control_mappings[{idx}].evidence_item_id",
                    f"References missing evidence item '{eid}'.",
                    "Finalize can fail or create inconsistent mappings.",
                    f"Change to one of existing item IDs: {sorted(item_ids)[:12]}",
                    True,
                )
            if cid and cid not in control_ids:
                add_issue(
                    f"item_control_mappings[{idx}].control_id",
                    f"References missing control '{cid}'.",
                    "Finalize can fail with foreign-key violation.",
                    f"Change to one of existing control IDs: {sorted(control_ids)[:20]}",
                    True,
                )

    if stage == 2:
        s1 = _get_stage_output(db, schema_name, pipeline_id, 1)
        s1_data = (s1 or {}).get("output_data") or {}
        s1_controls = {
            str(c.get("id")).strip()
            for c in (s1_data.get("controls") or [])
            if isinstance(c, dict) and str(c.get("id") or "").strip()
        }
        s1_items = {
            str(i.get("id")).strip()
            for i in (s1_data.get("canonical_evidence_items") or [])
            if isinstance(i, dict) and str(i.get("id") or "").strip()
        }
        rows = output_data.get("sufficiency_matrix") or []
        if not isinstance(rows, list):
            add_issue(
                "sufficiency_matrix",
                "Expected array.",
                "Stage 2 seed insert cannot run.",
                "Use an array of sufficiency matrix rows.",
                True,
            )
            rows = []
        seen_pairs: set[tuple[str, str]] = set()
        for idx, row in enumerate(rows):
            if not isinstance(row, dict):
                add_issue(
                    f"sufficiency_matrix[{idx}]",
                    "Row is not an object.",
                    "Finalize can fail for malformed rows.",
                    "Convert row to an object with item_code/control_id/ma.",
                    True,
                )
                continue
            item_code = str(row.get("item_code") or "").strip()
            control_id = str(row.get("control_id") or "").strip()
            ma_value = str(row.get("ma") or "").strip()
            if not item_code:
                add_issue(
                    f"sufficiency_matrix[{idx}].item_code",
                    "Missing item_code.",
                    "Cannot map this row to a canonical evidence item.",
                    "Set item_code to a valid Stage 1 evidence item id.",
                    True,
                )
            if not control_id:
                add_issue(
                    f"sufficiency_matrix[{idx}].control_id",
                    "Missing control_id.",
                    "Cannot map this row to a control.",
                    "Set control_id to a valid Stage 1 control id.",
                    True,
                )
            if ma_value and ma_value not in ("M", "A"):
                add_issue(
                    f"sufficiency_matrix[{idx}].ma",
                    f"Invalid ma '{ma_value}'.",
                    "DB column accepts 1-char value; finalize insert can fail.",
                    "Use 'M' (mandatory) or 'A' (advisory).",
                    True,
                )
            if item_code and item_code not in s1_items:
                add_issue(
                    f"sufficiency_matrix[{idx}].item_code",
                    f"Unknown item_code '{item_code}' (not in Stage 1).",
                    "Downstream question generation may be misaligned.",
                    "Use an item_code that exists in Stage 1 canonical_evidence_items.",
                    True,
                )
            if control_id and control_id not in s1_controls:
                add_issue(
                    f"sufficiency_matrix[{idx}].control_id",
                    f"Unknown control_id '{control_id}' (not in Stage 1).",
                    "Finalize can fail or create broken control mapping semantics.",
                    "Use a control_id that exists in Stage 1 controls.",
                    True,
                )
            if item_code and control_id:
                pair = (item_code, control_id)
                if pair in seen_pairs:
                    add_issue(
                        f"sufficiency_matrix[{idx}]",
                        f"Duplicate pair ({item_code}, {control_id}).",
                        "Unique key conflicts cause row to be ignored.",
                        "Keep only one row per (item_code, control_id).",
                        False,
                    )
                seen_pairs.add(pair)

    if stage == 3:
        rows = output_data.get("evaluation_questions") or []
        if not isinstance(rows, list):
            add_issue(
                "evaluation_questions",
                "Expected array.",
                "Stage 3 seed insert cannot run.",
                "Use an array of question objects.",
                True,
            )
            rows = []
        allowed_qt = {"text", "textarea", "select", "multiselect", "date", "file", "number", "boolean"}
        seen_keys: set[str] = set()
        for idx, row in enumerate(rows):
            if not isinstance(row, dict):
                add_issue(
                    f"evaluation_questions[{idx}]",
                    "Question row is not an object.",
                    "Finalize can fail for malformed questions.",
                    "Convert row to object with question_key/label/question_type.",
                    True,
                )
                continue
            qk = str(row.get("question_key") or "").strip()
            required = row.get("required")
            label = str(row.get("label") or "").strip()
            question_type = str(row.get("question_type") or "").strip().lower()
            if not label:
                add_issue(
                    f"evaluation_questions[{idx}].label",
                    "Missing question label.",
                    "UI cannot render understandable prompt.",
                    "Provide a non-empty label.",
                    True,
                )
            if question_type and question_type not in allowed_qt:
                add_issue(
                    f"evaluation_questions[{idx}].question_type",
                    f"Unexpected question_type '{question_type}'.",
                    "Collector may not render this input type.",
                    f"Use one of: {sorted(allowed_qt)}",
                    False,
                )
            if qk:
                if qk in seen_keys:
                    add_issue(
                        f"evaluation_questions[{idx}].question_key",
                        f"Duplicate question_key '{qk}'.",
                        "Collector/UI may overwrite answers across duplicate keys.",
                        "Make question_key unique within evaluation_questions.",
                        True,
                    )
                seen_keys.add(qk)
            if isinstance(required, str):
                add_issue(
                    f"evaluation_questions[{idx}].required",
                    f"Boolean expected, found string '{required}'.",
                    "Client form logic can behave unexpectedly for required fields.",
                    "Change required to true/false (boolean).",
                    False,
                )

    blocking_count = sum(1 for i in issues if i["blocking"])
    return {
        "stage": stage,
        "ok": blocking_count == 0,
        "blocking_issue_count": blocking_count,
        "warning_count": len(issues) - blocking_count,
        "issues": issues,
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


def _execute_stage_job(pipeline_id: str, stage: int) -> None:
    """Run a stage in background with an isolated DB session."""
    db = SessionLocal()
    try:
        pid = uuid.UUID(pipeline_id)
        pipeline = _get_pipeline(db, pid)
        sn = pipeline["schema_name"]

        if stage == 1:
            pdf_bytes = storage_service.download(pipeline["pdf_storage_path"])
            output_data = ai_service.run_stage_1(pdf_bytes)
        elif stage == 2:
            s1 = _get_stage_output(db, sn, pid, 1)
            if not s1 or s1["status"] != "confirmed":
                raise ValueError("Stage 1 must be confirmed first")
            output_data = ai_service.run_stage_2(s1["output_data"])
        elif stage == 3:
            s1 = _get_stage_output(db, sn, pid, 1)
            s2 = _get_stage_output(db, sn, pid, 2)
            if not s1 or s1["status"] != "confirmed":
                raise ValueError("Stage 1 must be confirmed first")
            if not s2 or s2["status"] != "confirmed":
                raise ValueError("Stage 2 must be confirmed first")
            try:
                output_data = ai_service.run_stage_3(s1["output_data"], s2["output_data"])
            except Exception as exc:
                # Expected recovery path when the model returns truncated/non-JSON output.
                logger.warning(
                    "Stage 3 model JSON parse failed; using deterministic fallback. Cause: %s",
                    exc,
                )
                output_data = ai_service.build_stage3_fallback(s1["output_data"], s2["output_data"])
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
    db: Session = Depends(get_db),
    user: User = Depends(get_platform_admin),
):
    if stage not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="Stage must be 1, 2, or 3")

    pipeline = _get_pipeline(db, pipeline_id)
    sn = pipeline["schema_name"]

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
    if stage not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="Stage must be 1, 2, or 3")
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
    existing = _get_stage_output(db, sn, pipeline_id, stage)
    if not existing:
        raise HTTPException(status_code=404, detail=f"No output for stage {stage}")
    if existing["status"] == "confirmed":
        raise HTTPException(status_code=400, detail="Cannot edit a confirmed stage output")

    db.execute(
        text(f"""
            UPDATE "{sn}".pipeline_stage_outputs
            SET output_data = CAST(:data AS jsonb), updated_at = now()
            WHERE id = :id
        """),
        {"data": json.dumps(body.output_data), "id": str(existing["id"])},
    )
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

    next_status = {1: "stage_1_review", 2: "stage_2_review", 3: "stage_3_review"}
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

    for s in (1, 2, 3):
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

        create_full_schema_tables(db, sn)
        ensure_dynamic_schema_control_ids(db, sn)
        ensure_dynamic_schema_text_columns(db, sn)

        seed_stage1_data(db, sn, s1["output_data"])
        seed_stage2_data(db, sn, s2["output_data"])
        seed_stage3_data(db, sn, s3["output_data"])

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

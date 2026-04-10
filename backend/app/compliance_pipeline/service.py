"""AI service for the compliance pipeline stages.

Uses Vertex AI (Gemini) to process compliance PDFs through a 5-stage pipeline,
and supports chat-based refinement of each stage's output.
"""

from __future__ import annotations

import concurrent.futures as cf
import json
import logging
import re
import time
import uuid
from pathlib import Path
from typing import Any

import vertexai  # type: ignore[import-untyped]
from google.api_core import exceptions as google_api_exceptions
from vertexai.generative_models import GenerativeModel, Part  # type: ignore[import-untyped]

from ..config import settings

from .stage3_mapping import build_item_control_mappings, validate_stage3

logger = logging.getLogger(__name__)
_VERTEX_CALL_TIMEOUT_SECONDS = 180
# Stage 5 runs many batched calls; 429s are common — allow more backoff cycles per call than other stages.
_STAGE_5_VERTEX_MAX_ATTEMPTS = 10
# Above this many evidence items, Stage 4 uses one LLM call per domain batch.
_STAGE_4_ITEM_THRESHOLD = 50
_STAGE_5_BATCH_SIZE = 8


class VertexAIRateLimitError(RuntimeError):
    """Vertex AI returned 429 / resource exhausted after retries exhausted."""


def _is_vertex_rate_limit(exc: BaseException) -> bool:
    if isinstance(exc, (google_api_exceptions.ResourceExhausted, google_api_exceptions.TooManyRequests)):
        return True
    msg = str(exc).lower()
    return "resource exhausted" in msg or "429" in msg or "rate limit" in msg


def _vertex_generate_with_timeout(
    model: GenerativeModel,
    parts: list[Part],
    *,
    timeout_seconds: int = _VERTEX_CALL_TIMEOUT_SECONDS,
):
    """
    Execute model.generate_content with a hard timeout.
    Prevents stages from staying in 'running' forever on stuck network/model calls.
    """
    executor = cf.ThreadPoolExecutor(max_workers=1, thread_name_prefix="vertex-call")
    future: cf.Future = executor.submit(model.generate_content, parts)
    try:
        return future.result(timeout=timeout_seconds)
    except cf.TimeoutError as exc:
        future.cancel()
        raise TimeoutError(
            f"Vertex generate_content timed out after {timeout_seconds}s"
        ) from exc
    finally:
        executor.shutdown(wait=False, cancel_futures=True)


def _generate_content_with_rate_limit_retry(
    model: GenerativeModel,
    parts: list[Part],
    *,
    operation: str = "generate_content",
    max_attempts: int = 6,
):
    """
    Wrap model.generate_content with exponential backoff on Vertex 429 / quota errors.
    """
    for attempt in range(1, max_attempts + 1):
        try:
            return _vertex_generate_with_timeout(model, parts)
        except Exception as e:
            is_timeout = isinstance(e, TimeoutError)
            if not _is_vertex_rate_limit(e) and not is_timeout:
                raise
            if attempt >= max_attempts:
                logger.error(
                    "[Pipeline] %s still unavailable after %d attempts: %s",
                    operation,
                    max_attempts,
                    e,
                )
                raise VertexAIRateLimitError(
                    "Vertex AI did not respond successfully after retries (rate limit/timeout). "
                    "Please try again in a minute."
                ) from e
            delay = min(32.0, float(2 ** (attempt - 1)))
            logger.warning(
                "[Pipeline] %s retry (%d/%d), waiting %.1fs: %s",
                operation,
                attempt,
                max_attempts,
                delay,
                e,
            )
            time.sleep(delay)

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "Prompt" / "files"
_STAGE_1_PROMPT = _PROMPT_DIR / "STAGE_1_PDF_to_Canonical_Evidence_Model.txt"
_STAGE_2_PROMPT = _PROMPT_DIR / "STAGE_2_Evidence_Catalog.txt"
_STAGE_4_PROMPT = _PROMPT_DIR / "STAGE_4_Sufficiency_Matrix.txt"
_STAGE_5_PROMPT = _PROMPT_DIR / "STAGE_5_Question_Bank.txt"

_model: GenerativeModel | None = None


def _get_model() -> GenerativeModel:
    global _model
    if _model is None:
        project = settings.GOOGLE_CLOUD_PROJECT
        if not project:
            raise ValueError("GOOGLE_CLOUD_PROJECT is not set.")
        vertexai.init(project=project, location=settings.VERTEX_AI_LOCATION)
        _model = GenerativeModel(settings.VERTEX_AI_MODEL)
    return _model


def _load_prompt(path: Path) -> str:
    if not path.is_file():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    return path.read_text(encoding="utf-8")


def _build_stage_parts(
    pdf_bytes: bytes,
    prior_blocks: list[tuple[str, dict[str, Any]]],
    stage_prompt: str,
    json_schema_instruction: str,
    *,
    repair_text: str | None = None,
    include_pdf: bool = True,
) -> list[Part]:
    """Optional PDF, then labeled JSON blocks, optional repair context, then prompt + JSON schema instructions."""
    parts: list[Part] = []
    if include_pdf:
        parts.append(Part.from_data(pdf_bytes, mime_type="application/pdf"))
    for label, obj in prior_blocks:
        parts.append(Part.from_text(f"=== {label} ===\n{json.dumps(obj, indent=2)}"))
    if repair_text:
        parts.append(Part.from_text(repair_text))
    parts.append(
        Part.from_text(stage_prompt + "\n\n" + _JSON_WRAPPER.format(schema_instruction=json_schema_instruction))
    )
    return parts


def _format_validation_issues_for_llm(validation: dict[str, Any], *, omit_pdf: bool = False) -> str:
    issues = validation.get("issues") or []
    if not issues:
        if omit_pdf:
            return (
                "(No validator issues were recorded — still re-check the prior-stage JSON and PREVIOUS_MODEL_OUTPUT "
                "for completeness, ID consistency, and any rules from the stage instructions.)"
            )
        return (
            "(No validator issues were recorded — still re-check the PDF and prior-stage JSON "
            "for completeness, ID consistency, and any rules from the stage instructions.)"
        )
    chunks: list[str] = []
    for iss in issues:
        if not isinstance(iss, dict):
            continue
        tag = "BLOCKING" if iss.get("blocking") else "WARNING"
        chunks.append(
            f"[{tag}] path={iss.get('path', '')}\n"
            f"  problem: {iss.get('problem', '')}\n"
            f"  impact: {iss.get('impact', '')}\n"
            f"  fix: {iss.get('fix', '')}"
        )
    return "\n\n".join(chunks)


def _repair_context_text(
    stage: int,
    validation: dict[str, Any],
    previous_slice: dict[str, Any],
    *,
    stage_extra: str | None = None,
    omit_pdf: bool = False,
) -> str:
    """Instructions + validation list + sliced previous JSON for a model re-run."""
    n_block = int(validation.get("blocking_issue_count") or 0)
    n_warn = int(validation.get("warning_count") or 0)
    issues_text = _format_validation_issues_for_llm(validation, omit_pdf=omit_pdf)
    prev_json = json.dumps(previous_slice, indent=2)
    extra_block = f"\n{stage_extra}\n" if stage_extra else ""
    if omit_pdf:
        req2 = (
            "2. Preserve all valid data from PREVIOUS_MODEL_OUTPUT — do not remove controls, domains, evidence items, "
            "matrix rows, or questions unless the validator requires a correction.\n"
        )
        req3 = (
            "3. Using the labeled prior-stage JSON blocks in this request and PREVIOUS_MODEL_OUTPUT, perform a full "
            "consistency pass: missing or duplicate IDs, control_count vs len(controls_served), coverage of all Stage 1 "
            "controls, pair completeness, question ordering, etc. No PDF is provided for this re-run.\n"
        )
    else:
        req2 = (
            "2. Preserve all valid data from PREVIOUS_MODEL_OUTPUT — do not remove controls, domains, evidence items, "
            "matrix rows, or questions unless the PDF or validator requires a correction.\n"
        )
        req3 = (
            "3. Using the PDF and prior-stage JSON in context, perform a full consistency pass: "
            "missing or duplicate IDs, control_count vs len(controls_served), coverage of all Stage 1 controls, "
            "pair completeness, question ordering, etc.\n"
        )
    return (
        f"=== RE-RUN / REPAIR (Stage {stage}) ===\n"
        "This is a re-generation: a previous model output failed pipeline validation or the user requested a re-run.\n\n"
        "REQUIREMENTS:\n"
        "1. Fix every BLOCKING validation issue below. Address WARNINGs where they are correct.\n"
        f"{req2}"
        f"{req3}"
        "4. Output ONLY one complete valid JSON object for this stage (same top-level keys as a normal run). "
        "No markdown, no code fences, no commentary before or after the JSON.\n"
        f"{extra_block}"
        f"\nValidator summary: {n_block} blocking issue(s), {n_warn} warning(s).\n\n"
        "=== VALIDATION_ISSUES ===\n"
        f"{issues_text}\n\n"
        "=== PREVIOUS_MODEL_OUTPUT (correct and return full stage output, not a patch) ===\n"
        f"{prev_json}"
    )


_STAGE_4_REPAIR_EXTRA = """
STAGE-SPECIFIC — EVIDENCE SUFFICIENCY MATRIX (Stage 4)
- Treat VALIDATION_ISSUES as the checklist: fix those paths first (e.g. evidence_sufficiency_matrix[i]).
- Each row’s (item_code, control_id) MUST be a pair that exists in Stage 2 canonical_evidence_items[].controls_served.
  Remove bad rows or change codes to a valid pair — do not invent pairs that Stage 2 does not serve.
- Do not add “extra” matrix rows beyond what Stage 2 requires. The only new rows allowed are those needed to clear
  a BLOCKING issue that explicitly says a required pair is missing from the matrix.
- Output the full evidence_sufficiency_matrix for this batch/run (same shape as a normal Stage 4 run), not a JSON patch.
"""


_JSON_WRAPPER = """
IMPORTANT OUTPUT FORMAT OVERRIDE:
Instead of producing XLSX/CSV files, return your output as a single JSON object.
The JSON must be valid and parseable. Do NOT wrap it in markdown code fences.
Return ONLY the raw JSON object — no commentary before or after.

{schema_instruction}
"""

_STAGE_1_JSON_SCHEMA = """
Return a JSON object with these top-level keys:
{
  "framework_name": "string",
  "framework_version": "string",
  "cscf_version": "string",
  "evidence_domains": [
    {"id": "A", "name": "string", "color": "#RRGGBB", "accent_color": "#RRGGBB", "item_count": 0, "sort_order": 1}
  ],
  "controls": [
    {"id": "1.1", "name": "Control Name", "control_type": "mandatory", "objective": 1, "architecture_applicability": "All", "description": "..."}
  ]
}
Domain ids: single uppercase letters A, B, C... in order. item_count always 0 at this stage.
"""

_STAGE_2_JSON_SCHEMA = """
Return a JSON object with this structure:
{
  "canonical_evidence_items": [
    {
      "item_code": "A1",
      "domain_id": "A",
      "sort_order": 1,
      "name": "Evidence Item Name",
      "priority": "CRITICAL",
      "evidence_type": "Visio/PDF diagram;PNG/JPEG image",
      "description": "...",
      "reduction_note": "...",
      "control_count": 3,
      "collection_model": "singleton",
      "reuse_tier": "HIGH",
      "input_schema": {"primary_type": "file", "accepted_formats": [".pdf"]},
      "sufficiency_dimensions": {"dimensions": ["completeness"], "min_criteria_count": 5},
      "per_system": false,
      "per_zone": false,
      "per_quarter": false,
      "per_access_point": false,
      "is_advisory": false,
      "is_conditional": false,
      "conditional_note": null,
      "evidence_description": "...",
      "sufficiency_definition": "...",
      "evaluation_criteria": "...",
      "controls_served": ["1.1", "1.2"],
      "ma_mix": "2M",
      "version_change_flag": null
    }
  ]
}
"""

_STAGE_4_JSON_SCHEMA = """
Return a JSON object with this structure:
{
  "evidence_sufficiency_matrix": [
    {
      "item_code": "A1",
      "control_id": "1.1",
      "evidence_item_name": "...",
      "control_name": "...",
      "ma": "M",
      "evidence_type": "...",
      "sufficiency_criteria": {"criteria": ["..."]},
      "evaluation_criteria": {"pass_if": ["..."], "fail_if": ["..."], "cross_checks": [], "notes": null}
    }
  ]
}
"""

_STAGE_5_JSON_SCHEMA = """
Return a JSON object with this structure:
{
  "evidence_based_questions": [
    {
      "id": "uuid-v4",
      "evidence_item_id": "A1",
      "question_key": "evidence_document",
      "label": "Upload evidence",
      "question_type": "file",
      "required": false,
      "placeholder": null,
      "options": [],
      "sort_order": 0,
      "control_id": null,
      "rows": null,
      "accept": ".pdf",
      "upload_label": "Upload document",
      "cscf_version": "2026v",
      "created_at": "2026-01-01T00:00:00Z",
      "guide": "...",
      "show_when_question": null,
      "show_when_values": [],
      "gcs_auto_level": null,
      "gcs_services": [],
      "question_level_gcs_sources": null,
      "evidence_required_raw": "Document/File Upload",
      "evidence_source": "primary",
      "collection_method": "upload",
      "aws_auto_level": null,
      "aws_services": [],
      "question_level_aws_sources": null,
      "reason_rationale": "...",
      "answers": {},
      "azure_auto_level": null,
      "azure_services": [],
      "question_level_azure_sources": null
    }
  ]
}
"""


def _extract_json(raw: str) -> dict[str, Any]:
    """Extract JSON from model response with robust fallbacks."""
    text = (raw or "").strip()
    if not text:
        raise ValueError("Model returned empty response; expected JSON.")

    # Fast path: already JSON.
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    # Fenced block path: ```json ... ```
    if "```" in text:
        for match in re.finditer(r"```(?:json)?\s*([\s\S]*?)\s*```", text, flags=re.IGNORECASE):
            block = (match.group(1) or "").strip()
            if not block:
                continue
            try:
                data = json.loads(block)
                if isinstance(data, dict):
                    return data
            except json.JSONDecodeError:
                continue

    # First complete JSON object from first `{` (handles trailing junk after valid JSON).
    brace_start = text.find("{")
    if brace_start != -1:
        decoder = json.JSONDecoder()
        try:
            obj, _end = decoder.raw_decode(text, brace_start)
            if isinstance(obj, dict):
                return obj
        except json.JSONDecodeError:
            pass

    preview = text[:1200].replace("\n", "\\n")
    raise ValueError(f"Could not parse model response as JSON. Preview: {preview}")


def _generate_json_with_retry(
    model: GenerativeModel,
    parts: list[Part],
    operation: str,
    initial_text: str | None = None,
    *,
    content_max_attempts: int = 6,
) -> dict[str, Any]:
    """
    Run model and parse JSON with one strict retry if needed.
    """
    retries = 3
    last_error: Exception | None = None
    retry_hint = (
        "Your previous response was not valid parseable JSON. "
        "Return ONLY a single valid JSON object. "
        "No markdown, no explanation, no prose."
    )
    repair_hint = (
        "Convert the following content into a single valid JSON object. "
        "Preserve keys and values exactly as much as possible. "
        "Return ONLY raw JSON, with no markdown and no commentary."
    )
    # Attempt 1 can reuse already-generated response text from caller.
    if initial_text is not None:
        try:
            return _extract_json(initial_text)
        except Exception as exc:
            last_error = exc
            logger.info(
                "[Pipeline] %s JSON parse retry needed (%d/%d): %s",
                operation,
                1,
                retries,
                exc,
            )
            # First retry path: repair the already generated content.
            # This is much faster than regenerating the full stage prompt.
            try:
                repair_response = _generate_content_with_rate_limit_retry(
                    model,
                    [Part.from_text(repair_hint), Part.from_text(initial_text)],
                    operation=f"{operation} JSON repair",
                    max_attempts=content_max_attempts,
                )
                repaired_text = (getattr(repair_response, "text", None) or "").strip()
                return _extract_json(repaired_text)
            except Exception as repair_exc:
                last_error = repair_exc
                logger.info(
                    "[Pipeline] %s JSON repair retry needed (%d/%d): %s",
                    operation,
                    2,
                    retries,
                    repair_exc,
                )
    current_parts = list(parts)
    for attempt in range(3 if initial_text is not None else 1, retries + 1):
        if attempt == 1:
            current_parts = list(parts)
        else:
            current_parts = list(parts) + [Part.from_text(retry_hint)]
        response = _generate_content_with_rate_limit_retry(
            model,
            current_parts,
            operation=f"{operation} generate",
            max_attempts=content_max_attempts,
        )
        raw_text = (getattr(response, "text", None) or "").strip()
        try:
            return _extract_json(raw_text)
        except Exception as exc:
            last_error = exc
            if attempt < retries:
                logger.info(
                    "[Pipeline] %s JSON parse retry needed (%d/%d): %s",
                    operation,
                    attempt,
                    retries,
                    exc,
                )
            else:
                logger.warning(
                    "[Pipeline] %s JSON parse failed on final attempt (%d/%d): %s",
                    operation,
                    attempt,
                    retries,
                    exc,
                )
    raise ValueError(f"{operation} returned non-JSON output after {retries} attempts: {last_error}")


def normalize_stage2_catalog(stage2: dict[str, Any], stage1: dict[str, Any]) -> dict[str, Any]:
    """
    Fix mechanical catalog fields the model often gets wrong so validation passes:
    control_count, controls_served cleanup, ma_mix, is_advisory — all derived from Stage 1 control_type.
    """
    control_meta: dict[str, str] = {}
    for c in stage1.get("controls") or []:
        if not isinstance(c, dict):
            continue
        cid = str(c.get("id") or "").strip()
        if not cid:
            continue
        control_meta[cid] = str(c.get("control_type") or "mandatory").strip().lower()

    items = stage2.get("canonical_evidence_items")
    if not isinstance(items, list):
        return stage2

    for item in items:
        if not isinstance(item, dict):
            continue
        raw_served = item.get("controls_served")
        if not isinstance(raw_served, list):
            item["controls_served"] = []
            item["control_count"] = 0
            item["ma_mix"] = "0M"
            item["is_advisory"] = False
            continue
        cleaned = [str(x).strip() for x in raw_served if str(x or "").strip()]
        item["controls_served"] = cleaned
        item["control_count"] = len(cleaned)

        m = a = 0
        for cid in cleaned:
            ct = control_meta.get(cid, "mandatory")
            if ct == "advisory":
                a += 1
            else:
                m += 1
        if m and a:
            item["ma_mix"] = f"{m}M + {a}A"
        elif m:
            item["ma_mix"] = f"{m}M"
        elif a:
            item["ma_mix"] = f"{a}A"
        else:
            item["ma_mix"] = "0M"

        if cleaned:
            item["is_advisory"] = all(control_meta.get(cid, "mandatory") == "advisory" for cid in cleaned)
        else:
            item["is_advisory"] = False

    return stage2


def run_stage_1(
    pdf_bytes: bytes,
    *,
    repair: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Stage 1: PDF -> evidence_domains + controls JSON."""
    model = _get_model()
    stage_prompt = _load_prompt(_STAGE_1_PROMPT)
    repair_text = None
    if repair:
        repair_text = _repair_context_text(
            1,
            repair["validation"],
            repair["previous_output"],
        )
        logger.info(
            "[Pipeline] Stage 1 repair mode (blocking=%s)",
            repair["validation"].get("blocking_issue_count"),
        )
    parts = _build_stage_parts(pdf_bytes, [], stage_prompt, _STAGE_1_JSON_SCHEMA, repair_text=repair_text)

    logger.info("[Pipeline] Running Stage 1: PDF to Canonical Evidence Model")
    t0 = time.time()
    response = _generate_content_with_rate_limit_retry(
        model,
        parts,
        operation="Stage 1 initial",
    )
    elapsed = time.time() - t0
    logger.info("[Pipeline] Stage 1 completed in %.1fs (%d chars)", elapsed, len(getattr(response, "text", "") or ""))

    return _generate_json_with_retry(
        model,
        parts,
        "Stage 1",
        initial_text=(getattr(response, "text", None) or ""),
    )


def run_stage_2(
    pdf_bytes: bytes,
    stage1_data: dict[str, Any],
    *,
    repair: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Stage 2: PDF + Stage 1 -> canonical_evidence_items JSON."""
    model = _get_model()
    stage_prompt = _load_prompt(_STAGE_2_PROMPT)
    repair_text = None
    repair_mode = bool(repair)
    if repair:
        repair_text = _repair_context_text(
            2,
            repair["validation"],
            repair["previous_output"],
            omit_pdf=True,
        )
        logger.info(
            "[Pipeline] Stage 2 repair mode (blocking=%s), LLM context without PDF",
            repair["validation"].get("blocking_issue_count"),
        )
    parts = _build_stage_parts(
        pdf_bytes,
        [("STAGE 1 CONFIRMED OUTPUT", stage1_data)],
        stage_prompt,
        _STAGE_2_JSON_SCHEMA,
        repair_text=repair_text,
        include_pdf=not repair_mode,
    )

    logger.info("[Pipeline] Running Stage 2: Evidence catalog")
    t0 = time.time()
    response = _generate_content_with_rate_limit_retry(
        model,
        parts,
        operation="Stage 2 initial",
    )
    elapsed = time.time() - t0
    logger.info("[Pipeline] Stage 2 completed in %.1fs (%d chars)", elapsed, len(getattr(response, "text", "") or ""))

    out = _generate_json_with_retry(
        model,
        parts,
        "Stage 2",
        initial_text=(getattr(response, "text", None) or ""),
    )
    normalize_stage2_catalog(out, stage1_data)
    return out


def run_stage_3(stage1_data: dict[str, Any], stage2_data: dict[str, Any]) -> dict[str, Any]:
    """Stage 3: deterministic item_control_mappings from Stage 1+2 (no LLM)."""
    cscf = str(stage1_data.get("cscf_version") or stage1_data.get("framework_version") or "generated")
    out = build_item_control_mappings(stage1_data, stage2_data, cscf)
    check = validate_stage3(out, stage1_data, stage2_data)
    if check.get("errors"):
        raise ValueError("Stage 3 validation failed: " + "; ".join(check["errors"]))
    logger.info("[Pipeline] Stage 3: %d mapping rows (Python)", len(out.get("item_control_mappings") or []))
    return out


def _canonical_items_list(stage2_data: dict[str, Any]) -> list[dict[str, Any]]:
    raw = stage2_data.get("canonical_evidence_items") or []
    return [i for i in raw if isinstance(i, dict)]


def _expected_stage2_item_control_pairs(stage2_data: dict[str, Any]) -> set[tuple[str, str]]:
    """All (item_code, control_id) pairs declared in Stage 2 controls_served."""
    pairs: set[tuple[str, str]] = set()
    for it in _canonical_items_list(stage2_data):
        icode = str(it.get("item_code") or "").strip()
        for cid in it.get("controls_served") or []:
            c = str(cid or "").strip()
            if icode and c:
                pairs.add((icode, c))
    return pairs


def _stage4_batches(items: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    """Single call if few items; otherwise one batch per domain_id (stable sort)."""
    if len(items) <= _STAGE_4_ITEM_THRESHOLD:
        return [items]
    by_domain: dict[str, list[dict[str, Any]]] = {}
    for it in items:
        dom = str(it.get("domain_id") or "").strip() or "_"
        by_domain.setdefault(dom, []).append(it)
    return [by_domain[k] for k in sorted(by_domain.keys())]


def run_stage_4(
    pdf_bytes: bytes,
    stage1_data: dict[str, Any],
    stage2_data: dict[str, Any],
    *,
    repair: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Stage 4: PDF + Stage 1 + Stage 2 -> evidence_sufficiency_matrix (optional domain batching)."""
    items = _canonical_items_list(stage2_data)
    if not items:
        logger.info("[Pipeline] Stage 4: no evidence items; skipping LLM")
        return {"evidence_sufficiency_matrix": []}
    model = _get_model()
    base_prompt = _load_prompt(_STAGE_4_PROMPT)
    batches = _stage4_batches(items)
    merged: list[dict[str, Any]] = []
    seen_pairs: set[tuple[str, str]] = set()
    prev_matrix_rows: list[dict[str, Any]] = []
    repair_mode = bool(repair)
    if repair:
        pm = (repair["previous_output"].get("evidence_sufficiency_matrix") or [])
        prev_matrix_rows = [r for r in pm if isinstance(r, dict)]
        logger.info(
            "[Pipeline] Stage 4 repair mode (blocking=%s), LLM context without PDF",
            repair["validation"].get("blocking_issue_count"),
        )

    logger.info(
        "[Pipeline] Running Stage 4: %d evidence items in %d LLM batch(es)",
        len(items),
        len(batches),
    )
    for bi, batch in enumerate(batches, 1):
        stage2_batch = {"canonical_evidence_items": batch}
        label_s2 = "STAGE 2 CONFIRMED OUTPUT (THIS BATCH)" if len(batches) > 1 else "STAGE 2 CONFIRMED OUTPUT"
        repair_text = None
        if repair and prev_matrix_rows:
            batch_codes = {str(i.get("item_code") or "").strip() for i in batch if str(i.get("item_code") or "").strip()}
            slice_rows = [
                r
                for r in prev_matrix_rows
                if str(r.get("item_code") or "").strip() in batch_codes
            ]
            repair_text = _repair_context_text(
                4,
                repair["validation"],
                {"evidence_sufficiency_matrix": slice_rows},
                stage_extra=_STAGE_4_REPAIR_EXTRA,
                omit_pdf=True,
            )
        elif repair:
            repair_text = _repair_context_text(
                4,
                repair["validation"],
                {"evidence_sufficiency_matrix": []},
                stage_extra=_STAGE_4_REPAIR_EXTRA,
                omit_pdf=True,
            )
        parts = _build_stage_parts(
            pdf_bytes,
            [
                ("STAGE 1 CONFIRMED OUTPUT", stage1_data),
                (label_s2, stage2_batch),
            ],
            base_prompt,
            _STAGE_4_JSON_SCHEMA,
            repair_text=repair_text,
            include_pdf=not repair_mode,
        )
        response = _generate_content_with_rate_limit_retry(
            model,
            parts,
            operation=f"Stage 4 batch {bi}/{len(batches)}",
        )
        batch_json = _generate_json_with_retry(
            model,
            parts,
            f"Stage 4 batch {bi}",
            initial_text=(getattr(response, "text", None) or ""),
        )
        rows = batch_json.get("evidence_sufficiency_matrix") or []
        if not isinstance(rows, list):
            continue
        for row in rows:
            if not isinstance(row, dict):
                continue
            code = str(row.get("item_code") or "").strip()
            cid = str(row.get("control_id") or "").strip()
            key = (code, cid)
            if key in seen_pairs:
                continue
            seen_pairs.add(key)
            merged.append(row)

    if repair:
        allowed_pairs = _expected_stage2_item_control_pairs(stage2_data)
        if allowed_pairs:
            n_before = len(merged)
            merged = [
                r
                for r in merged
                if isinstance(r, dict)
                and (
                    str(r.get("item_code") or "").strip(),
                    str(r.get("control_id") or "").strip(),
                )
                in allowed_pairs
            ]
            if n_before != len(merged):
                logger.info(
                    "[Pipeline] Stage 4 repair: dropped %d matrix row(s) not in Stage 2 pair set",
                    n_before - len(merged),
                )

    return {"evidence_sufficiency_matrix": merged}


def _chunked(seq: list[Any], size: int) -> list[list[Any]]:
    return [seq[i:i + size] for i in range(0, len(seq), size)]


def _dedupe_question_ids(rows: list[dict[str, Any]]) -> None:
    seen: set[str] = set()
    for row in rows:
        qid = str(row.get("id") or "").strip()
        if not qid or qid in seen:
            row["id"] = str(uuid.uuid4())
        seen.add(str(row["id"]))


def run_stage_5(
    pdf_bytes: bytes,
    stage1_data: dict[str, Any],
    stage2_data: dict[str, Any],
    stage4_data: dict[str, Any],
    *,
    repair: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Stage 5: question-bank generation in batches of evidence items (PDF + S1 + S2 + S4 per batch).
    Falls back to deterministic generation if model output fails repeatedly.
    """
    model = _get_model()
    stage_prompt_template = _load_prompt(_STAGE_5_PROMPT)

    items = [i for i in (stage2_data.get("canonical_evidence_items") or []) if isinstance(i, dict)]
    if not items:
        logger.info("[Pipeline] Stage 5: no evidence items; skipping LLM")
        return {"evidence_based_questions": []}
    matrix = stage4_data.get("evidence_sufficiency_matrix") or []
    if not isinstance(matrix, list):
        matrix = []

    prev_questions: list[dict[str, Any]] = []
    repair_mode = bool(repair)
    if repair:
        pq = repair["previous_output"].get("evidence_based_questions") or []
        prev_questions = [q for q in pq if isinstance(q, dict)]
        logger.info(
            "[Pipeline] Stage 5 repair mode (blocking=%s), LLM context without PDF",
            repair["validation"].get("blocking_issue_count"),
        )

    questions_all: list[dict[str, Any]] = []
    batches = _chunked(items, _STAGE_5_BATCH_SIZE)
    logger.info("[Pipeline] Stage 5 starting: %d evidence items in %d batches", len(items), len(batches))
    for idx, batch in enumerate(batches, 1):
        batch_codes = [str(i.get("item_code") or "").strip() for i in batch if str(i.get("item_code") or "").strip()]
        batch_codes_set = set(batch_codes)
        batch_matrix = [
            r for r in matrix if isinstance(r, dict) and str(r.get("item_code") or "").strip() in batch_codes_set
        ]
        stage_prompt = stage_prompt_template.replace(
            "{INJECT_ITEM_CODES_FOR_THIS_BATCH}",
            json.dumps(batch_codes),
        )
        repair_text = None
        if repair:
            slice_q = [
                q
                for q in prev_questions
                if str(q.get("evidence_item_id") or "").strip() in batch_codes_set
            ]
            repair_text = _repair_context_text(
                5,
                repair["validation"],
                {"evidence_based_questions": slice_q},
                omit_pdf=True,
            )
        parts = _build_stage_parts(
            pdf_bytes,
            [
                ("STAGE 1 CONFIRMED OUTPUT", stage1_data),
                ("STAGE 2 CONFIRMED OUTPUT (THIS BATCH)", {"canonical_evidence_items": batch}),
                ("STAGE 4 CONFIRMED OUTPUT (THIS BATCH)", {"evidence_sufficiency_matrix": batch_matrix}),
            ],
            stage_prompt,
            _STAGE_5_JSON_SCHEMA,
            repair_text=repair_text,
            include_pdf=not repair_mode,
        )

        try:
            logger.info("[Pipeline] Stage 5 batch %d/%d: AI generation start", idx, len(batches))
            response = _generate_content_with_rate_limit_retry(
                model,
                parts,
                operation="Stage 5 initial",
                max_attempts=_STAGE_5_VERTEX_MAX_ATTEMPTS,
            )
            batch_json = _generate_json_with_retry(
                model,
                parts,
                "Stage 5",
                initial_text=(getattr(response, "text", None) or ""),
                content_max_attempts=_STAGE_5_VERTEX_MAX_ATTEMPTS,
            )
            rows = batch_json.get("evidence_based_questions") or []
            if isinstance(rows, list):
                questions_all.extend([r for r in rows if isinstance(r, dict)])
            logger.info(
                "[Pipeline] Stage 5 batch %d/%d: AI generation success (%d rows)",
                idx,
                len(batches),
                len(rows) if isinstance(rows, list) else 0,
            )
        except Exception as exc:
            logger.warning(
                "[Pipeline] Stage 5 batch %d/%d failed; using deterministic fallback: %s",
                idx,
                len(batches),
                exc,
            )
            cscf_v = str(stage1_data.get("cscf_version") or stage1_data.get("framework_version") or "generated")
            fallback_rows = generate_fallback_questions(batch, cscf_v)
            questions_all.extend(fallback_rows)
            logger.info("[Pipeline] Stage 5 batch %d/%d fallback rows=%d", idx, len(batches), len(fallback_rows))

    _dedupe_question_ids(questions_all)
    logger.info("[Pipeline] Stage 5 done: total questions=%d", len(questions_all))
    return {"evidence_based_questions": questions_all}


def generate_fallback_questions(
    evidence_items: list[dict[str, Any]],
    cscf_version: str = "generated",
) -> list[dict[str, Any]]:
    """Deterministic fallback for Stage 5 when the model fails (passes strict per-item structure checks)."""
    out: list[dict[str, Any]] = []
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    ver = cscf_version or "generated"
    for item in evidence_items:
        if not isinstance(item, dict):
            continue
        code = str(item.get("item_code") or "").strip()
        name = str(item.get("name") or code or "Evidence").strip()
        if not code:
            continue
        out.extend([
            {
                "id": str(uuid.uuid4()),
                "evidence_item_id": code,
                "question_key": "evidence_document",
                "label": f"{name} Upload",
                "question_type": "file",
                "required": False,
                "placeholder": None,
                "options": [],
                "sort_order": 0,
                "control_id": None,
                "rows": None,
                "accept": ".pdf,.png,.jpg,.jpeg,.xlsx,.csv",
                "upload_label": f"Upload the primary evidence artifact for {name}. Include the latest version and any relevant annexes.",
                "cscf_version": ver,
                "created_at": now,
                "guide": "Upload the latest available evidence.",
                "show_when_question": None,
                "show_when_values": [],
                "gcs_auto_level": None,
                "gcs_services": [],
                "question_level_gcs_sources": None,
                "evidence_required_raw": "Document/File Upload",
                "evidence_source": "primary",
                "collection_method": "upload",
                "aws_auto_level": None,
                "aws_services": [],
                "question_level_aws_sources": None,
                "reason_rationale": "Primary evidence upload (fallback; no Stage 4 batch available).",
                "answers": {},
                "azure_auto_level": None,
                "azure_services": [],
                "question_level_azure_sources": None,
            },
            {
                "id": str(uuid.uuid4()),
                "evidence_item_id": code,
                "question_key": "evidence_date",
                "label": "Document date",
                "question_type": "date",
                "required": True,
                "placeholder": None,
                "options": [],
                "sort_order": 1,
                "control_id": None,
                "rows": None,
                "accept": None,
                "upload_label": None,
                "cscf_version": ver,
                "created_at": now,
                "guide": "Provide the document or report date.",
                "show_when_question": None,
                "show_when_values": [],
                "gcs_auto_level": None,
                "gcs_services": [],
                "question_level_gcs_sources": None,
                "evidence_required_raw": "Date confirmation",
                "evidence_source": "derived",
                "collection_method": "manual_entry",
                "aws_auto_level": None,
                "aws_services": [],
                "question_level_aws_sources": None,
                "reason_rationale": "Date is required for traceability.",
                "answers": {},
                "azure_auto_level": None,
                "azure_services": [],
                "question_level_azure_sources": None,
            },
            {
                "id": str(uuid.uuid4()),
                "evidence_item_id": code,
                "question_key": "compliance_confirmed",
                "label": "Compliance status",
                "question_type": "select",
                "required": True,
                "placeholder": None,
                "options": ["Confirmed", "Partial", "Not present"],
                "sort_order": 2,
                "control_id": None,
                "rows": None,
                "accept": None,
                "upload_label": None,
                "cscf_version": ver,
                "created_at": now,
                "guide": "Select current compliance status.",
                "show_when_question": None,
                "show_when_values": [],
                "gcs_auto_level": None,
                "gcs_services": [],
                "question_level_gcs_sources": None,
                "evidence_required_raw": "Configuration state confirmation (Yes/No/Status)",
                "evidence_source": "derived",
                "collection_method": "manual_entry",
                "aws_auto_level": None,
                "aws_services": [],
                "question_level_aws_sources": None,
                "reason_rationale": "Standard status capture (fallback).",
                "answers": {},
                "azure_auto_level": None,
                "azure_services": [],
                "question_level_azure_sources": None,
            },
            {
                "id": str(uuid.uuid4()),
                "evidence_item_id": code,
                "question_key": "scope_limitations",
                "label": "Describe any known limitations or scope exclusions for this evidence",
                "question_type": "textarea",
                "required": False,
                "placeholder": None,
                "options": [],
                "sort_order": 3,
                "control_id": None,
                "rows": 4,
                "accept": None,
                "upload_label": None,
                "cscf_version": ver,
                "created_at": now,
                "guide": "Optional context on scope boundaries.",
                "show_when_question": None,
                "show_when_values": [],
                "gcs_auto_level": None,
                "gcs_services": [],
                "question_level_gcs_sources": None,
                "evidence_required_raw": "Free-text narrative / explanation",
                "evidence_source": "derived",
                "collection_method": "manual_entry",
                "aws_auto_level": None,
                "aws_services": [],
                "question_level_aws_sources": None,
                "reason_rationale": "Scope and limitations summary (fallback template).",
                "answers": {},
                "azure_auto_level": None,
                "azure_services": [],
                "question_level_azure_sources": None,
            },
            {
                "id": str(uuid.uuid4()),
                "evidence_item_id": code,
                "question_key": "known_gaps_and_plan",
                "label": "Known gaps and remediation plan",
                "question_type": "textarea",
                "required": False,
                "placeholder": "Describe known gaps and remediation timeline.",
                "options": [],
                "sort_order": 4,
                "control_id": None,
                "rows": 4,
                "accept": None,
                "upload_label": None,
                "cscf_version": ver,
                "created_at": now,
                "guide": "List any known gaps in this evidence and your plan to address them.",
                "show_when_question": None,
                "show_when_values": [],
                "gcs_auto_level": None,
                "gcs_services": [],
                "question_level_gcs_sources": None,
                "evidence_required_raw": "Free-text narrative / explanation",
                "evidence_source": "derived",
                "collection_method": "manual_entry",
                "aws_auto_level": None,
                "aws_services": [],
                "question_level_aws_sources": None,
                "reason_rationale": "Capture remediation context.",
                "answers": {},
                "azure_auto_level": None,
                "azure_services": [],
                "question_level_azure_sources": None,
            },
        ])

    return out


def chat_refine(
    stage: int,
    current_output: dict[str, Any],
    chat_history: list[dict[str, str]],
    user_message: str,
) -> tuple[str, dict[str, Any] | None]:
    """Send the current stage output + chat history + user message to AI for refinement.

    Returns (assistant_reply, updated_output_or_none).
    If the AI returns an updated JSON, it is parsed from the first `{` onward; otherwise None.
    """
    model = _get_model()

    stage_names = {
        1: "Foundation Extraction",
        2: "Evidence Catalog",
        3: "Mapping Layer",
        4: "Sufficiency Matrix",
        5: "Question Bank",
    }
    stage_name = stage_names.get(stage, f"Stage {stage}")

    context = (
        f"You are a compliance pipeline assistant refining {stage_name} output.\n"
        f"=== CURRENT STAGE DRAFT ===\n{json.dumps(current_output, indent=2)}\n\n"
        "When the user requests changes to the data:\n"
        "1. Output your explanation (1-3 sentences) FIRST.\n"
        "2. Then output the complete updated JSON object. The JSON must start with {{ "
        "immediately after your explanation — no markdown code fences required.\n"
        "RULES: Preserve inter-stage references (domain_ids, control_ids, item_codes) "
        "unless the user explicitly changes them. Output the FULL JSON object, not a patch.\n"
        "For Stage 5: each question should still trace to a Stage 4 criterion in reason_rationale.\n"
        "If the user is only asking a question (not requesting edits), answer without emitting JSON.\n"
    )

    parts: list[Part] = [Part.from_text(context)]

    for msg in chat_history[-20:]:
        role_label = "User" if msg["role"] == "user" else "Assistant"
        parts.append(Part.from_text(f"{role_label}: {msg['content']}"))

    parts.append(Part.from_text(f"User: {user_message}"))

    response = _generate_content_with_rate_limit_retry(
        model,
        parts,
        operation=f"Stage {stage} chat_refine",
    )
    reply = (getattr(response, "text", None) or "").strip()

    updated_data = None
    if "{" in reply:
        try:
            updated_data = _extract_json(reply)
        except ValueError:
            pass

    return reply, updated_data

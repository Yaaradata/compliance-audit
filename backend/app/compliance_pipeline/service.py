"""AI service for the compliance pipeline stages.

Uses Vertex AI (Gemini) to process compliance PDFs through a 3-stage pipeline,
and supports chat-based refinement of each stage's output.
"""

from __future__ import annotations

import json
import logging
import re
import time
from pathlib import Path
from typing import Any

import vertexai  # type: ignore[import-untyped]
from google.api_core import exceptions as google_api_exceptions
from vertexai.generative_models import GenerativeModel, Part  # type: ignore[import-untyped]

from ..config import settings

logger = logging.getLogger(__name__)


class VertexAIRateLimitError(RuntimeError):
    """Vertex AI returned 429 / resource exhausted after retries exhausted."""


def _is_vertex_rate_limit(exc: BaseException) -> bool:
    if isinstance(exc, (google_api_exceptions.ResourceExhausted, google_api_exceptions.TooManyRequests)):
        return True
    msg = str(exc).lower()
    return "resource exhausted" in msg or "429" in msg or "rate limit" in msg


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
            return model.generate_content(parts)
        except Exception as e:
            if not _is_vertex_rate_limit(e):
                raise
            if attempt >= max_attempts:
                logger.error(
                    "[Pipeline] %s still rate-limited after %d attempts: %s",
                    operation,
                    max_attempts,
                    e,
                )
                raise VertexAIRateLimitError(
                    "Vertex AI is temporarily over capacity (429). Wait a minute and try again, "
                    "or increase Generative AI quotas in Google Cloud Console."
                ) from e
            delay = min(32.0, float(2 ** (attempt - 1)))
            logger.warning(
                "[Pipeline] %s rate limited (%d/%d), retrying in %.1fs: %s",
                operation,
                attempt,
                max_attempts,
                delay,
                e,
            )
            time.sleep(delay)

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "Prompt" / "files"
_STAGE_1_PROMPT = _PROMPT_DIR / "STAGE_1_PDF_to_Canonical_Evidence_Model.txt"
_STAGE_2_PROMPT = _PROMPT_DIR / "STAGE_2_Canonical_to_Sufficiency_Matrix.txt"
_STAGE_3_PROMPT = _PROMPT_DIR / "STAGE_3_Sufficiency_Matrix_to_Evaluation_Questions.txt"

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
  "evidence_domains": [
    {"id": "A", "name": "Network & Architecture", "color": "#6366f1", "accent_color": "#818cf8", "item_count": 0, "sort_order": 0}
  ],
  "controls": [
    {"id": "1.1", "name": "Control Name", "control_type": "mandatory", "objective": 1, "architecture_applicability": ["A1","A2","A3","A4","B"], "description": "..."}
  ],
  "canonical_evidence_items": [
    {"id": "A1", "domain_id": "A", "sort_order": 1, "name": "Evidence Item Name", "priority": "critical", "evidence_type": "diagram", "description": "...", "reduction_note": "...", "control_count": 6, "controls_served": "1.1, 1.4, 1.5"}
  ],
  "item_control_mappings": [
    {"evidence_item_id": "A1", "control_id": "1.1", "is_primary": true}
  ],
  "cross_domain_dependencies": [
    {"source_item_id": "A1", "target_item_id": "A2", "dependency_type": "validates", "description": "..."}
  ],
  "dedup_analysis": {
    "total_evidence_items": 0,
    "total_controls": 0,
    "average_controls_per_item": 0,
    "overall_reduction_pct": 0
  },
  "ux_readiness": [
    {"item_code": "A1", "screen_title": "...", "input_type": "File upload + text fields", "required_fields": "..."}
  ]
}
"""

_STAGE_2_JSON_SCHEMA = """
Return a JSON object with this structure:
{
  "framework_version": "string",
  "sufficiency_matrix": [
    {
      "item_code": "A1",
      "evidence_item_name": "...",
      "control_id": "1.1",
      "control_name": "...",
      "ma": "M",
      "evidence_type": "Diagram + Text",
      "sufficiency_criteria": "{\\"sufficiency_criteria\\": [\\"criterion 1\\", \\"criterion 2\\"]}",
      "evaluation_criteria": "{\\"pass_if\\": [...], \\"fail_if\\": [...], \\"cross_checks\\": [...], \\"notes\\": null}"
    }
  ]
}
The sufficiency_criteria and evaluation_criteria values must be JSON-encoded STRINGS (not nested objects).
"""

_STAGE_3_JSON_SCHEMA = """
Return a JSON object with this structure:
{
  "framework_version": "string",
  "evaluation_questions": [
    {
      "evidence_item_id": "A1",
      "question_key": "evidence_document",
      "label": "Network Architecture Diagram Upload",
      "question_type": "file",
      "required": false,
      "placeholder": null,
      "options": [],
      "sort_order": 0,
      "control_id": null,
      "accept": ".pdf,.png,.jpg",
      "upload_label": "Upload your network architecture diagram...",
      "guide": "Upload a dated network diagram...",
      "evidence_required_raw": "Document/File Upload"
    }
  ]
}
"""

_STAGE_3_SIZE_GUARD = """
CRITICAL SIZE LIMITS:
- Keep the output compact and machine-parseable.
- `label`, `upload_label`, and `guide` must each be short (max ~140 chars).
- Do not include long explanatory prose or repeated instructions in any field.
- Prefer concise wording over descriptive paragraphs.
- Return ONLY the JSON object.
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


def run_stage_1(pdf_bytes: bytes) -> dict[str, Any]:
    """Stage 1: PDF -> Canonical Evidence Model (JSON)."""
    model = _get_model()
    stage_prompt = _load_prompt(_STAGE_1_PROMPT)
    json_override = _JSON_WRAPPER.format(schema_instruction=_STAGE_1_JSON_SCHEMA)

    pdf_part = Part.from_data(pdf_bytes, mime_type="application/pdf")
    prompt_part = Part.from_text(stage_prompt + "\n\n" + json_override)

    logger.info("[Pipeline] Running Stage 1: PDF to Canonical Evidence Model")
    t0 = time.time()
    response = _generate_content_with_rate_limit_retry(
        model,
        [pdf_part, prompt_part],
        operation="Stage 1 initial",
    )
    elapsed = time.time() - t0
    logger.info("[Pipeline] Stage 1 completed in %.1fs (%d chars)", elapsed, len(getattr(response, "text", "") or ""))

    return _generate_json_with_retry(
        model,
        [pdf_part, prompt_part],
        "Stage 1",
        initial_text=(getattr(response, "text", None) or ""),
    )


def run_stage_2(stage1_data: dict[str, Any]) -> dict[str, Any]:
    """Stage 2: Canonical Evidence Model -> Sufficiency Matrix (JSON)."""
    model = _get_model()
    stage_prompt = _load_prompt(_STAGE_2_PROMPT)
    json_override = _JSON_WRAPPER.format(schema_instruction=_STAGE_2_JSON_SCHEMA)

    input_part = Part.from_text(
        "Here is the Stage 1 output (Canonical Evidence Model) as JSON:\n\n"
        + json.dumps(stage1_data, indent=2)
    )
    prompt_part = Part.from_text(stage_prompt + "\n\n" + json_override)

    logger.info("[Pipeline] Running Stage 2: Canonical to Sufficiency Matrix")
    t0 = time.time()
    response = _generate_content_with_rate_limit_retry(
        model,
        [input_part, prompt_part],
        operation="Stage 2 initial",
    )
    elapsed = time.time() - t0
    logger.info("[Pipeline] Stage 2 completed in %.1fs (%d chars)", elapsed, len(getattr(response, "text", "") or ""))

    return _generate_json_with_retry(
        model,
        [input_part, prompt_part],
        "Stage 2",
        initial_text=(getattr(response, "text", None) or ""),
    )


def run_stage_3(stage1_data: dict[str, Any], stage2_data: dict[str, Any]) -> dict[str, Any]:
    """Stage 3: Sufficiency Matrix -> Evaluation Questions (JSON)."""
    model = _get_model()
    stage_prompt = _load_prompt(_STAGE_3_PROMPT)
    json_override = _JSON_WRAPPER.format(
        schema_instruction=_STAGE_3_JSON_SCHEMA + "\n\n" + _STAGE_3_SIZE_GUARD
    )

    input_part = Part.from_text(
        "Stage 1 output (Canonical Evidence Model):\n\n"
        + json.dumps(stage1_data, indent=2)
        + "\n\nStage 2 output (Sufficiency Matrix):\n\n"
        + json.dumps(stage2_data, indent=2)
    )
    prompt_part = Part.from_text(stage_prompt + "\n\n" + json_override)

    logger.info("[Pipeline] Running Stage 3: Sufficiency Matrix to Evaluation Questions")
    t0 = time.time()
    response = _generate_content_with_rate_limit_retry(
        model,
        [input_part, prompt_part],
        operation="Stage 3 initial",
    )
    elapsed = time.time() - t0
    logger.info("[Pipeline] Stage 3 completed in %.1fs (%d chars)", elapsed, len(getattr(response, "text", "") or ""))

    return _generate_json_with_retry(
        model,
        [input_part, prompt_part],
        "Stage 3",
        initial_text=(getattr(response, "text", None) or ""),
    )


def build_stage3_fallback(stage1_data: dict[str, Any], stage2_data: dict[str, Any]) -> dict[str, Any]:
    """Create a compact, valid Stage 3 payload from Stage 2 data if AI JSON fails."""
    framework_version = (
        stage2_data.get("framework_version")
        or stage1_data.get("framework_version")
        or "unknown"
    )

    rows = stage2_data.get("sufficiency_matrix") or []
    if not isinstance(rows, list):
        rows = []

    questions: list[dict[str, Any]] = []
    seen_keys: set[tuple[str, str]] = set()
    sort_order = 0

    for row in rows:
        if not isinstance(row, dict):
            continue
        evidence_item_id = str(row.get("item_code") or row.get("evidence_item_id") or "").strip()
        control_id = row.get("control_id")
        evidence_name = str(row.get("evidence_item_name") or evidence_item_id or "Evidence").strip()
        required = str(row.get("ma") or "").upper() == "M"

        if not evidence_item_id:
            continue

        key_tuple = (evidence_item_id, str(control_id or ""))
        if key_tuple in seen_keys:
            continue
        seen_keys.add(key_tuple)

        q_key = f"{evidence_item_id.lower()}_{str(control_id or 'evidence').lower().replace('.', '_')}_response"[:100]
        questions.append(
            {
                "evidence_item_id": evidence_item_id,
                "question_key": q_key,
                "label": f"{evidence_name} evidence response",
                "question_type": "textarea",
                "required": required,
                "placeholder": "Provide evidence details and references",
                "options": [],
                "sort_order": sort_order,
                "control_id": control_id,
                "accept": None,
                "upload_label": None,
                "guide": "Attach supporting evidence and explain how the control is met.",
                "evidence_required_raw": row.get("evidence_type"),
            }
        )
        sort_order += 1

    if not questions:
        items = stage1_data.get("canonical_evidence_items") or []
        if isinstance(items, list):
            for it in items:
                if not isinstance(it, dict):
                    continue
                eid = str(it.get("id") or "").strip()
                if not eid:
                    continue
                name = str(it.get("name") or eid).strip()
                q_key = f"{eid.lower()}_evidence_response"[:100]
                questions.append(
                    {
                        "evidence_item_id": eid,
                        "question_key": q_key,
                        "label": f"{name} — evidence"[:500],
                        "question_type": "textarea",
                        "required": str(it.get("priority") or "").lower() == "critical",
                        "placeholder": "Provide evidence and references",
                        "options": [],
                        "sort_order": sort_order,
                        "control_id": None,
                        "accept": None,
                        "upload_label": None,
                        "guide": "Describe how this evidence item is satisfied.",
                        "evidence_required_raw": it.get("evidence_type"),
                    }
                )
                sort_order += 1

    return {
        "framework_version": framework_version,
        "evaluation_questions": questions,
    }


def chat_refine(
    stage: int,
    current_output: dict[str, Any],
    chat_history: list[dict[str, str]],
    user_message: str,
) -> tuple[str, dict[str, Any] | None]:
    """Send the current stage output + chat history + user message to AI for refinement.

    Returns (assistant_reply, updated_output_or_none).
    If the AI returns an updated JSON, it is parsed; otherwise None.
    """
    model = _get_model()

    stage_names = {1: "Canonical Evidence Model", 2: "Sufficiency Matrix", 3: "Evaluation Questions"}
    stage_name = stage_names.get(stage, f"Stage {stage}")

    context = (
        f"You are helping refine the {stage_name} output for a compliance pipeline.\n"
        f"Here is the current output:\n\n```json\n{json.dumps(current_output, indent=2)}\n```\n\n"
        "When the user asks for changes, respond with:\n"
        "1. A brief explanation of what you changed\n"
        "2. The complete updated JSON wrapped in ```json ... ``` fences\n"
        "If the user is just asking a question (not requesting changes), "
        "respond normally without JSON.\n"
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
    reply = response.text.strip()

    updated_data = None
    if "```json" in reply:
        try:
            start = reply.index("```json") + 7
            end = reply.index("```", start)
            updated_data = json.loads(reply[start:end].strip())
        except (ValueError, json.JSONDecodeError):
            pass

    return reply, updated_data

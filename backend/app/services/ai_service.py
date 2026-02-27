from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import vertexai  # type: ignore[import-untyped]
from vertexai.generative_models import GenerativeModel, Part  # type: ignore[import-untyped]

from ..config import settings

logger = logging.getLogger(__name__)

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "Prompt"
_PROMPT_FILE = _PROMPT_DIR / "evidence_evaluation_V1.txt"
_loaded_prompt_template: str | None = None


def _load_prompt_template() -> str:
    """Load the evidence evaluation prompt template (always re-read in dev for easier iteration)."""
    global _loaded_prompt_template
    if not _PROMPT_FILE.is_file():
        raise FileNotFoundError(f"Prompt file not found: {_PROMPT_FILE}")
    _loaded_prompt_template = _PROMPT_FILE.read_text(encoding="utf-8")
    return _loaded_prompt_template

_model: GenerativeModel | None = None


def _get_model() -> GenerativeModel:
    global _model
    if _model is None:
        project = settings.GOOGLE_CLOUD_PROJECT
        if not project:
            raise ValueError(
                "GOOGLE_CLOUD_PROJECT is not set. Set it in .env or environment to use Vertex AI."
            )
        vertexai.init(
            project=project,
            location=settings.VERTEX_AI_LOCATION,
        )
        _model = GenerativeModel(settings.VERTEX_AI_MODEL)
    return _model


def prepare_file_part(file_path: str, mime_type: str) -> Part:
    """Return a Vertex AI Part for the given file. PDF/images are sent as
    binary; Excel is converted to CSV text; everything else is sent as text."""
    if mime_type in (
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
    ):
        with open(file_path, "rb") as f:
            data = f.read()
        return Part.from_data(data, mime_type=mime_type)

    if "spreadsheet" in mime_type:
        import openpyxl

        wb = openpyxl.load_workbook(file_path, data_only=True)
        text_parts: list[str] = []
        for sheet in wb.sheetnames:
            ws = wb[sheet]
            rows = [[str(c.value or "") for c in row] for row in ws.iter_rows()]
            csv_text = "\n".join(",".join(r) for r in rows)
            text_parts.append(f"[Sheet: {sheet}]\n{csv_text}")
        return Part.from_text("\n\n".join(text_parts))

    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        return Part.from_text(f.read())


def _parse_numbered_criteria(value: str | dict | Any | None) -> list[tuple[str, str]]:
    """Parse sufficiency/evaluation_criteria JSON (string or dict) into [(id, label), ...], keys sorted numerically."""
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


def _format_criteria_as_numbered_list(parsed: list[tuple[str, str]]) -> str:
    """Turn [(id, label), ...] into '1. label\\n2. label\\n...' for prompt."""
    return "\n".join(f"{id_}. {label}" for id_, label in parsed)


def _format_criteria_with_control_ids(control_id: str, parsed: list[tuple[str, str]]) -> str:
    """Format criteria as 'control_id_N: label' so the LLM uses those exact IDs in its response."""
    return "\n".join(f"  {control_id}_{id_}: {label}" for id_, label in parsed)


def _build_prompt(
    item: Any,
    mappings: list[Any],
    matrix_rows: list[Any] | None = None,
    submission_context: str | None = None,
) -> str:
    """Build the evaluation prompt from evidence_sufficiency_matrix rows when present, else from CEI fields.
    When matrix_rows is set, all controls' sufficiency_criteria and evaluation_criteria are included
    as readable numbered lists. submission_context (e.g. form data) is appended for the AI."""
    controls_text = "\n".join(
        f"- {m.control_id}: {getattr(m, 'sufficiency_requirement', None) or 'General compliance'}"
        for m in mappings
    )
    if matrix_rows:
        sufficiency_parts = []
        evaluation_parts = []
        for row in matrix_rows:
            cid = getattr(row, "control_id", None) or row.get("control_id")
            cname = getattr(row, "control_name", None) or row.get("control_name") or cid
            suf_raw = getattr(row, "sufficiency_criteria", None) or row.get("sufficiency_criteria")
            ev_raw = getattr(row, "evaluation_criteria", None) or row.get("evaluation_criteria")
            suf_parsed = _parse_numbered_criteria(suf_raw)
            ev_parsed = _parse_numbered_criteria(ev_raw)
            if suf_parsed:
                sufficiency_parts.append(
                    f"--- Control {cid} ({cname}) ---\n" + _format_criteria_with_control_ids(cid, suf_parsed)
                )
            if ev_parsed:
                evaluation_parts.append(
                    f"--- Control {cid} ({cname}) ---\n" + _format_criteria_with_control_ids(cid, ev_parsed)
                )
        sufficiency_definition = "\n\n".join(sufficiency_parts) if sufficiency_parts else "N/A"
        evaluation_criteria = "\n\n".join(evaluation_parts) if evaluation_parts else "N/A"
        evidence_description = (
            getattr(item, "evidence_description", None) or "See per-control sufficiency and evaluation criteria below."
        )
    else:
        evidence_description = getattr(item, "evidence_description", None) or "N/A"
        sufficiency_definition = getattr(item, "sufficiency_definition", None) or "N/A"
        evaluation_criteria = getattr(item, "evaluation_criteria", None) or "N/A"
    template = _load_prompt_template()
    out = template.format(
        evidence_item_id=item.id,
        evidence_item_name=item.name,
        evidence_description=evidence_description,
        sufficiency_definition=sufficiency_definition,
        evaluation_criteria=evaluation_criteria,
        mapped_controls=controls_text or "None",
    )
    if submission_context and submission_context.strip():
        out += "\n\n## Declared / form context (use when evaluating):\n" + submission_context.strip()
    return out


def _parse_ai_response(text: str) -> dict:
    """Extract JSON from the model response, tolerating markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        first_nl = cleaned.index("\n")
        cleaned = cleaned[first_nl + 1 :]
    if cleaned.endswith("```"):
        cleaned = cleaned[: cleaned.rfind("```")]
    return json.loads(cleaned.strip())


def evaluate_evidence(
    file_parts: list[Part],
    evidence_item: Any,
    control_mappings: list[Any],
    matrix_rows: list[Any] | None = None,
    submission_context: str | None = None,
) -> dict:
    """Send files + prompt to Vertex AI and return the parsed JSON result.
    When matrix_rows is provided (from evidence_sufficiency_matrix), prompt is built from them.
    submission_context: optional (e.g. A5 declared architecture and form data) appended to prompt."""
    try:
        model = _get_model()
    except Exception as init_err:
        logger.exception("Vertex AI init failed")
        raise ValueError(
            "Vertex AI is not available. Check GOOGLE_CLOUD_PROJECT and "
            "Application Default Credentials (gcloud auth application-default login)."
        ) from init_err

    prompt_text = _build_prompt(
        evidence_item, control_mappings, matrix_rows=matrix_rows, submission_context=submission_context
    )
    contents = [Part.from_text(prompt_text)] + file_parts

    try:
        response = model.generate_content(contents)
    except Exception as api_err:
        logger.exception("Vertex AI generate_content failed")
        err_msg = str(api_err)
        if "PERMISSION_DENIED" in err_msg or "PermissionDenied" in type(api_err).__name__ or "403" in err_msg:
            raise ValueError(
                "Vertex AI permission denied (403). To fix: (1) Enable Vertex AI API in Google Cloud Console "
                "(https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=YOUR_PROJECT). "
                "(2) Grant the service account or user the role 'Vertex AI User' (roles/aiplatform.user) so it has "
                "aiplatform.endpoints.predict. (3) If the model does not exist in your region, set VERTEX_AI_MODEL "
                "to a supported model, e.g. gemini-2.5-flash-lite or gemini-2.5-flash-lite. Original error: " + err_msg
            ) from api_err
        raise ValueError(f"Vertex AI API error: {api_err}") from api_err

    text = _get_response_text(response)
    if not (text and text.strip()):
        raise ValueError(
            "Vertex AI returned no text (response may have been blocked or empty). "
            "Try different evidence files or check model safety settings."
        )

    try:
        return _parse_ai_response(text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("AI response parse error: %s\nRaw: %s", exc, text[:500])
        raise ValueError(f"AI returned invalid JSON: {exc}") from exc


def _get_response_text(response: Any) -> str:
    """Extract generated text from Vertex AI GenerateContentResponse."""
    if hasattr(response, "text") and response.text is not None:
        return response.text
    if hasattr(response, "candidates") and response.candidates:
        for c in response.candidates:
            if c.content and c.content.parts:
                for p in c.content.parts:
                    if getattr(p, "text", None):
                        return p.text
    return ""

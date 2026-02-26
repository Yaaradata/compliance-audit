from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import vertexai
from vertexai.generative_models import GenerativeModel, Part

from ..config import settings

logger = logging.getLogger(__name__)

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompt"
_PROMPT_FILE = _PROMPT_DIR / "evidence_evaluation_V1.txt"
_loaded_prompt_template: str | None = None


def _load_prompt_template() -> str:
    """Load the evidence evaluation prompt template from backend/app/prompt/evidence_evaluation_V1.txt."""
    global _loaded_prompt_template
    if _loaded_prompt_template is None:
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
    """Return a Vertex AI Part for the given file.  PDF/images are sent as
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


def _build_prompt(
    item: Any,
    mappings: list[Any],
    matrix_rows: list[Any] | None = None,
) -> str:
    """Build the evaluation prompt from evidence_sufficiency_matrix rows when present, else from CEI fields."""
    controls_text = "\n".join(
        f"- {m.control_id}: {getattr(m, 'sufficiency_requirement', None) or 'General compliance'}"
        for m in mappings
    )
    if matrix_rows:
        # Aggregate per-control sufficiency and evaluation from evidence_sufficiency_matrix
        sufficiency_parts = []
        evaluation_parts = []
        for row in matrix_rows:
            cid = getattr(row, "control_id", None) or row.get("control_id")
            cname = getattr(row, "control_name", None) or row.get("control_name") or cid
            suf = getattr(row, "sufficiency_criteria", None) or row.get("sufficiency_criteria")
            ev = getattr(row, "evaluation_criteria", None) or row.get("evaluation_criteria")
            if suf:
                sufficiency_parts.append(f"--- Control {cid} ({cname}) ---\n{suf}")
            if ev:
                evaluation_parts.append(f"--- Control {cid} ({cname}) ---\n{ev}")
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
    return template.format(
        evidence_item_id=item.id,
        evidence_item_name=item.name,
        evidence_description=evidence_description,
        sufficiency_definition=sufficiency_definition,
        evaluation_criteria=evaluation_criteria,
        mapped_controls=controls_text or "None",
    )


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
) -> dict:
    """Send files + prompt to Vertex AI and return the parsed JSON result.
    When matrix_rows is provided (from evidence_sufficiency_matrix), prompt is built from them."""
    try:
        model = _get_model()
    except Exception as init_err:
        logger.exception("Vertex AI init failed")
        raise ValueError(
            "Vertex AI is not available. Check GOOGLE_CLOUD_PROJECT and "
            "Application Default Credentials (gcloud auth application-default login)."
        ) from init_err

    prompt_text = _build_prompt(evidence_item, control_mappings, matrix_rows=matrix_rows)
    contents = [Part.from_text(prompt_text)] + file_parts

    try:
        response = model.generate_content(contents)
    except Exception as api_err:
        logger.exception("Vertex AI generate_content failed")
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

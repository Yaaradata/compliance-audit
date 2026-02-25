from __future__ import annotations

import json
import logging
from typing import Any

import vertexai
from vertexai.generative_models import GenerativeModel, Part

from ..config import settings

logger = logging.getLogger(__name__)

_model: GenerativeModel | None = None


def _get_model() -> GenerativeModel:
    global _model
    if _model is None:
        vertexai.init(
            project=settings.GOOGLE_CLOUD_PROJECT,
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
) -> str:
    controls_text = "\n".join(
        f"- {m.control_id}: {m.sufficiency_requirement or 'General compliance'}"
        for m in mappings
    )
    return f"""You are a SWIFT CSCF v2025 compliance auditor.
Evaluate the uploaded evidence file(s) against the criteria below.

## Evidence Item: {item.id} — {item.name}

### What This Evidence Should Contain:
{item.evidence_description or 'N/A'}

### Required Elements (Sufficiency Definition):
{item.sufficiency_definition or 'N/A'}

### Reviewer Checklist (Evaluation Criteria):
{item.evaluation_criteria or 'N/A'}

### Mapped Controls:
{controls_text or 'None'}

## Instructions:
Analyze the uploaded file(s) directly. For images/diagrams, describe what you see.
Score each sufficiency dimension 0-100 based on how well the evidence matches.

Return ONLY valid JSON (no markdown fences). Use this exact schema:
{{
  "overall_score": <0-100>,
  "overall_met": <true if evidence sufficiently matches criteria>,
  "summary": "<2-3 sentence summary of what evidence shows vs what is missing>",
  "confidence": <0.0-1.0>,
  "sufficiency_results": [
    {{"id": "1", "label": "<short label>", "met": true/false, "description": null or "<what is missing>"}}
  ],
  "criteria": [
    {{"id": "1", "label": "<short label>", "met": true/false, "description": null or "<what is missing>"}}
  ],
  "dimensions": [
    {{"code": "<dimension code>", "label": "<human name>", "score": <0-100>, "rationale": "<present vs missing>"}}
  ],
  "controls": [
    {{"control_id": "<e.g. 1.1>", "score": <0-100>, "rationale": "<how evidence supports this control>"}}
  ]
}}
"""


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
) -> dict:
    """Send files + prompt to Vertex AI and return the parsed JSON result."""
    model = _get_model()
    prompt_text = _build_prompt(evidence_item, control_mappings)
    contents = [Part.from_text(prompt_text)] + file_parts
    response = model.generate_content(contents)
    try:
        return _parse_ai_response(response.text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("AI response parse error: %s\nRaw: %s", exc, response.text[:500])
        raise ValueError(f"AI returned invalid JSON: {exc}") from exc

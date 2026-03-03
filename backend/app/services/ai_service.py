from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Any

import vertexai  # type: ignore[import-untyped]
from vertexai.generative_models import GenerativeModel, Part  # type: ignore[import-untyped]

from ..config import settings

logger = logging.getLogger(__name__)

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "Prompt"
_PROMPT_FILE = _PROMPT_DIR / "evidence_evaluation_V1.txt"
_REPORT_PROMPT_FILE = _PROMPT_DIR / "report_generation_V1.txt"
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


def prepare_file_part(file_path_or_bytes: str | bytes, mime_type: str) -> Part:
    """Return a Vertex AI Part. Accepts a local file path or raw bytes.
    PDF/images are sent as binary; Excel is converted to CSV text; rest as text."""
    if isinstance(file_path_or_bytes, bytes):
        raw = file_path_or_bytes
    else:
        with open(file_path_or_bytes, "rb") as f:
            raw = f.read()

    if mime_type in (
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
    ):
        return Part.from_data(raw, mime_type=mime_type)

    if "spreadsheet" in mime_type:
        import io
        import openpyxl

        wb = openpyxl.load_workbook(io.BytesIO(raw), data_only=True)
        text_parts: list[str] = []
        for sheet in wb.sheetnames:
            ws = wb[sheet]
            rows = [[str(c.value or "") for c in row] for row in ws.iter_rows()]
            csv_text = "\n".join(",".join(r) for r in rows)
            text_parts.append(f"[Sheet: {sheet}]\n{csv_text}")
        return Part.from_text("\n\n".join(text_parts))

    return Part.from_text(raw.decode("utf-8", errors="replace"))


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


def _format_criteria_with_control_ids(control_id: str, parsed: list[tuple[str, str]], prefix: str = "") -> str:
    """Format criteria as 'control_id_prefix_N: label' so the LLM uses those exact IDs in its response.
    prefix should be 'suf_' for sufficiency or 'eval_' for evaluation to avoid ID collisions."""
    return "\n".join(f"  {control_id}_{prefix}{id_}: {label}" for id_, label in parsed)


def _build_prompt(
    item: Any,
    mappings: list[Any],
    matrix_rows: list[Any] | None = None,
    submission_context: str | None = None,
    previous_evaluation: dict | None = None,
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
                    f"--- Control {cid} ({cname}) ---\n" + _format_criteria_with_control_ids(cid, suf_parsed, prefix="suf_")
                )
            if ev_parsed:
                evaluation_parts.append(
                    f"--- Control {cid} ({cname}) ---\n" + _format_criteria_with_control_ids(cid, ev_parsed, prefix="eval_")
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
    out += (
        "\n\n## CRITICAL RESPONSE RULES:\n"
        "- IDs starting with 'suf_' (e.g. 1.1_suf_1) are SUFFICIENCY criteria. Return them ONLY in the 'sufficiency_results' array.\n"
        "- IDs starting with 'eval_' (e.g. 1.1_eval_1) are EVALUATION criteria. Return them ONLY in the 'criteria' array.\n"
        "- NEVER duplicate: each criterion ID must appear in exactly ONE array.\n"
        "- Use the EXACT IDs provided (including the suf_/eval_ prefix).\n"
    )

    if submission_context and submission_context.strip():
        out += "\n\n## Declared / form context (use when evaluating):\n" + submission_context.strip()

    if previous_evaluation:
        prev_lines = []
        for section_key in ("sufficiency_results", "criteria"):
            for c in previous_evaluation.get(section_key, []):
                status = "MET" if c.get("met") else "NOT MET"
                desc = c.get("description") or ""
                label = c.get("label", c.get("id", ""))
                line = f"  - [{status}] {label}"
                if desc:
                    line += f" — {desc}"
                prev_lines.append(line)
        if prev_lines:
            out += (
                "\n\n## Previous evaluation results (user may have edited these; consider changes as user corrections):\n"
                + "\n".join(prev_lines)
            )

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
    previous_evaluation: dict | None = None,
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
        evidence_item, control_mappings, matrix_rows=matrix_rows,
        submission_context=submission_context, previous_evaluation=previous_evaluation,
    )
    contents = [Part.from_text(prompt_text)] + file_parts

    max_retries = 3
    last_err: Exception | None = None
    for attempt in range(max_retries + 1):
        try:
            response = model.generate_content(contents)
            break  # success
        except Exception as api_err:
            last_err = api_err
            err_msg = str(api_err)
            err_type = type(api_err).__name__

            is_rate_limit = "RESOURCE_EXHAUSTED" in err_type or "ResourceExhausted" in err_type or "429" in err_msg or "Resource exhausted" in err_msg
            if is_rate_limit and attempt < max_retries:
                wait = 2 ** attempt * 5  # 5s, 10s, 20s
                logger.warning("Vertex AI 429 (attempt %d/%d), retrying in %ds…", attempt + 1, max_retries + 1, wait)
                time.sleep(wait)
                continue

            if is_rate_limit:
                logger.warning("Vertex AI rate limit (429) after %d attempts: %s", attempt + 1, err_msg)
                raise ValueError(
                    "Vertex AI rate limit (429). The AI service is temporarily overloaded. Please try again in a minute."
                ) from api_err

            logger.exception("Vertex AI generate_content failed")
            if "PERMISSION_DENIED" in err_msg or "PermissionDenied" in err_type or "403" in err_msg:
                raise ValueError(
                    "Vertex AI permission denied (403). To fix: (1) Enable Vertex AI API in Google Cloud Console "
                    "(https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=YOUR_PROJECT). "
                    "(2) Grant the service account or user the role 'Vertex AI User' (roles/aiplatform.user) so it has "
                    "aiplatform.endpoints.predict. (3) If the model does not exist in your region, set VERTEX_AI_MODEL "
                    "to a supported model. Original error: " + err_msg
                ) from api_err
            raise ValueError(f"Vertex AI API error: {api_err}") from api_err
    else:
        raise ValueError(f"Vertex AI failed after {max_retries + 1} attempts: {last_err}")

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


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

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

_SECTION_INSTRUCTIONS: dict[str, str] = {
    "executive_summary": (
        "Write a 1–2 page Executive Summary for the SWIFT CSP assessment report.\n"
        "Include:\n"
        "- Purpose of the assessment\n"
        "- Overall compliance status (use the numbers provided, do NOT recalculate)\n"
        "- A compliance status table (Total / Mandatory / Advisory / Compliant / Partially / Non-Compliant / N/A)\n"
        "- Key observations (strengths and weaknesses)\n"
        "- High-level risk posture\n"
        "- Overall conclusion statement: 'Based on the procedures performed, [Bank] is assessed as [status] with the applicable SWIFT CSCF controls.'"
    ),
    "scope_methodology": (
        "Write the Scope of Assessment and Methodology section.\n"
        "Include:\n"
        "- Architecture type and what it means\n"
        "- In-scope systems (Messaging Interface, Communication Interface, SwiftNet Link, HSM, GUI)\n"
        "- Assessment period\n"
        "- Methodology: evidence review, L1 (completeness) → L2 (quality) → L3 (assessment) review workflow\n"
        "- Testing approach: documentation inspection, configuration validation, sample-based testing\n"
        "- Do NOT list actual evidence items; keep it at methodology level."
    ),
    "gap_analysis": (
        "Write a consolidated Gap Analysis section.\n"
        "Include:\n"
        "- A summary table: Control ID | Control Name | Status | Risk Level | Target Remediation\n"
        "- Only include controls that are NOT fully compliant\n"
        "- For each gap, write a brief observation and recommendation\n"
        "- Systemic patterns if any\n"
        "- Risk distribution summary (high / medium / low counts)"
    ),
    "attestation": (
        "Write the Final Attestation section.\n"
        "Include:\n"
        "- Formal attestation statement in SWIFT IAF format\n"
        "- Approved by, role, date, MFA verification status\n"
        "- If not yet attested, state that attestation is pending."
    ),
    "evidence_index": (
        "Generate an Evidence Index table listing all evidence items.\n"
        "Columns: Evidence Item ID | Status | Overall Met | Domain\n"
        "List every item from the data provided."
    ),
}


def _get_section_instructions(section_key: str) -> str:
    if section_key in _SECTION_INSTRUCTIONS:
        return _SECTION_INSTRUCTIONS[section_key]

    if section_key.startswith("domain_") and len(section_key) == 8:
        domain_letter = section_key[-1].upper()
        domain_name = DOMAIN_NAMES.get(domain_letter, f"Domain {domain_letter}")
        return (
            f"Write the detailed assessment section for Domain {domain_letter} — {domain_name}.\n"
            "For EACH control in this domain, write:\n"
            "### Control [ID] — [Name]\n"
            "- **Control Objective:** (from the data)\n"
            "- **Control Type:** Mandatory / Advisory\n"
            "- **Evidence Reviewed:** list the evidence item IDs and their status\n"
            "- **Testing Performed:** describe what was reviewed based on the evidence status and evaluation\n"
            "- **Assessment Result:** Compliant / Partially Compliant / Non-Compliant (use the compliance_status from data)\n"
            "- **Risk Rating:** High / Medium / Low\n"
            "- **Observation:** describe what was found based on eval_summary and failed_criteria\n"
            "- **Recommendation:** if non-compliant or partially compliant, what should be done (use remediation data)\n"
            "\nIf a control has no evidence items, note that evidence was not available."
        )

    return "Write the content for this section based on the provided data."


def _slice_snapshot_for_section(snapshot: dict, section_key: str) -> dict:
    """Return only the data slice relevant to a section to keep prompts focused."""
    meta = snapshot.get("metadata", {})
    summary = snapshot.get("overall_summary", {})
    controls = snapshot.get("controls", [])
    risk = snapshot.get("risk_summary", {})
    att = snapshot.get("attestation", {})

    if section_key == "executive_summary":
        return {"metadata": meta, "overall_summary": summary, "risk_summary": risk, "attestation": att}

    if section_key == "scope_methodology":
        return {"metadata": meta, "overall_summary": {"total_controls": summary.get("total_controls"),
                "mandatory_controls": summary.get("mandatory_controls"),
                "advisory_controls": summary.get("advisory_controls")}}

    if section_key.startswith("domain_") and len(section_key) == 8:
        domain_letter = section_key[-1].upper()
        domain_controls = [c for c in controls if c.get("domain", "").upper() == domain_letter]
        return {"metadata": meta, "controls": domain_controls}

    if section_key == "gap_analysis":
        non_compliant = [c for c in controls if c.get("compliance_status") != "compliant"]
        return {"metadata": meta, "risk_summary": risk, "controls": non_compliant}

    if section_key == "attestation":
        return {"metadata": meta, "attestation": att}

    if section_key == "evidence_index":
        items = []
        for c in controls:
            for ev in c.get("evidence_items", []):
                items.append({
                    "evidence_item_id": ev["evidence_item_id"],
                    "status": ev["status"],
                    "overall_met": ev.get("overall_met"),
                    "domain": c.get("domain", "?"),
                })
        seen = set()
        unique = []
        for item in items:
            if item["evidence_item_id"] not in seen:
                seen.add(item["evidence_item_id"])
                unique.append(item)
        return {"evidence_items": sorted(unique, key=lambda x: x["evidence_item_id"])}

    return snapshot


_SECTION_DISPLAY_NAMES: dict[str, str] = {
    "executive_summary": "Executive Summary",
    "scope_methodology": "Scope & Methodology",
    "gap_analysis": "Gap Analysis",
    "attestation": "Final Attestation",
    "evidence_index": "Evidence Index",
    "glossary": "Glossary",
}


def _section_display_name(section_key: str) -> str:
    if section_key in _SECTION_DISPLAY_NAMES:
        return _SECTION_DISPLAY_NAMES[section_key]
    if section_key.startswith("domain_") and len(section_key) == 8:
        letter = section_key[-1].upper()
        return f"Domain {letter} — {DOMAIN_NAMES.get(letter, letter)}"
    return section_key


def _load_report_prompt_template() -> str:
    if not _REPORT_PROMPT_FILE.is_file():
        raise FileNotFoundError(f"Report prompt file not found: {_REPORT_PROMPT_FILE}")
    return _REPORT_PROMPT_FILE.read_text(encoding="utf-8")


def generate_report_section(snapshot: dict, section_key: str) -> str:
    """Generate a single report section via Vertex AI.

    Returns markdown text for the section content.
    """
    if section_key == "glossary":
        return _static_glossary()

    meta = snapshot.get("metadata", {})
    section_data = _slice_snapshot_for_section(snapshot, section_key)
    instructions = _get_section_instructions(section_key)
    section_name = _section_display_name(section_key)

    template = _load_report_prompt_template()
    prompt = template.format(
        bank_name=meta.get("bank_name", "Unknown"),
        bic_code=meta.get("bic_code", "N/A"),
        assessment_year=meta.get("assessment_year", "N/A"),
        architecture_type=meta.get("architecture_type", "Unknown"),
        assessment_period=meta.get("assessment_period", "N/A"),
        cscf_version=meta.get("cscf_version", "2025v"),
        section_key=section_key,
        section_instructions=instructions,
        section_data=json.dumps(section_data, indent=2, default=str),
        section_name=section_name,
    )

    model = _get_model()

    max_retries = 5
    for attempt in range(max_retries + 1):
        try:
            response = model.generate_content([Part.from_text(prompt)])
            break
        except Exception as api_err:
            err_msg = str(api_err)
            is_rate_limit = "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg
            if is_rate_limit and attempt < max_retries:
                wait = min(5 * (2 ** attempt), 90)
                logger.warning(
                    "Report gen 429 (attempt %d/%d), retrying in %ds…",
                    attempt + 1, max_retries + 1, wait,
                )
                time.sleep(wait)
                continue
            raise ValueError(
                f"Vertex AI rate limit (429). Please try again in a few minutes. "
                f"Section: {section_key}. Error: {api_err}"
            ) from api_err

    text = _get_response_text(response)
    if not text or not text.strip():
        return f"*Content generation returned empty for section: {section_name}. Please regenerate.*"

    cleaned = text.strip()
    if cleaned.startswith("```"):
        first_nl = cleaned.index("\n") if "\n" in cleaned else len(cleaned)
        cleaned = cleaned[first_nl + 1:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:cleaned.rfind("```")]

    return cleaned.strip()


def _static_glossary() -> str:
    return (
        "| Term | Definition |\n"
        "|------|------------|\n"
        "| SWIFT | Society for Worldwide Interbank Financial Telecommunication |\n"
        "| CSP | Customer Security Programme |\n"
        "| CSCF | Customer Security Controls Framework |\n"
        "| IAF | Independent Assessment Framework |\n"
        "| BIC | Business Identifier Code |\n"
        "| MFA | Multi-Factor Authentication |\n"
        "| HSM | Hardware Security Module |\n"
        "| SIEM | Security Information and Event Management |\n"
        "| L1 | Level 1 Review — Completeness check |\n"
        "| L2 | Level 2 Review — Quality / technical accuracy check |\n"
        "| L3 | Level 3 Review — Independent assessment |\n"
        "| Mandatory (M) | Control that must be implemented |\n"
        "| Advisory (A) | Control that is recommended but not required |\n"
    )

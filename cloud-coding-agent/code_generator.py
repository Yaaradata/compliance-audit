"""Generate Azure collector Python modules via Vertex AI (same stack as backend ``ai_service``)."""
from __future__ import annotations

import json
import re
import time
from typing import Any

import vertexai
from vertexai.generative_models import GenerativeModel, Part

try:
    from vertexai.generative_models import GenerationConfig
except ImportError:  # pragma: no cover
    GenerationConfig = None  # type: ignore[misc, assignment]

from models import CollectorSpec

REFERENCE_SNIPPET = '''
# Reference pattern (existing repo — do not copy verbatim; match structure only):
from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "example"
EVIDENCE_TYPE = "..."
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [("A1", "1.1")]

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    results = []
    now = datetime.utcnow()
    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resources": [],
    }
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
'''

SYSTEM_PROMPT = """You are a senior Python engineer generating Azure evidence collectors for a FastAPI backend.

Rules:
- Output ONLY valid Python source code. No markdown fences, no explanations before or after.
- Do NOT create database models or change schema.
- Each module MUST define: COLLECTOR_NAME (str), EVIDENCE_TYPE (str), SOURCE_SYSTEM (str),
  CONTROL_MAPPINGS (list of (item_code, control_id) tuples EXACTLY as in the JSON spec — do not invent or drop pairs).
- Implement: def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]
- For each (item_code, control_id) in CONTROL_MAPPINGS, append one tuple:
  (payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM).
- payload must be JSON-serializable: include keys "collector" (same as COLLECTOR_NAME or module purpose),
  "subscription_id", "collected_at" (ISO string from datetime.utcnow().isoformat()).
- On API/query errors: put a string in payload["error"]; do NOT raise from collect().
- Prefer Azure Resource Graph KQL via:
  from app.azure_evidence.platform.resource_graph import query_object_array
  rows, err = query_object_array(credential, subscription_id, kql, max_rows=...)
  Use a KQL query aligned to the collector's purpose (network, IAM, Defender, logging, etc.); keep `take`/`limit` reasonable.
  Include row_count, resources (truncate list length), resource_graph_error.
- Cap list sizes in payload (e.g. resources[:MAX]) to avoid huge JSON.
- Use from __future__ import annotations if using modern types.
- Add a short module docstring describing what evidence the collector supports (e.g. SWIFT CSCF domains touched).
"""


def _strip_markdown_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:python)?\s*", "", t, count=1, flags=re.IGNORECASE)
        t = re.sub(r"\s*```\s*$", "", t, count=1)
    return t.strip()


def _get_response_text(response: Any) -> str:
    """Extract generated text from Vertex AI GenerateContentResponse (same as ai_service)."""
    if hasattr(response, "text") and response.text is not None:
        return response.text
    if hasattr(response, "candidates") and response.candidates:
        for c in response.candidates:
            if c.content and c.content.parts:
                for p in c.content.parts:
                    if getattr(p, "text", None):
                        return p.text
    return ""


_model: GenerativeModel | None = None
_model_key: tuple[str, str, str] | None = None


def _get_vertex_model(project: str, location: str, model_name: str) -> GenerativeModel:
    global _model, _model_key
    key = (project, location, model_name)
    if _model is None or _model_key != key:
        vertexai.init(project=project, location=location)
        _model = GenerativeModel(model_name)
        _model_key = key
    return _model


def _spec_payload(spec: CollectorSpec, max_mappings: int) -> dict[str, Any]:
    mappings = spec.control_mappings[:max_mappings]
    extra = len(spec.control_mappings) - len(mappings)
    note = f"... and {extra} more pairs omitted from prompt" if extra > 0 else ""
    return {
        "collector_name": spec.name,
        "evidence_type": spec.evidence_type,
        "source_system": spec.source_system,
        "control_mappings": [list(t) for t in mappings],
        "truncation_note": note,
    }


def generate_collector_code(
    spec: CollectorSpec,
    *,
    project_id: str,
    location: str,
    model_name: str,
    max_retries: int,
    max_mappings_in_prompt: int = 200,
    max_resources_in_payload: int = 600,
) -> str:
    """
    Call Vertex AI ``GenerativeModel.generate_content`` (same pattern as ``app.services.ai_service``).
    Uses Application Default Credentials; set ``GOOGLE_CLOUD_PROJECT`` and run ``gcloud auth application-default login``.
    """
    user_json = json.dumps(
        {
            "collector_spec": _spec_payload(spec, max_mappings_in_prompt),
            "reference_pattern": REFERENCE_SNIPPET,
            "max_resources_in_payload": max_resources_in_payload,
            "instructions": (
                "Generate the full collector module in one file. "
                "Set COLLECTOR_NAME to a snake_case identifier consistent with collector_spec.collector_name. "
                "Use only the control_mappings from collector_spec — same order and values. "
                "Choose KQL that matches evidence_type and the collector name (e.g. NSG/firewall vs IAM vs Defender). "
                f"Truncate embedded resource lists to at most {max_resources_in_payload} items."
            ),
        },
        indent=2,
    )

    full_prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        "## USER REQUEST (JSON)\n"
        f"{user_json}\n"
    )

    model = _get_vertex_model(project_id, location, model_name)
    contents = [Part.from_text(full_prompt)]

    gen_cfg = None
    if GenerationConfig is not None:
        gen_cfg = GenerationConfig(temperature=0.2, max_output_tokens=8192)

    max_attempts = max(1, max_retries + 1)
    response = None
    for attempt in range(max_attempts):
        try:
            if gen_cfg is not None:
                response = model.generate_content(contents, generation_config=gen_cfg)
            else:
                response = model.generate_content(contents)
            break
        except Exception as api_err:
            err_msg = str(api_err)
            err_type = type(api_err).__name__
            is_rate_limit = (
                "RESOURCE_EXHAUSTED" in err_type
                or "ResourceExhausted" in err_type
                or "429" in err_msg
                or "Resource exhausted" in err_msg
            )
            if is_rate_limit and attempt < max_attempts - 1:
                wait = min(2**attempt * 5, 60)
                time.sleep(wait)
                continue
            raise RuntimeError(f"Vertex AI generate_content failed: {api_err}") from api_err

    text = _get_response_text(response)
    if not (text and text.strip()):
        raise RuntimeError("Vertex AI returned no text (blocked or empty response).")

    return _strip_markdown_fences(text)

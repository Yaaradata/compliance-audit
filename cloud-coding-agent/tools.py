"""
LangChain tools wrapping the existing Excel parser, Vertex code generator, validator, and file writer.

Writes are restricted to ``cloud-coding-agent/output/azure_evidence/collectors/`` only.
Reads for reference are limited to AWS/GCP/Azure evidence packages under ``backend/app/``.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

_AGENT_DIR = Path(__file__).resolve().parent
if str(_AGENT_DIR) not in sys.path:
    sys.path.insert(0, str(_AGENT_DIR))

from langchain_core.tools import tool

from code_generator import generate_collector_code
from config import AgentConfig, COLLECTORS_OUTPUT_DIR, REPO_ROOT, assert_real_vertex_project
from excel_parser import parse_excel
from file_writer import write_collector_file
from models import CollectorSpec
from pipeline_state import STATE
from planner import build_plan
from utils.file_tools import collector_module_filename
from validator import validate_collector_source

ALLOWED_REFERENCE_PREFIXES = (
    REPO_ROOT / "backend" / "app" / "aws_evidence",
    REPO_ROOT / "backend" / "app" / "gcp_evidence",
    REPO_ROOT / "backend" / "app" / "azure_evidence",
)


def _spec_summary(spec: CollectorSpec) -> dict[str, Any]:
    return {
        "name": spec.name,
        "evidence_type": spec.evidence_type,
        "source_system": spec.source_system,
        "control_mapping_count": len(spec.control_mappings),
    }


def _get_cfg() -> AgentConfig:
    return AgentConfig.load()


@tool
def parse_excel_tool(excel_path: str) -> str:
    """Parse the Azure evidence Excel workbook into collector specifications. Call this first. Stores specs for generate_code_tool."""
    try:
        p = Path(excel_path).resolve()
        STATE.excel_path = str(p)
        specs = parse_excel(p)
        STATE.specs_by_name = {s.name: s for s in specs}
        out = {
            "ok": True,
            "count": len(specs),
            "collectors": [_spec_summary(s) for s in specs],
            "collector_names": [s.name for s in specs],
        }
        if STATE.evidence_framework:
            out["evidence_framework"] = STATE.evidence_framework
        if STATE.target_cloud:
            out["target_cloud"] = STATE.target_cloud
        return json.dumps(out, indent=2)
    except Exception as e:
        STATE.last_error = str(e)
        return json.dumps({"ok": False, "error": str(e)})


@tool
def build_plan_tool() -> str:
    """Return a JSON plan of collectors and output filenames (requires parse_excel_tool first)."""
    specs = list(STATE.specs_by_name.values())
    if not specs:
        return json.dumps({"ok": False, "error": "No specs loaded. Call parse_excel_tool first."})
    plan = build_plan(specs)
    return json.dumps({"ok": True, "plan": plan}, indent=2)


@tool
def read_repo_tool(relative_path: str, max_chars: int = 10000) -> str:
    """
    Read a reference file from backend evidence modules (read-only).
    Path must be under backend/app/aws_evidence, gcp_evidence, or azure_evidence.
    Example: backend/app/gcp_evidence/collectors/logging_posture_collector.py
    """
    rel = (relative_path or "").strip().replace("\\", "/").lstrip("/")
    if ".." in rel.split("/"):
        return json.dumps({"ok": False, "error": "Invalid path"})
    path = (REPO_ROOT / rel).resolve()
    allowed = False
    for prefix in ALLOWED_REFERENCE_PREFIXES:
        try:
            path.relative_to(prefix.resolve())
            allowed = True
            break
        except ValueError:
            continue
    if not allowed:
        return json.dumps(
            {
                "ok": False,
                "error": f"Path not allowed. Use a file under one of: aws_evidence, gcp_evidence, azure_evidence. Got: {rel}",
            }
        )
    if not path.is_file():
        return json.dumps({"ok": False, "error": f"Not a file: {rel}"})
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
        truncated = len(text) > max_chars
        if truncated:
            text = text[:max_chars] + "\n...[truncated]"
        return json.dumps({"ok": True, "path": rel, "content": text, "truncated": truncated})
    except OSError as e:
        return json.dumps({"ok": False, "error": str(e)})


@tool
def generate_code_tool(collector_name: str) -> str:
    """
    Generate Azure collector Python source for one collector by name (Vertex AI).
    Requires parse_excel_tool. Stores source in memory for validate_code_tool / write_file_tool.
    """
    cfg = _get_cfg()
    spec = STATE.specs_by_name.get(collector_name.strip())
    if not spec:
        return json.dumps(
            {"ok": False, "error": f"Unknown collector {collector_name!r}. Call parse_excel_tool first."}
        )
    if STATE.dry_run:
        return json.dumps({"ok": True, "skipped": True, "reason": "dry_run", "collector": collector_name})
    try:
        assert_real_vertex_project(cfg.google_cloud_project)
    except ValueError as e:
        return json.dumps({"ok": False, "error": str(e)})
    try:
        source = generate_collector_code(
            spec,
            project_id=cfg.google_cloud_project,
            location=cfg.vertex_ai_location,
            model_name=cfg.vertex_ai_model,
            max_retries=cfg.llm_max_retries,
            max_resources_in_payload=cfg.max_resources_in_payload,
        )
        STATE.sources[collector_name] = source
        return json.dumps(
            {"ok": True, "collector": collector_name, "chars": len(source)},
            indent=2,
        )
    except Exception as e:
        STATE.last_error = str(e)
        return json.dumps({"ok": False, "error": str(e), "collector": collector_name})


@tool
def validate_code_tool(collector_name: str) -> str:
    """Validate generated source for a collector (must call generate_code_tool first)."""
    src = STATE.sources.get(collector_name.strip())
    if not src:
        return json.dumps(
            {"ok": False, "error": f"No generated source for {collector_name!r}. Call generate_code_tool first."}
        )
    vr = validate_collector_source(src)
    out = {"ok": vr.ok, "collector": collector_name, "errors": vr.errors}
    return json.dumps(out, indent=2)


@tool
def write_file_tool(collector_name: str) -> str:
    """
    Write validated collector source to cloud-coding-agent/output/azure_evidence/collectors/<name>_collector.py only.
    Only call after validate_code_tool returns ok: true.
    """
    name = collector_name.strip()
    src = STATE.sources.get(name)
    if not src:
        return json.dumps({"ok": False, "error": f"No source for {name!r}. Generate and validate first."})
    vr = validate_collector_source(src)
    if not vr.ok:
        return json.dumps(
            {"ok": False, "error": "Validation failed; fix/regenerate before write.", "details": vr.errors}
        )
    if STATE.dry_run:
        return json.dumps({"ok": True, "skipped": True, "reason": "dry_run", "collector": name})

    fn = collector_module_filename(name)
    base = COLLECTORS_OUTPUT_DIR.resolve()
    target = (base / fn).resolve()
    if not str(target).startswith(str(base)):
        return json.dumps({"ok": False, "error": "Path safety check failed"})
    try:
        path = write_collector_file(fn, src, output_dir=COLLECTORS_OUTPUT_DIR)
        STATE.written.add(name)
        return json.dumps({"ok": True, "path": str(path), "filename": fn})
    except Exception as e:
        STATE.last_error = str(e)
        return json.dumps({"ok": False, "error": str(e)})


@tool
def list_collectors_tool() -> str:
    """List collector names from the last successful parse_excel_tool."""
    names = list(STATE.specs_by_name.keys())
    return json.dumps({"ok": True, "collector_names": names, "count": len(names)})


def all_tools():
    return [
        parse_excel_tool,
        build_plan_tool,
        list_collectors_tool,
        read_repo_tool,
        generate_code_tool,
        validate_code_tool,
        write_file_tool,
    ]


def reset_pipeline_state(dry_run: bool = False) -> None:
    STATE.reset()
    STATE.dry_run = dry_run

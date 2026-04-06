"""LangChain tool-calling agent for Azure collector generation (CLI)."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

_AGENT_DIR = Path(__file__).resolve().parent
if str(_AGENT_DIR) not in sys.path:
    sys.path.insert(0, str(_AGENT_DIR))

from config import AgentConfig, REPO_ROOT, assert_real_vertex_project
from langchain_core.messages import HumanMessage
from pipeline_state import STATE
from tools import all_tools, reset_pipeline_state
from wizard import WizardResult, apply_wizard_to_pipeline_state

try:
    from langchain.agents import create_agent
except ImportError as e:  # pragma: no cover
    raise ImportError(
        "LangChain is required. Install with: pip install -r cloud-coding-agent/requirements.txt"
    ) from e


AGENT_SYSTEM_PROMPT = """You are the orchestrator for an Azure evidence **collector code generation** pipeline.
Your job is to call the registered tools in order until every collector from the workbook is written (or dry-run is complete).
You do **not** write application code yourself in chat — Vertex generates Python inside `generate_code_tool`.

## How you must invoke tools (Gemini / Vertex)
- Use **only** the native function/tool-calling interface. Each tool is a named function with JSON arguments.
- **Forbidden:** Python snippets, `print(...)`, `call ...`, markdown code fences, or pretending to run shell commands.
- **Required:** Pass arguments that match the tool schema exactly (e.g. `parse_excel_tool` takes `excel_path` as a string).

## Phase 1 — Load specs (mandatory)
1. Call **parse_excel_tool** once with `excel_path` set to the **absolute path** from the user message (copy it exactly).
2. Read the returned JSON. If `"ok": false`, stop and summarize the `error` field — do not invent collectors.

## Phase 2 — Plan (optional)
3. Call **build_plan_tool** to show filenames and counts (helps you track progress).
4. Optionally call **read_repo_tool** with a path under `backend/app/aws_evidence/`, `gcp_evidence/`, or `azure_evidence/` if you need a pattern (read-only).

## Phase 3 — Generate, validate, write (repeat for every collector)
5. Use **list_collectors_tool** if you need the `collector_names` list again.
6. For **each** `collector_name` from the parse step, in any consistent order:
   - **generate_code_tool** with that exact `collector_name` string.
   - **validate_code_tool** with the same `collector_name`.
   - If validate JSON has `"ok": false`, call **generate_code_tool** again for that name (at most **two** regeneration attempts per collector), then **validate_code_tool** again.
   - When validate has `"ok": true`, call **write_file_tool** with that `collector_name`.
7. Do not skip collectors unless the parse step did not list them.

## Rules
- Never claim success without a successful **write_file_tool** result (or dry-run skip in its JSON).
- If `dry_run` is true in the user message: still run parse and plan; generation/validation may run but writes are expected to report skipped in tool output — still complete the loop.
- Collector names are case-sensitive and must match the Excel output exactly.

## Final reply
After all tools are done, reply in plain text with a **short** summary: parsed count, written count, any failures from tool JSON.
"""


def _make_llm(cfg: AgentConfig):
    """Orchestrator LLM: Vertex AI Gemini only (same defaults as backend ``VERTEX_AI_MODEL``)."""
    assert_real_vertex_project(cfg.google_cloud_project)
    try:
        from langchain_google_vertexai import ChatVertexAI
    except ImportError as e:
        raise ImportError(
            "Install langchain-google-vertexai: pip install langchain-google-vertexai"
        ) from e

    return ChatVertexAI(
        model_name=cfg.vertex_ai_model,
        project=cfg.google_cloud_project,
        location=cfg.vertex_ai_location,
        temperature=0,
    )


def _final_assistant_text(result: object) -> str:
    if isinstance(result, dict) and "messages" in result:
        msgs = result["messages"]
        if msgs:
            last = msgs[-1]
            c = getattr(last, "content", None)
            if c:
                return str(c)
    return str(result)


def run_langchain_pipeline(
    excel_path: Path,
    *,
    dry_run: bool,
    wizard_result: WizardResult | None = None,
) -> int:
    """
    Run the LangChain create_agent graph (tool calling).
    Returns process exit code: 0 success, 1 error, 2 partial failures.
    """
    cfg = AgentConfig.load()
    reset_pipeline_state(dry_run=bool(dry_run or cfg.dry_run))
    if wizard_result is not None:
        apply_wizard_to_pipeline_state(wizard_result)

    tools = all_tools()
    llm = _make_llm(cfg)

    agent = create_agent(
        llm,
        tools=tools,
        system_prompt=AGENT_SYSTEM_PROMPT,
    )

    excel_s = str(excel_path.resolve())
    fw = STATE.evidence_framework or "(not set)"
    ref = STATE.evidence_reference_path or "(none)"
    user_msg = (
        f"TASK: Run the full collector pipeline using tools only.\n\n"
        f"excel_path (pass verbatim to parse_excel_tool): {excel_s}\n"
        f"repository_root: {REPO_ROOT}\n"
        f"evidence_program: {fw}\n"
        f"reference_evidence_file: {ref}\n"
        f"target_cloud: {STATE.target_cloud or 'azure'}\n"
        f"dry_run: {STATE.dry_run}\n\n"
        "First step: call parse_excel_tool with {\"excel_path\": <the excel_path line above>}. "
        "Then for each collector_name in the parse result, run generate_code_tool → validate_code_tool "
        "→ (retry generate if needed) → write_file_tool. End with a brief summary."
    )

    # ~28 collectors × several tool calls each (generate/validate/write) exceeds default 100 graph steps.
    recursion = int(os.getenv("LANGCHAIN_RECURSION_LIMIT", "800"))

    print("\n[langchain] Starting agent (create_agent)…")
    print(f"[langchain] recursion_limit={recursion} (raise LANGCHAIN_RECURSION_LIMIT if you still hit the cap)\n")
    try:
        result = agent.invoke(
            {"messages": [HumanMessage(content=user_msg)]},
            config={"recursion_limit": recursion},
        )
    except Exception as e:
        print(f"\n[langchain] Agent failed: {e}\n")
        if "recursion" in str(e).lower() or "RECURSION" in str(e):
            print(
                "[langchain] Tip: set LANGCHAIN_RECURSION_LIMIT=1200 (or higher), "
                "or run: py -3 main.py --deterministic\n"
            )
        return 1

    out = _final_assistant_text(result)
    print("\n" + "=" * 60)
    print("[langchain] Final message:\n")
    print(out)
    print("=" * 60)

    written = len(STATE.written)
    expected = len(STATE.specs_by_name)
    if expected == 0:
        return 1 if STATE.last_error else 0
    if STATE.dry_run:
        return 0
    if written < expected:
        return 2
    return 0


def run_deterministic_pipeline(
    excel_path: Path,
    *,
    dry_run: bool,
    wizard_result: WizardResult | None = None,
) -> int:
    """
    Non-LLM sequential pipeline using the same tools (fallback / CI).
    parse → for each: generate → validate → retry once → write.
    """
    from tools import (
        build_plan_tool,
        generate_code_tool,
        list_collectors_tool,
        parse_excel_tool,
        validate_code_tool,
        write_file_tool,
    )

    cfg = AgentConfig.load()
    reset_pipeline_state(dry_run=bool(dry_run or cfg.dry_run))
    if wizard_result is not None:
        apply_wizard_to_pipeline_state(wizard_result)

    print("[deterministic] parse_excel_tool…")
    print(parse_excel_tool.invoke({"excel_path": str(excel_path.resolve())}))
    print("[deterministic] build_plan_tool…")
    print(build_plan_tool.invoke({}))

    data = json.loads(list_collectors_tool.invoke({}))
    names = data.get("collector_names") or []

    if STATE.dry_run:
        print("[deterministic] Dry run — stopping after plan.")
        return 0

    try:
        assert_real_vertex_project(cfg.google_cloud_project)
    except ValueError as e:
        print(f"[error] {e}")
        return 1

    ok = 0
    fail = 0
    for name in names:
        print(f"\n--- {name} ---")
        print(generate_code_tool.invoke({"collector_name": name}))
        v = json.loads(validate_code_tool.invoke({"collector_name": name}))
        if not v.get("ok"):
            print("[deterministic] retry generate once…")
            print(generate_code_tool.invoke({"collector_name": name}))
            v = json.loads(validate_code_tool.invoke({"collector_name": name}))
        if not v.get("ok"):
            print(f"[deterministic] VALIDATION FAIL: {v}")
            fail += 1
            continue
        print(write_file_tool.invoke({"collector_name": name}))
        ok += 1

    print(f"\n[deterministic] Done. ok={ok}, fail={fail}")
    return 0 if fail == 0 else 2

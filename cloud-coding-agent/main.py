#!/usr/bin/env python3
"""
CLI entry: interactive wizard (default) or batch mode for Azure collector generation → cloud-coding-agent/output/ only.

Run from cloud-coding-agent/:
  .\run.ps1                         # if `py` / `python` hit the Microsoft Store stub, use this (Windows)
  python main.py                    # interactive wizard, then pipeline
  python main.py --batch --excel path   # non-interactive (CI / scripts)

Orchestrator: Vertex AI Gemini (ChatVertexAI). See cloud-coding-agent/.env and config.py.

Environment:
  cloud-coding-agent/.env — GOOGLE_CLOUD_PROJECT, VERTEX_*, LANGCHAIN_RECURSION_LIMIT, …
  AGENT_USE_LANGCHAIN=0 — deterministic pipeline (no LangChain orchestrator)
  DRY_RUN — parse/plan only
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

_AGENT_DIR = Path(__file__).resolve().parent
if str(_AGENT_DIR) not in sys.path:
    sys.path.insert(0, str(_AGENT_DIR))

from config import AgentConfig, COLLECTORS_OUTPUT_DIR


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Evidence collector coding agent (wizard by default; Azure output under cloud-coding-agent/output/)."
    )
    p.add_argument(
        "--batch",
        action="store_true",
        help="Skip interactive wizard; use --excel path or config default (for automation).",
    )
    p.add_argument(
        "--excel",
        type=Path,
        default=None,
        help="Excel workbook with collector mappings (used in batch mode or as wizard default).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and plan only; skip Vertex generation and writes",
    )
    p.add_argument(
        "--deterministic",
        action="store_true",
        help="Run the fixed loop without LangChain orchestrator (uses same tools)",
    )
    return p.parse_args()


def main() -> int:
    args = _parse_args()
    cfg = AgentConfig.load()

    use_lc = os.getenv("AGENT_USE_LANGCHAIN", "1").strip().lower() not in ("0", "false", "no")
    if args.deterministic:
        use_lc = False

    wizard_result = None
    if not args.batch:
        from wizard import run_interactive_wizard

        default_excel = Path(args.excel).resolve() if args.excel else cfg.excel_path
        wr = run_interactive_wizard(default_excel=default_excel)
        if wr is None:
            return 1
        if wr.target_cloud != "azure":
            print()
            print("=" * 60)
            print("  This CLI agent currently generates **Azure** collector Python modules only.")
            print("  GCP / AWS codegen paths are not enabled here yet.")
            print("  Use the backend packages under backend/app/gcp_evidence and aws_evidence as reference.")
            print("=" * 60)
            return 0
        wizard_result = wr
        excel_path = wr.excel_path
    else:
        excel_path = Path(args.excel).resolve() if args.excel else cfg.excel_path

    dry = args.dry_run or cfg.dry_run

    print()
    print("=" * 60)
    print("  Evidence collector agent — run")
    print("=" * 60)
    print(f"[config] Excel path: {excel_path}")
    print(f"[config] Output dir: {COLLECTORS_OUTPUT_DIR}")
    print(f"[config] Dry run: {dry}")
    print(
        f"[config] Mode: {'LangChain agent (Vertex Gemini)' if use_lc else 'deterministic (no orchestrator LLM)'}"
    )
    print(f"[config] GOOGLE_CLOUD_PROJECT: {cfg.google_cloud_project or '(not set)'}")
    print(f"[config] Vertex AI model: {cfg.vertex_ai_model} @ {cfg.vertex_ai_location}")

    if use_lc:
        from langchain_agent import run_langchain_pipeline

        return run_langchain_pipeline(excel_path, dry_run=dry, wizard_result=wizard_result)

    from langchain_agent import run_deterministic_pipeline

    return run_deterministic_pipeline(excel_path, dry_run=dry, wizard_result=wizard_result)


if __name__ == "__main__":
    raise SystemExit(main())

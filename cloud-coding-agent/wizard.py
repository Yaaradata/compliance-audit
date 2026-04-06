"""Interactive CLI wizard: evidence program → Excel path → cloud confirmation → run."""
from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

from cloud_detect import detect_cloud_from_excel
from config import DEFAULT_EXCEL_PATH, REPO_ROOT


@dataclass
class WizardResult:
    evidence_framework: str
    evidence_reference_path: Path | None
    excel_path: Path
    target_cloud: str  # azure | gcp | aws


def _input_line(prompt: str, default: str | None = None) -> str:
    if default is not None:
        full = f"{prompt} [{default}]: "
    else:
        full = f"{prompt}: "
    try:
        s = input(full).strip()
    except EOFError:
        return default or ""
    if not s and default is not None:
        return default
    return s


def run_interactive_wizard(*, default_excel: Path | None = None) -> WizardResult | None:
    """
    Prompt for:
      1) Evidence program / framework (SWIFT, PCI DSS, SOC 2, …)
      2) Optional reference file path
      3) Excel path with collector mapping
      4) Confirm inferred cloud (Azure / GCP / AWS) before any codegen.
    """
    print()
    print("=" * 60)
    print("  Evidence collector agent — setup")
    print("=" * 60)

    print("\n--- Step 1: Evidence program / framework ---")
    print("Examples: SWIFT CSCF, PCI DSS, SOC 2 Type II, ISO 27001, …")
    fw = _input_line("Which evidence program is this run for?", "SWIFT CSCF")
    if not fw:
        print("A framework name is required.")
        return None

    print("\n--- Step 2: Reference evidence file (optional) ---")
    print("Path to a workbook, PDF, or notes that describe the evidence domain (optional).")
    ref_s = _input_line("Path (leave empty to skip)", "")
    evidence_ref: Path | None = None
    if ref_s:
        p = Path(ref_s)
        if not p.is_absolute():
            p = (REPO_ROOT / p).resolve()
        else:
            p = p.resolve()
        if not p.is_file():
            print(f"[wizard] Warning: file not found (continuing without it): {p}")
        else:
            evidence_ref = p

    print("\n--- Step 3: Collector mapping Excel ---")
    default_x = str(default_excel.resolve()) if default_excel else str(DEFAULT_EXCEL_PATH.resolve())
    ex_s = _input_line("Path to the Excel file with collector / control mappings", default_x)
    excel_path = Path(ex_s)
    if not excel_path.is_absolute():
        excel_path = (REPO_ROOT / excel_path).resolve()
    else:
        excel_path = excel_path.resolve()
    if not excel_path.is_file():
        print(f"[wizard] ERROR: Excel file not found: {excel_path}")
        return None

    suf = excel_path.suffix.lower()
    if suf not in (".xlsx", ".xls", ".xlsm"):
        print(
            "[wizard] ERROR: Collector mapping must be an Excel workbook (.xlsx / .xls / .xlsm), "
            "not a CSV or PDF. Example: Azure_Evidence_Collection_SWIFT_v2026.xlsx"
        )
        print(f"  Got: {excel_path}")
        return None

    print("\n--- Step 4: Target cloud ---")
    detected, scores = detect_cloud_from_excel(excel_path)
    print(f"  Heuristic scores (from sheet names + sample cells): {scores}")
    if detected == "unknown":
        print("  Could not infer a single cloud from the workbook text.")
        cloud = _input_line("Enter target cloud", "azure").strip().lower()
    else:
        print(f"  Inferred cloud: **{detected.upper()}**")
        cloud = _input_line("Confirm [Enter] = use inferred, or type azure / gcp / aws", detected).strip().lower()
        if not cloud:
            cloud = detected

    if cloud not in ("azure", "gcp", "aws"):
        print(f"[wizard] Invalid cloud: {cloud!r}. Use azure, gcp, or aws.")
        return None

    print("\n--- Step 5: Confirm ---")
    print(f"  Evidence program:     {fw}")
    print(f"  Reference file:       {evidence_ref or '(none)'}")
    print(f"  Excel workbook:       {excel_path}")
    print(f"  Target cloud:         {cloud.upper()}")
    ok = _input_line("Start pipeline for this configuration? [y/N]", "n").strip().lower()
    if ok not in ("y", "yes"):
        print("[wizard] Aborted (no code generation).")
        return None

    return WizardResult(
        evidence_framework=fw,
        evidence_reference_path=evidence_ref,
        excel_path=excel_path,
        target_cloud=cloud,
    )


def apply_wizard_to_pipeline_state(result: WizardResult) -> None:
    """Copy wizard choices into shared pipeline state for tools / prompts."""
    from pipeline_state import STATE

    STATE.evidence_framework = result.evidence_framework
    STATE.evidence_reference_path = str(result.evidence_reference_path) if result.evidence_reference_path else None
    STATE.target_cloud = result.target_cloud
    STATE.excel_path = str(result.excel_path.resolve())

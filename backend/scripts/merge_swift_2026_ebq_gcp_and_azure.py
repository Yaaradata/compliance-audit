#!/usr/bin/env python3
"""
Merge SWIFT 2026 evidence question rows: GCP/GCS columns from evidence_based_questions_2026.csv
plus Azure columns from Evidence_Based_Questions_2026_Azure.csv (same ids).

Usage:
  python backend/scripts/merge_swift_2026_ebq_gcp_and_azure.py --out evidence_based_questions_2026_gcp_azure_merged.csv
"""
from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent

DEFAULT_GCP = REPO_ROOT / "evidence_based_questions_2026.csv"
DEFAULT_AZURE = REPO_ROOT / "Evidence_Based_Questions_2026_Azure.csv"


def main() -> int:
    p = argparse.ArgumentParser(description="Merge GCS + Azure EBQ CSV rows by id.")
    p.add_argument("--gcp", type=Path, default=DEFAULT_GCP, help="CSV with gcs_auto_level, gcs_services, question_level_gcs_sources")
    p.add_argument("--azure", type=Path, default=DEFAULT_AZURE, help="CSV with azure_* columns")
    p.add_argument("--out", type=Path, required=True, help="Output merged CSV path")
    args = p.parse_args()

    if not args.gcp.is_file():
        print(f"[ERROR] Missing GCS base file: {args.gcp}", file=sys.stderr)
        return 1
    if not args.azure.is_file():
        print(f"[ERROR] Missing Azure file: {args.azure}", file=sys.stderr)
        return 1

    azure_by_id: dict[str, dict[str, str]] = {}
    with args.azure.open("r", encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            rid = (row.get("id") or "").strip()
            if rid:
                azure_by_id[rid] = row

    merged_rows: list[dict[str, str]] = []
    fieldnames: list[str] = []

    with args.gcp.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        base_fields = reader.fieldnames or []
        # Column order: base file, then azure-only keys not in base
        extra_azure = ["azure_auto_level", "azure_services", "question_level_azure_sources"]
        fieldnames = list(base_fields)
        for k in extra_azure:
            if k not in fieldnames:
                fieldnames.append(k)

        for row in reader:
            rid = (row.get("id") or "").strip()
            out = {k: (row.get(k) if row.get(k) is not None else "") for k in base_fields}
            az = azure_by_id.get(rid)
            if az:
                for k in extra_azure:
                    out[k] = az.get(k) if az.get(k) is not None else ""
            else:
                for k in extra_azure:
                    out[k] = ""
            merged_rows.append(out)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for r in merged_rows:
            w.writerow({k: r.get(k, "") for k in fieldnames})

    print(f"[OK] Merged {len(merged_rows)} rows -> {args.out}")
    missing_azure = sum(1 for r in merged_rows if not azure_by_id.get((r.get("id") or "").strip()))
    if missing_azure:
        print(f"[WARN] {missing_azure} rows had no Azure CSV match (azure_* left empty).", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

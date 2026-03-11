#!/usr/bin/env python3
"""
Load evidence_based_questions for swift_2026 from CSV.

1. Deletes all existing rows in swift_2026.evidence_based_questions
2. Inserts rows from ref-docs/swift/2026/evidence_questions_v2026_updated.csv
3. Includes guide and conditional visibility (show_when_question, show_when_values)

Prerequisites:
  - Run migration 27 first: python backend/scripts/run_evidence_questions_migration.py
    (or: psql -f backend/sql/27_add_guide_and_show_when_swift_2026.sql)

Usage (from repo root):
  python backend/scripts/load_evidence_questions_swift_2026.py [--dry-run]

With --dry-run: prints SQL and row count without executing.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import uuid
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
REPO_ROOT = BACKEND_DIR.parent
CSV_PATH = REPO_ROOT / "ref-docs" / "swift" / "2026" / "evidence_questions_v2026_updated.csv"

sys.path.insert(0, str(BACKEND_DIR))

# Conditional visibility: question_key -> (parent_question_key, list of values that show this question)
CONDITIONAL_MAPPING: dict[tuple[str, str], tuple[str, list[str]]] = {
    # (evidence_item_id, question_key): (show_when_question, show_when_values)
    ("A1", "internet_exposure_justification"): ("internet_exposure_confirmation", ["Yes", "Unknown"]),
    ("A5", "multiple_architecture_details"): ("multiple_architectures", ["Yes — described below"]),
    ("A7", "unprotected_mandatory_flows"): (
        "mandatory_flows_protected",
        ["No — some mandatory flows are unprotected (see details below)"],
    ),
}


def esc_sql(s: str | None) -> str:
    if s is None or s == "":
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def esc_json(val) -> str:
    return "'" + json.dumps(val).replace("'", "''") + "'"


def parse_bool(s: str | None) -> bool:
    if s is None:
        return False
    return str(s).strip().lower() in ("true", "1", "yes")


def parse_options(s: str | None) -> list:
    if not s or not str(s).strip():
        return []
    try:
        out = json.loads(s)
        return out if isinstance(out, list) else []
    except json.JSONDecodeError:
        return []


def load_csv_rows() -> list[dict]:
    """Load and parse CSV. Returns list of row dicts."""
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(dict(r))
    return rows


def build_insert_sql(rows: list[dict]) -> tuple[str, str, int]:
    """Build DELETE and INSERT statements. Returns (delete_sql, insert_sql, row_count)."""
    delete_sql = "DELETE FROM swift_2026.evidence_based_questions;"

    if not rows:
        return delete_sql, "", 0

    cols = [
        "id", "evidence_item_id", "question_key", "label", "question_type",
        "required", "placeholder", "options", "sort_order", "control_id",
        "rows", "accept", "upload_label", "cscf_version", "guide",
        "show_when_question", "show_when_values",
    ]

    values_list = []
    for r in rows:
        item_id = (r.get("evidence_item_id") or "").strip().upper()
        qkey = (r.get("question_key") or "").strip()
        cond = CONDITIONAL_MAPPING.get((item_id, qkey))

        row_id = r.get("id") or str(uuid.uuid4())
        options = parse_options(r.get("options"))
        required = parse_bool(r.get("required"))
        sort_order = int(r.get("sort_order") or 0)
        rows_val = r.get("rows")
        rows_int = int(rows_val) if rows_val and str(rows_val).isdigit() else None

        show_when_q = cond[0] if cond else None
        show_when_vals = cond[1] if cond else []

        vals = [
            esc_sql(row_id),
            esc_sql(item_id),
            esc_sql(qkey),
            esc_sql(r.get("label")),
            esc_sql(r.get("question_type")),
            "true" if required else "false",
            esc_sql(r.get("placeholder") or None),
            esc_json(options),
            str(sort_order),
            esc_sql(r.get("control_id") or None),
            str(rows_int) if rows_int is not None else "NULL",
            esc_sql(r.get("accept") or None),
            esc_sql(r.get("upload_label") or None),
            esc_sql(r.get("cscf_version") or "2026v"),
            esc_sql(r.get("guide") or None),
            esc_sql(show_when_q),
            esc_json(show_when_vals),
        ]
        values_list.append("(" + ", ".join(vals) + ")")

    insert_sql = """
INSERT INTO swift_2026.evidence_based_questions (
    id, evidence_item_id, question_key, label, question_type,
    required, placeholder, options, sort_order, control_id,
    rows, accept, upload_label, cscf_version, guide,
    show_when_question, show_when_values
) VALUES
""" + ",\n".join(values_list)

    return delete_sql, insert_sql, len(rows)


def main():
    parser = argparse.ArgumentParser(description="Load evidence_questions from CSV into swift_2026")
    parser.add_argument("--dry-run", action="store_true", help="Print SQL only, do not execute")
    args = parser.parse_args()

    rows = load_csv_rows()
    delete_sql, insert_sql, count = build_insert_sql(rows)

    if args.dry_run:
        out_path = BACKEND_DIR / "sql" / "_load_evidence_2026_dry_run.sql"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(delete_sql + "\n")
            if insert_sql:
                f.write(insert_sql + ";\n")
            f.write(f"\n-- Would insert {count} rows\n")
        print(f"Dry-run: wrote SQL to {out_path}")
        print(f"Would delete existing rows and insert {count} rows")
        return 0

    # Execute via psycopg2
    try:
        from dotenv import load_dotenv
        load_dotenv(BACKEND_DIR / ".env")

        import psycopg2

        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", "5432")),
            dbname=os.getenv("DB_NAME", "compliance"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", ""),
            sslmode="require" if os.getenv("DB_SSL", "false").lower() == "true" else "disable",
        )
        conn.autocommit = True
        cur = conn.cursor()

        cur.execute("SET search_path TO swift_2026, core, swift_2025, public")
        cur.execute(delete_sql)
        if count > 0 and insert_sql:
            cur.execute(insert_sql)
        conn.close()
        print(f"Loaded {count} rows into swift_2026.evidence_based_questions")
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Truncate and load swift_2026.evidence_based_questions from:
  ref-docs/swift/2026/SWIFT_CSCF2026_Combined (1).csv

This loader is 1:1 with CSV records (no Evidence Item splitting).

Usage:
  python backend/scripts/load_swift_2026_evidence_questions_combined_csv.py
  python backend/scripts/load_swift_2026_evidence_questions_combined_csv.py --file "ref-docs/swift/2026/SWIFT_CSCF2026_Combined (1).csv"
  python backend/scripts/load_swift_2026_evidence_questions_combined_csv.py --no-truncate
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from pathlib import Path
from typing import Any

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import execute_batch


SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
REPO_ROOT = BACKEND_DIR.parent

DEFAULT_FILE = REPO_ROOT / "ref-docs" / "swift" / "2026" / "SWIFT_CSCF2026_Combined (1).csv"

REQUIRED_COLUMNS = [
    "id",
    "evidence_item_id",
    "question_key",
    "label",
    "question_type",
    "required",
    "placeholder",
    "options",
    "sort_order",
    "control_id",
    "rows",
    "accept",
    "upload_label",
    "cscf_version",
    "created_at",
    "guide",
    "Evidence Required",
    "Evidence Source",
    "Collection Method",
    "AWS Auto Level",
    "AWS Services",
    "Question-Level AWS Sources",
    "Reason / Rationale",
]
OPTIONAL_COLUMNS = [
    "show_when_question",
    "show_when_values",
]


def to_text(v: Any) -> str | None:
    s = str(v or "").strip()
    return s if s else None


def to_bool(v: Any) -> bool:
    s = str(v or "").strip().lower()
    if s in {"true", "t", "1", "yes", "y"}:
        return True
    if s in {"false", "f", "0", "no", "n"}:
        return False
    return False


def to_int(v: Any) -> int | None:
    s = str(v or "").strip()
    if not s:
        return None
    return int(s)


def to_json_array_text(v: Any) -> str:
    raw = str(v or "").strip()
    if not raw:
        return "[]"
    parsed = json.loads(raw)
    if not isinstance(parsed, list):
        raise ValueError(f"Expected JSON array but got: {type(parsed).__name__}")
    return json.dumps(parsed)


def db_connect():
    load_dotenv(BACKEND_DIR / ".env")
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "compliance"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        sslmode="require" if os.getenv("DB_SSL", "false").lower() == "true" else "disable",
    )


def read_rows(csv_path: Path) -> list[dict[str, Any]]:
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = [dict(r) for r in reader if any(str(v or "").strip() for v in r.values())]
    if not rows:
        raise ValueError("CSV is empty.")
    missing = [c for c in REQUIRED_COLUMNS if c not in rows[0]]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")
    return rows


def build_payload(rows: list[dict[str, Any]]) -> list[tuple]:
    payload: list[tuple] = []
    for i, row in enumerate(rows, start=2):
        try:
            payload.append(
                (
                    to_text(row["id"]),
                    to_text(row["evidence_item_id"]),
                    to_text(row["question_key"]),
                    to_text(row["label"]),
                    to_text(row["question_type"]),
                    to_bool(row["required"]),
                    to_text(row["placeholder"]),
                    to_json_array_text(row["options"]),
                    to_int(row["sort_order"]) or 0,
                    to_text(row["control_id"]),
                    to_int(row["rows"]),
                    to_text(row["accept"]),
                    to_text(row["upload_label"]),
                    to_text(row["cscf_version"]) or "2026v",
                    to_text(row["created_at"]),
                    to_text(row["guide"]),
                    to_text(row.get("Evidence Required")),
                    to_text(row.get("Evidence Source")),
                    to_text(row.get("Collection Method")),
                    to_text(row.get("AWS Auto Level")),
                    to_text(row.get("AWS Services")),
                    to_text(row.get("Question-Level AWS Sources")),
                    to_text(row.get("Reason / Rationale")),
                    to_text(row.get("show_when_question")),
                    to_json_array_text(row.get("show_when_values")),
                )
            )
        except Exception as exc:
            raise ValueError(f"Row {i} parse error: {exc}") from exc
    return payload


def run(csv_path: Path, truncate_first: bool) -> int:
    rows = read_rows(csv_path)
    payload = build_payload(rows)

    conn = db_connect()
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            if truncate_first:
                cur.execute("TRUNCATE TABLE swift_2026.evidence_based_questions RESTART IDENTITY CASCADE")

            if truncate_first:
                # Exact refresh mode: truncate first, then insert rows exactly as provided.
                sql = """
                    INSERT INTO swift_2026.evidence_based_questions (
                        id, evidence_item_id, question_key, label, question_type, required, placeholder,
                        options, sort_order, control_id, rows, accept, upload_label, cscf_version,
                        created_at, guide,
                        evidence_required_raw, evidence_source, collection_method, aws_auto_level,
                        aws_services, question_level_aws_sources, reason_rationale,
                        show_when_question, show_when_values
                    ) VALUES (
                        %s::uuid, %s, %s, %s, %s, %s, %s,
                        %s::jsonb, %s, %s, %s, %s, %s, %s,
                        %s::timestamptz, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s::jsonb
                    )
                """
            else:
                sql = """
                    INSERT INTO swift_2026.evidence_based_questions (
                        id, evidence_item_id, question_key, label, question_type, required, placeholder,
                        options, sort_order, control_id, rows, accept, upload_label, cscf_version,
                        created_at, guide,
                        evidence_required_raw, evidence_source, collection_method, aws_auto_level,
                        aws_services, question_level_aws_sources, reason_rationale,
                        show_when_question, show_when_values
                    ) VALUES (
                        %s::uuid, %s, %s, %s, %s, %s, %s,
                        %s::jsonb, %s, %s, %s, %s, %s, %s,
                        %s::timestamptz, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s::jsonb
                    )
                    ON CONFLICT (evidence_item_id, question_key) DO UPDATE SET
                        id = EXCLUDED.id,
                        label = EXCLUDED.label,
                        question_type = EXCLUDED.question_type,
                        required = EXCLUDED.required,
                        placeholder = EXCLUDED.placeholder,
                        options = EXCLUDED.options,
                        sort_order = EXCLUDED.sort_order,
                        control_id = EXCLUDED.control_id,
                        rows = EXCLUDED.rows,
                        accept = EXCLUDED.accept,
                        upload_label = EXCLUDED.upload_label,
                        cscf_version = EXCLUDED.cscf_version,
                        created_at = EXCLUDED.created_at,
                        guide = EXCLUDED.guide,
                        evidence_required_raw = EXCLUDED.evidence_required_raw,
                        evidence_source = EXCLUDED.evidence_source,
                        collection_method = EXCLUDED.collection_method,
                        aws_auto_level = EXCLUDED.aws_auto_level,
                        aws_services = EXCLUDED.aws_services,
                        question_level_aws_sources = EXCLUDED.question_level_aws_sources,
                        reason_rationale = EXCLUDED.reason_rationale,
                        show_when_question = EXCLUDED.show_when_question,
                        show_when_values = EXCLUDED.show_when_values
                """
            execute_batch(cur, sql, payload, page_size=500)
            conn.commit()

            print(f"[OK] Source rows read: {len(rows)}")
            print(f"[OK] Rows loaded:     {len(payload)}")
            print(f"[OK] Truncate first:  {truncate_first}")
        return 0
    except Exception as exc:
        conn.rollback()
        print(f"[ERROR] Load failed: {exc}", file=sys.stderr)
        return 1
    finally:
        conn.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Truncate and load swift_2026.evidence_based_questions from combined CSV.")
    parser.add_argument("--file", default=str(DEFAULT_FILE), help="Path to source CSV file.")
    parser.add_argument("--no-truncate", action="store_true", help="Do not truncate table before load.")
    args = parser.parse_args()

    csv_path = Path(args.file).resolve()
    if not csv_path.exists():
        print(f"[ERROR] CSV not found: {csv_path}", file=sys.stderr)
        return 1

    print(f"[INFO] Loading from: {csv_path}")
    return run(csv_path, truncate_first=not args.no_truncate)


if __name__ == "__main__":
    sys.exit(main())

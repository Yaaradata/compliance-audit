#!/usr/bin/env python3
"""
Truncate and load swift_2026.evidence_based_questions from a CSV file
with snake_case headers (supports optional AWS/GCS enrichment columns).
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

DEFAULT_FILE = REPO_ROOT / "evidence_based_questions_2026.csv"

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
]

COLUMN_ALIASES = {
    "Evidence Required": "evidence_required_raw",
    "Evidence Source": "evidence_source",
    "Collection Method": "collection_method",
    "AWS Auto Level": "aws_auto_level",
    "AWS Services": "aws_services",
    "Question-Level AWS Sources": "question_level_aws_sources",
    "Reason / Rationale": "reason_rationale",
    "GCS Auto Level": "gcs_auto_level",
    "GCS Services": "gcs_services",
    "Question-Level GCS Sources": "question_level_gcs_sources",
    "Azure Auto Level": "azure_auto_level",
    "Azure Services": "azure_services",
    "Question-Level Azure Sources": "question_level_azure_sources",
}

OPTIONAL_EMPTY_COLUMNS = {
    "show_when_question",
    "show_when_values",
}


def to_text(v: Any) -> str | None:
    s = str(v or "").strip()
    return s if s else None


def to_bool(v: Any) -> bool:
    s = str(v or "").strip().lower()
    return s in {"true", "t", "1", "yes", "y"}


def to_int(v: Any) -> int | None:
    s = str(v or "").strip()
    if not s:
        return None
    if "." in s:
        f = float(s)
        if f.is_integer():
            return int(f)
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
        rows = []
        for r in reader:
            if not any(str(v or "").strip() for v in r.values()):
                continue
            normalized: dict[str, Any] = {}
            for key, value in dict(r).items():
                normalized_key = COLUMN_ALIASES.get(key, key)
                normalized[normalized_key] = value
            rows.append(normalized)
    if not rows:
        raise ValueError("CSV is empty.")
    missing = [c for c in REQUIRED_COLUMNS if c not in rows[0]]
    for col in OPTIONAL_EMPTY_COLUMNS:
        if col in missing:
            for row in rows:
                row[col] = ""
            missing.remove(col)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")
    return rows


def get_table_columns(conn) -> set[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'swift_2026'
              AND table_name = 'evidence_based_questions'
            """
        )
        return {r[0] for r in cur.fetchall()}


def build_payload(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for i, row in enumerate(rows, start=2):
        try:
            payload.append(
                {
                    "id": to_text(row["id"]),
                    "evidence_item_id": to_text(row["evidence_item_id"]),
                    "question_key": to_text(row["question_key"]),
                    "label": to_text(row["label"]),
                    "question_type": to_text(row["question_type"]),
                    "required": to_bool(row["required"]),
                    "placeholder": to_text(row["placeholder"]),
                    "options": to_json_array_text(row["options"]),
                    "sort_order": to_int(row["sort_order"]) or 0,
                    "control_id": to_text(row["control_id"]),
                    "rows": to_int(row["rows"]),
                    "accept": to_text(row["accept"]),
                    "upload_label": to_text(row["upload_label"]),
                    "cscf_version": to_text(row["cscf_version"]) or "2026v",
                    "created_at": to_text(row["created_at"]),
                    "guide": to_text(row.get("guide")),
                    "show_when_question": to_text(row.get("show_when_question")),
                    "show_when_values": to_json_array_text(row.get("show_when_values")),
                    "evidence_required_raw": to_text(row.get("evidence_required_raw")),
                    "evidence_source": to_text(row.get("evidence_source")),
                    "collection_method": to_text(row.get("collection_method")),
                    "aws_auto_level": to_text(row.get("aws_auto_level")),
                    "aws_services": to_text(row.get("aws_services")),
                    "question_level_aws_sources": to_text(row.get("question_level_aws_sources")),
                    "reason_rationale": to_text(row.get("reason_rationale")),
                    "answers": to_text(row.get("answers")),
                    "gcs_auto_level": to_text(row.get("gcs_auto_level")),
                    "gcs_services": to_text(row.get("gcs_services")),
                    "question_level_gcs_sources": to_text(row.get("question_level_gcs_sources")),
                    "azure_auto_level": to_text(row.get("azure_auto_level")),
                    "azure_services": to_text(row.get("azure_services")),
                    "question_level_azure_sources": to_text(row.get("question_level_azure_sources")),
                }
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

            existing_columns = get_table_columns(conn)
            ordered_columns = [
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
                "show_when_question",
                "show_when_values",
                "evidence_required_raw",
                "evidence_source",
                "collection_method",
                "aws_auto_level",
                "aws_services",
                "question_level_aws_sources",
                "reason_rationale",
                "answers",
                "gcs_auto_level",
                "gcs_services",
                "question_level_gcs_sources",
                "azure_auto_level",
                "azure_services",
                "question_level_azure_sources",
            ]
            insert_columns = [c for c in ordered_columns if c in existing_columns]
            cast_types = {
                "id": "::uuid",
                "options": "::jsonb",
                "created_at": "::timestamptz",
                "show_when_values": "::jsonb",
            }
            sql_columns = ", ".join(insert_columns)
            sql_values = ", ".join(f"%({c})s{cast_types.get(c, '')}" for c in insert_columns)
            sql = f"INSERT INTO swift_2026.evidence_based_questions ({sql_columns}) VALUES ({sql_values})"

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
    parser = argparse.ArgumentParser(description="Truncate and load swift_2026.evidence_based_questions from CSV.")
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

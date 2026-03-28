#!/usr/bin/env python3
"""
Create schema `demo`, table `demo."2026_demo"`, and load
`Test Data/2026/SWIFT_CSCF2026_Combined_with_Answers.csv` as-is (all columns TEXT).

Uses PostgreSQL COPY for faithful CSV import (quoted fields, commas, etc.).

Usage (from repo root):
  python backend/scripts/upload_demo_2026_combined_csv.py
  python backend/scripts/upload_demo_2026_combined_csv.py --file "Test Data/2026/SWIFT_CSCF2026_Combined_with_Answers.csv"
  python scripts/upload_demo_2026_combined_csv.py --schema demo --table "2026_demo" --no-drop

Requires: psycopg2, python-dotenv; DB_* in backend/.env
"""

from __future__ import annotations

import argparse
import csv
import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2 import sql


SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
REPO_ROOT = BACKEND_DIR.parent

DEFAULT_CSV = REPO_ROOT / "Test Data" / "2026" / "SWIFT_CSCF2026_Combined_with_Answers.csv"

EXPECTED_COLUMNS = [
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
    "answers",
]


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


def read_header_columns(csv_path: Path) -> list[str]:
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        header = next(reader, None)
    if not header:
        raise ValueError("CSV has no header row.")
    return [c.strip() for c in header]


def main() -> int:
    parser = argparse.ArgumentParser(description="Load SWIFT 2026 combined CSV into demo.2026_demo.")
    parser.add_argument("--file", default=str(DEFAULT_CSV), help="Path to CSV file.")
    parser.add_argument("--schema", default="demo", help="PostgreSQL schema (default: demo).")
    parser.add_argument("--table", default="2026_demo", help='Table name (default: 2026_demo). Quote-safe.')
    parser.add_argument(
        "--no-drop",
        action="store_true",
        help="Do not DROP TABLE before create (fails if table already exists with different shape).",
    )
    parser.add_argument(
        "--skip-header-check",
        action="store_true",
        help="Do not verify CSV columns match the expected list.",
    )
    args = parser.parse_args()

    csv_path = Path(args.file).resolve()
    if not csv_path.exists():
        print(f"[ERROR] CSV not found: {csv_path}", file=sys.stderr)
        return 1

    try:
        columns = read_header_columns(csv_path)
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1

    if not args.skip_header_check:
        if columns != EXPECTED_COLUMNS:
            print("[ERROR] CSV header does not match expected columns.", file=sys.stderr)
            print(f"  Expected ({len(EXPECTED_COLUMNS)}): {EXPECTED_COLUMNS}", file=sys.stderr)
            print(f"  Found    ({len(columns)}): {columns}", file=sys.stderr)
            return 1

    schema_name = args.schema
    table_name = args.table

    conn = db_connect()
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(schema_name))
            )

            if not args.no_drop:
                cur.execute(
                    sql.SQL("DROP TABLE IF EXISTS {}.{} CASCADE").format(
                        sql.Identifier(schema_name),
                        sql.Identifier(table_name),
                    )
                )

            create_cols = sql.SQL(", ").join(
                sql.SQL("{} TEXT").format(sql.Identifier(col)) for col in columns
            )
            cur.execute(
                sql.SQL("CREATE TABLE {}.{} ({})").format(
                    sql.Identifier(schema_name),
                    sql.Identifier(table_name),
                    create_cols,
                )
            )

            copy_stmt = sql.SQL("COPY {}.{} ({}) FROM STDIN WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')").format(
                sql.Identifier(schema_name),
                sql.Identifier(table_name),
                sql.SQL(", ").join(sql.Identifier(c) for c in columns),
            )

            copy_sql = copy_stmt.as_string(conn)

            with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
                cur.copy_expert(copy_sql, f)

            cur.execute(
                sql.SQL("SELECT COUNT(*) FROM {}.{}").format(
                    sql.Identifier(schema_name),
                    sql.Identifier(table_name),
                )
            )
            (nrows,) = cur.fetchone()

        conn.commit()
        print(f"[OK] Loaded {nrows} rows into {schema_name}.\"{table_name}\" from {csv_path}")
        return 0
    except Exception as exc:
        conn.rollback()
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main())

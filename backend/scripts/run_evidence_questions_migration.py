#!/usr/bin/env python3
"""
Run evidence_based_questions migrations (22-25) only.
Use when the full schema migration fails earlier (e.g. at 16) but you want to add evidence questions.

Usage (from repo root):
  python backend/scripts/run_evidence_questions_migration.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
SQL_DIR = BACKEND_DIR / "sql"

MIGRATIONS = [
    "22_evidence_based_questions_swift_2025.sql",
    "23_evidence_based_questions_swift_2026.sql",
    "24_seed_evidence_questions_swift_2025.sql",
    "25_seed_evidence_questions_swift_2026.sql",
]


def main():
    sys.path.insert(0, str(BACKEND_DIR))
    try:
        from dotenv import load_dotenv
        import psycopg2
        load_dotenv(BACKEND_DIR / ".env")
    except ImportError as e:
        print(f"Install: pip install psycopg2-binary python-dotenv. Error: {e}", file=sys.stderr)
        return 1

    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "compliance"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        sslmode="require" if os.getenv("DB_SSL", "false").lower() == "true" else "disable",
    )
    conn.autocommit = False
    for name in MIGRATIONS:
        path = SQL_DIR / name
        if not path.exists():
            print(f"  SKIP (not found): {name}")
            continue
        print(f"  Running {name} ...")
        try:
            sql = path.read_text(encoding="utf-8", errors="replace")
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"  ERROR: {e}", file=sys.stderr)
            conn.close()
            return 1
    conn.close()
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

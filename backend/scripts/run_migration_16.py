#!/usr/bin/env python3
"""
Run only migration 16 (seed swift_2026 evidence items and mappings).
Use this when psql is not on PATH (e.g. Windows). Uses app DB config.

From repo root:
  python backend/scripts/run_migration_16.py
From backend/:
  python scripts/run_migration_16.py
"""
from pathlib import Path
import sys

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
SQL_DIR = BACKEND_DIR / "sql"
MIGRATION_16 = SQL_DIR / "16_seed_swift_2026_evidence_items_mappings.sql"


def main():
    sys.path.insert(0, str(BACKEND_DIR))
    try:
        from app.config import settings
        database_url = settings.database_url
    except Exception as e:
        print(f"Cannot load DB config: {e}", file=sys.stderr)
        print("Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD or use backend/.env", file=sys.stderr)
        sys.exit(1)

    if not MIGRATION_16.exists():
        print(f"Migration file not found: {MIGRATION_16}", file=sys.stderr)
        sys.exit(1)

    try:
        import psycopg2
    except ImportError:
        print("Install psycopg2: pip install psycopg2-binary", file=sys.stderr)
        sys.exit(1)

    print(f"Running {MIGRATION_16.name} ...")
    sql = MIGRATION_16.read_text(encoding="utf-8", errors="replace")
    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        print("Done.")
    except Exception as e:
        conn.rollback()
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()

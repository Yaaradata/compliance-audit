#!/usr/bin/env python3
"""
Run all SOC 2 SQL scripts in order and apply them to Postgres (local or GCP Cloud SQL).

Usage (from repo root):
  python backend/SOC_2/run_soc2_sql.py [options]

Or from backend/:
  python SOC_2/run_soc2_sql.py [options]

Or from backend/SOC_2/:
  python run_soc2_sql.py [options]

Requires:
  - PostgreSQL running (local or Cloud SQL Proxy / GCP).
  - Database created (e.g. compliance).
  - backend/.env with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.
  - For GCP Cloud SQL: set CLOUD_SQL_INSTANCE=project:region:instance when using
    Cloud Run; for local use Cloud SQL Proxy and DB_HOST=127.0.0.1.
  - pip install psycopg2-binary (or psycopg2)
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

# Paths: script may be run from repo root, backend/, or backend/SOC_2/
SCRIPT_DIR = Path(__file__).resolve().parent
SOC2_DIR = SCRIPT_DIR
BACKEND_DIR = SCRIPT_DIR.parent
REPO_ROOT = BACKEND_DIR.parent
SQL_DIR = SOC2_DIR / "sql"

# SQL files in execution order (schema then seed)
SQL_FILES = [
    "01_soc2_schema.sql",
    "02_soc2_architecture_and_controls_seed.sql",
    "03_soc2_full_schema.sql",
    "04_soc2_seed_data.sql",
    "06_soc2_esm_criteria_to_jsonb.sql",
    "05_soc2_evidence_sufficiency_matrix_seed.sql",
]


def load_database_url() -> str:
    """Load database URL from backend app config or from env / backend/.env."""
    # Try backend app config first (uses pydantic_settings and backend/.env)
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    try:
        from app.config import settings
        return settings.database_url
    except Exception:
        pass
    # Fallback: load from environment, optionally from backend/.env
    env_file = BACKEND_DIR / ".env"
    if env_file.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
        except ImportError:
            pass
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "compliance")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    cloud_sql = os.getenv("CLOUD_SQL_INSTANCE", "").strip()
    ssl_mode = "require" if os.getenv("DB_SSL", "").lower() in ("true", "1", "yes") else ""
    if cloud_sql:
        ssl = "&sslmode=require" if ssl_mode else ""
        return f"postgresql://{user}:{password}@/{name}?host=/cloudsql/{cloud_sql}{ssl}"
    ssl = "?sslmode=require" if ssl_mode else ""
    return f"postgresql://{user}:{password}@{host}:{port}/{name}{ssl}"


def run_soc2_sql(database_url: str, dry_run: bool, stop_on_error: bool) -> bool:
    """Run each SOC 2 SQL file in order. Returns True if all succeeded."""
    if not dry_run:
        try:
            import psycopg2
        except ImportError:
            print("Install psycopg2: pip install psycopg2-binary", file=sys.stderr)
            return False

    for name in SQL_FILES:
        path = SQL_DIR / name
        if not path.exists():
            print(f"  SKIP (not found): {name}")
            continue
        if dry_run:
            print(f"  [dry-run] would run: {name}")
            continue
        print(f"  Running {name} ...")
        try:
            sql = path.read_text(encoding="utf-8", errors="replace")
            conn = psycopg2.connect(database_url)
            conn.autocommit = False
            try:
                with conn.cursor() as cur:
                    cur.execute(sql)
                conn.commit()
                print(f"    OK: {name}")
            except Exception as e:
                conn.rollback()
                print(f"  ERROR in {name}: {e}", file=sys.stderr)
                conn.close()
                if stop_on_error:
                    return False
            finally:
                if conn.closed == 0:
                    conn.close()
        except Exception as e:
            print(f"  ERROR running {name}: {e}", file=sys.stderr)
            if stop_on_error:
                return False
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run SOC 2 SQL scripts in order and store in Postgres (local or GCP)."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only list SQL files that would be run.",
    )
    parser.add_argument(
        "--no-stop-on-error",
        action="store_true",
        help="Continue running remaining files after an error (default: stop on first error).",
    )
    args = parser.parse_args()

    print("SOC 2 SQL runner")
    print(f"  SQL dir: {SQL_DIR}")
    if not SQL_DIR.exists():
        print(f"  ERROR: SQL directory not found: {SQL_DIR}", file=sys.stderr)
        return 1

    database_url = load_database_url()
    # Mask password in log
    if "@" in database_url and ":" in database_url:
        safe_url = "postgresql://...@.../" + database_url.split("/")[-1].split("?")[0]
    else:
        safe_url = database_url
    print(f"  DB: {safe_url}")

    ok = run_soc2_sql(
        database_url,
        dry_run=args.dry_run,
        stop_on_error=not args.no_stop_on_error,
    )
    if args.dry_run:
        print("  Dry run done. Run without --dry-run to execute.")
    elif ok:
        print("  All SOC 2 SQL scripts completed successfully.")
    else:
        print("  One or more scripts failed.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

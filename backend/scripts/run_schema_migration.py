#!/usr/bin/env python3
"""
Run the full schema and data migration for SWIFT 2025/2026 as described in
docs/step-by-step-schema-and-migration.md.

Usage (from repo root):
  python backend/scripts/run_schema_migration.py [options]

Or from backend/:
  python scripts/run_schema_migration.py [options]

Requires: PostgreSQL running, DB created (e.g. compliance), .env or env vars for DB.
Optional: openpyxl for load scripts that read xlsx.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

# Resolve paths so script works from repo root or backend/
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
REPO_ROOT = BACKEND_DIR.parent
SQL_DIR = BACKEND_DIR / "sql"
SCRIPTS_DIR = SQL_DIR / "scripts"

# SQL migrations in order (01–14, 16, 17)
SQL_MIGRATIONS = [
    "01_schema_ddl.sql",
    "02_seed_reference_data.sql",
    "03_add_evidence_columns.sql",
    "04_add_cei_description.sql",
    "05_update_a5_json_format.sql",
    "06_evidence_sufficiency_matrix.sql",
    "07_a5_sufficiency_evaluation_criteria.sql",
    "08_reviewer_checklist_json_columns.sql",
    "09_user_role_l1_l2.sql",
    "10_evidence_submission_history.sql",
    "11_notes_notifications.sql",
    "12_core_schema_and_move_tables.sql",
    "12b_audit_log_date_month_swift_2025.sql",
    "13_swift_2026_schema.sql",
    "14_seed_swift_2026_domains_controls.sql",
    "16_seed_swift_2026_evidence_items_mappings.sql",
    "17_seed_swift_2026_a7_control.sql",
    "20_cycle_user_assignments.sql",
    "21_remove_deprecated_user_roles.sql",
    "22_evidence_based_questions_swift_2025.sql",
    "23_evidence_based_questions_swift_2026.sql",
    "24_seed_evidence_questions_swift_2025.sql",
    "25_seed_evidence_questions_swift_2026.sql",
    "26_add_a5_all_esm.sql",
    "27_add_guide_and_show_when_swift_2026.sql",
]

# Data load scripts (run from repo root)
LOAD_SCRIPTS = [
    "backend/sql/scripts/load_2026_cei.py",
    "backend/sql/scripts/load_2026_esm.py",
    "backend/sql/scripts/load_2026_reviewer_checklist.py",
    "backend/sql/scripts/update_swift_2025_esm_json.py",
]


def load_db_config():
    """Load DB URL from backend app config."""
    sys.path.insert(0, str(BACKEND_DIR))
    try:
        from app.config import settings
        return settings.database_url
    except Exception as e:
        print(f"Could not load app config: {e}", file=sys.stderr)
        print("Ensure backend/.env exists or set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.", file=sys.stderr)
        sys.exit(1)


def run_sql_migrations(database_url: str, dry_run: bool) -> bool:
    """Run SQL migration files 01–14 in order. Returns True if all succeeded."""
    try:
        import psycopg2
    except ImportError:
        print("Install psycopg2: pip install psycopg2-binary", file=sys.stderr)
        return False

    for name in SQL_MIGRATIONS:
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
            except Exception as e:
                conn.rollback()
                print(f"  ERROR in {name}: {e}", file=sys.stderr)
                conn.close()
                return False
            finally:
                conn.close()
        except Exception as e:
            print(f"  ERROR running {name}: {e}", file=sys.stderr)
            return False
    return True


def run_load_scripts(dry_run: bool) -> bool:
    """Run 2026 CEI/ESM/reviewer checklist and Swift 2025 ESM JSON scripts. Returns True if all succeeded."""
    python = sys.executable
    env = os.environ.copy()
    # Ensure backend is importable when scripts run
    env.setdefault("PYTHONPATH", str(BACKEND_DIR))
    if "PYTHONPATH" in env and str(REPO_ROOT) not in env["PYTHONPATH"]:
        env["PYTHONPATH"] = f"{REPO_ROOT}{os.pathsep}{env['PYTHONPATH']}"

    for rel_path in LOAD_SCRIPTS:
        script_path = REPO_ROOT / rel_path
        if not script_path.exists():
            print(f"  SKIP (not found): {rel_path}")
            continue
        if dry_run:
            print(f"  [dry-run] would run: {rel_path}")
            continue
        print(f"  Running {rel_path} ...")
        try:
            result = subprocess.run(
                [python, str(script_path)],
                cwd=REPO_ROOT,
                env=env,
                capture_output=False,
                text=True,
            )
            if result.returncode != 0:
                print(f"  ERROR: {rel_path} exited with code {result.returncode}", file=sys.stderr)
                return False
        except Exception as e:
            print(f"  ERROR running {rel_path}: {e}", file=sys.stderr)
            return False
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run schema migrations (01-14) and data load scripts for SWIFT 2025/2026.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be run without executing.",
    )
    parser.add_argument(
        "--skip-sql",
        action="store_true",
        help="Skip SQL migrations (only run load scripts).",
    )
    parser.add_argument(
        "--skip-loads",
        action="store_true",
        help="Skip data load scripts (only run SQL migrations).",
    )
    args = parser.parse_args()

    print("Schema and data migration (SWIFT 2025/2026)")
    print("=" * 50)

    database_url = load_db_config()
    # Redact password in log
    safe_url = "postgresql://...@.../..." if "@" in database_url else database_url
    print(f"Database: {safe_url}")
    print()

    if not args.skip_sql:
        print("Step 1: SQL migrations (01 -> 14)")
        if not run_sql_migrations(database_url, args.dry_run):
            return 1
        print("  Done.")
        print()
    else:
        print("Step 1: SQL migrations skipped (--skip-sql)")
        print()

    if not args.skip_loads:
        print("Step 2: Data load scripts (2026 CEI/ESM/reviewer, 2025 ESM JSON)")
        if not run_load_scripts(args.dry_run):
            return 1
        print("  Done.")
        print()
    else:
        print("Step 2: Data load scripts skipped (--skip-loads)")
        print()

    if args.dry_run:
        print("Dry run finished. Run without --dry-run to apply.")
    else:
        print("Migration finished. Next: start backend and verify (see docs/step-by-step-schema-and-migration.md).")
    return 0


if __name__ == "__main__":
    sys.exit(main())

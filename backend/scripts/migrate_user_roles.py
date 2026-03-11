#!/usr/bin/env python3
"""
Migrate user_role enum in swift_2025 and swift_2026 schemas to match frontend/backend.

Canonical roles (aligned with backend/app/constants.py, schemas/assessment.py, frontend/lib/types.ts):
  - admin
  - compliance_officer
  - it_sme
  - internal_reviewer_l1
  - internal_reviewer_l2
  - external_assessor  (L3; acts as approver)

Deprecated roles (mapped during migration):
  - internal_reviewer -> internal_reviewer_l1
  - approver -> external_assessor

Usage (from repo root):
  python backend/scripts/migrate_user_roles.py [--dry-run]

Requires: PostgreSQL, psycopg2, backend/.env or DB_* env vars.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Resolve paths
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent

# -----------------------------------------------------------------------------
# Canonical role definitions (must match backend + frontend)
# -----------------------------------------------------------------------------
VALID_USER_ROLES = (
    "admin",
    "compliance_officer",
    "it_sme",
    "internal_reviewer_l1",
    "internal_reviewer_l2",
    "external_assessor",
)

DEPRECATED_ROLE_MAP = {
    "internal_reviewer": "internal_reviewer_l1",
    "approver": "external_assessor",
}


def load_db_url() -> str:
    """Load database URL from backend app config."""
    sys.path.insert(0, str(BACKEND_DIR))
    try:
        from app.config import settings
        return settings.database_url
    except Exception as e:
        print(f"Could not load app config: {e}", file=sys.stderr)
        print("Ensure backend/.env exists or set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.", file=sys.stderr)
        sys.exit(1)


def get_enum_labels(conn, schema: str, type_name: str) -> list[str]:
    """Return list of enum labels for the given type in schema."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT e.enumlabel
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typname = %s AND n.nspname = %s
            ORDER BY e.enumsortorder
        """, (type_name, schema))
        return [row[0] for row in cur.fetchall()]


def enum_needs_migration(labels: list[str]) -> bool:
    """True if enum has deprecated values or is missing required values."""
    has_deprecated = any(r in DEPRECATED_ROLE_MAP for r in labels)
    missing_valid = any(r not in labels for r in VALID_USER_ROLES)
    return has_deprecated or missing_valid


def migrate_swift_2025(conn, dry_run: bool) -> bool:
    """
    Migrate swift_2025.user_role.
    core.users.role references swift_2025.user_role (users moved from swift_2025 to core).
    """
    labels = get_enum_labels(conn, "swift_2025", "user_role")
    if not labels:
        print("  swift_2025.user_role: not found (schema may not exist yet)")
        return True

    if not enum_needs_migration(labels):
        print("  swift_2025.user_role: already up to date")
        return True

    print("  swift_2025.user_role: migrating...")

    if dry_run:
        print("    [dry-run] would create user_role_new, alter column with USING, drop old, rename")
        return True

    with conn.cursor() as cur:
        # 1. Create new enum (idempotent: skip if already exists from partial run)
        cur.execute("""
            SELECT 1 FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typname = 'user_role_new' AND n.nspname = 'swift_2025'
        """)
        if not cur.fetchone():
            cur.execute("""
                CREATE TYPE swift_2025.user_role_new AS ENUM (
                    'admin', 'compliance_officer', 'it_sme',
                    'internal_reviewer_l1', 'internal_reviewer_l2', 'external_assessor'
                )
            """)

        altered_tables: list[tuple[str, str]] = []

        def alter_users_role(table_schema: str, table_name: str) -> None:
            """Alter role column: drop default, change type. Default restored after type rename."""
            full_name = f"{table_schema}.{table_name}"
            cur.execute(f"ALTER TABLE {full_name} ALTER COLUMN role DROP DEFAULT")
            cur.execute(f"""
                ALTER TABLE {full_name}
                ALTER COLUMN role TYPE swift_2025.user_role_new
                USING (
                    CASE role::text
                        WHEN 'internal_reviewer' THEN 'internal_reviewer_l1'::swift_2025.user_role_new
                        WHEN 'approver' THEN 'external_assessor'::swift_2025.user_role_new
                        ELSE role::text::swift_2025.user_role_new
                    END
                )
            """)
            altered_tables.append((table_schema, table_name))
            print(f"    {full_name}.role: altered")

        # 2. Alter core.users (if exists and uses user_role enum from swift_2025)
        cur.execute("""
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_schema = 'core' AND c.table_name = 'users' AND c.column_name = 'role'
              AND c.udt_schema = 'swift_2025' AND c.udt_name = 'user_role'
        """)
        if cur.fetchone():
            alter_users_role("core", "users")

        # 3. Alter swift_2025.users (if exists, pre-12 migration)
        cur.execute("""
            SELECT 1 FROM information_schema.tables t
            JOIN information_schema.columns c ON c.table_schema = t.table_schema AND c.table_name = t.table_name
            WHERE t.table_schema = 'swift_2025' AND t.table_name = 'users'
              AND c.column_name = 'role' AND c.udt_schema = 'swift_2025' AND c.udt_name = 'user_role'
        """)
        if cur.fetchone():
            alter_users_role("swift_2025", "users")

        # 4. Drop old enum and rename new (only if not already done)
        cur.execute("""
            SELECT 1 FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typname = 'user_role' AND n.nspname = 'swift_2025'
        """)
        if cur.fetchone():
            cur.execute("DROP TYPE swift_2025.user_role")
            cur.execute("ALTER TYPE swift_2025.user_role_new RENAME TO user_role")
            print("    swift_2025.user_role: replaced")

        # 5. Restore default on role column (after type rename)
        for schema, tbl in altered_tables:
            cur.execute(f"ALTER TABLE {schema}.{tbl} ALTER COLUMN role SET DEFAULT 'it_sme'::swift_2025.user_role")
            print(f"    {schema}.{tbl}.role: default restored")

    return True


def migrate_swift_2026(conn, dry_run: bool) -> bool:
    """
    Migrate swift_2026.user_role.
    This enum is typically not used by any table (core.users uses swift_2025.user_role).
    We drop and recreate for consistency.
    """
    # Check if swift_2026 schema exists
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 1 FROM information_schema.schemata WHERE schema_name = 'swift_2026'
        """)
        if not cur.fetchone():
            print("  swift_2026.user_role: schema swift_2026 not found (skip)")
            return True

    labels = get_enum_labels(conn, "swift_2026", "user_role")
    if not labels:
        print("  swift_2026.user_role: not found (schema may not exist yet)")
        return True

    if not enum_needs_migration(labels):
        print("  swift_2026.user_role: already up to date")
        return True

    print("  swift_2026.user_role: migrating...")

    if dry_run:
        print("    [dry-run] would drop and recreate swift_2026.user_role")
        return True

    with conn.cursor() as cur:
        # swift_2026.user_role is typically unused; safe to drop and recreate
        try:
            cur.execute("DROP TYPE swift_2026.user_role")
        except Exception as e:
            if "depends on" in str(e).lower():
                print(f"    WARNING: swift_2026.user_role is in use; skipping. Error: {e}")
                return True
            raise

        cur.execute("""
            CREATE TYPE swift_2026.user_role AS ENUM (
                'admin', 'compliance_officer', 'it_sme',
                'internal_reviewer_l1', 'internal_reviewer_l2', 'external_assessor'
            )
        """)
        print("    swift_2026.user_role: recreated")

    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Migrate user_role enum in swift_2025 and swift_2026 to match frontend/backend."
    )
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")
    args = parser.parse_args()

    try:
        import psycopg2
    except ImportError:
        print("Install psycopg2: pip install psycopg2-binary", file=sys.stderr)
        return 1

    db_url = load_db_url()
    safe_url = "postgresql://...@.../..." if "@" in db_url else db_url
    print(f"Database: {safe_url}")
    print("Migrating user_role enum (swift_2025, swift_2026)...")
    if args.dry_run:
        print("[DRY RUN - no changes will be made]")
    print()

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False
        try:
            if not migrate_swift_2025(conn, args.dry_run):
                return 1
            conn.commit()

            conn.autocommit = False
            if not migrate_swift_2026(conn, args.dry_run):
                return 1
            conn.commit()

            print()
            print("Done.")
        except Exception as e:
            conn.rollback()
            print(f"ERROR: {e}", file=sys.stderr)
            return 1
        finally:
            conn.close()
    except Exception as e:
        print(f"Connection failed: {e}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())

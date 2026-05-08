"""
Run a PostgreSQL SQL backup file against a target database instance.

Usage examples:
    python db_migration.py
    python db_migration.py --sql-file DB_backup_compliance_backup.sql
    python db_migration.py --host 34.171.237.58 --port 5432 --db-name compliance
"""

from __future__ import annotations

import argparse
import io
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


# Default updated configuration (can be overridden by CLI args or env vars)
DEFAULT_DB_HOST = "34.171.237.58"
DEFAULT_DB_PORT = 5432
DEFAULT_DB_NAME = "compliance"
DEFAULT_DB_USER = "postgres"
DEFAULT_DB_PASSWORD = "Compliance_Audit01"
DEFAULT_DB_USER_APP = "compliance-audit01"
DEFAULT_SQL_FILE = Path(__file__).with_name("DB_backup_compliance_backup.sql")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Apply a SQL backup file directly to a PostgreSQL instance."
    )
    parser.add_argument(
        "--sql-file",
        type=Path,
        default=Path(os.getenv("SQL_FILE", str(DEFAULT_SQL_FILE))),
        help="Path to the .sql file to execute.",
    )
    parser.add_argument(
        "--host",
        default=os.getenv("DB_HOST", DEFAULT_DB_HOST),
        help="Database host.",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("DB_PORT", str(DEFAULT_DB_PORT))),
        help="Database port.",
    )
    parser.add_argument(
        "--db-name",
        default=os.getenv("DB_NAME", DEFAULT_DB_NAME),
        help="Database name.",
    )
    parser.add_argument(
        "--user",
        default=os.getenv("DB_USER", DEFAULT_DB_USER),
        help="Database admin user (used for restore).",
    )
    parser.add_argument(
        "--password",
        default=os.getenv("DB_PASSWORD", DEFAULT_DB_PASSWORD),
        help="Database user password.",
    )
    parser.add_argument(
        "--app-user",
        default=os.getenv("DB_USER_APP", DEFAULT_DB_USER_APP),
        help="App DB user (informational only).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print command and exit without applying SQL.",
    )
    parser.add_argument(
        "--method",
        choices=["auto", "psql", "psycopg"],
        default=os.getenv("DB_RESTORE_METHOD", "auto"),
        help="Restore method. auto=psql if available else psycopg.",
    )
    parser.add_argument(
        "--clean-existing",
        dest="clean_existing",
        action="store_true",
        default=os.getenv("DB_CLEAN_EXISTING", "true").lower() in {"1", "true", "yes"},
        help="Drop schemas found in dump before restore (default: enabled).",
    )
    parser.add_argument(
        "--no-clean-existing",
        dest="clean_existing",
        action="store_false",
        help="Do not drop existing schemas before restore.",
    )
    return parser.parse_args()


def ensure_sql_file(sql_file: Path) -> None:
    if not sql_file.exists():
        raise FileNotFoundError(f"SQL file not found: {sql_file}")
    if sql_file.suffix.lower() != ".sql":
        raise ValueError(f"Expected a .sql file, got: {sql_file}")


def has_psql() -> bool:
    return shutil.which("psql") is not None


def should_skip_non_sql_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False

    # pg_dump/session meta commands that are meant for psql client
    if stripped.startswith("\\restrict") or stripped.startswith("\\unrestrict"):
        return True

    # Skip env-style assignments often mistaken as SQL.
    if "=" in stripped and not stripped.upper().startswith("SET "):
        key = stripped.split("=", 1)[0].strip()
        if key and key.replace("_", "").isalnum() and key.upper() == key:
            return True

    return False


def execute_dump_with_copy_support(cur, sql_file: Path) -> None:
    """
    Execute a pg_dump plain SQL file without psql by handling COPY FROM stdin blocks.
    """
    dollar_quote_tag: str | None = None
    statement_parts: list[str] = []
    copy_command: str | None = None
    copy_data_parts: list[str] = []

    def execute_if_sql(statement_text: str) -> None:
        candidate = statement_text.strip()
        if not candidate:
            return

        # Remove single-line comments to detect effectively empty statements.
        uncommented_lines = []
        for line in candidate.splitlines():
            stripped = line.strip()
            if stripped.startswith("--"):
                continue
            uncommented_lines.append(line)
        candidate_no_line_comments = "\n".join(uncommented_lines).strip()
        if not candidate_no_line_comments:
            return
        if candidate_no_line_comments.strip(";").strip() == "":
            return

        cur.execute(statement_text)

    with sql_file.open("r", encoding="utf-8", errors="replace") as handle:
        for raw_line in handle:
            if copy_command is not None:
                if raw_line.rstrip("\r\n") == "\\.":
                    copy_data = "".join(copy_data_parts)
                    cur.copy_expert(copy_command, io.StringIO(copy_data))
                    copy_command = None
                    copy_data_parts = []
                else:
                    copy_data_parts.append(raw_line)
                continue

            if should_skip_non_sql_line(raw_line):
                continue

            stripped = raw_line.strip()
            if stripped.upper().startswith("COPY ") and " FROM stdin;" in raw_line:
                if statement_parts:
                    statement_sql = "".join(statement_parts)
                    execute_if_sql(statement_sql)
                    statement_parts = []
                copy_command = raw_line.strip()
                continue

            statement_parts.append(raw_line)

            for tag in re.findall(r"\$[A-Za-z0-9_]*\$", raw_line):
                if dollar_quote_tag is None:
                    dollar_quote_tag = tag
                elif dollar_quote_tag == tag:
                    dollar_quote_tag = None

            if dollar_quote_tag is None and stripped.endswith(";"):
                statement_sql = "".join(statement_parts)
                execute_if_sql(statement_sql)
                statement_parts = []

    if copy_command is not None:
        raise RuntimeError("Unexpected EOF: COPY data block was not terminated with '\\.'.")

    if statement_parts:
        statement_sql = "".join(statement_parts)
        execute_if_sql(statement_sql)


def quote_ident(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def extract_dump_schemas(sql_file: Path) -> list[str]:
    """
    Parse schema names from pg_dump lines like:
    CREATE SCHEMA artifact_registry;
    CREATE SCHEMA "my-schema";
    """
    schemas: list[str] = []
    seen: set[str] = set()
    schema_re = re.compile(r'^\s*CREATE\s+SCHEMA\s+("([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*;')

    with sql_file.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            match = schema_re.match(line)
            if not match:
                continue
            schema_name = match.group(2) or match.group(3)
            if not schema_name:
                continue
            if schema_name in {"pg_catalog", "information_schema"}:
                continue
            if schema_name not in seen:
                seen.add(schema_name)
                schemas.append(schema_name)
    return schemas


def clean_existing_schemas(cur, sql_file: Path) -> None:
    schemas = extract_dump_schemas(sql_file)
    if not schemas:
        return

    print(f"Clean existing enabled: dropping {len(schemas)} schemas from target DB.")
    for schema in schemas:
        cur.execute(f"DROP SCHEMA IF EXISTS {quote_ident(schema)} CASCADE;")


def build_psql_command(args: argparse.Namespace) -> list[str]:
    return [
        "psql",
        "-h",
        args.host,
        "-p",
        str(args.port),
        "-U",
        args.user,
        "-d",
        args.db_name,
        "-v",
        "ON_ERROR_STOP=1",
        "-f",
        str(args.sql_file),
    ]


def run_restore_with_psql(args: argparse.Namespace) -> int:
    if not has_psql():
        raise EnvironmentError(
            "psql command not found. Install PostgreSQL client tools and ensure psql is in PATH."
        )
    cmd = build_psql_command(args)

    safe_cmd_for_logs = " ".join(cmd)
    print("Starting DB restore...")
    print(f"Host: {args.host}:{args.port}")
    print(f"Database: {args.db_name}")
    print(f"User: {args.user}")
    print(f"App User (info): {args.app_user}")
    print(f"SQL File: {args.sql_file}")
    print(f"Command: {safe_cmd_for_logs}")

    if args.dry_run:
        print("Dry run enabled; no changes were applied.")
        return 0

    env = os.environ.copy()
    env["PGPASSWORD"] = args.password

    process = subprocess.run(cmd, env=env, text=True, capture_output=True)
    if process.returncode == 0:
        print("Restore completed successfully.")
        if process.stdout.strip():
            print(process.stdout)
        return 0

    print("Restore failed.")
    if process.stdout.strip():
        print("STDOUT:")
        print(process.stdout)
    if process.stderr.strip():
        print("STDERR:")
        print(process.stderr, file=sys.stderr)
    return process.returncode


def run_restore_with_psycopg(args: argparse.Namespace) -> int:
    try:
        import psycopg  # type: ignore

        driver = "psycopg"
    except ImportError:
        try:
            import psycopg2  # type: ignore

            psycopg = None  # type: ignore[assignment]
            driver = "psycopg2"
        except ImportError as exc:
            raise ImportError(
                "Python PostgreSQL driver not found. Install one with "
                "'pip install psycopg[binary]' (recommended) or 'pip install psycopg2-binary'."
            ) from exc

    print("Starting DB restore...")
    print(f"Host: {args.host}:{args.port}")
    print(f"Database: {args.db_name}")
    print(f"User: {args.user}")
    print(f"App User (info): {args.app_user}")
    print(f"SQL File: {args.sql_file}")
    print(f"Method: {driver}")
    print(f"Clean Existing: {args.clean_existing}")

    if args.dry_run:
        print("Dry run enabled; no changes were applied.")
        return 0

    if driver == "psycopg":
        conn_str = (
            f"host={args.host} port={args.port} dbname={args.db_name} "
            f"user={args.user} password={args.password}"
        )
        with psycopg.connect(conn_str, autocommit=True) as conn:  # type: ignore[union-attr]
            with conn.cursor() as cur:
                if args.clean_existing:
                    clean_existing_schemas(cur, args.sql_file)
                execute_dump_with_copy_support(cur, args.sql_file)
    else:
        conn = psycopg2.connect(  # type: ignore[name-defined]
            host=args.host,
            port=args.port,
            dbname=args.db_name,
            user=args.user,
            password=args.password,
        )
        conn.autocommit = True
        try:
            with conn.cursor() as cur:
                if args.clean_existing:
                    clean_existing_schemas(cur, args.sql_file)
                execute_dump_with_copy_support(cur, args.sql_file)
        finally:
            conn.close()

    print("Restore completed successfully.")
    return 0


def run_restore(args: argparse.Namespace) -> int:
    ensure_sql_file(args.sql_file)
    method = args.method

    if method == "psql":
        return run_restore_with_psql(args)
    if method == "psycopg":
        return run_restore_with_psycopg(args)

    # auto mode
    if has_psql():
        print("Auto mode selected: using psql.")
        return run_restore_with_psql(args)

    print("Auto mode selected: psql not found, falling back to psycopg.")
    return run_restore_with_psycopg(args)


def main() -> None:
    try:
        args = parse_args()
        exit_code = run_restore(args)
        sys.exit(exit_code)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

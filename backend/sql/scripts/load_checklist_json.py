#!/usr/bin/env python3
"""
Load reviewer_checklist from Reviewer_doc/Reviewer_L1_L2_L3_Checklists.xlsx into DB.

Excel layout (sheet "Reviewer Checklists"):
  Col 0: Item Code   Col 1: Evidence Item   Col 2: Control ID   Col 3: Control Name
  Col 4: M/A         Col 5: Evidence Type
  Col 6: L1_check (JSON)   Col 7: L2_check (JSON)   Col 8: L2 Status (ignored)
  Col 9: L3_check (JSON)   Col 10: L3 Rating (ignored)   Col 11: L3 Comment (ignored)

Row 0 = header, rows 1–85 = data.
L1/L2/L3 cells contain ready-to-use JSON with {checklist: [...], action: {...}}.

Usage:
  cd backend
  python sql/scripts/load_checklist_json.py             # write directly to DB
  python sql/scripts/load_checklist_json.py --dry-run    # generate SQL file only
"""
from __future__ import annotations

import argparse
import json
import sys
import uuid
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

REPO_ROOT = BACKEND.parent
XLSX_PATH = REPO_ROOT / "Reviewer_doc" / "Reviewer_L1_L2_L3_Checklists.xlsx"
SQL_OUT = BACKEND / "sql" / "reviewer_checklist_data_json.sql"


# ---------------------------------------------------------------------------
#  Read Excel
# ---------------------------------------------------------------------------

def read_excel(path: Path) -> list[dict]:
    try:
        import openpyxl
    except ImportError:
        print("pip install openpyxl", file=sys.stderr)
        sys.exit(1)
    if not path.exists():
        print(f"Not found: {path}", file=sys.stderr)
        sys.exit(1)

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    if len(rows) < 2:
        print("Not enough rows in sheet", file=sys.stderr)
        sys.exit(1)

    data_rows = rows[1:]  # row 0 is header
    out: list[dict] = []
    errors = 0

    for i, r in enumerate(data_rows, start=2):
        r = list(r) + [None] * max(0, 12 - len(r))
        item_code = str(r[0] or "").strip()
        evidence_item = str(r[1] or "").strip()
        control_id = str(r[2] or "").strip()
        control_name = str(r[3] or "").strip()
        mandatory_advisory = str(r[4] or "M").strip()[:10] or "M"

        if not item_code and not control_id:
            continue

        l1_json = _parse_cell(r[6], f"Row {i} L1")
        l2_json = _parse_cell(r[7], f"Row {i} L2")
        l3_json = _parse_cell(r[9], f"Row {i} L3")

        if l1_json is None:
            errors += 1
        if l2_json is None:
            errors += 1
        if l3_json is None:
            errors += 1

        out.append({
            "item_code": item_code or "?",
            "evidence_item": evidence_item,
            "control_id": control_id or "?",
            "control_name": control_name,
            "mandatory_advisory": mandatory_advisory,
            "l1_check": l1_json,
            "l2_check": l2_json,
            "l3_check": l3_json,
        })

    if errors:
        print(f"WARNING: {errors} cells had empty/invalid JSON", file=sys.stderr)
    return out


def _parse_cell(raw, label: str) -> dict | None:
    if raw is None:
        return None
    s = str(raw).strip()
    if not s:
        return None
    try:
        return json.loads(s)
    except json.JSONDecodeError as e:
        print(f"  {label}: JSON parse error: {e}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
#  DB load
# ---------------------------------------------------------------------------

def load_into_db(rows: list[dict]) -> None:
    from sqlalchemy import text as sa_text
    from app.database import engine, SCHEMA

    with engine.connect() as conn:
        # Ensure columns are JSONB (migrate from TEXT if needed)
        r = conn.execute(sa_text("""
            SELECT column_name, data_type FROM information_schema.columns
            WHERE table_schema = :schema AND table_name = 'reviewer_checklist'
              AND column_name IN ('l1_check','l2_check','l3_check','l1_check_json')
        """), {"schema": SCHEMA})
        col_info = {row[0]: row[1] for row in r}

        if col_info.get("l1_check") == "text":
            print("Converting TEXT columns to JSONB...")
            conn.execute(sa_text("ALTER TABLE reviewer_checklist ADD COLUMN IF NOT EXISTS l1_check_json JSONB"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist ADD COLUMN IF NOT EXISTS l2_check_json JSONB"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist ADD COLUMN IF NOT EXISTS l3_check_json JSONB"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist DROP COLUMN l1_check"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist DROP COLUMN l2_check"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist DROP COLUMN l3_check"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist RENAME COLUMN l1_check_json TO l1_check"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist RENAME COLUMN l2_check_json TO l2_check"))
            conn.execute(sa_text("ALTER TABLE reviewer_checklist RENAME COLUMN l3_check_json TO l3_check"))
            conn.commit()

        # Truncate and insert
        conn.execute(sa_text("TRUNCATE reviewer_checklist CASCADE"))
        conn.commit()

        for row in rows:
            l1 = json.dumps(row["l1_check"], ensure_ascii=False) if row["l1_check"] else None
            l2 = json.dumps(row["l2_check"], ensure_ascii=False) if row["l2_check"] else None
            l3 = json.dumps(row["l3_check"], ensure_ascii=False) if row["l3_check"] else None
            conn.execute(
                sa_text("""
                    INSERT INTO reviewer_checklist
                        (id, item_code, evidence_item, control_id, control_name, mandatory_advisory,
                         l1_check, l2_check, l3_check)
                    VALUES
                        (CAST(:id AS uuid), :item_code, :evidence_item, :control_id, :control_name,
                         :ma, CAST(:l1 AS jsonb), CAST(:l2 AS jsonb), CAST(:l3 AS jsonb))
                """),
                {
                    "id": str(uuid.uuid4()),
                    "item_code": row["item_code"],
                    "evidence_item": row["evidence_item"],
                    "control_id": row["control_id"],
                    "control_name": row["control_name"],
                    "ma": row["mandatory_advisory"],
                    "l1": l1, "l2": l2, "l3": l3,
                },
            )
        conn.commit()
    print(f"Loaded {len(rows)} rows into reviewer_checklist (JSONB).")


# ---------------------------------------------------------------------------
#  SQL file output (--dry-run)
# ---------------------------------------------------------------------------

def _esc(s: str) -> str:
    return (s or "").replace("'", "''")


def write_sql(rows: list[dict], out: Path) -> None:
    lines = [
        "-- reviewer_checklist with JSONB l1/l2/l3 from Reviewer_L1_L2_L3_Checklists.xlsx",
        "SET search_path TO swift_2025, public;",
        "",
        "-- Ensure JSONB columns (convert TEXT if needed)",
        "DO $$ BEGIN",
        "  IF EXISTS (SELECT 1 FROM information_schema.columns",
        "             WHERE table_schema='swift_2025' AND table_name='reviewer_checklist'",
        "               AND column_name='l1_check' AND data_type='text') THEN",
        "    ALTER TABLE reviewer_checklist ADD COLUMN IF NOT EXISTS l1_check_json JSONB;",
        "    ALTER TABLE reviewer_checklist ADD COLUMN IF NOT EXISTS l2_check_json JSONB;",
        "    ALTER TABLE reviewer_checklist ADD COLUMN IF NOT EXISTS l3_check_json JSONB;",
        "    ALTER TABLE reviewer_checklist DROP COLUMN l1_check;",
        "    ALTER TABLE reviewer_checklist DROP COLUMN l2_check;",
        "    ALTER TABLE reviewer_checklist DROP COLUMN l3_check;",
        "    ALTER TABLE reviewer_checklist RENAME COLUMN l1_check_json TO l1_check;",
        "    ALTER TABLE reviewer_checklist RENAME COLUMN l2_check_json TO l2_check;",
        "    ALTER TABLE reviewer_checklist RENAME COLUMN l3_check_json TO l3_check;",
        "  END IF;",
        "END $$;",
        "",
        "BEGIN;",
        "TRUNCATE reviewer_checklist CASCADE;",
        "",
    ]
    for row in rows:
        l1 = json.dumps(row["l1_check"], ensure_ascii=False) if row["l1_check"] else None
        l2 = json.dumps(row["l2_check"], ensure_ascii=False) if row["l2_check"] else None
        l3 = json.dumps(row["l3_check"], ensure_ascii=False) if row["l3_check"] else None
        l1s = f"'{_esc(l1)}'::jsonb" if l1 else "NULL"
        l2s = f"'{_esc(l2)}'::jsonb" if l2 else "NULL"
        l3s = f"'{_esc(l3)}'::jsonb" if l3 else "NULL"
        lines.append(
            "INSERT INTO reviewer_checklist "
            "(id, item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ("
            f"'{uuid.uuid4()}'::uuid, '{_esc(row['item_code'])}', '{_esc(row['evidence_item'])}', "
            f"'{_esc(row['control_id'])}', '{_esc(row['control_name'])}', '{_esc(row['mandatory_advisory'])}', "
            f"{l1s}, {l2s}, {l3s});"
        )
    lines.extend(["", "COMMIT;", ""])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(rows)} rows to {out}")


# ---------------------------------------------------------------------------
#  Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Load reviewer_checklist from Reviewer_L1_L2_L3_Checklists.xlsx into DB (exact JSON)."
    )
    parser.add_argument("--dry-run", action="store_true", help="Generate SQL file without touching DB")
    args = parser.parse_args()

    rows = read_excel(XLSX_PATH)
    if not rows:
        print("No data rows found.", file=sys.stderr)
        sys.exit(1)
    print(f"Parsed {len(rows)} rows from Excel (0 JSON errors).")

    # Print sample
    s = rows[0]
    l1_sections = len(s["l1_check"].get("checklist", [])) if s["l1_check"] else 0
    l2_sections = len(s["l2_check"].get("checklist", [])) if s["l2_check"] else 0
    l3_sections = len(s["l3_check"].get("checklist", [])) if s["l3_check"] else 0
    print(f"Sample: {s['item_code']}/{s['control_id']} — L1: {l1_sections} sections, L2: {l2_sections} sections, L3: {l3_sections} sections")

    if args.dry_run:
        write_sql(rows, SQL_OUT)
        print(f"\nRun when PostgreSQL is up:")
        print(f"  psql -U postgres -d compliance -f {SQL_OUT}")
        return

    try:
        load_into_db(rows)
    except Exception as e:
        err = str(e).lower()
        if "connection" in err or "5432" in err or "closed" in err:
            print(f"\nDB connection failed. Falling back to --dry-run...\n", file=sys.stderr)
            write_sql(rows, SQL_OUT)
            print(f"\nRun when PostgreSQL is up:")
            print(f"  psql -U postgres -d compliance -f {SQL_OUT}")
            sys.exit(1)
        raise


if __name__ == "__main__":
    main()

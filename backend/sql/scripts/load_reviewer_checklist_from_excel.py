#!/usr/bin/env python3
"""
Load reviewer_checklist from Reviewer_doc/Reviewer.xlsx and update the DB.
Expects Excel columns: item_code, evidence_item, control_id, control_name, mandatory_advisory,
l1_check, l2_check, l3_check (values as JSON strings). Optional: id, cscf_version.
Also supports legacy layout: Item Code, Evidence Item, Control ID, Control Name, M/A, L1, L2, L3.
Repairs common JSON issues (e.g. L3 array items split at commas) and writes JSONB to DB.

Run from repo root: python backend/sql/scripts/load_reviewer_checklist_from_excel.py
Requires: openpyxl, and DB with reviewer_checklist (l1_check, l2_check, l3_check as JSONB).
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import uuid
from pathlib import Path

# backend/app
BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))


# -----------------------------------------------------------------------------
# JSON repair: merge wrongly split items in L3 (and L2) arrays
# -----------------------------------------------------------------------------

def _repair_l3_array(arr: list[str], merge_patterns: list[tuple[str, str]]) -> list[str]:
    """Merge consecutive items that match (prev_suffix, curr_prefix) patterns."""
    if not arr or not merge_patterns:
        return arr
    out: list[str] = []
    i = 0
    while i < len(arr):
        current = arr[i].strip()
        merged = False
        for prev_suffix, curr_prefix in merge_patterns:
            if out and out[-1].strip().endswith(prev_suffix) and current.startswith(curr_prefix):
                out[-1] = (out[-1].strip() + ", " + current).strip()
                merged = True
                break
        if not merged:
            out.append(arr[i])
        i += 1
    return out


# Patterns: (previous line ends with, current line starts with) -> merge
L3_INDEPENDENT_VERIFY_MERGE = [
    ("dedicated inside", "purpose outside"),
    ("dedicated inside", "general-purpose outside"),
    ("All inter", "component data flows"),
    ("Protocol type annotated", "Cross"),
    ("Cross", "environment flows"),
    ("Cross", "environment"),
]
L3_CROSS_CHECK_MERGE = [
    ("confirm deny", "outbound for internet"),
    ("confirm deny-outbound", "outbound for internet"),
]


def _normalize_merged_l3_item(s: str) -> str:
    """Fix common merged strings (e.g. 'Cross, environment' -> 'Cross-environment')."""
    s = s.replace("Cross, environment", "Cross-environment")
    s = s.replace("confirm deny, outbound", "confirm deny-outbound")
    return s


def repair_l3_json(obj: dict) -> dict:
    """Repair L3 check JSON: merge split items in independent_verify and cross_check_validation."""
    if not isinstance(obj, dict):
        return obj
    out = dict(obj)
    for key in ("independent_verify", "cross_check_validation"):
        if key not in out or not isinstance(out[key], list):
            continue
        arr = [str(x).strip() for x in out[key] if x]
        patterns = L3_INDEPENDENT_VERIFY_MERGE if key == "independent_verify" else L3_CROSS_CHECK_MERGE
        arr = _repair_l3_array(arr, patterns)
        out[key] = [_normalize_merged_l3_item(x) for x in arr]
    return out


def repair_l2_json(obj: dict) -> dict:
    """Repair L2: ensure must_show, pass_criteria, fail_criteria, cross_checks are lists of strings."""
    if not isinstance(obj, dict):
        return obj
    out = dict(obj)
    for key in ("must_show", "pass_criteria", "fail_criteria", "cross_checks"):
        if key not in out:
            continue
        val = out[key]
        if isinstance(val, list):
            out[key] = [str(x).strip() for x in val if x]
        elif isinstance(val, str):
            out[key] = [x.strip() for x in val.split("|") if x.strip()]
    return out


def parse_and_repair_json(raw: str | None, level: str) -> dict | None:
    """Parse JSON string and repair structure. level in ('L1','L2','L3')."""
    if raw is None:
        return None
    s = (raw if isinstance(raw, str) else str(raw)).strip()
    if not s:
        return None
    try:
        obj = json.loads(s)
    except json.JSONDecodeError:
        return None
    if not isinstance(obj, dict):
        return None
    if level == "L3":
        obj = repair_l3_json(obj)
    elif level == "L2":
        obj = repair_l2_json(obj)
    return obj


# -----------------------------------------------------------------------------
# Excel reading with header detection
# -----------------------------------------------------------------------------

def _normalize_header(cell: str | None) -> str:
    if cell is None:
        return ""
    return str(cell).strip().lower().replace(" ", "_").replace("-", "_")


# Map possible header names to canonical key
HEADER_ALIASES = {
    "item_code": ("item_code", "itemcode"),
    "evidence_item": ("evidence_item", "evidenceitem"),
    "control_id": ("control_id", "controlid"),
    "control_name": ("control_name", "controlname"),
    "mandatory_advisory": ("mandatory_advisory", "m/a", "ma", "mandatory_advisory"),
    "l1_check": ("l1_check", "l1", "l1check"),
    "l2_check": ("l2_check", "l2", "l2check"),
    "l3_check": ("l3_check", "l3", "l3check"),
    "id": ("id",),
    "cscf_version": ("cscf_version", "cscfversion"),
}


def _find_column_index(header_row: list, canonical: str) -> int | None:
    aliases = set(HEADER_ALIASES.get(canonical, (canonical,)))
    aliases.add(canonical.replace("_", ""))
    for idx, cell in enumerate(header_row):
        h = _normalize_header(cell)
        if not h:
            continue
        if h in aliases or h.replace("_", "") in {a.replace("_", "") for a in aliases}:
            return idx
    return None


def _detect_layout(rows: list) -> tuple[int, dict[str, int]]:
    """Return (header_row_index, column_map). column_map: canonical_name -> col_index."""
    # Try first 5 rows for header
    for row_idx in range(min(5, len(rows))):
        row = [str(c).strip() if c is not None else "" for c in rows[row_idx]]
        nc = _normalize_header(row[0]) if row else ""
        # Legacy: first column is "Item Code" or similar
        if "item" in nc and "code" in nc:
            return row_idx, {
                "item_code": 0,
                "evidence_item": 1,
                "control_id": 2,
                "control_name": 3,
                "mandatory_advisory": 4,
                "l1_check": 5,
                "l2_check": 6,
                "l3_check": 8 if len(row) > 8 else 7,
            }
        # New: header has id, item_code, evidence_item, ...
        col_map = {}
        for key in ("id", "item_code", "evidence_item", "control_id", "control_name", "mandatory_advisory", "l1_check", "l2_check", "l3_check"):
            idx = _find_column_index(row, key)
            if idx is not None:
                col_map[key] = idx
        if "item_code" in col_map and "l1_check" in col_map:
            return row_idx, col_map
    raise ValueError("Could not detect Excel header layout (expect 'Item Code' or 'item_code', 'l1_check', etc.)")


def read_excel(path: Path) -> list[dict]:
    """Read Reviewer.xlsx and return list of row dicts with keys item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check (parsed JSON)."""
    try:
        import openpyxl
    except ImportError:
        print("Install openpyxl: pip install openpyxl", file=sys.stderr)
        sys.exit(1)
    if not path.exists():
        print(f"File not found: {path}", file=sys.stderr)
        sys.exit(1)

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    if len(rows) < 2:
        return []

    header_idx, col_map = _detect_layout(rows)
    data_rows = rows[header_idx + 1:]
    out = []
    for r in data_rows:
        while len(r) < max(col_map.values()) + 1:
            r = r + (None,)
        item_code = (r[col_map["item_code"]] or "").strip() or None
        evidence_item = (r[col_map["evidence_item"]] or "").strip() or ""
        control_id = (r[col_map["control_id"]] or "").strip() or None
        control_name = (r[col_map["control_name"]] or "").strip() or ""
        mandatory_advisory = (r[col_map["mandatory_advisory"]] or "M").strip()[:10] or "M"
        l1_raw = r[col_map["l1_check"]]
        l2_raw = r[col_map["l2_check"]]
        l3_raw = r[col_map["l3_check"]]

        if not item_code and not control_id:
            continue

        l1_json = parse_and_repair_json(l1_raw, "L1")
        l2_json = parse_and_repair_json(l2_raw, "L2")
        l3_json = parse_and_repair_json(l3_raw, "L3")

        row_id = None
        if "id" in col_map and r[col_map["id"]]:
            try:
                row_id = str(r[col_map["id"]]).strip()
                uuid.UUID(row_id)
            except (ValueError, TypeError):
                row_id = None

        out.append({
            "id": row_id,
            "item_code": item_code or "?",
            "evidence_item": evidence_item,
            "control_id": control_id or "?",
            "control_name": control_name,
            "mandatory_advisory": mandatory_advisory,
            "l1_check": l1_json,
            "l2_check": l2_json,
            "l3_check": l3_json,
        })
    return out


# -----------------------------------------------------------------------------
# DB update
# -----------------------------------------------------------------------------

def ensure_jsonb_columns(conn) -> None:
    """Ensure l1_check, l2_check, l3_check are JSONB. If they are TEXT, add _json columns, drop TEXT, rename."""
    from sqlalchemy import text
    from app.database import SCHEMA
    r = conn.execute(text("""
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = :schema AND table_name = 'reviewer_checklist' AND column_name = 'l1_check'
    """), {"schema": SCHEMA})
    dt = r.scalar()
    if dt == "text":
        conn.execute(text("""
            ALTER TABLE reviewer_checklist
            ADD COLUMN IF NOT EXISTS l1_check_json JSONB,
            ADD COLUMN IF NOT EXISTS l2_check_json JSONB,
            ADD COLUMN IF NOT EXISTS l3_check_json JSONB
        """))
        conn.commit()
        conn.execute(text("ALTER TABLE reviewer_checklist DROP COLUMN l1_check"))
        conn.execute(text("ALTER TABLE reviewer_checklist DROP COLUMN l2_check"))
        conn.execute(text("ALTER TABLE reviewer_checklist DROP COLUMN l3_check"))
        conn.execute(text("ALTER TABLE reviewer_checklist RENAME COLUMN l1_check_json TO l1_check"))
        conn.execute(text("ALTER TABLE reviewer_checklist RENAME COLUMN l2_check_json TO l2_check"))
        conn.execute(text("ALTER TABLE reviewer_checklist RENAME COLUMN l3_check_json TO l3_check"))
        conn.commit()


def load_into_db(rows: list[dict], truncate_first: bool = True) -> None:
    from sqlalchemy import text
    from app.database import engine, SCHEMA

    with engine.connect() as conn:
        ensure_jsonb_columns(conn)
        if truncate_first:
            conn.execute(text("TRUNCATE reviewer_checklist CASCADE"))
            conn.commit()
        for row in rows:
            l1 = json.dumps(row["l1_check"]) if row["l1_check"] else None
            l2 = json.dumps(row["l2_check"]) if row["l2_check"] else None
            l3 = json.dumps(row["l3_check"]) if row["l3_check"] else None
            row_id = row["id"]
            if not row_id:
                row_id = str(uuid.uuid4())
            conn.execute(
                text("""
                    INSERT INTO reviewer_checklist (id, item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check)
                    VALUES (CAST(:id AS uuid), :item_code, :evidence_item, :control_id, :control_name, :mandatory_advisory, CAST(:l1 AS jsonb), CAST(:l2 AS jsonb), CAST(:l3 AS jsonb))
                """),
                {
                    "id": row_id,
                    "item_code": row["item_code"],
                    "evidence_item": row["evidence_item"],
                    "control_id": row["control_id"],
                    "control_name": row["control_name"],
                    "mandatory_advisory": row["mandatory_advisory"],
                    "l1": l1,
                    "l2": l2,
                    "l3": l3,
                },
            )
        conn.commit()
    print(f"Loaded {len(rows)} rows into reviewer_checklist.")


def _sql_esc(s: str) -> str:
    """Escape single quotes for SQL literal."""
    return (s or "").replace("\\", "\\\\").replace("'", "''")


def write_sql_file(rows: list[dict], out_path: Path) -> None:
    """Write INSERT statements to a SQL file (for use with --dry-run or when DB is unavailable)."""
    lines = [
        "-- Reviewer checklist from Reviewer_doc/Reviewer.xlsx (generated, run in swift_2025)",
        "SET search_path TO swift_2025, public;",
        "",
        "BEGIN;",
        "TRUNCATE reviewer_checklist CASCADE;",
        "",
    ]
    for row in rows:
        row_id = row["id"] or str(uuid.uuid4())
        l1 = json.dumps(row["l1_check"], ensure_ascii=False) if row["l1_check"] else None
        l2 = json.dumps(row["l2_check"], ensure_ascii=False) if row["l2_check"] else None
        l3 = json.dumps(row["l3_check"], ensure_ascii=False) if row["l3_check"] else None
        l1_sql = f"'{_sql_esc(l1)}'::jsonb" if l1 is not None else "NULL"
        l2_sql = f"'{_sql_esc(l2)}'::jsonb" if l2 is not None else "NULL"
        l3_sql = f"'{_sql_esc(l3)}'::jsonb" if l3 is not None else "NULL"
        lines.append(
            "INSERT INTO reviewer_checklist (id, item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) "
            f"VALUES ('{row_id}'::uuid, "
            f"'{_sql_esc(row['item_code'])}', "
            f"'{_sql_esc(row['evidence_item'])}', "
            f"'{_sql_esc(row['control_id'])}', "
            f"'{_sql_esc(row['control_name'])}', "
            f"'{_sql_esc(row['mandatory_advisory'])}', "
            f"{l1_sql}, {l2_sql}, {l3_sql});"
        )
    lines.extend(["", "COMMIT;", ""])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(rows)} rows to {out_path} (dry-run; run this SQL when PostgreSQL is available).")


def main():
    parser = argparse.ArgumentParser(description="Load reviewer_checklist from Reviewer.xlsx into DB (or output SQL).")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Do not connect to DB; read Excel and write INSERTs to backend/sql/reviewer_checklist_data_json.sql",
    )
    args = parser.parse_args()
    REPO_ROOT = Path(__file__).resolve().parents[3]
    xlsx_path = REPO_ROOT / "Reviewer_doc" / "Reviewer.xlsx"
    rows = read_excel(xlsx_path)
    if not rows:
        print("No data rows found in Excel.", file=sys.stderr)
        sys.exit(1)
    if args.dry_run:
        out_sql = REPO_ROOT / "backend" / "sql" / "reviewer_checklist_data_json.sql"
        write_sql_file(rows, out_sql)
        return
    try:
        load_into_db(rows, truncate_first=True)
    except Exception as e:
        if "connection" in str(e).lower() or "5432" in str(e) or "OperationalError" in type(e).__name__:
            print("", file=sys.stderr)
            print("Database connection failed (PostgreSQL at 127.0.0.1:5432).", file=sys.stderr)
            print("  - Start PostgreSQL, then run this script again.", file=sys.stderr)
            print("  - Or run with --dry-run to generate SQL without connecting:", file=sys.stderr)
            print("    python load_reviewer_checklist_from_excel.py --dry-run", file=sys.stderr)
            sys.exit(1)
        raise


if __name__ == "__main__":
    main()

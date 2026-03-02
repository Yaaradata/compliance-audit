#!/usr/bin/env python3
"""
Generate SQL INSERT statements from Reviewer_doc/Reviewer.xlsx for reviewer_checklist.
Run from repo root: python backend/sql/scripts/load_reviewer_checklist.py
Output: backend/sql/reviewer_checklist_data.sql (run after reviewer_checklist_ddl.sql)
"""
from pathlib import Path
import sys

# Script lives at backend/sql/scripts/load_reviewer_checklist.py -> repo root = parents[3]
REPO_ROOT = Path(__file__).resolve().parents[3]
XLSX_PATH = REPO_ROOT / "Reviewer_doc" / "Reviewer.xlsx"
OUT_SQL = REPO_ROOT / "backend" / "sql" / "reviewer_checklist_data.sql"


def escape_sql(s):
    if s is None:
        return "NULL"
    if isinstance(s, (int, float)):
        if isinstance(s, float) and (s != s or int(s) == s):  # NaN or whole number
            return str(int(s)) if s == s else "NULL"
        return str(s)
    t = str(s).strip()
    if t == "":
        return "NULL"
    return "'" + t.replace("\\", "\\\\").replace("'", "''") + "'"


def main():
    try:
        import openpyxl
    except ImportError:
        print("Install openpyxl: pip install openpyxl", file=sys.stderr)
        sys.exit(1)

    if not XLSX_PATH.exists():
        print(f"File not found: {XLSX_PATH}", file=sys.stderr)
        sys.exit(1)

    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    # Row 0 = title, 1 = section headers, 2 = column headers, 3+ = data
    if len(rows) < 4:
        print("Not enough rows in sheet", file=sys.stderr)
        sys.exit(1)

    data_rows = rows[3:]
    out_lines = [
        "-- Reviewer checklist data from Reviewer_doc/Reviewer.xlsx",
        "-- Run after reviewer_checklist_ddl.sql",
        "",
        "BEGIN;",
        "TRUNCATE reviewer_checklist CASCADE;",
        "",
    ]

    for r in data_rows:
        # Columns: 0 Item Code, 1 Evidence Item, 2 Control ID, 3 Control Name, 4 M/A, 5 L1, 6 L2, (7 L2 Status dropped), 8 L3, (9 L3 Rating, 10 L3 Comment dropped)
        while len(r) < 11:
            r = r + (None,)
        item_code = r[0]
        evidence_item = r[1]
        control_id = r[2]
        control_name = r[3]
        mandatory_advisory = r[4]
        l1_check = r[5]
        l2_check = r[6]
        l3_check = r[8]

        if not item_code and not evidence_item and not control_id:
            continue

        item_code = (item_code or "").strip() or "?"
        evidence_item = (evidence_item or "").strip() or ""
        control_id = (control_id or "").strip() or "?"
        control_name = (control_name or "").strip() or ""
        mandatory_advisory = (mandatory_advisory or "M").strip()[:10] or "M"

        out_lines.append(
            "INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ("
            + ", ".join([
                escape_sql(item_code),
                escape_sql(evidence_item),
                escape_sql(control_id),
                escape_sql(control_name),
                escape_sql(mandatory_advisory),
                escape_sql(l1_check),
                escape_sql(l2_check),
                escape_sql(l3_check),
            ])
            + ");"
        )

    out_lines.extend(["", "COMMIT;", ""])
    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text("\n".join(out_lines), encoding="utf-8")
    print(f"Wrote {len(data_rows)} rows to {OUT_SQL}")


if __name__ == "__main__":
    main()

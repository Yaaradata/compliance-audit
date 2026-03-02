#!/usr/bin/env python3
"""Load reviewer_checklist table from Reviewer_doc/Reviewer.xlsx using the app database."""
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND.parent  # compliance-audit (folder containing backend)
sys.path.insert(0, str(BACKEND))

from dotenv import load_dotenv
load_dotenv(BACKEND / ".env")

try:
    import openpyxl
except ImportError:
    print("Install openpyxl: pip install openpyxl", file=sys.stderr)
    sys.exit(1)

from sqlalchemy import text
from app.database import engine, SCHEMA

XLSX_PATH = REPO_ROOT / "Reviewer_doc" / "Reviewer.xlsx"


def main():
    if not XLSX_PATH.exists():
        print(f"File not found: {XLSX_PATH}", file=sys.stderr)
        sys.exit(1)

    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    if len(rows) < 4:
        print("Not enough rows in sheet", file=sys.stderr)
        sys.exit(1)

    data_rows = rows[3:]
    insert_sql = text("""
        INSERT INTO reviewer_checklist
        (item_code, evidence_item, control_id, control_name, mandatory_advisory,
         l1_check, l2_check, l3_check)
        VALUES
        (:item_code, :evidence_item, :control_id, :control_name, :mandatory_advisory,
         :l1_check, :l2_check, :l3_check)
    """)

    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, public"))
        conn.execute(text("TRUNCATE reviewer_checklist CASCADE"))
        count = 0
        for r in data_rows:
            while len(r) < 11:
                r = r + (None,)
            item_code = (r[0] or "").strip() or "?"
            evidence_item = (r[1] or "").strip() or ""
            control_id = (r[2] or "").strip() or "?"
            control_name = (r[3] or "").strip() or ""
            mandatory_advisory = (r[4] or "M").strip()[:10] or "M"
            if not item_code and not evidence_item and not control_id:
                continue
            conn.execute(insert_sql, {
                "item_code": item_code,
                "evidence_item": evidence_item,
                "control_id": control_id,
                "control_name": control_name,
                "mandatory_advisory": mandatory_advisory,
                "l1_check": (r[5] or "").strip() or None,
                "l2_check": (r[6] or "").strip() or None,
                "l3_check": (r[8] or "").strip() or None,
            })
            count += 1
        conn.commit()
    print(f"Inserted {count} rows into reviewer_checklist.")


if __name__ == "__main__":
    main()

"""
Seed script: reads xlsx files and upserts canonical_evidence_items JSONB fields
(input_schema, sufficiency_dimensions) and item_control_mappings sufficiency details.

Usage:
    cd backend
    pip install -r requirements.txt
    python scripts/seed_data.py
"""

import json
import os
import sys
from pathlib import Path

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
load_dotenv(BACKEND_DIR / ".env")

XLSX_DIR = Path(os.getenv("XLSX_DIR", str(BACKEND_DIR.parent.parent)))

EVIDENCE_MODEL_FILE = XLSX_DIR / "SWIFT_CSCF_v2025_Canonical_Evidence_Model.xlsx"
SUFFICIENCY_FILE = XLSX_DIR / "MultiControl_Evidence_Sufficiency.xlsx"


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "compliance"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "Compliance_Audit01"),
        sslmode="require" if os.getenv("DB_SSL", "false").lower() == "true" else "disable",
    )


def safe_str(val):
    if val is None:
        return None
    return str(val).strip()


def parse_evidence_model(wb):
    """Parse input_schema and sufficiency_dimensions from the Evidence Model xlsx."""
    items = {}

    try:
        ws = wb["1_Canonical_Evidence_Items"]
    except KeyError:
        sheet_names = wb.sheetnames
        ws = wb[sheet_names[0]] if sheet_names else None

    if ws is None:
        print("WARNING: Could not find evidence items sheet")
        return items

    headers = [safe_str(c.value) for c in next(ws.iter_rows(min_row=1, max_row=1))]

    for row in ws.iter_rows(min_row=2, values_only=True):
        row_dict = dict(zip(headers, row))
        item_id = safe_str(row_dict.get("Item ID") or row_dict.get("ID") or row_dict.get("Evidence ID"))
        if not item_id:
            continue

        input_schema = []
        suf_dims = []

        items[item_id] = {
            "input_schema": input_schema,
            "sufficiency_dimensions": suf_dims,
        }

    return items


def parse_sufficiency_matrix(wb):
    """Parse sufficiency requirements from the sufficiency xlsx."""
    mappings = []

    try:
        ws = wb["Sufficiency Detail"]
    except KeyError:
        try:
            ws = wb[wb.sheetnames[0]]
        except (KeyError, IndexError):
            print("WARNING: Could not find sufficiency detail sheet")
            return mappings

    headers = [safe_str(c.value) for c in next(ws.iter_rows(min_row=1, max_row=1))]

    for row in ws.iter_rows(min_row=2, values_only=True):
        row_dict = dict(zip(headers, row))
        item_id = safe_str(row_dict.get("Evidence Item ID") or row_dict.get("Item ID") or row_dict.get("Evidence ID"))
        control_id = safe_str(row_dict.get("Control ID") or row_dict.get("Control"))
        requirement = safe_str(row_dict.get("Sufficiency Requirement") or row_dict.get("Requirement"))

        if item_id and control_id:
            mappings.append({
                "evidence_item_id": item_id,
                "control_id": control_id,
                "sufficiency_requirement": requirement,
            })

    return mappings


def seed_jsonb_fields(conn, items_data):
    """Update canonical_evidence_items with parsed JSONB fields."""
    if not items_data:
        print("No JSONB data to seed for canonical_evidence_items")
        return

    cur = conn.cursor()
    updated = 0
    for item_id, data in items_data.items():
        cur.execute(
            """
            UPDATE cscf_2025_new.canonical_evidence_items
            SET input_schema = %s::jsonb,
                sufficiency_dimensions = %s::jsonb
            WHERE id = %s
            """,
            (json.dumps(data["input_schema"]), json.dumps(data["sufficiency_dimensions"]), item_id),
        )
        if cur.rowcount > 0:
            updated += 1

    conn.commit()
    cur.close()
    print(f"Updated {updated} canonical_evidence_items with JSONB fields")


def seed_sufficiency_requirements(conn, mappings):
    """Update item_control_mappings with sufficiency_requirement text."""
    if not mappings:
        print("No sufficiency requirements to seed")
        return

    cur = conn.cursor()
    updated = 0
    for m in mappings:
        if m["sufficiency_requirement"]:
            cur.execute(
                """
                UPDATE cscf_2025_new.item_control_mappings
                SET sufficiency_requirement = %s
                WHERE evidence_item_id = %s AND control_id = %s
                """,
                (m["sufficiency_requirement"], m["evidence_item_id"], m["control_id"]),
            )
            if cur.rowcount > 0:
                updated += 1

    conn.commit()
    cur.close()
    print(f"Updated {updated} item_control_mappings with sufficiency requirements")


def main():
    conn = get_connection()
    conn.autocommit = False
    print(f"Connected to {os.getenv('DB_HOST', '127.0.0.1')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'compliance')}")

    try:
        import openpyxl
    except ImportError:
        print("ERROR: openpyxl is required. Run: pip install openpyxl")
        sys.exit(1)

    items_data = {}
    if EVIDENCE_MODEL_FILE.exists():
        print(f"Reading {EVIDENCE_MODEL_FILE.name}...")
        wb = openpyxl.load_workbook(EVIDENCE_MODEL_FILE, read_only=True, data_only=True)
        items_data = parse_evidence_model(wb)
        wb.close()
        print(f"  Parsed {len(items_data)} evidence items")
    else:
        print(f"WARNING: {EVIDENCE_MODEL_FILE} not found — skipping JSONB seed")

    sufficiency_mappings = []
    if SUFFICIENCY_FILE.exists():
        print(f"Reading {SUFFICIENCY_FILE.name}...")
        wb = openpyxl.load_workbook(SUFFICIENCY_FILE, read_only=True, data_only=True)
        sufficiency_mappings = parse_sufficiency_matrix(wb)
        wb.close()
        print(f"  Parsed {len(sufficiency_mappings)} sufficiency mappings")
    else:
        print(f"WARNING: {SUFFICIENCY_FILE} not found — skipping sufficiency seed")

    seed_jsonb_fields(conn, items_data)
    seed_sufficiency_requirements(conn, sufficiency_mappings)

    conn.close()
    print("Done.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Migrate reviewer_checklist l1_check, l2_check, l3_check from TEXT to JSONB.
- Adds l1_check_json, l2_check_json, l3_check_json (JSONB), backfills from parsed text, then drops TEXT columns and renames JSONB to l1_check, l2_check, l3_check.
Run from repo root: python backend/sql/scripts/migrate_reviewer_checklist_to_json.py
Requires: 08_reviewer_checklist_json_columns.sql applied first (adds _json columns), or script will add them.
"""
import json
import re
import sys
from pathlib import Path

# backend/app
BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

from sqlalchemy import text

# L1 check names for the 5 standard checks
L1_CHECK_NAMES = [
    "File Presence",
    "Document Type",
    "Section Completeness",
    "Date Validity",
    "Control Linkage",
]


def parse_l1(l1_text: str | None, evidence_item: str, control_name: str) -> dict | None:
    if not l1_text or not l1_text.strip():
        return None
    # Strip prefix: "Confirm the '...' has been submitted as a ... Check: "
    after_check = re.sub(
        r"^Confirm\s+the\s+'.*?'\s+has\s+been\s+submitted\s+as\s+a\s+[^.]+\.\s*Check:\s*",
        "",
        l1_text.strip(),
        flags=re.IGNORECASE | re.DOTALL,
    )
    if after_check == l1_text.strip():
        after_check = re.sub(r"^.*?Check:\s*", "", l1_text.strip(), flags=re.IGNORECASE | re.DOTALL)
    # Split by (1) (2) (3) (4) (5)
    parts = re.split(r"\s*\(\d\)\s*", after_check, maxsplit=5)
    # parts[0] may be empty or junk; we want 5 descriptions = parts[1:6] if len(parts)>=6 else pad
    descriptions = []
    for i in range(1, 6):
        if i < len(parts) and parts[i].strip():
            d = parts[i].strip().rstrip(".")
            if i == 5 and control_name and not d.strip():
                d = f"Document is linked/tagged to Control: {control_name}"
            descriptions.append(d)
        else:
            descriptions.append("")
    if len(descriptions) < 5:
        descriptions.extend([""] * (5 - len(descriptions)))
    document = evidence_item.strip() if evidence_item else "Document"
    # Title-case like user example
    if document:
        document = document[0].upper() + document[1:] if len(document) > 1 else document.upper()
    checks = [
        {"id": i + 1, "check": L1_CHECK_NAMES[i], "description": descriptions[i]}
        for i in range(5)
    ]
    return {
        "task": "Submission Validation",
        "document": document,
        "checks": checks,
    }


def parse_l2(l2_text: str | None, evidence_item: str, control_name: str) -> dict | None:
    if not l2_text or not l2_text.strip():
        return None
    s = l2_text.strip()
    # Remove "Review the '...' to confirm it technically satisfies Control '...': "
    s = re.sub(
        r"^Review\s+the\s+'.*?'\s+to\s+confirm\s+it\s+technically\s+satisfies\s+Control\s+'.*?'\s*:\s*",
        "",
        s,
        flags=re.IGNORECASE,
    )
    if s == l2_text.strip():
        s = re.sub(r"^.*?MUST\s+SHOW\s+—\s*", "MUST SHOW — ", s, flags=re.IGNORECASE)

    def split_section(block: str, sep: str) -> list[str]:
        block = block.replace("\n", " ").strip()
        return [x.strip() for x in block.split("|") if x.strip()]

    must_show: list[str] = []
    pass_criteria: list[str] = []
    fail_criteria: list[str] = []
    cross_checks: list[str] = []

    for marker, key in [
        ("MUST SHOW —", "must"),
        ("PASS IF —", "pass"),
        ("FAIL IF —", "fail"),
        ("CROSS-CHECK —", "cross"),
    ]:
        m = re.search(re.escape(marker), s, re.IGNORECASE)
        if not m:
            continue
        start = m.end()
        next_markers = [
            "MUST SHOW —",
            "PASS IF —",
            "FAIL IF —",
            "CROSS-CHECK —",
        ]
        end = len(s)
        for nm in next_markers:
            if nm == marker:
                continue
            n = re.search(re.escape(nm), s[start:], re.IGNORECASE)
            if n:
                end = start + n.start()
                break
        block = s[start:end].strip()
        items = split_section(block, "|")
        if key == "must":
            must_show = items
        elif key == "pass":
            pass_criteria = items
        elif key == "fail":
            fail_criteria = items
        else:
            cross_checks = items

    document = (evidence_item or "").strip()
    if document:
        document = document[0].upper() + document[1:] if len(document) > 1 else document.upper()
    return {
        "task": "Technical Review",
        "document": document or "Document",
        "control": (control_name or "").strip(),
        "must_show": must_show,
        "pass_criteria": pass_criteria,
        "fail_criteria": fail_criteria,
        "cross_checks": cross_checks,
    }


def parse_l3(l3_text: str | None, evidence_item: str, control_name: str, mandatory_advisory: str) -> dict | None:
    if not l3_text or not l3_text.strip():
        return None
    s = l3_text.strip()
    mandatory = "MANDATORY" in s.upper() or (mandatory_advisory or "").upper().startswith("M")
    gaps_permitted = "documented deviations accepted" in s.lower()
    if "no gaps permitted" in s.lower():
        gaps_permitted = False

    # Independent verify bullets: after "INDEPENDENTLY VERIFY" until "CROSS-CHECK VALIDATION" or "ASSESS"
    ind_verify: list[str] = []
    m_verify = re.search(r"INDEPENDENTLY\s+VERIFY\s*[^:]*:\s*", s, re.IGNORECASE | re.DOTALL)
    if m_verify:
        rest = s[m_verify.end() :]
        for sep in ["CROSS-CHECK VALIDATION", "ASSESS:"]:
            idx = rest.upper().find(sep.upper())
            if idx != -1:
                rest = rest[:idx]
                break
        for part in re.split(r"\s*[•\-]\s*|\n", rest):
            part = part.strip()
            if part and "RATE:" not in part.upper():
                ind_verify.append(part)

    cross_check_val: list[str] = []
    m_cross = re.search(r"CROSS-CHECK\s+VALIDATION\s*:\s*", s, re.IGNORECASE | re.DOTALL)
    if m_cross:
        rest = s[m_cross.end() :]
        for sep in ["ASSESS:", "RATE:"]:
            idx = rest.upper().find(sep.upper())
            if idx != -1:
                rest = rest[:idx]
                break
        for part in re.split(r"\s*[•\-]\s*|\n", rest):
            part = part.strip()
            if part:
                cross_check_val.append(part)

    authenticity = "Assess whether evidence is authentic and not paper compliance only"
    m_assess = re.search(r"ASSESS:\s*(.+?)(?=RATE:|$)", s, re.IGNORECASE | re.DOTALL)
    if m_assess:
        assess_block = m_assess.group(1).strip()
        if "paper compliance" in assess_block.lower():
            authenticity = assess_block.split("Raise formal")[0].strip() if "Raise formal" in assess_block else assess_block
    dispute = "Raise formal comment if L2 'Sufficient' rating is disputed"
    if "Raise formal comment" in s:
        dispute = "Raise formal comment if L2 Sufficient rating is disputed"

    rating_options = ["Compliant", "Partially Compliant", "Non-Compliant", "N/A"]
    m_rate = re.search(r"RATE:\s*([^\n]+)", s, re.IGNORECASE)
    if m_rate:
        rate_str = m_rate.group(1).strip()
        rating_options = [x.strip() for x in rate_str.split("|") if x.strip()]

    document = (evidence_item or "").strip()
    if document:
        document = document[0].upper() + document[1:] if len(document) > 1 else document.upper()
    return {
        "task": "Independent Attestation",
        "document": document or "Document",
        "control": (control_name or "").strip(),
        "mandatory": mandatory,
        "gaps_permitted": gaps_permitted,
        "note": "Do not rely on L2 outcome — independently verify all items",
        "independent_verify": ind_verify,
        "cross_check_validation": cross_check_val,
        "authenticity_check": authenticity,
        "dispute_action": dispute,
        "rating_options": rating_options,
        "rating": None,
    }


def main():
    from app.database import engine, SCHEMA

    with engine.connect() as conn:
        # 1) Check current column types
        r = conn.execute(text("""
            SELECT column_name, data_type FROM information_schema.columns
            WHERE table_schema = :schema AND table_name = 'reviewer_checklist'
            AND column_name IN ('l1_check', 'l2_check', 'l3_check', 'l1_check_json', 'l2_check_json', 'l3_check_json')
        """), {"schema": SCHEMA})
        col_info = {row[0]: row[1] for row in r}
        l1_type = col_info.get("l1_check")

        if l1_type == "jsonb" and "l1_check_json" not in col_info:
            print("l1_check, l2_check, l3_check already JSONB. Nothing to do.")
            return

        if l1_type == "text":
            # Add JSONB columns for backfill
            conn.execute(text("""
                ALTER TABLE reviewer_checklist
                ADD COLUMN IF NOT EXISTS l1_check_json JSONB,
                ADD COLUMN IF NOT EXISTS l2_check_json JSONB,
                ADD COLUMN IF NOT EXISTS l3_check_json JSONB
            """))
            conn.commit()

        # 2) Fetch all rows with TEXT columns
        result = conn.execute(text("""
            SELECT id, item_code, evidence_item, control_id, control_name, mandatory_advisory,
                   l1_check, l2_check, l3_check
            FROM reviewer_checklist
        """))
        rows = result.fetchall()

        if l1_type == "text":
            for row in rows:
                row_id, item_code, evidence_item, control_id, control_name, mandatory_advisory, l1, l2, l3 = row
                l1_json = parse_l1(l1, evidence_item, control_name)
                l2_json = parse_l2(l2, evidence_item, control_name)
                l3_json = parse_l3(l3, evidence_item, control_name, mandatory_advisory)
                conn.execute(
                    text("""
                        UPDATE reviewer_checklist
                        SET l1_check_json = :l1, l2_check_json = :l2, l3_check_json = :l3
                        WHERE id = :id
                    """),
                    {
                        "id": row_id,
                        "l1": json.dumps(l1_json) if l1_json else None,
                        "l2": json.dumps(l2_json) if l2_json else None,
                        "l3": json.dumps(l3_json) if l3_json else None,
                    },
                )
            conn.commit()
            print(f"Backfilled {len(rows)} rows with JSON.")

        # 3) Replace TEXT columns with JSONB: drop l1_check, l2_check, l3_check; rename _json to l1_check, etc.
        if l1_type == "text":
            conn.execute(text("ALTER TABLE reviewer_checklist DROP COLUMN l1_check"))
            conn.execute(text("ALTER TABLE reviewer_checklist DROP COLUMN l2_check"))
            conn.execute(text("ALTER TABLE reviewer_checklist DROP COLUMN l3_check"))
            conn.execute(text("ALTER TABLE reviewer_checklist RENAME COLUMN l1_check_json TO l1_check"))
            conn.execute(text("ALTER TABLE reviewer_checklist RENAME COLUMN l2_check_json TO l2_check"))
            conn.execute(text("ALTER TABLE reviewer_checklist RENAME COLUMN l3_check_json TO l3_check"))
            conn.commit()
            print("Dropped TEXT columns and renamed JSONB to l1_check, l2_check, l3_check.")
        else:
            print("l1_check already JSONB; skipped drop/rename.")


if __name__ == "__main__":
    main()

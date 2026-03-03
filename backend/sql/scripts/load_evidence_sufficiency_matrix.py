#!/usr/bin/env python3
"""
Load evidence_sufficiency_matrix from Reviewer_doc/Reviewer_L1_L2_L3_Checklists.xlsx.

Excel sheet "Reviewer Checklists" (86 rows: 1 header + 85 data):
  Col 0: Item Code        → item_code
  Col 1: Evidence Item    → evidence_item_name
  Col 2: Control ID       → control_id
  Col 3: Control Name     → control_name
  Col 4: M/A              → ma
  Col 5: Evidence Type    → evidence_type
  Col 6: L1_check (JSON)  → sufficiency_criteria  (from L1 "Content Present" section)
  Col 7: L2_check (JSON)  → evaluation_criteria   (from L2 "Technical Verification" section)

sufficiency_criteria = L1 checklist → 2nd section "Content Present in Evidence" checks (what must be present)
evaluation_criteria  = L2 checklist → 1st section "Technical Verification" checks (pass/fail criteria)

Both stored as JSON: {"1": "point one", "2": "point two", ...}

Usage:
  cd backend
  python sql/scripts/load_evidence_sufficiency_matrix.py             # write to DB
  python sql/scripts/load_evidence_sufficiency_matrix.py --dry-run    # generate SQL only
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

REPO_ROOT = BACKEND.parent
XLSX_PATH = REPO_ROOT / "Reviewer_doc" / "Reviewer_L1_L2_L3_Checklists.xlsx"
SQL_OUT = BACKEND / "sql" / "evidence_sufficiency_matrix_data.sql"
SCHEMA = "cscf_2025_new"


# ---------------------------------------------------------------------------
#  Extract sufficiency/evaluation from L1/L2 JSON
# ---------------------------------------------------------------------------

def extract_sufficiency(l1_json: dict | None) -> str | None:
    """Extract 'Content Present in Evidence' checks from L1 JSON → numbered dict."""
    if not l1_json:
        return None
    checklist = l1_json.get("checklist", [])
    for section in checklist:
        sec_name = (section.get("section") or "").lower()
        if "content present" in sec_name:
            checks = section.get("checks", [])
            if checks:
                return json.dumps(
                    {str(i): c for i, c in enumerate(checks, 1)},
                    ensure_ascii=False,
                )
    return None


def extract_evaluation(l2_json: dict | None) -> str | None:
    """Extract 'Technical Verification' checks from L2 JSON → numbered dict."""
    if not l2_json:
        return None
    checklist = l2_json.get("checklist", [])
    for section in checklist:
        sec_name = (section.get("section") or "").lower()
        if "technical verification" in sec_name:
            checks = section.get("checks", [])
            if checks:
                return json.dumps(
                    {str(i): c for i, c in enumerate(checks, 1)},
                    ensure_ascii=False,
                )
    return None


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
        return []

    data_rows = rows[1:]
    out: list[dict] = []

    for r in data_rows:
        r = list(r) + [None] * max(0, 12 - len(r))
        item_code = str(r[0] or "").strip()
        evidence_item = str(r[1] or "").strip()
        control_id = str(r[2] or "").strip()
        control_name = str(r[3] or "").strip()
        ma_raw = str(r[4] or "M").strip()
        ma = ma_raw[:1].upper() if ma_raw else "M"
        if ma not in ("M", "A"):
            ma = "M"
        evidence_type = str(r[5] or "").strip()

        if not item_code or not control_id:
            continue

        # Parse L1 and L2 JSON
        l1_json = _parse_json(r[6])
        l2_json = _parse_json(r[7])

        sufficiency_criteria = extract_sufficiency(l1_json)
        evaluation_criteria = extract_evaluation(l2_json)

        out.append({
            "item_code": item_code[:5],
            "control_id": control_id[:10],
            "evidence_item_name": evidence_item[:255],
            "control_name": control_name[:255],
            "ma": ma,
            "evidence_type": evidence_type[:100],
            "sufficiency_criteria": sufficiency_criteria,
            "evaluation_criteria": evaluation_criteria,
        })
    return out


def _parse_json(raw) -> dict | None:
    if raw is None:
        return None
    s = str(raw).strip()
    if not s or not s.startswith("{"):
        return None
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        return None


# ---------------------------------------------------------------------------
#  DB load
# ---------------------------------------------------------------------------

def load_into_db(rows: list[dict]) -> None:
    from sqlalchemy import text as sa_text
    from app.database import engine

    with engine.connect() as conn:
        # Create table if not exists
        conn.execute(sa_text(f"""
            CREATE TABLE IF NOT EXISTS evidence_sufficiency_matrix (
                item_code            VARCHAR(5) NOT NULL,
                control_id           VARCHAR(10) NOT NULL,
                evidence_item_name   VARCHAR(255) NOT NULL,
                control_name         VARCHAR(255) NOT NULL,
                ma                   VARCHAR(1) NOT NULL,
                evidence_type        VARCHAR(100) NOT NULL,
                sufficiency_criteria TEXT,
                evaluation_criteria  TEXT,
                cscf_version         VARCHAR(10) NOT NULL DEFAULT '2025v',
                created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
                PRIMARY KEY (item_code, control_id)
            )
        """))
        conn.execute(sa_text("CREATE INDEX IF NOT EXISTS idx_esm_item_code ON evidence_sufficiency_matrix(item_code)"))
        conn.execute(sa_text("CREATE INDEX IF NOT EXISTS idx_esm_control_id ON evidence_sufficiency_matrix(control_id)"))
        conn.commit()

        # Truncate and insert
        conn.execute(sa_text("TRUNCATE evidence_sufficiency_matrix CASCADE"))
        conn.commit()

        for row in rows:
            conn.execute(
                sa_text("""
                    INSERT INTO evidence_sufficiency_matrix
                        (item_code, control_id, evidence_item_name, control_name, ma,
                         evidence_type, sufficiency_criteria, evaluation_criteria)
                    VALUES (:item_code, :control_id, :evidence_item_name, :control_name, :ma,
                            :evidence_type, :sufficiency, :evaluation)
                    ON CONFLICT (item_code, control_id) DO UPDATE SET
                        evidence_item_name = EXCLUDED.evidence_item_name,
                        control_name = EXCLUDED.control_name,
                        ma = EXCLUDED.ma,
                        evidence_type = EXCLUDED.evidence_type,
                        sufficiency_criteria = EXCLUDED.sufficiency_criteria,
                        evaluation_criteria = EXCLUDED.evaluation_criteria
                """),
                {
                    "item_code": row["item_code"],
                    "control_id": row["control_id"],
                    "evidence_item_name": row["evidence_item_name"],
                    "control_name": row["control_name"],
                    "ma": row["ma"],
                    "evidence_type": row["evidence_type"],
                    "sufficiency": row["sufficiency_criteria"],
                    "evaluation": row["evaluation_criteria"],
                },
            )
        conn.commit()
    print(f"Loaded {len(rows)} rows into evidence_sufficiency_matrix.")


# ---------------------------------------------------------------------------
#  SQL output (--dry-run)
# ---------------------------------------------------------------------------

def _esc(s: str) -> str:
    return (s or "").replace("'", "''")


def write_sql(rows: list[dict], out: Path) -> None:
    lines = [
        f"-- evidence_sufficiency_matrix from Reviewer_L1_L2_L3_Checklists.xlsx",
        f"SET search_path TO {SCHEMA}, public;",
        "",
        "CREATE TABLE IF NOT EXISTS evidence_sufficiency_matrix (",
        "    item_code            VARCHAR(5) NOT NULL,",
        "    control_id           VARCHAR(10) NOT NULL,",
        "    evidence_item_name   VARCHAR(255) NOT NULL,",
        "    control_name         VARCHAR(255) NOT NULL,",
        "    ma                   VARCHAR(1) NOT NULL,",
        "    evidence_type        VARCHAR(100) NOT NULL,",
        "    sufficiency_criteria TEXT,",
        "    evaluation_criteria  TEXT,",
        "    cscf_version         VARCHAR(10) NOT NULL DEFAULT '2025v',",
        "    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),",
        "    PRIMARY KEY (item_code, control_id)",
        ");",
        "",
        "BEGIN;",
        "TRUNCATE evidence_sufficiency_matrix CASCADE;",
        "",
    ]
    for row in rows:
        sc = f"'{_esc(row['sufficiency_criteria'])}'" if row["sufficiency_criteria"] else "NULL"
        ec = f"'{_esc(row['evaluation_criteria'])}'" if row["evaluation_criteria"] else "NULL"
        lines.append(
            "INSERT INTO evidence_sufficiency_matrix "
            "(item_code, control_id, evidence_item_name, control_name, ma, evidence_type, sufficiency_criteria, evaluation_criteria) VALUES ("
            f"'{_esc(row['item_code'])}', '{_esc(row['control_id'])}', '{_esc(row['evidence_item_name'])}', "
            f"'{_esc(row['control_name'])}', '{_esc(row['ma'])}', '{_esc(row['evidence_type'])}', "
            f"{sc}, {ec});"
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
        description="Load evidence_sufficiency_matrix from Reviewer_L1_L2_L3_Checklists.xlsx"
    )
    parser.add_argument("--dry-run", action="store_true", help="Generate SQL file without touching DB")
    args = parser.parse_args()

    rows = read_excel(XLSX_PATH)
    if not rows:
        print("No data rows found.", file=sys.stderr)
        sys.exit(1)

    # Stats
    with_suff = sum(1 for r in rows if r["sufficiency_criteria"])
    with_eval = sum(1 for r in rows if r["evaluation_criteria"])
    print(f"Parsed {len(rows)} rows: {with_suff} with sufficiency, {with_eval} with evaluation criteria.")

    # Sample
    s = rows[0]
    print(f"Sample: {s['item_code']}/{s['control_id']} ({s['control_name']})")
    if s["sufficiency_criteria"]:
        obj = json.loads(s["sufficiency_criteria"])
        print(f"  sufficiency: {len(obj)} points — {list(obj.values())[:2]}...")
    if s["evaluation_criteria"]:
        obj = json.loads(s["evaluation_criteria"])
        print(f"  evaluation:  {len(obj)} points — {list(obj.values())[:2]}...")

    if args.dry_run:
        write_sql(rows, SQL_OUT)
        return

    try:
        load_into_db(rows)
    except Exception as e:
        err = str(e).lower()
        if "connection" in err or "5432" in err or "closed" in err:
            print(f"\nDB connection failed. Falling back to --dry-run...\n", file=sys.stderr)
            write_sql(rows, SQL_OUT)
            sys.exit(1)
        raise


if __name__ == "__main__":
    main()

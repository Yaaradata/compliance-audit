#!/usr/bin/env python3
"""Run migration to add evidence_description, sufficiency_definition, evaluation_criteria columns."""
# Add parent to path
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine, SCHEMA


def add_columns_if_missing() -> None:
    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, public"))
        # Add description and evidence columns if missing (required by ORM)
        for col, suffix in [
            ("description", " DEFAULT ''"),
            ("evidence_description", ""),
            ("sufficiency_definition", ""),
            ("evaluation_criteria", ""),
        ]:
            try:
                conn.execute(text(
                    f"ALTER TABLE canonical_evidence_items ADD COLUMN IF NOT EXISTS {col} TEXT{suffix}"
                ))
                print(f"Added column: {col}")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"Column {col} already exists, skipping")
                else:
                    raise
        conn.commit()
    print("Migration complete.")


def update_a5_json_format() -> None:
    """Update A5 with structured JSON for sufficiency_definition and evaluation_criteria."""
    import json
    suff = {
        "1": "Selected architecture type with justification,",
        "2": "Description of SWIFT infrastructure matching the architecture,",
        "3": "List of all SWIFT-related components,",
        "4": "Identification of any hybrid setups,",
        "5": "Confirmation of component ownership model",
    }
    eval_ = {
        "1": "Architecture type matches actual infrastructure?",
        "2": "All SWIFT components accounted for?",
        "3": "Justification aligns with SWIFT architecture decision tree?",
        "4": "Ownership model clear?",
    }
    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, public"))
        conn.execute(
            text("""
                UPDATE canonical_evidence_items SET
                    sufficiency_definition = CAST(:suff AS jsonb),
                    evaluation_criteria = CAST(:eval AS jsonb)
                WHERE id = 'A5'
            """),
            {"suff": json.dumps(suff), "eval": json.dumps(eval_)},
        )
        conn.commit()
    print("A5 JSON format updated.")


if __name__ == "__main__":
    import sys
    add_columns_if_missing()
    if len(sys.argv) > 1 and sys.argv[1] == "--a5":
        update_a5_json_format()

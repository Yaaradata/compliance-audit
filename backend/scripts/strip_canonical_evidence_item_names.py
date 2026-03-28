#!/usr/bin/env python3
"""
Strip parenthetical suffixes from swift_2026.canonical_evidence_items.name.

Example:
  "Network architecture diagram (with secure zone boundaries)"
    -> "Network architecture diagram"

Uses regex to remove each (...) segment; repeats until none remain (nested/multiple).

Usage (from repo root or backend/):
  python scripts/strip_canonical_evidence_item_names.py
  python scripts/strip_canonical_evidence_item_names.py --dry-run

Requires DATABASE_URL or same env as backend (.env in backend/).
"""

from __future__ import annotations

import argparse
import os
import re
import sys

# Allow `from app.database import engine` when run from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text

from app.database import engine

SCHEMA = "swift_2026"
TABLE = f'"{SCHEMA}".canonical_evidence_items'

# One non-nested (...) segment; run in a loop to clear multiples / edge cases.
_PAREN_SEGMENT = re.compile(r"\s*\([^)]*\)")


def strip_parenthetical_content(name: str) -> str:
    if not name or not name.strip():
        return name
    s = name.strip()
    prev = None
    while prev != s:
        prev = s
        s = _PAREN_SEGMENT.sub("", s)
    return re.sub(r"\s+", " ", s).strip()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print changes only; do not commit updates.",
    )
    args = parser.parse_args()

    with engine.connect() as conn:
        rows = conn.execute(
            text(f"SELECT id, name FROM {TABLE} ORDER BY id")
        ).fetchall()

    if not rows:
        print(f"No rows in {TABLE}.")
        return 0

    updates: list[tuple[str, str, str]] = []
    for row in rows:
        old = row.name if row.name is not None else ""
        new = strip_parenthetical_content(old)
        if new != old:
            updates.append((row.id, old, new))

    if not updates:
        print("No rows need updating (no parenthetical segments found).")
        return 0

    print(f"Found {len(updates)} row(s) to update:\n")
    for eid, old, new in updates:
        print(f"  {eid}")
        print(f"    FROM: {old!r}")
        print(f"    TO:   {new!r}\n")

    if args.dry_run:
        print("--dry-run: no database changes applied.")
        return 0

    with engine.begin() as conn:
        for eid, _old, new in updates:
            conn.execute(
                text(f"UPDATE {TABLE} SET name = :name WHERE id = :id"),
                {"name": new, "id": eid},
            )

    print(f"Updated {len(updates)} row(s) in {TABLE}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

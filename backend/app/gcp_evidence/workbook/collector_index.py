"""Map SWIFT item codes to collector module ids (from CONTROL_MAPPINGS)."""
from __future__ import annotations

from app.gcp_evidence.collectors import COLLECTORS


def item_code_to_collector_ids() -> dict[str, list[str]]:
    """item_code -> collector names that emit evidence for that item."""
    m: dict[str, list[str]] = {}
    for name, mod in COLLECTORS:
        cm = getattr(mod, "CONTROL_MAPPINGS", None) or []
        seen = {ic.strip().upper() for ic, _ in cm}
        for ic in seen:
            m.setdefault(ic, []).append(name)
    return m


def all_automated_item_codes() -> set[str]:
    return set(item_code_to_collector_ids().keys())

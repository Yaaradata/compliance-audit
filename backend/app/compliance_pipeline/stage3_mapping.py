"""Stage 3: deterministic item–control mappings from Stage 1 + Stage 2 (no LLM)."""

from __future__ import annotations

import uuid
from typing import Any


def build_item_control_mappings(
    stage1: dict[str, Any],
    stage2: dict[str, Any],
    cscf_version: str,
) -> dict[str, Any]:
    """
    Expand controls_served arrays into explicit mapping rows.
    Primary = item with highest control_count among those serving a control; ties broken
    by domain_id then sort_order (same heuristic as product brief).
    """
    controls_index = {c["id"]: c for c in stage1.get("controls") or [] if isinstance(c, dict) and c.get("id")}
    items = [i for i in (stage2.get("canonical_evidence_items") or []) if isinstance(i, dict)]

    control_to_items: dict[str, list[dict[str, Any]]] = {}
    for item in items:
        for control_id in item.get("controls_served") or []:
            cid = str(control_id or "").strip()
            if not cid:
                continue
            control_to_items.setdefault(cid, []).append(item)

    primary_per_control: dict[str, str] = {}
    for control_id, serving_items in control_to_items.items():
        sorted_items = sorted(
            serving_items,
            key=lambda i: (
                -int(i.get("control_count") or len(i.get("controls_served") or []) or 0),
                str(i.get("domain_id") or ""),
                int(i.get("sort_order") or 0),
            ),
        )
        primary_per_control[control_id] = str(sorted_items[0].get("item_code") or "").strip()

    def compute_weight(item: dict[str, Any], control_id: str, is_primary: bool) -> float:
        tier = str(item.get("reuse_tier") or "LOW").upper()
        if is_primary:
            if tier == "HIGH":
                return 0.75
            if tier == "MEDIUM":
                return 1.00
            return 1.00
        if tier == "HIGH":
            return 0.25
        if tier == "MEDIUM":
            return 0.50
        return 0.25

    def build_sufficiency_requirement(item: dict[str, Any], control_id: str, control: dict[str, Any]) -> str:
        base = item.get("sufficiency_definition") or item.get("description") or ""
        base = str(base)
        control_name = str(control.get("name") or control_id)
        item_name = str(item.get("name") or item.get("item_code") or "")
        snippet = base[:200].rstrip(".")
        return (
            f"{item_name} must demonstrate compliance with '{control_name}'. "
            f"{snippet}."
        )

    mappings: list[dict[str, Any]] = []
    for item in items:
        item_code = str(item.get("item_code") or "").strip()
        if not item_code:
            continue
        for control_id in item.get("controls_served") or []:
            cid = str(control_id or "").strip()
            if not cid:
                continue
            control = controls_index.get(cid, {})
            is_primary = primary_per_control.get(cid) == item_code
            weight = compute_weight(item, cid, is_primary)
            mappings.append(
                {
                    "id": str(uuid.uuid4()),
                    "evidence_item_code": item_code,
                    "control_id": cid,
                    "is_primary": is_primary,
                    "weight": weight,
                    "sufficiency_requirement": build_sufficiency_requirement(item, cid, control),
                    "cscf_version": cscf_version,
                }
            )

    mappings.sort(key=lambda m: (m["evidence_item_code"], m["control_id"]))
    return {"item_control_mappings": mappings}


def validate_stage3(stage3: dict[str, Any], stage1: dict[str, Any], stage2: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []

    valid_item_codes = {
        str(i.get("item_code") or "").strip()
        for i in (stage2.get("canonical_evidence_items") or [])
        if isinstance(i, dict) and str(i.get("item_code") or "").strip()
    }
    valid_control_ids = {
        str(c.get("id") or "").strip()
        for c in (stage1.get("controls") or [])
        if isinstance(c, dict) and str(c.get("id") or "").strip()
    }
    seen_pairs: set[tuple[str, str]] = set()
    primary_per_control: dict[str, int] = {}

    rows = stage3.get("item_control_mappings") or []
    if not isinstance(rows, list):
        errors.append("item_control_mappings must be an array")
        return {"errors": errors, "warnings": warnings}

    for m in rows:
        if not isinstance(m, dict):
            errors.append("Each mapping must be an object")
            continue
        code = str(m.get("evidence_item_code") or "").strip()
        cid = str(m.get("control_id") or "").strip()
        pair = (code, cid)
        if pair in seen_pairs:
            errors.append(f"Duplicate mapping: {pair}")
        seen_pairs.add(pair)

        if code not in valid_item_codes:
            errors.append(f"Unknown evidence_item_code: {code}")
        if cid not in valid_control_ids:
            errors.append(f"Unknown control_id: {cid}")
        try:
            w = float(m.get("weight", 0))
            if not (0.10 <= w <= 1.00):
                errors.append(f"Weight {w} out of range for {pair}")
        except (TypeError, ValueError):
            errors.append(f"Invalid weight for {pair}")

        primary_per_control[cid] = primary_per_control.get(cid, 0) + (1 if m.get("is_primary") else 0)

    for control_id, count in primary_per_control.items():
        if count != 1:
            errors.append(f"Control {control_id} has {count} primary mappings — must be exactly 1")

    return {"errors": errors, "warnings": warnings}

"""Lightweight checks before Azure collection."""
from __future__ import annotations

from app.azure_evidence.platform.resource_graph import query_object_array


def precheck_azure_collection(credential, subscription_id: str) -> dict:
    # Use summarize so we get exactly one row on success even when the subscription has zero resources.
    # `Resources | take 1` falsely fails for empty subscriptions (HTTP 200, empty data) and looks like RBAC issues.
    rows, err = query_object_array(
        credential,
        subscription_id,
        "Resources | summarize resource_count = count() | project resource_count",
        max_rows=5,
    )
    ok = (not err) and len(rows) >= 1
    return {
        "ok": ok,
        "subscription_id": subscription_id,
        "resource_graph_sample_rows": len(rows),
        "error": err,
    }

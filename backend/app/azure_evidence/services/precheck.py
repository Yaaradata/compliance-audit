"""Lightweight checks before Azure collection."""
from __future__ import annotations

from app.azure_evidence.platform.resource_graph import query_object_array


def precheck_azure_collection(credential, subscription_id: str) -> dict:
    rows, err = query_object_array(
        credential,
        subscription_id,
        "Resources | project id | take 1",
        max_rows=5,
    )
    ok = bool(rows) and not err
    return {
        "ok": ok,
        "subscription_id": subscription_id,
        "resource_graph_sample_rows": len(rows),
        "error": err,
    }

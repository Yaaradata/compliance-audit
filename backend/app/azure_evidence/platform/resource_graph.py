"""Azure Resource Graph KQL queries with pagination."""
from __future__ import annotations

from typing import Any

from azure.core.exceptions import HttpResponseError
from azure.mgmt.resourcegraph import ResourceGraphClient
from azure.mgmt.resourcegraph.models import QueryRequest, QueryRequestOptions, ResultFormat


def query_object_array(
    credential,
    subscription_id: str,
    query: str,
    *,
    max_rows: int = 2000,
) -> tuple[list[dict[str, Any]], str | None]:
    """
    Run a Resource Graph query scoped to one subscription.
    Returns (rows, error_message). error_message is set on failure.
    """
    sub = (subscription_id or "").strip()
    if not sub:
        return [], "subscription_id is required"

    client = ResourceGraphClient(credential)
    rows: list[dict[str, Any]] = []
    skip_token: str | None = None
    try:
        while len(rows) < max_rows:
            batch = min(1000, max_rows - len(rows))
            opts = QueryRequestOptions(
                result_format=ResultFormat.object_array,
                top=batch,
                skip_token=skip_token,
            )
            req = QueryRequest(subscriptions=[sub], query=query, options=opts)
            resp = client.resources(req)
            chunk = getattr(resp, "data", None) or []
            if isinstance(chunk, list):
                for item in chunk:
                    if isinstance(item, dict):
                        rows.append(item)
                    else:
                        try:
                            rows.append(dict(item))
                        except Exception:
                            rows.append({"_raw": str(item)})
            skip_token = getattr(resp, "skip_token", None) or None
            if not skip_token or not chunk:
                break
        return rows, None
    except HttpResponseError as e:
        return [], f"Resource Graph HTTP error: {e.message or e}"
    except Exception as e:
        return [], str(e)

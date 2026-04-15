"""Delegated Azure Resource Manager helpers (user access token from OAuth)."""
from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def list_arm_subscriptions(access_token: str) -> tuple[list[dict[str, Any]], str | None]:
    """GET /subscriptions. Returns (value list, error message)."""
    import httpx

    tok = (access_token or "").strip()
    if not tok:
        return [], "missing access token"
    try:
        r = httpx.get(
            "https://management.azure.com/subscriptions?api-version=2022-12-01",
            headers={"Authorization": f"Bearer {tok}"},
            timeout=60.0,
        )
    except Exception as e:
        logger.warning("ARM subscriptions list request failed: %s", e)
        return [], str(e)
    if r.status_code != 200:
        body = (r.text or "")[:800]
        logger.warning("ARM subscriptions list HTTP %s: %s", r.status_code, body)
        return [], body or f"HTTP {r.status_code}"
    try:
        data = r.json()
    except Exception as e:
        return [], str(e)
    value = data.get("value")
    return (value if isinstance(value, list) else []), None


def pick_first_enabled_subscription(arm_subscriptions: list[dict[str, Any]]) -> tuple[str, str] | None:
    """Returns (subscription_id, tenant_id) lowercased GUIDs, or None."""
    enabled = [s for s in arm_subscriptions if (s.get("state") or "").strip().lower() == "enabled"]
    if not enabled:
        return None
    enabled.sort(key=lambda s: ((s.get("displayName") or ""), (s.get("subscriptionId") or "")))
    s = enabled[0]
    sid = (s.get("subscriptionId") or "").strip().lower()
    tid = (s.get("tenantId") or "").strip().lower()
    if not sid or not tid:
        return None
    return sid, tid


def resolve_subscription_and_tenant_after_oauth(
    *,
    saved_subscription_id: str,
    arm_subscriptions: list[dict[str, Any]],
) -> tuple[str, str] | None:
    """
    If saved_subscription_id is set, require that subscription to appear as Enabled in ARM list.
    Otherwise pick the first enabled subscription (stable sort).
    """
    desired = (saved_subscription_id or "").strip().lower()
    enabled = [s for s in arm_subscriptions if (s.get("state") or "").strip().lower() == "enabled"]
    by_id = {(s.get("subscriptionId") or "").strip().lower(): s for s in enabled}
    if desired:
        s = by_id.get(desired)
        if not s:
            return None
        sid = (s.get("subscriptionId") or "").strip().lower()
        tid = (s.get("tenantId") or "").strip().lower()
        if sid and tid:
            return sid, tid
        return None
    return pick_first_enabled_subscription(arm_subscriptions)

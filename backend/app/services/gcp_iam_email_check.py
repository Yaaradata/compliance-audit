"""Check whether a Google account email appears on a project's IAM policy (direct user bindings)."""
from __future__ import annotations

import logging
from typing import Any

from google.cloud.resourcemanager_v3 import ProjectsClient

logger = logging.getLogger(__name__)


def check_user_email_in_project_iam(project_id: str, email: str) -> dict[str, Any]:
    """
    Read project IAM policy with current credentials and see if ``user:{email}`` appears in any binding.

    Does not expand Google Groups: access granted only via ``group:`` is reported as not a direct user binding.
    """
    pid = (project_id or "").strip()
    em = (email or "").strip().lower()
    if not pid:
        return {"ok": False, "found": False, "detail": "Project ID is empty.", "roles": []}
    if not em or "@" not in em:
        return {"ok": False, "found": False, "detail": "Valid email is required.", "roles": []}

    user_member = f"user:{em}"
    roles: list[str] = []
    group_member_count = 0
    try:
        client = ProjectsClient()
        policy = client.get_iam_policy(request={"resource": f"projects/{pid}"})
        bindings = list(getattr(policy, "bindings", None) or [])
        for b in bindings:
            members = getattr(b, "members", None) or []
            role = getattr(b, "role", "") or ""
            for m in members:
                ms = (m or "").strip()
                if ms.lower() == user_member:
                    roles.append(role)
                if ms.startswith("group:"):
                    group_member_count += 1
        roles = sorted({r for r in roles if r})
        if roles:
            detail = (
                f"This identity appears directly on the project IAM policy "
                f"({len(roles)} role(s), e.g. {', '.join(roles[:5])}"
                f"{'…' if len(roles) > 5 else ''})."
            )
            return {"ok": True, "found": True, "detail": detail, "roles": roles, "group_bindings_in_policy": group_member_count}
        hint = ""
        if group_member_count:
            hint = (
                f" The policy lists {group_member_count} group principal(s); "
                "your user may still have access via a group (not verified here)."
            )
        return {
            "ok": True,
            "found": False,
            "detail": (
                "No direct IAM binding for this email on the project."
                + hint
                + " Ask a project admin to grant a role to the user or a group they belong to."
            ),
            "roles": [],
            "group_bindings_in_policy": group_member_count,
        }
    except Exception as e:
        logger.exception("IAM policy read failed for project %s", pid)
        return {"ok": False, "found": False, "detail": str(e), "roles": []}

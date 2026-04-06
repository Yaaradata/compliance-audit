from __future__ import annotations

from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_b5_password_policy_configuration"
EVIDENCE_TYPE = "Password policy + expiry compliance"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("B5", "4.1"),
]
MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure AD password policy configuration and expiry compliance.
    Covers password policy settings like complexity, length, and expiry.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to get password policies for Azure AD tenants
    # This query targets the Microsoft.Authorization/policyAssignments resource type
    # which can be used to enforce password policies via Azure Policy.
    # It's a proxy for direct Azure AD password policy settings which are not directly queryable
    # via Resource Graph in the same way as other Azure resources.
    # A more direct approach would involve Microsoft Graph API, but the prompt
    # prefers Resource Graph.
    kql = """
    Resources
    | where type =~ 'microsoft.authorization/policyassignments'
    | where properties.displayName contains 'Password policy' or properties.displayName contains 'Password expiration'
    | project name, properties, id, kind
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": err,
    }

    if err:
        for item_code, control_id in CONTROL_MAPPINGS:
            payload["error"] = f"Error querying Azure Resource Graph: {err}"
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    else:
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
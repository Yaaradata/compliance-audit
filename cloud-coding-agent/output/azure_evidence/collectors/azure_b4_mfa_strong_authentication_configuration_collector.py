from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_b4_mfa_strong_authentication_configuration"
EVIDENCE_TYPE = "MFA posture + Conditional Access config"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [("B4", "4.2")]


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects information about Azure AD MFA and Conditional Access policies.
    This collector aims to cover controls related to strong authentication configurations.
    """
    results = []
    now = datetime.utcnow()
    max_resources = 600

    # KQL to query for Azure AD Conditional Access policies and MFA settings.
    # This query aims to capture policies that enforce MFA, including those targeting specific users,
    # applications, or locations, and also checks for general MFA registration requirements.
    kql = """
    union
    (
        // Conditional Access Policies
        search "type='microsoft.aad.policy'"
        | where properties.displayName contains "MFA" or properties.displayName contains "Multi-Factor Authentication" or properties.displayName contains "Strong Authentication"
        | project
            policyId = id,
            policyName = properties.displayName,
            policyState = properties.state,
            conditions = properties.conditions,
            grantControls = properties.grantControls,
            applicationEnforcement = properties.applicationEnforcement,
            userAction = "Conditional Access Policy"
    ),
    (
        // MFA Registration Policy (if available via AAD Graph or similar, this is a placeholder)
        // Note: Direct querying of MFA registration status for all users via Resource Graph is complex.
        // This part is a conceptual placeholder. A more robust solution might involve Microsoft Graph API.
        // For Resource Graph, we might look for related configurations if exposed.
        // As a proxy, we can look for policies that *require* MFA.
        search "type='microsoft.aad.policy'"
        | where properties.displayName contains "MFA" or properties.displayName contains "Multi-Factor Authentication"
        | where isnotempty(properties.grantControls.authenticationStrength.policyId) or isnotempty(properties.grantControls.termsOfUse.termsOfUseIdList)
        | project
            policyId = id,
            policyName = properties.displayName,
            policyState = properties.state,
            conditions = properties.conditions,
            grantControls = properties.grantControls,
            applicationEnforcement = properties.applicationEnforcement,
            userAction = "MFA Requirement Policy"
    )
    | project
        policyId,
        policyName,
        policyState,
        conditions,
        grantControls,
        applicationEnforcement,
        userAction
    """

    try:
        rows, err = query_object_array(
            credential, subscription_id, kql, max_rows=max_resources
        )
        if err:
            error_message = f"Resource Graph query failed: {err}"
            payload = {
                "collector": COLLECTOR_NAME,
                "subscription_id": subscription_id,
                "collected_at": now.isoformat(),
                "error": error_message,
                "row_count": 0,
                "resources": [],
                "resource_graph_error": str(err),
            }
        else:
            payload = {
                "collector": COLLECTOR_NAME,
                "subscription_id": subscription_id,
                "collected_at": now.isoformat(),
                "row_count": len(rows),
                "resources": rows[:max_resources],
                "resource_graph_error": None,
            }
    except Exception as e:
        error_message = f"An unexpected error occurred during collection: {str(e)}"
        payload = {
            "collector": COLLECTOR_NAME,
            "subscription_id": subscription_id,
            "collected_at": now.isoformat(),
            "error": error_message,
            "row_count": 0,
            "resources": [],
            "resource_graph_error": str(e),
        }

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
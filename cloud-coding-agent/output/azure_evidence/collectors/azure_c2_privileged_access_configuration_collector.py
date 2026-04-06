from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_c2_privileged_access_configuration"
EVIDENCE_TYPE = "Privileged access posture"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("C2", "1.2"),
    ("C2", "5.1"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects information about privileged access configurations in Azure,
    focusing on Azure AD Privileged Identity Management (PIM) roles.
    This collector aims to cover controls related to the posture of privileged access.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to find Azure AD PIM eligible roles assignments
    # This query retrieves information about roles that can be activated,
    # which is a key aspect of privileged access posture.
    kql = """
    IdentityGovernanceRoleAssignment
    | where isnotempty(roleDefinitionId)
    | where isnotempty(principalId)
    | where isnotempty(resourceId)
    | project
        roleAssignmentId,
        roleDefinitionId,
        principalId,
        resourceId,
        resourceType,
        tenantId,
        displayName = tostring(properties.displayName),
        description = tostring(properties.description),
        roleName = tostring(properties.roleName),
        roleAssignmentType = tostring(properties.roleAssignmentType),
        activationStatus = tostring(properties.activationStatus),
        justification = tostring(properties.justification),
        schedule = tostring(properties.schedule),
        eligibleAssignment = tostring(properties.eligibleAssignment),
        assignedDateTime = tostring(properties.assignedDateTime),
        lastUpdatedDateTime = tostring(properties.lastUpdatedDateTime)
    | order by assignedDateTime desc
    """

    rows, err = query_object_array(
        credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": rows[:MAX_RESOURCES_IN_PAYLOAD] if rows else [],
        "resource_graph_error": err,
    }

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
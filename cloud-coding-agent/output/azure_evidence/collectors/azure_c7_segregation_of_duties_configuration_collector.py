from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_c7_segregation_of_duties_configuration"
EVIDENCE_TYPE = "SoD control validation"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [("C7", "5.2")]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects evidence for Azure C7 Segregation of Duties configuration.
    This collector checks for Azure RBAC role assignments to ensure that
    users or groups with high-privilege roles (e.g., Owner, Contributor)
    are not also assigned roles that could allow them to bypass security controls
    or audit logs. It focuses on identifying potential conflicts in role assignments
    that might violate segregation of duties principles.
    """
    results = []
    now = datetime.utcnow()
    payload_template = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": 0,
        "resources": [],
        "resource_graph_error": None,
    }

    # KQL query to find role assignments.
    # This query aims to identify potential SoD conflicts by looking for
    # assignments of highly privileged roles (Owner, Contributor) and
    # comparing them with assignments that might allow circumvention of controls.
    # A more sophisticated query would be needed for a complete SoD check,
    # but this serves as a starting point to identify potentially problematic assignments.
    kql = """
    Resources
    | where type =~ 'microsoft.authorization/roleassignments'
    | project
        name,
        id,
        properties.roleDefinitionId,
        properties.principalId,
        properties.principalType,
        properties.scope,
        properties.description
    | join kind=inner (
        Resources
        | where type =~ 'microsoft.authorization/roledefinitions'
        | project roleDefinitionId = id, roleName = properties.roleName
    ) on $left.properties.roleDefinitionId == $right.roleDefinitionId
    | where roleName in ('Owner', 'Contributor') // Focus on highly privileged roles
    | project
        assignmentName = name,
        assignmentId = id,
        roleName,
        principalId,
        principalType,
        scope,
        description
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = payload_template.copy()
    if err:
        payload["resource_graph_error"] = str(err)
    else:
        payload["row_count"] = len(rows)
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
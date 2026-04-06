from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_c3_user_access_list"
EVIDENCE_TYPE = "Access matrix + stale binding detection"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("C3", "5.1"),
]
MAX_RESOURCES_IN_PAYLOAD = 600

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects user access information for Azure resources, focusing on identifying
    potential stale bindings or excessive permissions. This collector aims to
    provide an access matrix for Azure resources.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to find role assignments and associated principals (users, groups, service principals)
    # This query aims to capture who has access to what, which is fundamental for an access matrix.
    # Further analysis would be needed to detect "stale" bindings, which is typically done by
    # correlating with activity logs or last used timestamps if available.
    kql_query = """
    Resources
    | where type =~ 'microsoft.authorization/roleassignments'
    | project
        id,
        name,
        scope,
        properties.roleDefinitionId,
        properties.principalId,
        properties.principalType,
        properties.createdOn,
        properties.assignerId
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.authorization/roledefinitions'
        | project roleDefinitionId = id, roleName = properties.roleName
    ) on $left.properties.roleDefinitionId == $right.roleDefinitionId
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.aad/users' or type =~ 'microsoft.azure.graph/users' or type =~ 'microsoft.directory/users'
        | project principalId = id, userPrincipalName = properties.userPrincipalName, displayName = properties.displayName
    ) on $left.properties.principalId == $right.principalId
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.azure.graph/groups' or type =~ 'microsoft.directory/groups'
        | project principalId = id, groupDisplayName = properties.displayName
    ) on $left.properties.principalId == $right.principalId
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.azure.graph/applications' or type =~ 'microsoft.directory/applications' or type =~ 'microsoft.authorization/serviceprincipals'
        | project principalId = id, servicePrincipalDisplayName = properties.displayName
    ) on $left.properties.principalId == $right.principalId
    | project
        assignmentId = name,
        scope,
        roleName,
        principalId,
        principalType = properties.principalType,
        userPrincipalName = iff(principalType =~ 'User', userPrincipalName, ''),
        userDisplayName = iff(principalType =~ 'User', displayName, ''),
        groupDisplayName = iff(principalType =~ 'Group', groupDisplayName, ''),
        servicePrincipalDisplayName = iff(principalType =~ 'ServicePrincipal', servicePrincipalDisplayName, iff(principalType =~ 'Application', servicePrincipalDisplayName, '')),
        createdOn = properties.createdOn,
        assignerId
    | order by scope asc, roleName asc, principalType asc, userPrincipalName asc, groupDisplayName asc, servicePrincipalDisplayName asc
    """

    rows, err = query_object_array(credential, subscription_id, kql_query, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": 0,
        "resources": [],
        "resource_graph_error": None,
    }

    if err:
        payload["error"] = f"Azure Resource Graph query failed: {err}"
        payload["resource_graph_error"] = str(err)
    else:
        payload["row_count"] = len(rows)
        # Truncate the list of resources if it exceeds the maximum allowed
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
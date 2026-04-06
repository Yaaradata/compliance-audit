from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_a2_swift_component_inventory"
EVIDENCE_TYPE = "Asset inventory + tag compliance"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("A2", "1.1"),
    ("A2", "1.2"),
    ("A2", "1.3"),
    ("A2", "1.5"),
    ("A2", "2.8"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure Swift component inventory and tag compliance information.
    Covers controls related to asset inventory and tag compliance.
    """
    results = []
    now = datetime.utcnow()
    collected_at_iso = now.isoformat()

    # KQL query to get Swift components and their tags.
    # This query assumes 'Swift' is a common tag or part of a resource name/type
    # that identifies components relevant to the A2 controls.
    # Adjust the query based on how Swift components are actually identified in your Azure environment.
    kql = """
    Resources
    | where type =~ 'microsoft.web/sites' // Example: targeting App Services, adjust if Swift components are different resource types
    | where tags has 'Swift' or tostring(tags) contains 'swift' // Example: looking for a 'Swift' tag or keyword in tags
    | project
        id,
        name,
        type,
        location,
        tags,
        properties = bag_unpack(properties) // Unpack properties for easier access if needed
    | order by id asc
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": collected_at_iso,
        "resources": [],
        "row_count": 0,
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
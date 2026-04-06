from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_d3_software_version_inventory"
EVIDENCE_TYPE = "Software version + EOL tracking"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [("D3", "2.2")]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects software version information for Azure resources to track End-of-Life (EOL) status.
    This collector aims to cover resources that host or manage software, such as VMs, App Services,
    and AKS clusters, to provide visibility into software versions and their EOL implications.
    """
    results = []
    now = datetime.utcnow()

    kql_query = """
    Resources
    | where type =~ 'microsoft.compute/virtualmachines' or type =~ 'microsoft.web/sites' or type =~ 'microsoft.containerservice/managedclusters'
    | project
        name,
        type,
        id,
        location,
        tags,
        properties
    """

    rows, err = query_object_array(
        credential, subscription_id, kql_query, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": err,
    }

    if err:
        # If there's an error querying Resource Graph, we still append the payload
        # with the error message, but no resources will be collected.
        pass
    elif rows:
        # Process collected rows and extract relevant software version information.
        # This is a simplified example; actual extraction would depend on resource type.
        collected_resources = []
        for row in rows:
            resource_info = {
                "name": row.get("name"),
                "type": row.get("type"),
                "id": row.get("id"),
                "location": row.get("location"),
                "tags": row.get("tags"),
                # Placeholder for software version extraction logic
                "software_versions": [],
            }

            # Example: Extracting OS version for Virtual Machines
            if row.get("type") == "microsoft.compute/virtualmachines":
                os_profile = row.get("properties", {}).get("osProfile", {})
                if os_profile:
                    resource_info["software_versions"].append(
                        {
                            "name": "Operating System",
                            "version": os_profile.get("computerName"),  # Placeholder, actual OS version is deeper
                            "eol_status": "Unknown",  # EOL status would require external data
                        }
                    )
            # Example: Extracting runtime stack for App Services
            elif row.get("type") == "microsoft.web/sites":
                site_config = row.get("properties", {}).get("siteConfig", {})
                if site_config:
                    resource_info["software_versions"].append(
                        {
                            "name": "Runtime Stack",
                            "version": site_config.get("linuxFxVersion") or site_config.get("windowsFxVersion"),
                            "eol_status": "Unknown",
                        }
                    )
            # Example: Extracting Kubernetes version for AKS
            elif row.get("type") == "microsoft.containerservice/managedclusters":
                managed_cluster_properties = row.get("properties", {})
                if managed_cluster_properties:
                    resource_info["software_versions"].append(
                        {
                            "name": "Kubernetes",
                            "version": managed_cluster_properties.get("kubernetesVersion"),
                            "eol_status": "Unknown",
                        }
                    )

            collected_resources.append(resource_info)

        payload["resources"] = collected_resources[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
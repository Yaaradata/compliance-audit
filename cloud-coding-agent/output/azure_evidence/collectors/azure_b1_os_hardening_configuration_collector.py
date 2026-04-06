from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_b1_os_hardening_configuration"
EVIDENCE_TYPE = "OS hardening + patch compliance"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("B1", "2.2"),
    ("B1", "2.3"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects OS hardening and patch compliance configuration for Azure resources.
    Covers controls related to OS security configurations and patch status.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to find virtual machines and their OS patch status and some hardening configurations.
    # This is a simplified example; a real-world scenario might involve more detailed queries
    # for specific hardening configurations (e.g., security baselines, firewall rules, etc.).
    kql = """
    Resources
    | where type =~ 'microsoft.compute/virtualmachines'
    | project
        id,
        name,
        location,
        resourceGroup,
        properties.osProfile.computerName,
        properties.storageProfile.osDisk.osType,
        properties.hardwareProfile.vmSize,
        properties.osProfile.adminUsername,
        properties.diagnosticsProfile.bootDiagnostics.enabled,
        properties.networkProfile.networkInterfaces,
        properties.osProfile.linuxConfiguration.patchSettings.enableAutomaticUpdates,
        properties.osProfile.windowsConfiguration.patchSettings.patchMode
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.compute/virtualmachines/extensions'
        | where properties.type startswith 'Microsoft.Insights.VMInsights' or properties.type startswith 'Microsoft.Azure.Monitoring.DependencyAgent'
        | project vmId = tostring(split(id, '/')[8]), extensionEnabled = properties.provisioningState
    ) on $left.id == $right.vmId
    | project
        id,
        name,
        location,
        resourceGroup,
        computerName = properties_osProfile_computerName,
        osType = properties_storageProfile_osDisk_osType,
        vmSize = properties_hardwareProfile_vmSize,
        adminUsername = properties_osProfile_adminUsername,
        bootDiagnosticsEnabled = properties_diagnosticsProfile_bootDiagnostics_enabled,
        networkInterfaces = properties_networkProfile_networkInterfaces,
        linuxAutomaticUpdates = properties_osProfile_linuxConfiguration_patchSettings_enableAutomaticUpdates,
        windowsPatchMode = properties_osProfile_windowsConfiguration_patchSettings_patchMode,
        vmInsightsEnabled = extensionEnabled
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload_base = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resource_graph_error": err,
        "row_count": len(rows) if rows else 0,
    }

    if err:
        for item_code, control_id in CONTROL_MAPPINGS:
            payload = payload_base.copy()
            payload["error"] = f"Azure Resource Graph query failed: {err}"
            payload["resources"] = []
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    else:
        # Process collected rows and map to controls
        for item_code, control_id in CONTROL_MAPPINGS:
            payload = payload_base.copy()
            payload["resources"] = []

            if item_code == "B1" and control_id == "2.2":  # OS hardening configuration
                # Example: Check if Linux VMs have automatic updates enabled or Windows VMs have a patch mode set.
                # This is a basic check; real hardening would involve more specific configurations.
                hardening_resources = []
                for row in rows:
                    is_hardened = False
                    if row.get("osType", "").lower() == "linux":
                        if row.get("linuxAutomaticUpdates") is True:
                            is_hardened = True
                    elif row.get("osType", "").lower() == "windows":
                        if row.get("windowsPatchMode") in ["AutomaticByOS", "AutomaticByPlatform"]:
                            is_hardened = True

                    if is_hardened:
                        hardening_resources.append({
                            "id": row.get("id"),
                            "name": row.get("name"),
                            "resourceGroup": row.get("resourceGroup"),
                            "computerName": row.get("computerName"),
                            "osType": row.get("osType"),
                            "vmInsightsEnabled": row.get("vmInsightsEnabled"),
                        })
                payload["resources"] = hardening_resources[:MAX_RESOURCES_IN_PAYLOAD]
                results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

            elif item_code == "B1" and control_id == "2.3":  # Patch compliance
                # Example: Check for VMs that might not be up-to-date.
                # This KQL doesn't directly provide patch status, so we'll use it as a placeholder.
                # A more robust solution would involve Azure Update Management or similar services.
                # For this example, we'll just list all VMs as potentially needing patch compliance checks.
                patch_compliance_resources = []
                for row in rows:
                    patch_compliance_resources.append({
                        "id": row.get("id"),
                        "name": row.get("name"),
                        "resourceGroup": row.get("resourceGroup"),
                        "computerName": row.get("computerName"),
                        "osType": row.get("osType"),
                        "vmSize": row.get("vmSize"),
                    })
                payload["resources"] = patch_compliance_resources[:MAX_RESOURCES_IN_PAYLOAD]
                results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_a4_firewall_rule_sets"
EVIDENCE_TYPE = "Firewall rule configuration"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("A4", "1.1"),
    ("A4", "1.4"),
    ("A4", "2.1"),
]


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """Collects Azure firewall rule configurations for Network Security Groups (NSGs) and Azure Firewall policies."""
    results = []
    now = datetime.utcnow()
    max_resources = 600

    # KQL query for Network Security Group (NSG) rules
    kql_nsg = """
    resources
    | where type =~ 'microsoft.network/networksecuritygroups'
    | mv-expand rules = properties.securityRules
    | project
        name,
        id,
        location,
        resourceGroup,
        rules
    | project
        name,
        id,
        location,
        resourceGroup,
        ruleName = rules.name,
        rulePriority = rules.priority,
        ruleDirection = rules.direction,
        ruleAccess = rules.access,
        ruleProtocol = rules.protocol,
        ruleSourcePortRange = rules.sourcePortRange,
        ruleSourceAddressPrefix = rules.sourceAddressPrefix,
        ruleSourceAddressPrefixes = rules.sourceAddressPrefixes,
        ruleDestinationPortRange = rules.destinationPortRange,
        ruleDestinationAddressPrefix = rules.destinationAddressPrefix,
        ruleDestinationAddressPrefixes = rules.destinationAddressPrefixes,
        ruleDescription = rules.description
    """

    # KQL query for Azure Firewall policies (rules are nested)
    kql_azure_firewall = """
    resources
    | where type =~ 'microsoft.network/azurefirewalls/policies'
    | mv-expand ruleCollection = properties.ruleCollectionGroups
    | mv-expand rule = ruleCollection.rules
    | project
        name,
        id,
        location,
        resourceGroup,
        ruleCollectionName = ruleCollection.name,
        ruleName = rule.name,
        rulePriority = rule.priority,
        ruleDirection = rule.direction,
        ruleAction = rule.action.type,
        ruleProtocol = rule.protocol,
        ruleSourceAddresses = rule.sourceAddresses,
        ruleSourceIpGroups = rule.sourceIpGroups,
        ruleDestinationAddresses = rule.destinationAddresses,
        ruleDestinationPorts = rule.destinationPorts,
        ruleDestinationFqdns = rule.destinationFqdns,
        ruleDestinationUrlGroups = rule.destinationUrlGroups,
        ruleNetworkRuleCollection = rule.networkRuleCollection,
        ruleNatRuleCollection = rule.natRuleCollection,
        ruleApplicationRuleCollection = rule.applicationRuleCollection
    | project
        name,
        id,
        location,
        resourceGroup,
        ruleCollectionName,
        ruleName,
        rulePriority,
        ruleDirection,
        ruleAction,
        ruleProtocol,
        ruleSourceAddresses,
        ruleSourceIpGroups,
        ruleDestinationAddresses,
        ruleDestinationPorts,
        ruleDestinationFqdns,
        ruleDestinationUrlGroups,
        ruleNetworkRuleCollection,
        ruleNatRuleCollection,
        ruleApplicationRuleCollection
    """

    # Collect NSG rules
    rows_nsg, err_nsg = query_object_array(
        credential, subscription_id, kql_nsg, max_rows=max_resources
    )
    payload_nsg = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows_nsg) if rows_nsg else 0,
        "resources": rows_nsg[:max_resources] if rows_nsg else [],
        "resource_graph_error": err_nsg,
    }
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload_nsg, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    # Collect Azure Firewall rules
    rows_azure_firewall, err_azure_firewall = query_object_array(
        credential, subscription_id, kql_azure_firewall, max_rows=max_resources
    )
    payload_azure_firewall = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows_azure_firewall) if rows_azure_firewall else 0,
        "resources": rows_azure_firewall[:max_resources] if rows_azure_firewall else [],
        "resource_graph_error": err_azure_firewall,
    }
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload_azure_firewall, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_d5_remediation_tracking"
EVIDENCE_TYPE = "Remediation SLA + secure score"
SOURCE_SYSTEM = "azure-evidence"
CONTROL_MAPPINGS = [("D5", "2.7")]

MAX_RESOURCES_IN_PAYLOAD = 600

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects remediation tracking and secure score information from Azure Security Center.
    This collector aims to cover controls related to remediation SLAs and overall secure score.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to get remediation tasks and their status, along with secure score
    # This query is a placeholder and might need adjustment based on specific Azure Security Center APIs/schema.
    # It attempts to fetch information about security recommendations and their remediation status.
    kql = """
    securityresources
    | where type =~ 'microsoft.security/assessments'
    | project
        id,
        name,
        properties.displayName,
        properties.resourceDetails.id,
        properties.status,
        properties.remediation.isAutomated,
        properties.remediation.portalReference,
        properties.assessmentEndTime,
        properties.metadata.severity,
        properties.metadata.displayName,
        properties.metadata.description,
        properties.metadata.mitreTechniques
    | join kind=leftouter (
        securityresources
        | where type =~ 'microsoft.security/assessments/subassessments'
        | project
            assessmentId = tostring(split(id, '/')[8]),
            subAssessmentId = name,
            subAssessmentDisplayName = properties.displayName,
            subAssessmentStatus = properties.status,
            subAssessmentRemediationTime = properties.remediation.timeAssigned,
            subAssessmentIsAutomated = properties.remediation.isAutomated
    ) on $left.id == $right.assessmentId
    | project
        assessmentId = $left.id,
        assessmentDisplayName = $left.properties.displayName,
        resourceId = $left.properties.resourceDetails.id,
        assessmentStatus = $left.properties.status,
        remediationIsAutomated = $left.properties.remediation.isAutomated,
        remediationPortalReference = $left.properties.remediation.portalReference,
        assessmentEndTime = $left.properties.assessmentEndTime,
        severity = $left.properties.metadata.severity,
        metadataDisplayName = $left.properties.metadata.displayName,
        metadataDescription = $left.properties.metadata.description,
        mitreTechniques = $left.properties.metadata.mitreTechniques,
        subAssessmentDisplayName,
        subAssessmentStatus,
        subAssessmentRemediationTime,
        subAssessmentIsAutomated
    | where isnotempty(resourceId) // Filter for assessments related to specific resources
    | order by assessmentEndTime desc
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": None,
    }

    if err:
        payload["error"] = str(err)
        payload["resource_graph_error"] = str(err)
    elif rows:
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
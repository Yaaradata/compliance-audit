"""
SWIFT Evidence Item → AWS Asset / API mapping (from SWIFT–AWS evidence sheet).
Use this as the single source of truth for which AWS APIs to call per evidence item.
Evidence items map to SWIFT 2026 controls via evidence_sufficiency_matrix (item_code, control_id).
"""
from typing import TypedDict


class EvidenceItemSpec(TypedDict):
    item_id: str
    name: str
    aws_services: list[str]
    apis: list[str]
    evidence_type: str
    feasibility: str  # HIGH, MEDIUM, LOW
    control_ids: list[str]  # typical controls this item supports (from ESM)


# Evidence item → AWS APIs and suggested control mappings (ESM may have more)
EVIDENCE_REGISTRY: list[EvidenceItemSpec] = [
    # A: Network & Architecture
    {"item_id": "A1", "name": "Network Architecture Diagram", "aws_services": ["VPC", "EC2", "Config"], "apis": ["ec2:DescribeVpcs", "DescribeSubnets", "DescribeRouteTables", "DescribeInternetGateways", "DescribeNatGateways", "DescribeTransitGateways"], "evidence_type": "Infrastructure topology", "feasibility": "HIGH", "control_ids": ["1.1", "1.4", "1.5", "2.1"]},
    {"item_id": "A2", "name": "SWIFT Component Inventory", "aws_services": ["EC2", "SSM", "Config", "RDS", "ELB"], "apis": ["ec2:DescribeInstances", "ssm:DescribeInstanceInformation", "rds:DescribeDBInstances", "elbv2:DescribeLoadBalancers"], "evidence_type": "Asset inventory", "feasibility": "HIGH", "control_ids": ["1.1", "1.2", "1.3", "1.5", "2.8"]},
    {"item_id": "A3", "name": "Data Flow Diagrams", "aws_services": ["VPC Flow Logs", "CloudWatch", "TGW"], "apis": ["ec2:DescribeFlowLogs", "DescribeVpcPeeringConnections", "DescribeVpnConnections", "logs:FilterLogEvents"], "evidence_type": "Network flow data", "feasibility": "MEDIUM", "control_ids": ["2.1", "2.4"]},
    {"item_id": "A4", "name": "Firewall Rule Sets", "aws_services": ["EC2", "Network Firewall", "WAF", "Config"], "apis": ["ec2:DescribeSecurityGroups", "DescribeNetworkAcls", "network-firewall:DescribeRuleGroup", "wafv2:GetWebACL"], "evidence_type": "Firewall configuration", "feasibility": "HIGH", "control_ids": ["1.1", "1.4", "2.1"]},
    {"item_id": "A6", "name": "Secure Zone Design Rationale", "aws_services": ["VPC", "Config"], "apis": ["ec2:DescribeVpcs", "DescribeSubnets", "DescribeRouteTables"], "evidence_type": "Zone architecture", "feasibility": "MEDIUM", "control_ids": ["1.1", "1.4"]},
    {"item_id": "A7", "name": "Back-Office Data Flow Inventory", "aws_services": ["VPC", "TGW", "PrivateLink"], "apis": ["ec2:DescribeVpcPeeringConnections", "DescribeTransitGatewayAttachments", "DescribeVpcEndpoints"], "evidence_type": "Inter-zone connectivity", "feasibility": "HIGH", "control_ids": ["2.4"]},
    # B: System Hardening & Config
    {"item_id": "B1", "name": "OS Hardening Configuration", "aws_services": ["SSM", "Inspector", "Config"], "apis": ["ssm:ListComplianceItems", "ListInventoryEntries", "inspector2:ListFindings"], "evidence_type": "OS config + compliance", "feasibility": "HIGH", "control_ids": ["2.2", "2.3"]},
    {"item_id": "B3", "name": "Encryption Configuration", "aws_services": ["KMS", "ACM", "ELB", "RDS", "S3", "EBS"], "apis": ["kms:ListKeys", "DescribeKey", "GetKeyRotationStatus", "acm:ListCertificates", "DescribeCertificate", "elbv2:DescribeListeners", "DescribeSSLPolicies"], "evidence_type": "Encryption posture", "feasibility": "HIGH", "control_ids": ["2.5A", "2.6"]},
    {"item_id": "B4", "name": "MFA Configuration", "aws_services": ["IAM", "Config", "Security Hub"], "apis": ["iam:ListMFADevices", "GetAccountSummary", "GetCredentialReport"], "evidence_type": "Authentication config", "feasibility": "HIGH", "control_ids": ["4.2"]},
    {"item_id": "B5", "name": "Password Policy Configuration", "aws_services": ["IAM", "Config"], "apis": ["iam:GetAccountPasswordPolicy"], "evidence_type": "Password policy", "feasibility": "HIGH", "control_ids": ["4.1"]},
    {"item_id": "B6", "name": "Hardening Baseline Compliance", "aws_services": ["SSM", "Config", "Security Hub"], "apis": ["ssm:ListComplianceSummaries", "config:GetConformancePackComplianceDetails"], "evidence_type": "Baseline compliance", "feasibility": "HIGH", "control_ids": ["2.3", "2.10"]},
    {"item_id": "B7", "name": "Change Management Records", "aws_services": ["CloudTrail", "Config"], "apis": ["cloudtrail:LookupEvents", "config:GetResourceConfigHistory", "GetInsightSelectors"], "evidence_type": "Change audit trail", "feasibility": "HIGH", "control_ids": ["6.4"]},
    {"item_id": "B8", "name": "Backup Configuration", "aws_services": ["AWS Backup", "RDS", "Config"], "apis": ["backup:ListBackupPlans", "DescribeBackupVault", "rds:DescribeDBInstances", "ec2:DescribeSnapshots", "s3:GetBucketVersioning"], "evidence_type": "Backup posture", "feasibility": "HIGH", "control_ids": ["7.1"]},
    # C: Access Management
    {"item_id": "C2", "name": "Privileged Account Inventory", "aws_services": ["IAM", "Access Analyzer", "SSO"], "apis": ["iam:ListUsers", "ListAttachedUserPolicies", "access-analyzer:ListFindings"], "evidence_type": "Privileged account list", "feasibility": "HIGH", "control_ids": ["1.2", "5.1"]},
    {"item_id": "C3", "name": "User Access List", "aws_services": ["IAM", "Config"], "apis": ["iam:GenerateCredentialReport", "GetCredentialReport", "ListUsers", "ListGroupsForUser"], "evidence_type": "User access matrix", "feasibility": "HIGH", "control_ids": ["5.1"]},
    {"item_id": "C4", "name": "RBAC Role Definitions", "aws_services": ["IAM", "Access Analyzer"], "apis": ["iam:ListRoles", "GetRolePolicy", "ListAttachedRolePolicies"], "evidence_type": "RBAC structure", "feasibility": "HIGH", "control_ids": ["5.1"]},
    {"item_id": "C5", "name": "Quarterly Access Review Records", "aws_services": ["IAM", "Access Analyzer"], "apis": ["iam:GenerateServiceLastAccessedDetails", "GetServiceLastAccessedDetails", "access-analyzer:ListFindings"], "evidence_type": "Access review data", "feasibility": "HIGH", "control_ids": ["5.1"]},
    {"item_id": "C7", "name": "Token/Certificate Inventory", "aws_services": ["ACM", "IAM", "Secrets Manager"], "apis": ["acm:ListCertificates", "DescribeCertificate", "iam:ListAccessKeys", "GetAccessKeyLastUsed", "secretsmanager:ListSecrets"], "evidence_type": "Credential inventory", "feasibility": "HIGH", "control_ids": ["5.2"]},
    {"item_id": "C8", "name": "Credential Storage Evidence", "aws_services": ["Secrets Manager", "SSM", "KMS"], "apis": ["secretsmanager:DescribeSecret", "GetResourcePolicy", "ssm:DescribeParameters", "kms:DescribeKey"], "evidence_type": "Credential storage", "feasibility": "HIGH", "control_ids": ["5.4"]},
    # D: Vulnerability & Patch Mgmt
    {"item_id": "D2", "name": "Current Patch Levels", "aws_services": ["SSM", "Inspector", "Config"], "apis": ["ssm:DescribeInstancePatchStates", "DescribeInstancePatches", "inspector2:ListFindings"], "evidence_type": "Patch compliance snapshot", "feasibility": "HIGH", "control_ids": ["2.2"]},
    {"item_id": "D3", "name": "Patch Deployment Records", "aws_services": ["SSM", "CloudTrail"], "apis": ["ssm:DescribeMaintenanceWindowExecutions", "DescribePatchBaselines"], "evidence_type": "Patch deployment history", "feasibility": "HIGH", "control_ids": ["2.2"]},
    {"item_id": "D4", "name": "Vulnerability Scan Reports", "aws_services": ["Inspector", "Security Hub"], "apis": ["inspector2:ListFindings", "ListFindingAggregations", "securityhub:GetFindings"], "evidence_type": "Vulnerability scan results", "feasibility": "HIGH", "control_ids": ["2.7"]},
    {"item_id": "D5", "name": "Vulnerability Remediation Tracking", "aws_services": ["Security Hub", "Inspector"], "apis": ["securityhub:GetFindings", "BatchUpdateFindings", "inspector2:ListFindings"], "evidence_type": "Remediation tracking", "feasibility": "HIGH", "control_ids": ["2.7"]},
    # E: Monitoring & Detection
    {"item_id": "E1", "name": "Anti-Malware Configuration", "aws_services": ["GuardDuty", "SSM"], "apis": ["guardduty:GetDetector", "GetMalwareProtectionPlan", "ListFindings", "ssm:ListInventoryEntries"], "evidence_type": "Malware protection", "feasibility": "MEDIUM", "control_ids": ["6.1"]},
    {"item_id": "E2", "name": "SIEM / Logging Config & Retention", "aws_services": ["CloudTrail", "CW Logs", "VPC", "Config"], "apis": ["cloudtrail:DescribeTrails", "GetTrailStatus", "logs:DescribeLogGroups", "ec2:DescribeFlowLogs", "s3:GetBucketLogging"], "evidence_type": "Logging configuration", "feasibility": "HIGH", "control_ids": ["6.4"]},
    {"item_id": "E3", "name": "Alert Rules & Response", "aws_services": ["CloudWatch", "EventBridge", "SNS", "Security Hub"], "apis": ["cloudwatch:DescribeAlarms", "events:ListRules", "DescribeRule", "sns:ListSubscriptionsByTopic"], "evidence_type": "Alert configuration", "feasibility": "HIGH", "control_ids": ["6.4", "7.1"]},
    {"item_id": "E4", "name": "Software Integrity Verification", "aws_services": ["SSM", "Config"], "apis": ["ssm:ListInventoryEntries", "config:GetComplianceDetailsByConfigRule"], "evidence_type": "Software inventory", "feasibility": "MEDIUM", "control_ids": ["6.2", "2.10"]},
    {"item_id": "E5", "name": "Database Integrity Evidence", "aws_services": ["RDS", "Config"], "apis": ["rds:DescribeDBInstances", "DescribeDBLogFiles"], "evidence_type": "Database security", "feasibility": "HIGH", "control_ids": ["6.3"]},
    {"item_id": "E6", "name": "IDS/IPS Configuration", "aws_services": ["GuardDuty", "Network Firewall", "WAF"], "apis": ["guardduty:GetDetector", "ListFindings", "network-firewall:DescribeFirewall", "DescribeRuleGroup", "wafv2:GetWebACL"], "evidence_type": "IDS/IPS config", "feasibility": "HIGH", "control_ids": ["6.5A"]},
    {"item_id": "E7", "name": "Admin Activity Monitoring Logs", "aws_services": ["CloudTrail", "GuardDuty"], "apis": ["cloudtrail:LookupEvents", "GetInsightSelectors", "guardduty:ListFindings"], "evidence_type": "Admin audit trail", "feasibility": "HIGH", "control_ids": ["6.4"]},
    # F, G, H
    {"item_id": "F1", "name": "Vendor Inventory (partial)", "aws_services": ["Organizations", "Access Analyzer"], "apis": ["organizations:ListAccounts", "access-analyzer:ListFindings", "cloudtrail:LookupEvents"], "evidence_type": "External access inventory", "feasibility": "MEDIUM", "control_ids": ["2.8"]},
    {"item_id": "G", "name": "Physical (AWS attestation)", "aws_services": ["AWS Artifact"], "apis": ["artifact:GetReport"], "evidence_type": "AWS compliance attestation", "feasibility": "LOW", "control_ids": ["3.1"]},
    {"item_id": "H", "name": "Incident Data (partial)", "aws_services": ["Security Hub", "GuardDuty"], "apis": ["securityhub:GetFindings", "guardduty:GetFindingsStatistics", "cloudwatch:DescribeAlarmHistory"], "evidence_type": "Incident signal data", "feasibility": "LOW", "control_ids": ["7.1"]},
]


def get_control_ids_for_item(item_id: str) -> list[str]:
    """Return suggested control_ids for an evidence item (from registry)."""
    for spec in EVIDENCE_REGISTRY:
        if spec["item_id"] == item_id:
            return spec["control_ids"]
    return []


def get_all_high_feasibility_items() -> list[EvidenceItemSpec]:
    return [s for s in EVIDENCE_REGISTRY if s["feasibility"] == "HIGH"]


def get_apis_for_control(item_codes: list[str]) -> dict:
    """
    Return AWS APIs relevant to a control given its required evidence item codes.
    Returns {"aws_apis": ["ec2:DescribeVpcs", ...], "by_evidence_item": [{"item_code": "A1", "evidence_item_name": "...", "apis": [...]}]}.
    """
    by_item: list[dict] = []
    all_apis: set[str] = set()
    item_codes_set = {c.strip() for c in item_codes if c}
    for spec in EVIDENCE_REGISTRY:
        item_id = spec.get("item_id") or ""
        if item_id not in item_codes_set:
            continue
        apis = list(spec.get("apis") or [])
        name = spec.get("name") or item_id
        by_item.append({"item_code": item_id, "evidence_item_name": name, "apis": apis})
        for api in apis:
            all_apis.add(api)
    return {"aws_apis": sorted(all_apis), "by_evidence_item": by_item}

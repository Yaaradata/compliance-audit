"""
Catalog of AWS API calls made by each collector (for run-detail / audit display).
One run executes all collectors; this lists the APIs each collector uses.
"""
# Collector name -> list of AWS API/operation names (service:Operation)
COLLECTOR_AWS_APIS = {
    "iam": [
        "iam:ListUsers",
        "iam:ListRoles",
        "iam:GetUser",
        "iam:ListAttachedUserPolicies",
        "iam:ListAttachedRolePolicies",
    ],
    "ec2": [
        "ec2:DescribeInstances",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeReservations",
    ],
    "cloudtrail": [
        "cloudtrail:DescribeTrails",
        "cloudtrail:GetTrailStatus",
    ],
    "config": [
        "config:DescribeConfigurationRecorders",
        "config:DescribeConfigurationRecorderStatus",
    ],
    "ssm_patch": [
        "ec2:DescribeInstances",
        "ssm:DescribeInstancePatchStates",
        "ssm:DescribePatchBaselines",
        "ssm:DescribeMaintenanceWindowExecutions",
    ],
    "vpc_network": [
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeRouteTables",
        "ec2:DescribeInternetGateways",
        "ec2:DescribeNatGateways",
        "ec2:DescribeFlowLogs",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeNetworkAcls",
        "ec2:DescribeVpcPeeringConnections",
        "ec2:DescribeVpnConnections",
        "ec2:DescribeVpcEndpoints",
    ],
    "encryption": [
        "kms:ListKeys",
        "kms:DescribeKey",
        "kms:GetKeyRotationStatus",
        "acm:ListCertificates",
        "acm:DescribeCertificate",
        "elasticloadbalancingv2:DescribeLoadBalancers",
        "elasticloadbalancingv2:DescribeListeners",
        "elasticloadbalancingv2:DescribeSSLPolicies",
        "rds:DescribeDBInstances",
    ],
    "iam_mfa_password": [
        "iam:GetAccountPasswordPolicy",
        "iam:ListMFADevices",
        "iam:ListUsers",
        "iam:GetAccountSummary",
    ],
    "backup": [
        "backup:ListBackupPlans",
        "backup:GetBackupPlan",
        "backup:DescribeBackupVault",
        "rds:DescribeDBInstances",
        "ec2:DescribeSnapshots",
    ],
    "guardduty": [
        "guardduty:ListDetectors",
        "guardduty:GetDetector",
        "guardduty:GetFindingsStatistics",
        "guardduty:GetMalwareProtectionPlan",
    ],
    "inspector": [
        "inspector2:ListFindingAggregations",
        "inspector2:ListFindings",
    ],
    "logging": [
        "cloudtrail:DescribeTrails",
        "cloudtrail:GetTrailStatus",
        "logs:DescribeLogGroups",
        "ec2:DescribeFlowLogs",
    ],
    "access_credential": [
        "iam:ListUsers",
        "iam:ListAttachedUserPolicies",
        "iam:GenerateCredentialReport",
        "iam:GetCredentialReport",
        "iam:ListRoles",
        "iam:ListAccessKeys",
        "iam:GetAccessKeyLastUsed",
        "acm:ListCertificates",
        "acm:DescribeCertificate",
        "secretsmanager:ListSecrets",
    ],
}


# Order of collectors when run is "all" (matches __init__.py COLLECTORS)
COLLECTOR_ORDER = [
    "iam", "ec2", "cloudtrail", "config", "ssm_patch",
    "vpc_network", "encryption", "iam_mfa_password", "backup",
    "guardduty", "inspector", "logging", "access_credential",
]


def get_apis_for_run(run_collector_name: str) -> list[dict]:
    """
    Return list of { "collector": name, "apis": [...] } for a run.
    When run is "all", return all collectors and their APIs; otherwise single collector.
    """
    if run_collector_name == "all":
        return [
            {"collector": name, "apis": COLLECTOR_AWS_APIS.get(name, [])}
            for name in COLLECTOR_ORDER
        ]
    return [
        {"collector": run_collector_name, "apis": COLLECTOR_AWS_APIS.get(run_collector_name, [])}
    ]

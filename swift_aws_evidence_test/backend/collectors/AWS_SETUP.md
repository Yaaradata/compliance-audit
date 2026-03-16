# Required AWS Setup to Collect All SWIFT Evidence

To get **all** evidence items from the SWIFT–AWS mapping sheet, enable the following in your AWS account and grant the collector IAM role the listed permissions.

---

## 1. AWS Services to Enable (one-time)

| Service | Enable / one-time setup | Used for evidence items |
|--------|--------------------------|--------------------------|
| **AWS Config** | Turn on Config in each region; add rules (e.g. vpc-flow-logs-enabled, restricted-ssh, iam-password-policy). | A1, A2, B1, B4, B5, B6, B7, B8, D2, E2, E4, E5 |
| **AWS Systems Manager (SSM)** | Ensure EC2 instances have SSM Agent and are registered (or use hybrid). | A2, B1, B6, D2, D3, E1, E4 |
| **Amazon Inspector** | Enable Inspector v2 (EC2 and/or ECR). | A2, B1, D2, D4 |
| **AWS Security Hub** | Enable Security Hub; optionally enable standards (CIS, FSBP). | B4, B6, D4, D5, E3, H |
| **Amazon GuardDuty** | Enable GuardDuty in each region. | A3, A7, E1, E6, E7, F1, H |
| **AWS Access Analyzer** | Create an analyzer (account or org). | C2, C4, C5, F1 |
| **AWS Backup** | Create backup plans if you use Backup for RDS/EBS/FSx. | B8 |
| **CloudTrail** | At least one trail (prefer org trail, multi-region, log file validation). | B7, E2, E7, F1 |
| **VPC Flow Logs** | Create flow logs for VPCs you want to evidence. | A1, A3, E2 |

Optional for full coverage:

- **AWS Artifact** (for G – physical/attestation): subscribe to SOC 2 / ISO reports (manual download or API if allowed).
- **AWS Organizations** (for F1): if using multi-account.

---

## 2. IAM Policy for the Collector

Attach a policy to the IAM user/role whose credentials are in `.env` (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) with at least:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeVpcs", "ec2:DescribeSubnets", "ec2:DescribeRouteTables",
        "ec2:DescribeInternetGateways", "ec2:DescribeNatGateways", "ec2:DescribeTransitGateways", "ec2:DescribeTransitGatewayAttachments",
        "ec2:DescribeInstances", "ec2:DescribeSecurityGroups", "ec2:DescribeNetworkAcls",
        "ec2:DescribeFlowLogs", "ec2:DescribeVpcPeeringConnections", "ec2:DescribeVpnConnections", "ec2:DescribeVpcEndpoints",
        "ec2:DescribeSnapshots", "ec2:DescribeVolumes",
        "iam:ListUsers", "iam:ListRoles", "iam:ListAttachedUserPolicies", "iam:ListAttachedRolePolicies", "iam:GetRolePolicy", "iam:GetAccountPasswordPolicy",
        "iam:GetCredentialReport", "iam:GenerateCredentialReport", "iam:ListGroupsForUser", "iam:ListMFADevices", "iam:GetAccountSummary",
        "iam:ListAccessKeys", "iam:GetAccessKeyLastUsed", "iam:GenerateServiceLastAccessedDetails", "iam:GetServiceLastAccessedDetails",
        "cloudtrail:DescribeTrails", "cloudtrail:GetTrailStatus", "cloudtrail:LookupEvents", "cloudtrail:GetInsightSelectors",
        "ssm:DescribeInstanceInformation", "ssm:ListComplianceItems", "ssm:ListInventoryEntries", "ssm:ListComplianceSummaries",
        "ssm:DescribeInstancePatchStates", "ssm:DescribeInstancePatches", "ssm:DescribeMaintenanceWindowExecutions", "ssm:DescribePatchBaselines",
        "ssm:DescribeParameters", "ssm:GetParameters",
        "config:DescribeConfigurationRecorders", "config:DescribeConfigurationRecorderStatus", "config:GetResourceConfigHistory", "config:GetComplianceDetailsByConfigRule", "config:GetConformancePackComplianceDetails",
        "kms:ListKeys", "kms:DescribeKey", "kms:GetKeyRotationStatus",
        "acm:ListCertificates", "acm:DescribeCertificate",
        "elasticloadbalancing:DescribeLoadBalancers", "elasticloadbalancingv2:DescribeLoadBalancers", "elasticloadbalancingv2:DescribeListeners", "elasticloadbalancingv2:DescribeSSLPolicies",
        "rds:DescribeDBInstances", "rds:DescribeDBLogFiles",
        "s3:GetBucketVersioning", "s3:GetBucketLogging",
        "logs:DescribeLogGroups", "logs:FilterLogEvents",
        "backup:ListBackupPlans", "backup:DescribeBackupVault", "backup:ListRecoveryPointsByBackupVault",
        "secretsmanager:ListSecrets", "secretsmanager:DescribeSecret", "secretsmanager:GetResourcePolicy",
        "guardduty:GetDetector", "guardduty:ListDetectors", "guardduty:ListFindings", "guardduty:GetFindingsStatistics", "guardduty:GetMalwareProtectionPlan",
        "inspector2:ListFindings", "inspector2:ListFindingAggregations", "inspector2:CreateFindingsReport",
        "securityhub:GetFindings", "securityhub:ListFindingAggregators", "securityhub:BatchUpdateFindings",
        "access-analyzer:ListFindings", "access-analyzer:ListAnalyzers",
        "network-firewall:DescribeFirewall", "network-firewall:DescribeRuleGroup",
        "wafv2:GetWebACL", "wafv2:ListWebACLs",
        "events:ListRules", "events:DescribeRule",
        "sns:ListSubscriptionsByTopic", "sns:ListTopics",
        "cloudwatch:DescribeAlarms", "cloudwatch:DescribeAlarmHistory",
        "organizations:ListAccounts"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::swift-evidence", "arn:aws:s3:::swift-evidence/*"]
    }
  ]
}
```

(Adjust `swift-evidence` if your bucket name is different.)

---

## 3. After Setup

1. Ensure **AWS Config** is recording and rules are deployed (so Config API calls return data).
2. Run **Fetch AWS evidence** from the Control View (or `python -m runner.run_collector`). All registered collectors will run; those that need GuardDuty, Inspector, Security Hub, etc. will only return data if those services are enabled and have data.
3. For evidence items that still show no data, check: region (some services are per-region), and that the relevant resource types exist (e.g. RDS for E5, Backup plans for B8).

---

## 4. Evidence Items by Feasibility

- **HIGH**: Fully automatable with the APIs above; enable the services and use the collector.
- **MEDIUM**: Automatable but may need extra setup (e.g. flow log delivery, SSM inventory).
- **LOW**: G (Artifact) and H (incident trends) — partial automation or manual download.

See `evidence_mapping.py` for the full list of item → API → control mappings.

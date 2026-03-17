# AWS Evidence Collectors

Collectors gather evidence from AWS APIs and store JSON in the DB (`response_json`) and upload a copy to GCS.

## Environment (backend/.env)

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` – credentials with the permissions below
- `AWS_DEFAULT_REGION` – e.g. `ap-south-1`, `us-east-1`
- `AWS_ACCOUNT_ID` – your AWS account ID (optional; used for GCS paths and EBS snapshot owner filter)

## Run behavior

- **Fetch AWS evidence** runs all collectors. If a collector throws, the run continues; errors are stored on the run (`error_message`) and the run status is set to `partial`. The UI shows these errors in Run history when you expand a run.
- Evidence content is always read from `response_json` in the DB. Empty arrays in the JSON (e.g. GuardDuty `detector_configs: []`) mean the AWS API returned no data (e.g. no detectors in that region) or the credentials lack permission.

## Required AWS permissions (per collector)

Ensure the IAM user/role used by the backend has at least:

| Collector | AWS APIs / permissions |
|-----------|------------------------|
| iam | `iam:ListUsers`, `iam:ListRoles`, pagination |
| ec2 | `ec2:DescribeInstances`, `ec2:DescribeSecurityGroups` |
| cloudtrail | `cloudtrail:DescribeTrails`, `cloudtrail:GetTrailStatus` |
| config | `config:DescribeConfigurationRecorders`, `config:DescribeConfigurationRecorderStatus` |
| ssm_patch | `ssm:DescribeInstancePatchStates`, `ssm:DescribePatchBaselines`, `ec2:DescribeInstances` |
| vpc_network | `ec2:DescribeVpcs`, `ec2:DescribeSubnets`, `ec2:DescribeRouteTables`, `ec2:DescribeInternetGateways`, `ec2:DescribeFlowLogs`, `ec2:DescribeSecurityGroups`, `ec2:DescribeNetworkAcls`, `ec2:DescribeVpcPeeringConnections`, `ec2:DescribeVpnConnections`, `ec2:DescribeVpcEndpoints`, `ec2:DescribeNatGateways` |
| encryption | `kms:ListKeys`, `kms:DescribeKey`, `kms:GetKeyRotationStatus`, `acm:ListCertificates`, `acm:DescribeCertificate`, `elbv2:DescribeLoadBalancers`, `elbv2:DescribeListeners`, `rds:DescribeDBInstances` |
| iam_mfa_password | `iam:GetAccountPasswordPolicy`, `iam:ListUsers`, `iam:ListMFADevices`, `iam:GetAccountSummary` |
| backup | `backup:ListBackupPlans`, `backup:GetBackupPlan`, `rds:DescribeDBInstances`, `ec2:DescribeSnapshots` |
| guardduty | `guardduty:ListDetectors`, `guardduty:GetDetector`, `guardduty:GetFindingsStatistics` |
| inspector | `inspector2:*` (or `inspector2:ListFindingAggregations`, `inspector2:ListFindings`) |
| logging | `cloudtrail:DescribeTrails`, `cloudtrail:GetTrailStatus`, `logs:DescribeLogGroups`, `ec2:DescribeFlowLogs` |
| access_credential | `iam:ListUsers`, `iam:ListAttachedUserPolicies`, `iam:GenerateCredentialReport`, `iam:GetCredentialReport`, `iam:ListRoles`, `acm:ListCertificates`, `iam:ListAccessKeys`, `iam:GetAccessKeyLastUsed`, `secretsmanager:ListSecrets` |

If a service is not enabled in the account/region (e.g. GuardDuty, Inspector, Config), the collector will still run and store a payload; lists may be empty or contain an `error` field.

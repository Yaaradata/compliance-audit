# SWIFT 2026 GCP evidence — workbook-aligned collector plan

Source: `GCP_Evidence_CollectionforSWIFT_v2026_Updated.xlsx` (domains A–H, automation feasibility, phased implementation); parsed at runtime for structured collection APIs.

## Design

- Each **collector module** calls one or more GCP APIs, emits one **payload**, and fans out DB rows using **`swift_control_pairs(...)`** from `collectors/control_mappings.py` (same SWIFT item/control matrix as AWS).
- **Not fully automatable** in code alone: **A5**, **B2**, **B6** (partially via OS Config + Asset + SCC when licensed), **C1/C6/C9**, **D1/D6**, **F2–F4**, **G** (Compliance Reports download), **H** (mostly policy/training). Those remain manual or need SCC Premium / Workspace Admin SDK / Compliance Reports APIs.

## Required collector modules (control-wise / evidence-item-wise)

| Phase | Collector (module) | Evidence items | Primary GCP APIs (from workbook) |
|------|---------------------|----------------|----------------------------------|
| 1 | `network_topology` | A1 | compute.networks.list, subnetworks.aggregatedList, routes.list, routers.aggregatedList, vpnTunnels.aggregatedList |
| 1 | `swift_component_inventory` | A2 | compute.instances.aggregatedList, sqladmin.instances.list, forwardingRules.aggregatedList, run.services.list |
| 1 | `network_flow_and_segmentation` | A3, A6 | subnetworks (logConfig, PGA), networks (peering); logging.entries.list optional later |
| 1 | `firewall_and_edge` | A4, E6 (partial) | compute.firewalls.list, networkFirewallPolicies, securityPolicies (Cloud Armor) |
| 1 | `interconnectivity` | A7 | networks.listPeeringRoutes (per VPC), interconnectAttachments, serviceAttachments |
| 1 | `kms_encryption` | B3 | cloudkms.cryptoKeys.list / versions, sslPolicies.list, sql (encryption flags), certificatemanager optional |
| 1 | `backup_snapshot` | B8 | snapshots.list, resourcePolicies (snapshot schedules), sql backupConfiguration |
| 1 | `logging_posture` | E2 | logging.sinks.list, logging.logBuckets.list, subnetworks logConfig |
| 2 | `project_iam_policy` | C2, C3 (partial) | resourcemanager.projects.getIamPolicy |
| 2 | `rbac_roles` | C4 | iam.roles.list (project) |
| 2 | `service_accounts_keys` | C3, C7 (partial) | iam.serviceAccounts.list, serviceAccountKeys.list |
| 2 | `secret_manager_inventory` | C8 | secretmanager.secrets.list |
| 2 | `osconfig_posture` | B1, D2, E4 (partial) | osconfig.inventories.list, vulnerabilityReports.list; patchDeployments optional |
| 2 | `cloud_asset_resources` | B6 (partial), breadth | cloudasset.assets.searchAllResources (scoped, capped) |
| 2 | `sql_database_posture` | E5 (partial), A2 (partial) | sqladmin.instances.list |
| 3 | `monitoring_alerts` | E3 | monitoring.alertPolicies.list |
| 3+ | **Future** | C5, D3–D5, E1, E7, F1, H (partial) | SCC findings, Recommender, Policy Analyzer, Cloud Audit export, Container Analysis, etc. |

## What the codebase implements today

Implementations live under `backend/app/gcp_evidence/collectors/`. Modules above replace the earlier minimal three-collector POC. SCC, Workspace Admin (B4/B5), Backup DR service, Policy Analyzer, and full Cloud Audit history are **out of scope** for the current code path unless you add APIs, roles, and (for SCC) billing tier.

## IAM hint

Workbook §5 suggests a **read-only custom role** across ~15 services; start with service-specific viewer roles on the target project and expand as `PERMISSION_DENIED` appears.

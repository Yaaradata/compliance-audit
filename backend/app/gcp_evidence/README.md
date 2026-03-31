# GCP evidence (SWIFT 2026)

Collectors persist to `swift_2026.collector_runs` / `swift_2026.evidence` with `cloud_provider=gcp`.  
**Control coverage** comes from the same SWIFT matrix as AWS (`evidence_mapping.EVIDENCE_REGISTRY`) via `collectors/control_mappings.py`.  
**Collector design** is aligned to `GCP_Evidence_CollectionforSWIFT_v2026_Updated.xlsx` (server path via `GCP_EVIDENCE_WORKBOOK_PATH` or repo root) — see `SWIFT_2026_GCP_COLLECTOR_PLAN.md` and `docs/gcp-api-driven-architecture.md`.

## Environment

- `GCP_EVIDENCE_PROJECT_ID` — project to scan (required).
- Application Default Credentials (service account key, `gcloud auth application-default login`, or attached SA on Cloud Run).

## Enable APIs (project)

Enable at minimum: **Compute**, **Cloud Resource Manager**, **Cloud Logging**, **Cloud KMS**, **Secret Manager**, **IAM** (for `roles.list` / service accounts), **Cloud Asset**, **Cloud OS Config** (optional, for VM Manager vulnerability summaries), **Cloud Monitoring**, **Cloud SQL Admin**, **Cloud Run**, **Certificate Manager** (optional), **Cloud Asset API**.

## Collector modules (run order)

| ID | SWIFT items (primary) | Notes |
|----|------------------------|--------|
| `network_topology` | A1 | VPC, subnets, routes, routers, VPN |
| `swift_component_inventory` | A2, E5 | VMs, LBs, Cloud SQL, Cloud Run |
| `network_flow_segmentation` | A3, A6 | Flow logs / PGA / peering summary |
| `firewall_and_edge` | A4 | VPC firewalls, hierarchical policies, Cloud Armor |
| `interconnectivity` | A7 | Peering routes, interconnect, PSC |
| `kms_encryption` | B3 | KMS keys, SSL policies, certs (if enabled) |
| `backup_snapshot` | B8 | Snapshots, snapshot policies, SQL backup flags |
| `logging_posture` | E2 | Sinks, log buckets, subnet flow flags |
| `project_iam_policy` | C2, C3 | Project IAM bindings |
| `rbac_roles` | C4 | Custom roles (`iam.roles.list`) |
| `service_accounts_keys` | C3, C7 | SAs + user-managed keys |
| `secret_manager_inventory` | C8 | Secret metadata only |
| `osconfig_posture` | B1, D2 | Vulnerability reports per zone (VM Manager) |
| `cloud_asset_inventory` | B6 (partial) | `searchAllResources` (capped) |
| `monitoring_alerts` | E3 | Alert policies |

**Not implemented as API collectors:** B4/B5 (Workspace Admin SDK), C5/Recommender, D3/D4/D5 (patch jobs / SCC findings / Container Analysis), E1/E6/E7 (SCC ETD / IDS / audit log export), F/G/H as in workbook (mostly manual or Compliance Reports).

## HTTP

Base path: **`/api/v1/cloud/gcp`** (AWS evidence uses **`/api/v1/cloud/aws`**).

- `GET /api/v1/cloud/gcp/config?cycle_id=...`
- `POST /api/v1/cloud/gcp/credentials/test?cycle_id=...`
- `POST /api/v1/cloud/gcp/runs/collect?cycle_id=...`
- `GET /api/v1/cloud/gcp/runs?cycle_id=...`
- `GET /api/v1/cloud/gcp/validation/precheck?cycle_id=...` — IAM + optional enabled APIs sample
- `GET /api/v1/cloud/gcp/workbook/mapping?cycle_id=...` — parsed Excel sheet 1 (evidence ↔ API text)
- `POST /api/v1/cloud/gcp/runs/collect-structured?cycle_id=...` — same persistence as collect + `StandardEvidenceResult[]` body
- `GET /api/v1/cloud/gcp/evidence?cycle_id=...`

## Frontend

IT Expert: **GCP** nav — `/gcp` and `/gcp/dashboard`.

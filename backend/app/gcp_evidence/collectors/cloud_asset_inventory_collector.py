"""B6 (partial) — Cloud Asset searchAllResources snapshot (capped) for resource inventory breadth."""
from __future__ import annotations

from datetime import datetime

from google.cloud.asset_v1 import AssetServiceClient
from google.cloud.asset_v1.types import SearchAllResourcesRequest

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "cloud_asset_inventory"
EVIDENCE_TYPE = "Baseline compliance"
SOURCE_SYSTEM = "gcp-cloudasset"
CONTROL_MAPPINGS = swift_control_pairs("B6")

# High-value asset types for SWIFT network/access posture (workbook)
_ASSET_TYPES = (
    "compute.googleapis.com/Instance",
    "compute.googleapis.com/Firewall",
    "compute.googleapis.com/Subnetwork",
    "compute.googleapis.com/Network",
    "sqladmin.googleapis.com/Instance",
    "iam.googleapis.com/ServiceAccount",
    "secretmanager.googleapis.com/Secret",
    "run.googleapis.com/Service",
)


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    scope = f"projects/{project_id}"
    try:
        client = AssetServiceClient()
        assets: list[dict] = []
        request = SearchAllResourcesRequest(
            scope=scope,
            asset_types=_ASSET_TYPES,
            page_size=100,
        )
        for page in client.search_all_resources(request=request):
            assets.append(
                {
                    "asset_type": page.asset_type or None,
                    "name": page.name or None,
                    "display_name": page.display_name or None,
                    "location": page.location or None,
                }
            )
            if len(assets) >= 500:
                break
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "asset_count": len(assets),
            "assets": assets,
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": str(e)}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results

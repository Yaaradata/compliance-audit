"""Derive GCP-style `instances` hints from ARM / Resource Graph rows for Vertex autofill (A2 spreadsheet)."""
from __future__ import annotations

from typing import Any


def vm_inventory_rows_for_llm(resources: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    """
    Map microsoft.compute/virtualmachines resources into a compact list similar to
    GCP swift_component_inventory `instances` (name, location, OS hint, NIC refs) so the
    shared gcp_autofill prompt can ground spreadsheet answers.
    """
    out: list[dict[str, Any]] = []
    for r in resources or []:
        if not isinstance(r, dict):
            continue
        typ = (r.get("type") or "").lower()
        if typ != "microsoft.compute/virtualmachines":
            continue
        props = r.get("properties")
        if not isinstance(props, dict):
            props = {}
        hw = props.get("hardwareProfile")
        vm_size = hw.get("vmSize") if isinstance(hw, dict) else None
        storage = props.get("storageProfile")
        os_type = None
        if isinstance(storage, dict):
            od = storage.get("osDisk")
            if isinstance(od, dict):
                os_type = od.get("osType")
        nic_names: list[str] = []
        net = props.get("networkProfile")
        if isinstance(net, dict):
            for nic in (net.get("networkInterfaces") or [])[:6]:
                if isinstance(nic, dict):
                    rid = nic.get("id") or ""
                    if isinstance(rid, str) and rid:
                        nic_names.append(rid.split("/")[-1])
        tags = r.get("tags")
        if not isinstance(tags, dict):
            tags = {}
        out.append(
            {
                "name": r.get("name"),
                "resource_group": r.get("resourceGroup"),
                "location": r.get("location"),
                "vm_size": vm_size,
                "os_type": os_type,
                "network_interfaces": nic_names,
                "provisioning_state": props.get("provisioningState"),
                "tags": tags,
            }
        )
    return out[:500]

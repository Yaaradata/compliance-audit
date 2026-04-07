#!/usr/bin/env python3
"""
One-shot fix: convert A2 inventory_rows and A7 flow_inventory_rows
from pipe-delimited text to proper JSON arrays in demo."2026_demo".

Usage (from repo root):
  python backend/scripts/fix_demo_spreadsheet_json.py
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

# Keys must match spreadsheet column `key` values (see seed_evidence_questions.A2_COLUMNS).
A2_INVENTORY_ROWS = json.dumps([
    {
        "hostname": "SWIFT-MSG-01",
        "ip_address": "10.10.1.10",
        "os_version": "Windows Server 2022",
        "function_role": "Messaging Interface",
        "zone": "Secure Zone",
        "environment": "Production",
        "physical_virtual": "Physical",
        "hypervisor_platform": "N/A (bare metal)",
        "host_mapping": "",
        "shared_host": "No",
        "cloud_provider": "On-premises",
        "cloud_service_model": "",
        "third_party_managed": "No",
        "vendor_name": "SWIFT",
        "mgmt_access_type": "On-Site",
        "bridging_role": "Not applicable",
        "dedicated_shared": "Dedicated",
        "notes": "Primary Alliance Access messaging interface; MFA enforced for admin.",
    },
    {
        "hostname": "SWIFT-COMM-01",
        "ip_address": "10.10.1.11",
        "os_version": "Linux RHEL 8.9",
        "function_role": "Communication Interface",
        "zone": "Secure Zone",
        "environment": "Production",
        "physical_virtual": "Physical",
        "hypervisor_platform": "N/A (bare metal)",
        "host_mapping": "",
        "shared_host": "No",
        "cloud_provider": "On-premises",
        "cloud_service_model": "",
        "third_party_managed": "No",
        "vendor_name": "SWIFT",
        "mgmt_access_type": "On-Site",
        "bridging_role": "Not applicable",
        "dedicated_shared": "Dedicated",
        "notes": "SWIFTNet Link (SNL) gateway; hardened per bank build standard.",
    },
    {
        "hostname": "SWIFT-GUI-01",
        "ip_address": "10.10.1.20",
        "os_version": "Windows 11 Pro",
        "function_role": "GUI",
        "zone": "Secure Zone",
        "environment": "Production",
        "physical_virtual": "Physical",
        "hypervisor_platform": "N/A (desktop workstation)",
        "host_mapping": "",
        "shared_host": "No",
        "cloud_provider": "On-premises",
        "cloud_service_model": "",
        "third_party_managed": "No",
        "vendor_name": "Dell",
        "mgmt_access_type": "On-Site",
        "bridging_role": "Not applicable",
        "dedicated_shared": "Dedicated",
        "notes": "Dedicated operator GUI; screen lock and full-disk encryption enabled.",
    },
    {
        "hostname": "SWIFT-HSM-01",
        "ip_address": "10.10.1.30",
        "os_version": "Luna SA7 firmware 7.7.1",
        "function_role": "HSM",
        "zone": "Secure Zone",
        "environment": "Production",
        "physical_virtual": "Physical",
        "hypervisor_platform": "N/A (appliance)",
        "host_mapping": "",
        "shared_host": "No",
        "cloud_provider": "On-premises",
        "cloud_service_model": "",
        "third_party_managed": "Yes",
        "vendor_name": "Thales",
        "mgmt_access_type": "On-Site",
        "bridging_role": "Not applicable",
        "dedicated_shared": "Dedicated",
        "notes": "Luna Network HSM; key ceremonies logged; mTLS to messaging layer.",
    },
    {
        "hostname": "SWIFT-JUMP-01",
        "ip_address": "10.10.1.5",
        "os_version": "Windows Server 2022",
        "function_role": "Jump Server",
        "zone": "Secure Zone",
        "environment": "Production",
        "physical_virtual": "Virtual",
        "hypervisor_platform": "VMware vSphere 8.0",
        "host_mapping": "SWIFT-ESXi-CL01",
        "shared_host": "No",
        "cloud_provider": "On-premises",
        "cloud_service_model": "IaaS",
        "third_party_managed": "No",
        "vendor_name": "Dell",
        "mgmt_access_type": "Both",
        "bridging_role": "Not applicable",
        "dedicated_shared": "Dedicated",
        "notes": "Privileged session broker; no internet egress; RDP restricted by AD group.",
    },
    {
        "hostname": "SWIFT-FW-01",
        "ip_address": "10.10.1.1",
        "os_version": "PAN-OS 11.1.3",
        "function_role": "Network Device",
        "zone": "DMZ",
        "environment": "Production",
        "physical_virtual": "Physical",
        "hypervisor_platform": "N/A (network appliance)",
        "host_mapping": "",
        "shared_host": "No",
        "cloud_provider": "On-premises",
        "cloud_service_model": "",
        "third_party_managed": "Yes",
        "vendor_name": "Palo Alto",
        "mgmt_access_type": "Remote",
        "bridging_role": "Not applicable",
        "dedicated_shared": "Dedicated",
        "notes": "Perimeter boundary firewall (Secure Zone ↔ enterprise); deny-by-default; annual rules review.",
    },
    {
        "hostname": "SWIFT-BRIDGE-01",
        "ip_address": "10.10.1.40",
        "os_version": "Linux RHEL 8.9",
        "function_role": "Bridging Server",
        "zone": "Secure Zone",
        "environment": "Production",
        "physical_virtual": "Virtual",
        "hypervisor_platform": "KVM (RHEL virt-host)",
        "host_mapping": "SWIFT-HV-BR01",
        "shared_host": "No",
        "cloud_provider": "On-premises",
        "cloud_service_model": "IaaS",
        "third_party_managed": "No",
        "vendor_name": "Internal",
        "mgmt_access_type": "On-Site",
        "bridging_role": "Yes — v2026 mandatory SAP ↔ SWIFT bridge",
        "dedicated_shared": "Dedicated",
        "notes": "Back-office bridge; TLS 1.3 + mTLS; see A7 DF-003 for flow inventory.",
    },
], ensure_ascii=False)


# Keys match evidence_based_questions options for A7 flow_inventory_rows (v2026 CSV).
A7_FLOW_INVENTORY_ROWS = json.dumps([
    {
        "flow_id": "DF-001",
        "source_system": "SAP ERP (Back-Office)",
        "destination_system": "SWIFT Messaging Interface (Alliance Access)",
        "protocol": "TLS 1.3 (mTLS)",
        "direction": "Inbound",
        "flow_classification": "New Direct Flow (mandatory protection)",
        "bridging_server": "N/A",
        "protection_method": "End-to-End (AES-GCM)",
        "encryption_algorithm": "AES-256-GCM (128-bit keys in HSM)",
        "compliance_status": "Protected",
        "migration_plan_ref": "N/A — already on mandatory protected path (verify CHG-2025-ARCH-01)",
        "notes": "ERP payment files into secure zone; cert pinning on both ends; reviewed Q3 2025.",
    },
    {
        "flow_id": "DF-002",
        "source_system": "SWIFT Messaging Interface (Alliance Access)",
        "destination_system": "SAP ERP (Back-Office)",
        "protocol": "TLS 1.3 (mTLS)",
        "direction": "Outbound",
        "flow_classification": "New Direct Flow (mandatory protection)",
        "bridging_server": "N/A",
        "protection_method": "End-to-End (AES-GCM)",
        "encryption_algorithm": "AES-256-GCM (128-bit keys in HSM)",
        "compliance_status": "Protected",
        "migration_plan_ref": "N/A — mirror of DF-001; same control set",
        "notes": "Status/ACK back to ERP; same ciphers and cert chain as inbound.",
    },
    {
        "flow_id": "DF-003",
        "source_system": "SAP ERP (Back-Office)",
        "destination_system": "SWIFT Messaging Interface (via bridge)",
        "protocol": "TLS 1.3 (mTLS) + REST",
        "direction": "Bidirectional",
        "flow_classification": "Bridging Server Flow (mandatory protection)",
        "bridging_server": "SWIFT-BRIDGE-01",
        "protection_method": "Authenticated API over TLS",
        "encryption_algorithm": "AES-256-GCM; RSA-4096 server certs",
        "compliance_status": "Protected",
        "migration_plan_ref": "Bridge hardening CHG-2025-BRG-14 (closed 2025-10-01)",
        "notes": "Mandatory v2026 bridging path; SAP RFC disabled; JSON API with OAuth client credentials.",
    },
    {
        "flow_id": "DF-004",
        "source_system": "Thales Luna HSM",
        "destination_system": "SWIFT Messaging Interface",
        "protocol": "TLS 1.3 (HSM partition)",
        "direction": "Bidirectional",
        "flow_classification": "New Direct Flow (mandatory protection)",
        "bridging_server": "N/A",
        "protection_method": "End-to-End (LAU)",
        "encryption_algorithm": "AES-256 + SWIFT LAU keys (HSM-backed)",
        "compliance_status": "Protected",
        "migration_plan_ref": "N/A — LAU alignment with CSCF crypto inventory",
        "notes": "Dedicated VLAN to HSM; no routing to back-office; KM team quarterly review.",
    },
    {
        "flow_id": "DF-005",
        "source_system": "Operator GUI (SWIFT-GUI-01)",
        "destination_system": "Alliance Access 7.5",
        "protocol": "HTTPS / TLS 1.3",
        "direction": "Inbound",
        "flow_classification": "New Direct Flow (mandatory protection)",
        "bridging_server": "N/A",
        "protection_method": "Per-Leg TLS",
        "encryption_algorithm": "TLS 1.3 (ECDHE) + AES-256-GCM; BitLocker on GUI",
        "compliance_status": "Protected",
        "migration_plan_ref": "N/A — operator access reviewed under ORG-2026-OP-03",
        "notes": "Dedicated operator PC; no split tunnel; session timeout 15 min; AA GUI path documented.",
    },
], ensure_ascii=False)


def main() -> int:
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "compliance"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        sslmode="require" if os.getenv("DB_SSL", "false").lower() == "true" else "disable",
    )
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE demo."2026_demo" SET answers = %s '
                "WHERE UPPER(evidence_item_id) = 'A2' AND question_key = 'inventory_rows'",
                (A2_INVENTORY_ROWS,),
            )
            a2 = cur.rowcount
            cur.execute(
                'UPDATE demo."2026_demo" SET answers = %s '
                "WHERE UPPER(evidence_item_id) = 'A7' AND question_key = 'flow_inventory_rows'",
                (A7_FLOW_INVENTORY_ROWS,),
            )
            a7 = cur.rowcount
        conn.commit()
        print(f"[OK] Updated A2 inventory_rows ({a2} row(s)), A7 flow_inventory_rows ({a7} row(s))")
        return 0
    except Exception as exc:
        conn.rollback()
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main())

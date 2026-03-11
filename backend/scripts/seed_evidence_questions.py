#!/usr/bin/env python3
"""
Seed evidence_based_questions table in swift_2025 and swift_2026 schemas.
Extracts questions from frontend evidence files and inserts into DB.

Usage (from repo root):
  python backend/scripts/seed_evidence_questions.py [--output-sql]

With --output-sql: writes SQL files instead of executing against DB.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
REPO_ROOT = BACKEND_DIR.parent

# Add backend to path for app config
sys.path.insert(0, str(BACKEND_DIR))


def esc_sql(s: str | None) -> str:
    """Escape single quotes for SQL."""
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def esc_json(val) -> str:
    """Escape for JSONB in SQL."""
    return "'" + json.dumps(val).replace("'", "''") + "'"


# A2 spreadsheet columns for options JSONB (type must be string "text" not builtin)
A2_COLUMNS = [
    {"key": "hostname", "label": "Hostname", "type": "text", "required": True, "options": []},
    {"key": "ip_address", "label": "IP Address", "type": "text", "required": True, "options": []},
    {"key": "os_version", "label": "OS Version", "type": "text", "required": True, "options": []},
    {"key": "function_role", "label": "Function/Role", "type": "select", "required": True,
     "options": ["Messaging Interface", "Communication Interface", "GUI", "SwiftNet Link", "HSM",
                "Customer Connector", "Jump Server", "Dedicated Operator PC", "General-Purpose PC",
                "Network Device", "Bridging Server", "Other"]},
    {"key": "zone", "label": "Zone", "type": "select", "required": True,
     "options": ["Secure Zone", "Customer Zone", "DMZ", "Enterprise", "DR"]},
    {"key": "environment", "label": "Environment", "type": "select", "required": True,
     "options": ["Production", "Test", "DR", "Backup"]},
    {"key": "physical_virtual", "label": "Physical/Virtual", "type": "select", "required": True,
     "options": ["Physical", "Virtual", "Container", "Cloud"]},
    {"key": "hypervisor_platform", "label": "Hypervisor/Platform", "type": "text", "required": False, "options": []},
    {"key": "host_mapping", "label": "VM Host", "type": "text", "required": False, "options": []},
    {"key": "shared_host", "label": "Shared Host?", "type": "select", "required": False, "options": ["", "No", "Yes"]},
    {"key": "cloud_provider", "label": "Cloud Provider", "type": "text", "required": False, "options": []},
    {"key": "cloud_service_model", "label": "Service Model", "type": "select", "required": False,
     "options": ["", "IaaS", "PaaS", "SaaS"]},
    {"key": "third_party_managed", "label": "Third-Party Managed?", "type": "select", "required": False,
     "options": ["", "No", "Yes"]},
    {"key": "vendor_name", "label": "Vendor Name", "type": "text", "required": False, "options": []},
    {"key": "mgmt_access_type", "label": "Mgmt Access", "type": "select", "required": False,
     "options": ["", "On-Site", "Remote", "Both"]},
    {"key": "bridging_role", "label": "Bridging Role", "type": "text", "required": False, "options": []},
    {"key": "dedicated_shared", "label": "Dedicated/Shared", "type": "select", "required": False,
     "options": ["", "Dedicated", "Shared"]},
    {"key": "notes", "label": "Notes", "type": "text", "required": False, "options": []},
]


def build_questions() -> list[dict]:
    """Build full list of evidence_based_questions rows."""
    rows = []

    def add(item_id: str, key: str, label: str, qtype: str, required: bool = True,
            placeholder: str | None = None, options: list | None = None, sort_order: int = 0,
            rows_val: int | None = None, upload_label: str | None = None, accept: str | None = None):
        opt = options if options else []
        rows.append({
            "evidence_item_id": item_id,
            "question_key": key,
            "label": label,
            "question_type": qtype,
            "required": required,
            "placeholder": placeholder,
            "options": opt,
            "sort_order": sort_order,
            "rows": rows_val,
            "upload_label": upload_label,
            "accept": accept,
        })

    def add_file(item_id: str, label: str, upload_label: str, sort_order: int = 0):
        add(item_id, "evidence_document", label, "file", required=False,
            upload_label=upload_label, sort_order=sort_order)

    # --- A1 ---
    add_file("A1", "Diagram upload", "Drop A1 diagram files or click to upload", 0)
    add("A1", "diagram_date", "Diagram version/date used for assessment", "date", True, "YYYY-MM-DD", [], 1)
    add("A1", "protocol_encryption_notes", "Protocol/encryption clarifications (if not fully visible on diagram)",
        "textarea", True, "List critical flows and protocol/security detail...", [], 2, 3)
    add("A1", "internet_exposure_confirmation", "Any direct internet path from secure zone?",
        "select", True, None, ["No", "Yes", "Unknown"], 3)
    add("A1", "internet_exposure_justification",
        "If yes, provide business/technical justification and compensating controls",
        "textarea", True, "If any internet path exists, explain why...", [], 4, 3)
    add("A1", "connector_zone_statement", "Customer connector zone statement (A1-specific)",
        "textarea", True, "Describe connector placement/boundary...", [], 5, 3)
    add("A1", "backoffice_path_summary", "Back-office connectivity summary",
        "textarea", True, "Summarize secure-zone to back-office paths...", [], 6, 3)
    add("A1", "known_gaps_and_plan", "Known documentation gaps and remediation plan",
        "textarea", True, "Document missing labels/details...", [], 7, 3)

    # --- A2 ---
    add_file("A2", "Upload supporting documents", "Drop spreadsheet/CSV or supporting files", 0)
    add("A2", "inventory_rows", "SWIFT Component Inventory", "spreadsheet", True, None,
        A2_COLUMNS, 1)  # options = column defs
    add("A2", "exclusion_justification", "Systems excluded from zone (with justification)",
        "textarea", True, "List any systems excluded from the secure zone...", [], 2, 3)
    add("A2", "co_hosting_notes", "Co-hosting decisions (non-SWIFT systems in zone)",
        "textarea", True, "Describe any non-SWIFT systems co-hosted...", [], 3, 3)
    add("A2", "customer_zone_notes", "Customer connectivity zone details (A1 only)",
        "textarea", True, "Describe customer connectivity zone details...", [], 4, 3)

    # --- A3 ---
    add_file("A3", "Upload data flow diagrams", "Drop A3 data flow diagrams or click to upload", 0)
    add("A3", "flow_inventory_notes", "Data flow inventory clarifications", "textarea", True,
        "List any flows not fully visible on the diagram...", [], 1, 3)
    add("A3", "unprotected_legacy_flows", "Unprotected/legacy flows and risk status",
        "textarea", True, "Identify any legacy flows without end-to-end protection...", [], 2, 3)
    add("A3", "hsm_flow_details", "HSM connection flow details", "textarea", True,
        "Describe HSM flows if not fully shown on diagram...", [], 3, 3)
    add("A3", "encryption_method_summary", "Encryption method summary per flow type",
        "textarea", True, "Summarize encryption methods...", [], 4, 3)
    add("A3", "cross_environment_details", "Cross-environment flow details",
        "textarea", True, "Describe any on-prem to cloud flows...", [], 5, 3)
    add("A3", "known_gaps", "Known documentation gaps and remediation plan",
        "textarea", True, "Document any missing flow details...", [], 6, 3)

    # --- A4 ---
    add_file("A4", "Upload firewall config exports", "Drop firewall rule set exports or click to upload", 0)
    add("A4", "firewall_inventory", "List all firewalls at secure zone boundaries",
        "textarea", True, "List each firewall: name/model, boundary protected...", [], 1, 3)
    add("A4", "deny_default_confirmation", "Deny-by-default posture confirmed for all rulesets?",
        "select", True, None, ["Yes", "No"], 2)
    add("A4", "allow_any_exceptions", "Any 'allow any' or overly permissive rules?",
        "textarea", True, "If any permissive rules exist...", [], 3, 3)
    add("A4", "internet_deny_confirmation", "Outbound internet explicitly denied from secure zone?",
        "select", True, None, ["Yes", "No"], 4)
    add("A4", "jump_server_internet_status", "Jump server internet access status",
        "select", True, None, ["None", "Restricted", "Full", "N/A"], 5)
    add("A4", "annual_review_date", "Last annual firewall rule review date", "date", True, None, [], 6)
    add("A4", "annual_review_reviewer", "Review performed by", "text", True, "Name and role of reviewer", [], 7)
    add("A4", "shared_firewall_notes", "Shared firewall status",
        "textarea", True, "If firewalls also protect non-SWIFT zones...", [], 8, 3)
    add("A4", "customer_zone_rule_summary", "Customer zone firewall rules (A1 only)",
        "textarea", True, "Summarize customer zone boundary rules...", [], 9, 3)
    add("A4", "known_exceptions", "Known exceptions and remediation plan",
        "textarea", True, "Document any rule exceptions...", [], 10, 3)

    # --- A5 (no file upload; architecture from cycle) ---
    add("A5", "evidence_document", "Evidence upload", "file", False,
        upload_label="Drop files or click to upload", sort_order=0)
    add("A5", "architecture_type", "Declared architecture type", "select", True, None,
        ["A1", "A2", "A3", "A4", "B"], 1)
    add("A5", "selected_diagram", "Selected diagram (from architecture selection)", "text", False, None, [], 2)
    add("A5", "decision_rationale", "Decision rationale", "textarea", True,
        "Explain why this architecture type applies...", [], 3, 4)
    add("A5", "infrastructure_characteristics", "Key infrastructure characteristics",
        "textarea", True, "Describe how your infrastructure aligns...", [], 4, 4)
    add("A5", "bics", "SWIFT BIC(s) covered by this assessment",
        "textarea", True, "List BIC(s) in scope...", [], 5, 3)
    add("A5", "changes_from_previous", "Changes from previous architecture type (if applicable)",
        "textarea", False, "If you previously declared a different architecture type...", [], 6, 3)
    add("A5", "multiple_architectures", "Multiple architectures per institution (Yes/No)",
        "select", False, None, ["Yes", "No"], 7)

    # --- A6 ---
    add_file("A6", "Upload design rationale document", "Drop zone design rationale document or click to upload", 0)
    add("A6", "zone_boundary_rationale", "Why were zone boundaries drawn at these specific points?",
        "textarea", True, "Explain the rationale for your secure zone boundary placement...", [], 1, 4)
    add("A6", "swift_guidance_reference", "SWIFT Security Guidance references",
        "textarea", True, "List specific SWIFT Security Guidance sections...", [], 2, 3)
    add("A6", "segmentation_approach", "Segmentation approach", "textarea", True, None, [], 3, 3)
    add("A6", "auth_separation_rationale", "Authentication zone separation rationale",
        "textarea", True, "Explain why separate AD/LDAP is used...", [], 4, 4)
    add("A6", "shared_component_risk", "Shared components/services risk assessment",
        "textarea", True, "Document any shared components crossing zone boundaries...", [], 5, 3)
    add("A6", "co_hosting_justification", "Co-hosting decisions",
        "textarea", True, "If any non-SWIFT systems exist in the secure zone...", [], 6, 3)
    add("A6", "customer_zone_rationale", "Customer connector zone design rationale (A1 only)",
        "textarea", True, "Explain customer connector zone design choices...", [], 7, 3)
    add("A6", "customer_zone_equivalence", "Customer zone equivalent protection justification (A1 only)",
        "textarea", True, "Explain how customer zone achieves equivalent protection...", [], 8, 3)

    # --- B1 ---
    add_file("B1", "Upload OS hardening config / screenshots", "Drop OS config exports or click to upload", 0)
    add("B1", "hardening_baseline_name", "Hardening baseline applied (CIS, DISA STIG, NIST, vendor)",
        "text", True, "e.g. CIS Windows Server 2019 Benchmark v2.0...", [], 1)
    add("B1", "builtin_admin_status", "Built-in administrator account status",
        "select", True, None, ["Disabled/restricted", "Emergency only", "In use", "Not documented"], 2)
    add("B1", "individual_admin_confirmed", "Individual admin accounts with escalation (sudo) configured?",
        "select", True, None, ["Yes", "No", "Partial"], 3)
    add("B1", "privilege_elevation_logging", "Privilege elevation logging enabled?",
        "select", True, None, ["Yes", "No"], 4)
    add("B1", "password_storage_zone_local", "Admin passwords stored in zone-local directory (not enterprise AD)?",
        "select", True, None, ["Yes", "No", "Hybrid"], 5)
    add("B1", "network_device_admin_access", "Network device admin access method",
        "textarea", True, "Describe admin access method for network devices...", [], 6, 2)
    add("B1", "default_passwords_changed", "Default passwords changed on all systems?",
        "select", True, None, ["Yes", "No", "Partial"], 7)
    add("B1", "autolock_configured", "Auto-lock configured (≤15 min)?",
        "select", True, None, ["Yes", "No", "Partial"], 8)
    add("B1", "usb_ports_restricted", "USB / physical ports restricted?",
        "select", True, None, ["Yes", "No", "Partial"], 9)
    add("B1", "hardening_check_dates", "Last two hardening check dates",
        "text", True, "Provide dates of the last two hardening checks...", [], 10)
    add("B1", "deviations_documented", "Deviations from baseline with justification",
        "textarea", False, "List each deviation with justification...", [], 11, 3)
    add("B1", "known_gaps", "Known gaps and remediation plan",
        "textarea", False, "Document any gaps in hardening coverage...", [], 12, 3)

    # B2-B8: Add minimal form fields (can expand later)
    for bid, fields in [
        ("B2", [("app_security_baseline", "Application security baseline", "text"), ("session_encryption", "Session encryption status", "select"), ("known_gaps", "Known gaps", "textarea")]),
        ("B3", [("encryption_summary", "Encryption configuration summary", "textarea"), ("key_management", "Key management approach", "select"), ("known_gaps", "Known gaps", "textarea")]),
        ("B4", [("platform_security", "Platform security level", "select"), ("vm_isolation", "VM isolation status", "select"), ("known_gaps", "Known gaps", "textarea")]),
        ("B5", [("password_policy_scope", "Password policy scope", "select"), ("lockout_config", "Account lockout configured?", "select"), ("known_gaps", "Known gaps", "textarea")]),
        ("B6", [("baseline_scan_status", "Baseline scan status", "select"), ("coverage", "System coverage", "textarea"), ("known_gaps", "Known gaps", "textarea")]),
        ("B7", [("mfa_coverage", "MFA coverage across access points", "select"), ("second_factor_types", "Approved second factor types", "textarea"), ("known_gaps", "Known gaps", "textarea")]),
        ("B8", [("session_recording", "Privileged session recording status", "select"), ("coverage", "Coverage details", "textarea"), ("known_gaps", "Known gaps", "textarea")]),
    ]:
        add_file(bid, f"Upload {bid} evidence", "Drop files or click to upload", 0)
        for i, (k, lbl, t) in enumerate(fields, 1):
            opts = ["Yes", "No", "Partial"] if t == "select" else []
            add(bid, k, lbl, t, True, None, opts, i, 3 if t == "textarea" else None)

    # C1-H9: Use FIELDS pattern - add file + form fields from evidence files
    # C1 (from c1-evidence.ts)
    add_file("C1", "Upload access control policy", "Drop policy document or click to upload", 0)
    c1_fields = [
        ("policy_version_date", "Policy version / approval date", "date", None),
        ("policy_owner", "Policy owner / approver", "text", "e.g. CISO, Head of IT Security"),
        ("privileged_account_scope", "Privileged account policy coverage across component types", "select",
         ["All types covered (OS, network, VM/cloud, HSM)", "Most types covered", "Some types covered", "Not documented"]),
        ("admin_access_conditions", "Conditions for admin access and duration limits", "textarea", None),
        ("builtin_admin_restrictions", "Built-in/default admin account restrictions", "select",
         ["Restricted to emergency/break-glass only with physical password control", "Restricted with some exceptions", "No restrictions documented"]),
        ("virtualisation_cloud_coverage", "Virtualisation/cloud platform access and admin role segregation", "select",
         ["Fully covered with role segregation and VM provisioning approval", "Partially covered", "Not addressed", "Not applicable"]),
        ("cloud_shared_responsibility", "Cloud shared responsibility delineated per CSCF Appendix G", "select",
         ["Yes — fully documented", "Partially documented", "Not documented", "Not applicable — no cloud"]),
        ("session_security_policy", "Session management controls documented", "textarea", None),
        ("remote_access_controls", "Remote access and session recording requirements", "select",
         ["VPN + MFA enforced with privileged session recording", "VPN + MFA enforced without session recording", "VPN without MFA", "No remote access policy documented"]),
        ("mfa_coverage", "MFA requirements across all access points", "select",
         ["All access points covered including service provider access", "All internal access points covered", "Most access points covered", "Not documented"]),
        ("mfa_approved_factors", "Approved MFA second factor types and restrictions", "textarea", None),
        ("least_privilege_sod", "Least privilege, need-to-know, and separation of duties", "textarea", None),
        ("access_review_mandate", "Mandated access review frequency", "select", ["Quarterly", "Semi-annually", "Annually", "Not mandated"]),
        ("jml_emergency_procedures", "JML process and emergency access procedure documented", "select",
         ["Both fully documented including provider access revocation", "JML documented only", "Emergency access documented only", "Neither documented"]),
        ("known_gaps", "Known gaps and remediation plan", "textarea", None),
    ]
    for i, (k, lbl, t, ph_or_opts) in enumerate(c1_fields, 1):
        opts = ph_or_opts if isinstance(ph_or_opts, list) else []
        ph = ph_or_opts if isinstance(ph_or_opts, str) else None
        add("C1", k, lbl, t, True, ph, opts, i, 3 if t == "textarea" else None)

    # C2-C9, D1-D6, E1-E7, F1-F4, G1-G4, H1-H9: Add representative fields
    # For brevity, add one file + 3 generic fields per item; full data can be expanded
    generic_items = (
        ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"] +
        ["D1", "D2", "D3", "D4", "D5", "D6"] +
        ["E1", "E2", "E3", "E4", "E5", "E6", "E7"] +
        ["F1", "F2", "F3", "F4"] + ["G1", "G2", "G3", "G4"] +
        ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9"]
    )
    for item in generic_items:
        if item == "C1":
            continue  # already done
        add_file(item, f"Upload {item} evidence", "Drop files or click to upload", 0)
        add(item, "policy_version_date", "Policy/evidence version date", "date", False, None, [], 1)
        add(item, "summary_or_owner", "Summary or owner", "text", False, "Brief summary or owner name", [], 2)
        add(item, "known_gaps", "Known gaps and remediation plan", "textarea", False,
            "Document any gaps and planned remediation", [], 3, 3)

    return rows


def generate_sql(questions: list[dict], schema: str, cscf_version: str) -> str:
    """Generate INSERT SQL for a schema."""
    lines = [
        f"-- Seed evidence_based_questions for {schema}",
        f"-- Generated by seed_evidence_questions.py",
        "",
        f"SET search_path TO {schema}, core, public;",
        "",
        "INSERT INTO " + schema + ".evidence_based_questions (",
        "  evidence_item_id, question_key, label, question_type, required, placeholder,",
        "  options, sort_order, rows, upload_label, accept, cscf_version",
        ") VALUES",
    ]
    vals = []
    for q in questions:
        ph = esc_sql(q.get("placeholder")) if q.get("placeholder") else "NULL"
        opts = esc_json(q.get("options") or [])
        rows_val = str(q["rows"]) if q.get("rows") else "NULL"
        ul = esc_sql(q.get("upload_label")) if q.get("upload_label") else "NULL"
        acc = esc_sql(q.get("accept")) if q.get("accept") else "NULL"
        vals.append(
            f"  ({esc_sql(q['evidence_item_id'])}, {esc_sql(q['question_key'])}, {esc_sql(q['label'])}, "
            f"{esc_sql(q['question_type'])}, {str(q.get('required', True)).lower()}, {ph}, "
            f"{opts}, {q.get('sort_order', 0)}, {rows_val}, {ul}, {acc}, {esc_sql(cscf_version)})"
        )
    lines.append(",\n".join(vals))
    lines.append("ON CONFLICT (evidence_item_id, question_key) DO UPDATE SET")
    lines.append("  label = EXCLUDED.label,")
    lines.append("  question_type = EXCLUDED.question_type,")
    lines.append("  required = EXCLUDED.required,")
    lines.append("  placeholder = EXCLUDED.placeholder,")
    lines.append("  options = EXCLUDED.options,")
    lines.append("  sort_order = EXCLUDED.sort_order,")
    lines.append("  rows = EXCLUDED.rows,")
    lines.append("  upload_label = EXCLUDED.upload_label,")
    lines.append("  accept = EXCLUDED.accept;")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Seed evidence_based_questions")
    parser.add_argument("--output-sql", action="store_true", help="Write SQL files instead of executing")
    args = parser.parse_args()

    questions = build_questions()

    if args.output_sql:
        sql_dir = BACKEND_DIR / "sql"
        sql_2025 = generate_sql(questions, "swift_2025", "2025v")
        sql_2026 = generate_sql(questions, "swift_2026", "2026v")
        (sql_dir / "24_seed_evidence_questions_swift_2025.sql").write_text(sql_2025, encoding="utf-8")
        (sql_dir / "25_seed_evidence_questions_swift_2026.sql").write_text(sql_2026, encoding="utf-8")
        print("Wrote 24_seed_evidence_questions_swift_2025.sql and 25_seed_evidence_questions_swift_2026.sql")
        return 0

    # Execute against DB
    try:
        from dotenv import load_dotenv
        import psycopg2
        load_dotenv(BACKEND_DIR / ".env")
    except ImportError as e:
        print(f"Install dependencies: pip install psycopg2-binary python-dotenv. Error: {e}", file=sys.stderr)
        return 1

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
        cur = conn.cursor()
        for schema, cscf in [("swift_2025", "2025v"), ("swift_2026", "2026v")]:
            cur.execute(f"SET search_path TO {schema}, core, public")
            for q in questions:
                cur.execute(
                    """
                    INSERT INTO """ + schema + """.evidence_based_questions (
                        evidence_item_id, question_key, label, question_type, required, placeholder,
                        options, sort_order, rows, upload_label, accept, cscf_version
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s)
                    ON CONFLICT (evidence_item_id, question_key) DO UPDATE SET
                        label = EXCLUDED.label, question_type = EXCLUDED.question_type,
                        required = EXCLUDED.required, placeholder = EXCLUDED.placeholder,
                        options = EXCLUDED.options, sort_order = EXCLUDED.sort_order,
                        rows = EXCLUDED.rows, upload_label = EXCLUDED.upload_label,
                        accept = EXCLUDED.accept
                    """,
                    (
                        q["evidence_item_id"], q["question_key"], q["label"], q["question_type"],
                        q.get("required", True), q.get("placeholder"),
                        json.dumps(q.get("options") or []), q.get("sort_order", 0),
                        q.get("rows"), q.get("upload_label"), q.get("accept"), cscf,
                    ),
                )
        conn.commit()
        print(f"Inserted/updated {len(questions)} questions per schema (swift_2025, swift_2026)")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}", file=sys.stderr)
        return 1
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())

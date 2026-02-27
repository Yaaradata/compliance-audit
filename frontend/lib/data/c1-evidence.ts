import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C1_EVIDENCE_ITEM_ID = "C1";

export const C1_UPLOAD_GUIDANCE = [
  { id: "1", label: "Approved access control policy covering privileged accounts for all component types (OS, network devices, VM/cloud, HSM)" },
  { id: "2", label: "Policy sections on admin access conditions, duration limits, individual account requirements, and logging per 6.4" },
  { id: "3", label: "Built-in/default admin account restrictions (emergency/break-glass only) and physical control of admin passwords" },
  { id: "4", label: "Virtualisation/cloud platform access rules including admin role segregation and VM provisioning/decommissioning approval" },
  { id: "5", label: "Cloud shared responsibility matrix delineated per CSCF Appendix G" },
  { id: "6", label: "Session management policy: encryption requirements, timeout settings, acceptable session types and protocols" },
  { id: "7", label: "Remote access VPN+MFA requirements and session recording for privileged accounts" },
  { id: "8", label: "MFA policy: approved second factors (NIST AAL2), same-device prohibition, individual factor assignment, exception process" },
  { id: "9", label: "Least privilege, need-to-know, and separation of duties rules (submit≠approve, app admin≠security officer, network admin≠OS admin)" },
  { id: "10", label: "Annual access review mandate, JML process, emergency access procedure, and provider access revocation requirements" },
];

export const C1_FIELDS: FieldDef[] = [
  {
    key: "policy_version_date",
    label: "Policy version / approval date",
    type: "date",
  },
  {
    key: "policy_owner",
    label: "Policy owner / approver",
    type: "text",
    placeholder: "e.g. CISO, Head of IT Security",
  },
  {
    key: "privileged_account_scope",
    label: "Privileged account policy coverage across component types",
    type: "select",
    options: [
      "All types covered (OS, network, VM/cloud, HSM)",
      "Most types covered",
      "Some types covered",
      "Not documented",
    ],
  },
  {
    key: "admin_access_conditions",
    label: "Conditions for admin access and duration limits",
    type: "textarea",
    placeholder: "Describe conditions (software install, config, maintenance, emergency), duration limits, individual account requirements, and logging per 6.4",
    rows: 3,
  },
  {
    key: "builtin_admin_restrictions",
    label: "Built-in/default admin account restrictions",
    type: "select",
    options: [
      "Restricted to emergency/break-glass only with physical password control",
      "Restricted with some exceptions",
      "No restrictions documented",
    ],
  },
  {
    key: "virtualisation_cloud_coverage",
    label: "Virtualisation/cloud platform access and admin role segregation",
    type: "select",
    options: [
      "Fully covered with role segregation and VM provisioning approval",
      "Partially covered",
      "Not addressed",
      "Not applicable",
    ],
  },
  {
    key: "cloud_shared_responsibility",
    label: "Cloud shared responsibility delineated per CSCF Appendix G",
    type: "select",
    options: [
      "Yes — fully documented",
      "Partially documented",
      "Not documented",
      "Not applicable — no cloud",
    ],
  },
  {
    key: "session_security_policy",
    label: "Session management controls documented",
    type: "textarea",
    placeholder: "Describe session encryption requirements, timeout policy, acceptable session types/protocols, and any restrictions",
    rows: 3,
  },
  {
    key: "remote_access_controls",
    label: "Remote access and session recording requirements",
    type: "select",
    options: [
      "VPN + MFA enforced with privileged session recording",
      "VPN + MFA enforced without session recording",
      "VPN without MFA",
      "No remote access policy documented",
    ],
  },
  {
    key: "mfa_coverage",
    label: "MFA requirements across all access points",
    type: "select",
    options: [
      "All access points covered including service provider access",
      "All internal access points covered",
      "Most access points covered",
      "Not documented",
    ],
  },
  {
    key: "mfa_approved_factors",
    label: "Approved MFA second factor types and restrictions",
    type: "textarea",
    placeholder: "List approved second factor types (NIST AAL2), same-device prohibition rule, individual factor assignment policy, and exception process",
    rows: 3,
  },
  {
    key: "least_privilege_sod",
    label: "Least privilege, need-to-know, and separation of duties",
    type: "textarea",
    placeholder: "Describe least privilege principle, SoD rules (submit≠approve, app admin≠security officer, network admin≠OS admin), and four-eyes for sensitive operations",
    rows: 3,
  },
  {
    key: "access_review_mandate",
    label: "Mandated access review frequency",
    type: "select",
    options: ["Quarterly", "Semi-annually", "Annually", "Not mandated"],
  },
  {
    key: "jml_emergency_procedures",
    label: "JML process and emergency access procedure documented",
    type: "select",
    options: [
      "Both fully documented including provider access revocation",
      "JML documented only",
      "Emergency access documented only",
      "Neither documented",
    ],
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any policy gaps, missing sections, or planned improvements",
    rows: 3,
  },
];

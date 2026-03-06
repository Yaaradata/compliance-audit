import { useState, useCallback, useMemo } from "react";

// ── DOMAIN C DATA MODEL (from Canonical Evidence Model & Sufficiency Matrix) ──
// Sub-groups organize C1-C9 into logical clusters for navigation
const SUB_GROUPS = [
  { name: "Access Policy", color: "#7c3aed", items: ["C1"] },
  { name: "Identity & Access Lifecycle", color: "#0369a1", items: ["C2","C3","C4","C5","C6"] },
  { name: "Token & Credential Security", color: "#0f766e", items: ["C7","C8"] },
  { name: "Personnel Security", color: "#9333ea", items: ["C9"] },
];

const ALL_CONTROLS = ["1.2","1.3","2.6","4.2","5.1","5.2","5.3A","5.4"];

const EVIDENCE_ITEMS = [
  {
    id: "C1", order: 1, name: "Access Control Policy (Comprehensive)",
    priority: "CRITICAL", type: "Policy Document",
    controls: [
      { id: "1.2", name: "OS Privileged Account Control", ma: "M" },
      { id: "1.3", name: "Virtualisation/Cloud Platform Protection", ma: "A" },
      { id: "2.6", name: "Operator Session Confidentiality", ma: "M" },
      { id: "4.2", name: "Multi-Factor Authentication", ma: "M" },
      { id: "5.1", name: "Logical Access Control", ma: "M" },
    ],
    controlCount: 5,
    description: "Highest-reuse policy document in Domain C. Covers 5 controls across 3 SWIFT principles. Without platform: requested 5 separate times. 80% reduction.",
    inputs: [
      { id: "policy_doc", label: "Access Control Policy Document", type: "file", required: true, accept: ".pdf,.docx,.doc" },
      { id: "policy_version", label: "Policy Version / Effective Date", type: "text", required: true, placeholder: "e.g., v3.2 — Effective 15-Jan-2025" },
      { id: "policy_approver", label: "Approving Authority", type: "text", required: true, placeholder: "e.g., CISO, Head of IT Security" },
      { id: "chk_rbac", label: "Policy covers RBAC model with role definitions for SWIFT systems", type: "checkbox", required: true },
      { id: "chk_jml", label: "Policy covers Joiner/Mover/Leaver (JML) process for SWIFT access", type: "checkbox", required: true },
      { id: "chk_reviews", label: "Policy mandates quarterly access reviews for all SWIFT accounts", type: "checkbox", required: true },
      { id: "chk_mfa", label: "Policy specifies MFA requirements for all SWIFT access points", type: "checkbox", required: true },
      { id: "chk_session", label: "Policy covers session management (timeouts, encryption, concurrent limits)", type: "checkbox", required: true },
      { id: "chk_sod", label: "Policy addresses separation of duties and least privilege principles", type: "checkbox", required: true },
      { id: "chk_privaccess", label: "Policy governs privileged account usage on SWIFT systems", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "RBAC model specific to SWIFT systems", why: "Control 5.1 requires role definitions with permissions mapped to SWIFT functions. Generic corporate RBAC is insufficient.", controlRef: "5.1" },
      { dim: "SD-2", label: "Privileged access governance documented", why: "Control 1.2 requires policy governing who has admin access and under what conditions on SWIFT OS.", controlRef: "1.2" },
      { dim: "SD-3", label: "MFA requirements for all SWIFT access", why: "Control 4.2 requires policy mandating MFA for all privileged access to SWIFT infrastructure.", controlRef: "4.2" },
      { dim: "SD-4", label: "Session management rules defined", why: "Control 2.6 requires operator session encryption, timeout, and access rules in policy.", controlRef: "2.6" },
      { dim: "SD-5", label: "Quarterly review mandate & JML process", why: "Control 5.1 requires documented review frequency and staff lifecycle procedures.", controlRef: "5.1" },
      { dim: "SD-6", label: "Separation of duties & least privilege", why: "Control 5.1 requires SoD rules preventing toxic role combinations and enforcing least privilege.", controlRef: "5.1" },
      { dim: "SD-7", label: "Policy dated, versioned, and approved", why: "Undated or unapproved policy is an immediate audit finding across all 5 controls.", controlRef: "All" },
    ],
    perControlSufficiency: [
      { controlId: "1.2", requirement: "Policy governing privileged account usage on SWIFT systems; who has admin access and under what conditions." },
      { controlId: "1.3", requirement: "Policy covering platform access control for virtualisation layer; segregation of admin roles." },
      { controlId: "2.6", requirement: "Session management policy; operator access rules; session encryption requirements." },
      { controlId: "4.2", requirement: "MFA requirements for all privileged access to SWIFT infrastructure; coverage of access points." },
      { controlId: "5.1", requirement: "RBAC model definition; quarterly access review mandate; JML process; least privilege principle." },
    ],
    reductionNote: "Highest-reuse policy document. Covers 5 controls across 3 principles. 80% reduction vs per-control collection."
  },
  {
    id: "C2", order: 2, name: "Privileged Account Inventory",
    priority: "CRITICAL", type: "Spreadsheet / PAM Export",
    controls: [
      { id: "1.2", name: "OS Privileged Account Control", ma: "M" },
      { id: "5.1", name: "Logical Access Control", ma: "M" },
    ],
    controlCount: 2,
    description: "Complete list of all privileged/admin accounts across all SWIFT systems. Same list serves OS privileged account control (1.2) and logical access control (5.1). 50% reduction.",
    inputs: [
      { id: "priv_export", label: "Privileged Account Inventory Export", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "pam_export", label: "PAM Tool Export (if applicable)", type: "file", required: false, accept: ".xlsx,.csv,.pdf" },
      { id: "last_review", label: "Last Review Date", type: "date", required: true },
      { id: "chk_all_systems", label: "Inventory covers ALL SWIFT systems (messaging, GUI, middleware, DB)", type: "checkbox", required: true },
      { id: "chk_justified", label: "Each account has documented business justification", type: "checkbox", required: true },
      { id: "chk_stale", label: "Stale/unused accounts identified and flagged for removal", type: "checkbox", required: true },
      { id: "chk_review90", label: "All accounts reviewed within last 90 days", type: "checkbox", required: true },
    ],
    requiredColumns: ["Account Name","System/Application","Privilege Level","Assigned Person/Team","Business Justification","Last Review Date","Last Login Date","Status (Active/Disabled)"],
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT systems represented", why: "Control 1.2 requires per-system privileged account listing. Missing one system = finding.", controlRef: "1.2" },
      { dim: "SD-2", label: "Each account justified", why: "Every privileged account must have a documented business justification per 5.1.", controlRef: "5.1" },
      { dim: "SD-3", label: "Stale accounts identified", why: "Unused accounts with active privileges are high-risk findings for both 1.2 and 5.1.", controlRef: "1.2, 5.1" },
      { dim: "SD-4", label: "Review dates within 90 days", why: "Quarterly review mandate means no account should be unreviewed for >90 days.", controlRef: "5.1" },
      { dim: "SD-5", label: "Consistent with B1 OS hardening evidence", why: "Privileged accounts listed here must match those in Domain B OS hardening configs.", controlRef: "1.2" },
    ],
    perControlSufficiency: [
      { controlId: "1.2", requirement: "List of all privileged accounts on SWIFT systems; justification for each; evidence of restricted usage." },
      { controlId: "5.1", requirement: "Privileged accounts cross-referenced with RBAC roles; evidence of quarterly review; removal of stale accounts." },
    ],
    reductionNote: "Same privileged account list serves OS privileged account control (1.2) and logical access control (5.1). 50% reduction."
  },
  {
    id: "C3", order: 3, name: "User Access List (All SWIFT Accounts)",
    priority: "HIGH", type: "System Export / IAM Extract",
    controls: [
      { id: "5.1", name: "Logical Access Control", ma: "M" },
    ],
    controlCount: 1,
    description: "Complete list of all user accounts (privileged and non-privileged) on SWIFT systems with role assignments and permissions.",
    inputs: [
      { id: "access_list", label: "User Access List Export", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "iam_source", label: "IAM Source System", type: "text", required: true, placeholder: "e.g., Active Directory, CyberArk, SailPoint" },
      { id: "extract_date", label: "Extract Date", type: "date", required: true },
      { id: "chk_all_systems", label: "List covers all SWIFT systems and applications", type: "checkbox", required: true },
      { id: "chk_roles_mapped", label: "Each user has assigned role(s) matching C4 RBAC definitions", type: "checkbox", required: true },
      { id: "chk_no_orphans", label: "No orphaned accounts (all linked to active personnel)", type: "checkbox", required: true },
    ],
    requiredColumns: ["Username","System/Application","Assigned Role(s)","Permissions Summary","Department/Team","Account Creation Date","Last Login Date"],
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT systems covered", why: "Control 5.1 requires complete user listing across every SWIFT system.", controlRef: "5.1" },
      { dim: "SD-2", label: "Roles align with RBAC model from C4", why: "User roles must match formal role definitions. Mismatches indicate unauthorized access.", controlRef: "5.1" },
      { dim: "SD-3", label: "No orphaned accounts", why: "Accounts not linked to active personnel indicate failed JML process.", controlRef: "5.1" },
      { dim: "SD-4", label: "Permissions align with job functions", why: "Excessive permissions beyond job requirements violate least privilege.", controlRef: "5.1" },
    ],
    perControlSufficiency: [
      { controlId: "5.1", requirement: "Complete user listing for all SWIFT systems; roles and permissions documented; cross-referenced with RBAC model." },
    ],
    reductionNote: "Control-specific for 5.1. Cross-referenced with C2 for privileged subset and C4 for role definitions."
  },
  {
    id: "C4", order: 4, name: "RBAC Role Definitions & Assignment Matrix",
    priority: "HIGH", type: "Config Export / Role Matrix",
    controls: [
      { id: "5.1", name: "Logical Access Control", ma: "M" },
    ],
    controlCount: 1,
    description: "Formal definition of all SWIFT-related roles with permissions, separation of duties rules, and user-to-role mapping.",
    inputs: [
      { id: "role_matrix", label: "Role Definition & Assignment Matrix", type: "file", required: true, accept: ".xlsx,.csv,.pdf,.docx" },
      { id: "sod_matrix", label: "Separation of Duties (SoD) Matrix", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "iam_config", label: "IAM/RBAC Configuration Screenshot", type: "file", required: false, accept: ".pdf,.png,.jpg" },
      { id: "chk_perms_defined", label: "Each role has explicitly defined permissions", type: "checkbox", required: true },
      { id: "chk_sod_enforced", label: "Separation of duties matrix enforced (no toxic combinations)", type: "checkbox", required: true },
      { id: "chk_maker_checker", label: "Maker-checker enforcement for SWIFT transactions", type: "checkbox", required: true },
      { id: "chk_approval_wf", label: "Role assignment requires documented approval workflow", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Roles with defined permissions", why: "Each SWIFT role must have explicit permissions documented. Undefined roles cannot be audited.", controlRef: "5.1" },
      { dim: "SD-2", label: "Separation of duties matrix", why: "Toxic role combinations (e.g., maker + checker) must be explicitly prohibited.", controlRef: "5.1" },
      { dim: "SD-3", label: "Maker-checker enforcement", why: "SWIFT transaction controls require dual authorization. Must demonstrate enforcement.", controlRef: "5.1" },
      { dim: "SD-4", label: "No excessive role accumulation", why: "Users accumulating roles over time violate least privilege. Must show periodic cleanup.", controlRef: "5.1" },
      { dim: "SD-5", label: "Role approval workflow documented", why: "Role assignments must follow documented approval process, not ad-hoc grants.", controlRef: "5.1" },
    ],
    perControlSufficiency: [
      { controlId: "5.1", requirement: "Formal role definitions; SoD matrix; user-to-role mapping; maker-checker enforcement; role approval workflow." },
    ],
    reductionNote: "Control-specific for 5.1. Foundational for demonstrating least privilege and separation of duties."
  },
  {
    id: "C5", order: 5, name: "Quarterly Access Review Records",
    priority: "HIGH", type: "Review Documentation / Sign-off",
    perQuarter: true,
    controls: [
      { id: "5.1", name: "Logical Access Control", ma: "M" },
    ],
    controlCount: 1,
    description: "Evidence of regular (quarterly minimum) access reviews for all SWIFT accounts. Time-series evidence demonstrating ongoing compliance.",
    inputs: [
      { id: "review_records", label: "Access Review Records", type: "file", required: true, accept: ".pdf,.xlsx,.docx,.zip", scope: "per-quarter" },
      { id: "signoff_evidence", label: "Management Sign-off Evidence", type: "file", required: true, accept: ".pdf,.png,.docx", scope: "per-quarter" },
      { id: "review_date", label: "Review Date", type: "date", required: true, scope: "per-quarter" },
      { id: "reviewer_name", label: "Reviewer Name / Role", type: "text", required: true, scope: "per-quarter", placeholder: "e.g., IT Security Manager" },
      { id: "scope_desc", label: "Review Scope", type: "text", required: true, scope: "per-quarter", placeholder: "e.g., All SWIFT messaging and GUI accounts" },
      { id: "findings_count", label: "Findings Count", type: "text", required: true, scope: "per-quarter", placeholder: "e.g., 3 excessive access, 2 stale accounts" },
      { id: "chk_actions", label: "All findings have documented remediation actions", type: "checkbox", required: true, scope: "per-quarter" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Quarterly cadence (4 reviews in 12 months)", why: "Control 5.1 requires at minimum quarterly reviews. Fewer than 4 in the assessment period = finding.", controlRef: "5.1" },
      { dim: "SD-2", label: "All SWIFT systems in scope", why: "Reviews must cover every SWIFT system. Partial scope = partial compliance.", controlRef: "5.1" },
      { dim: "SD-3", label: "Findings acted upon", why: "Identifying issues without remediation is insufficient. Action tracking required.", controlRef: "5.1" },
      { dim: "SD-4", label: "Management sign-off present", why: "Reviews without management sign-off lack accountability and authority.", controlRef: "5.1" },
      { dim: "SD-5", label: "Leavers' access removed", why: "Access reviews must confirm JML process execution — leavers should have no active accounts.", controlRef: "5.1" },
    ],
    perControlSufficiency: [
      { controlId: "5.1", requirement: "4 quarterly reviews in 12 months; all systems in scope; findings remediated; management sign-off." },
    ],
    reductionNote: "Control-specific for 5.1. Time-series evidence demonstrating ongoing compliance."
  },
  {
    id: "C6", order: 6, name: "Joiner/Mover/Leaver (JML) Process Evidence",
    priority: "MEDIUM", type: "Process Doc + Execution Records",
    controls: [
      { id: "5.1", name: "Logical Access Control", ma: "M" },
    ],
    controlCount: 1,
    description: "Documented process for managing SWIFT access through staff lifecycle events, with evidence of actual execution.",
    inputs: [
      { id: "jml_process", label: "JML Process Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "joiner_evidence", label: "Recent Joiner Evidence (last 6 months)", type: "file", required: true, accept: ".pdf,.xlsx,.png" },
      { id: "leaver_evidence", label: "Recent Leaver Evidence (last 6 months)", type: "file", required: true, accept: ".pdf,.xlsx,.png" },
      { id: "mover_evidence", label: "Recent Mover/Role-Change Evidence", type: "file", required: false, accept: ".pdf,.xlsx,.png" },
      { id: "chk_hr_trigger", label: "Process is triggered by HR events (not manual notification)", type: "checkbox", required: true },
      { id: "chk_sla", label: "Timeliness SLAs defined (e.g., leaver access removed within 24h)", type: "checkbox", required: true },
      { id: "chk_escalation", label: "Escalation process for overdue JML actions", type: "checkbox", required: true },
      { id: "chk_all_systems", label: "JML process covers all SWIFT systems", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Documented JML process", why: "Control 5.1 requires a formal, approved process — not ad-hoc access management.", controlRef: "5.1" },
      { dim: "SD-2", label: "HR-triggered mechanism", why: "Manual notifications are error-prone. Automated HR triggers reduce missed leavers.", controlRef: "5.1" },
      { dim: "SD-3", label: "Timeliness SLAs tracked", why: "Delayed access removal (especially leavers) creates security exposure.", controlRef: "5.1" },
      { dim: "SD-4", label: "Evidence of actual execution", why: "Process documentation alone is insufficient. Must show recent joiner/leaver examples.", controlRef: "5.1" },
      { dim: "SD-5", label: "All SWIFT systems covered", why: "JML process must apply to every SWIFT system, not just the primary messaging interface.", controlRef: "5.1" },
    ],
    perControlSufficiency: [
      { controlId: "5.1", requirement: "Formal JML process; HR-triggered; SLAs defined; execution evidence; all SWIFT systems." },
    ],
    reductionNote: "Control-specific for 5.1. Process compliance evidence."
  },
  {
    id: "C7", order: 7, name: "Token/Certificate Inventory & Lifecycle",
    priority: "HIGH", type: "Inventory + Process Document",
    controls: [
      { id: "5.2", name: "Token Management", ma: "M" },
    ],
    controlCount: 1,
    description: "Inventory of all hardware/software tokens and certificates used for SWIFT operations, with lifecycle management procedures.",
    inputs: [
      { id: "token_inventory", label: "Token/Certificate Inventory", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "lifecycle_doc", label: "Token Lifecycle Procedures (Issuance/Renewal/Revocation)", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "pki_export", label: "PKI/Certificate Manager Export (if applicable)", type: "file", required: false, accept: ".xlsx,.csv,.pdf" },
      { id: "chk_assigned", label: "Each token/certificate assigned to a named individual or role", type: "checkbox", required: true },
      { id: "chk_annual_review", label: "Annual token review completed", type: "checkbox", required: true },
      { id: "chk_revocation", label: "Revocation process for leavers confirmed and documented", type: "checkbox", required: true },
      { id: "chk_storage", label: "Secure storage requirements met (physical and logical)", type: "checkbox", required: true },
      { id: "chk_ped", label: "PED key management documented (if HSM used)", type: "checkbox", required: false },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All tokens/certificates accounted for", why: "Control 5.2 requires complete inventory. Untracked tokens = unmanaged security risk.", controlRef: "5.2" },
      { dim: "SD-2", label: "Annual review completed", why: "Token inventory must be reviewed annually to confirm accuracy and remove unused tokens.", controlRef: "5.2" },
      { dim: "SD-3", label: "Revocation for leavers confirmed", why: "Tokens not revoked on departure remain usable. Must demonstrate JML integration.", controlRef: "5.2" },
      { dim: "SD-4", label: "Secure storage requirements met", why: "Hardware tokens must be physically secured. Software certificates must be logically protected.", controlRef: "5.2" },
      { dim: "SD-5", label: "Lifecycle procedures documented", why: "Issuance, renewal, revocation must follow formal process, not ad-hoc management.", controlRef: "5.2" },
    ],
    perControlSufficiency: [
      { controlId: "5.2", requirement: "Complete inventory; lifecycle procedures; annual review; revocation for leavers; secure storage." },
    ],
    reductionNote: "Control-specific for 5.2. Paired with C1 access control policy."
  },
  {
    id: "C8", order: 8, name: "Credential Storage Evidence (Vault/HSM)",
    priority: "HIGH", type: "Config Screenshots / Vault Export",
    controls: [
      { id: "5.4", name: "Password Repository Protection", ma: "M" },
    ],
    controlCount: 1,
    description: "Evidence that SWIFT passwords and credentials are stored securely: encrypted at rest, access-controlled, no plaintext, and access logged.",
    inputs: [
      { id: "vault_config", label: "Vault/HSM Configuration Evidence", type: "file", required: true, accept: ".pdf,.png,.xlsx" },
      { id: "access_log", label: "Credential Access Log Sample", type: "file", required: true, accept: ".pdf,.csv,.xlsx" },
      { id: "emergency_proc", label: "Emergency Access Procedure (break-glass)", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "vault_vendor", label: "Vault/HSM Solution", type: "text", required: true, placeholder: "e.g., CyberArk, HashiCorp Vault, Thales HSM" },
      { id: "chk_no_plaintext", label: "No plaintext password storage anywhere (systems, scripts, documents)", type: "checkbox", required: true },
      { id: "chk_encrypted", label: "All stored credentials encrypted at rest", type: "checkbox", required: true },
      { id: "chk_auth_access", label: "Authenticated access to credential store (no shared master passwords)", type: "checkbox", required: true },
      { id: "chk_logging", label: "All credential retrievals are logged and auditable", type: "checkbox", required: true },
      { id: "chk_physical", label: "Physical passwords in sealed envelopes in safe (if applicable)", type: "checkbox", required: false },
    ],
    sufficiency: [
      { dim: "SD-1", label: "No plaintext anywhere", why: "Control 5.4 requires zero plaintext credential storage. Even one instance = critical finding.", controlRef: "5.4" },
      { dim: "SD-2", label: "Encryption at rest for stored credentials", why: "Vault/HSM must encrypt all stored credentials. Unencrypted database = finding.", controlRef: "5.4" },
      { dim: "SD-3", label: "Authenticated access to credential store", why: "Shared master passwords undermine accountability. Individual authentication required.", controlRef: "5.4" },
      { dim: "SD-4", label: "Access logging active", why: "Every credential retrieval must be logged with who/when/what for audit trail.", controlRef: "5.4" },
      { dim: "SD-5", label: "Emergency access procedure with password change", why: "Break-glass access must trigger mandatory password change afterwards.", controlRef: "5.4" },
    ],
    perControlSufficiency: [
      { controlId: "5.4", requirement: "No plaintext storage; encryption at rest; authenticated access; access logging; emergency procedures." },
    ],
    reductionNote: "Control-specific for 5.4. Evidence of secure credential management."
  },
  {
    id: "C9", order: 9, name: "Personnel Vetting Records",
    priority: "MEDIUM", type: "HR Documentation",
    isAdvisory: true,
    controls: [
      { id: "5.3A", name: "Staff Screening Process", ma: "A" },
    ],
    controlCount: 1,
    description: "Background check policy and execution records for staff with SWIFT operational access. Advisory control (5.3A).",
    inputs: [
      { id: "vetting_policy", label: "Personnel Screening Policy", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "check_evidence", label: "Background Check Confirmations (sample)", type: "file", required: true, accept: ".pdf,.xlsx" },
      { id: "revetting_schedule", label: "Periodic Re-vetting Schedule", type: "file", required: false, accept: ".pdf,.xlsx,.docx" },
      { id: "chk_preemployment", label: "Pre-employment checks completed for all SWIFT operators", type: "checkbox", required: true },
      { id: "chk_contractors", label: "Contractor and consultant vetting coverage confirmed", type: "checkbox", required: true },
      { id: "chk_periodic", label: "Periodic re-vetting schedule defined and active", type: "checkbox", required: false },
      { id: "chk_concerns", label: "Process for handling identified concerns documented", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Screening policy exists and is approved", why: "Advisory 5.3A requires formal policy even though compliance is not mandatory.", controlRef: "5.3A" },
      { dim: "SD-2", label: "Covers all SWIFT-access personnel", why: "Vetting scope must include everyone with SWIFT operational access.", controlRef: "5.3A" },
      { dim: "SD-3", label: "Pre-employment and periodic checks both addressed", why: "Initial screening alone is insufficient — re-vetting demonstrates ongoing diligence.", controlRef: "5.3A" },
      { dim: "SD-4", label: "Contractor coverage", why: "Third-party staff with SWIFT access must be vetted to the same standard as employees.", controlRef: "5.3A" },
    ],
    perControlSufficiency: [
      { controlId: "5.3A", requirement: "Screening policy; pre-employment checks; periodic re-vetting; contractor coverage; concern handling." },
    ],
    reductionNote: "Advisory control (5.3A). Organizational HR evidence."
  },
];

// Quarter periods for C5 quarterly reviews
const REVIEW_QUARTERS = ["Q1 2024 (Jan–Mar)","Q2 2024 (Apr–Jun)","Q3 2024 (Jul–Sep)","Q4 2024 (Oct–Dec)"];

// ── UTILITY FUNCTIONS ──
function getStatusColor(pct) {
  if (pct >= 90) return "#10b981";
  if (pct >= 60) return "#f59e0b";
  if (pct > 0) return "#ef4444";
  return "#94a3b8";
}
function getStatusLabel(pct) {
  if (pct >= 90) return "Sufficient";
  if (pct >= 60) return "Partial";
  if (pct > 0) return "Insufficient";
  return "Not Started";
}
function getStatusIcon(pct) {
  if (pct >= 90) return "✓";
  if (pct >= 60) return "⚠";
  if (pct > 0) return "✗";
  return "○";
}

function ScoreRing({ pct, size = 56, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = getStatusColor(pct);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 absolute">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
}

function ControlBadge({ ctrl }) {
  const isMandatory = ctrl.ma === "M";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{
        background: isMandatory ? "#fef3c7" : "#e0f2fe",
        borderColor: isMandatory ? "#f59e0b" : "#7dd3fc",
        color: isMandatory ? "#92400e" : "#0369a1"
      }}>
      <span className="font-bold">{ctrl.id}</span>
      <span className="opacity-60">{ctrl.ma}</span>
    </span>
  );
}

// ── MAIN COMPONENT ──
export default function DomainCIntake() {
  const [activeItem, setActiveItem] = useState("C1");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [expandedSuff, setExpandedSuff] = useState({});
  const [expandedPerControl, setExpandedPerControl] = useState({});
  const [selectedQuarter, setSelectedQuarter] = useState("all");

  const updateField = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setEvaluated(false);
  }, []);
  const markFileUploaded = useCallback((key) => {
    setUploadedFiles(prev => ({ ...prev, [key]: true }));
    setEvaluated(false);
  }, []);

  const getItemCompletion = useCallback((item) => {
    let filled = 0, total = 0;
    item.inputs.forEach(inp => {
      if (!inp.required) return;
      if (item.perQuarter && inp.scope === "per-quarter") {
        REVIEW_QUARTERS.forEach(q => {
          total++;
          const key = `${item.id}.${q}.${inp.id}`;
          if (inp.type === "file" ? uploadedFiles[key] : inp.type === "checkbox" ? formData[key] : formData[key]) filled++;
        });
      } else {
        total++;
        const key = `${item.id}.${inp.id}`;
        if (inp.type === "file" ? uploadedFiles[key] : inp.type === "checkbox" ? formData[key] : formData[key]) filled++;
      }
    });
    return total === 0 ? 100 : Math.round((filled / total) * 100);
  }, [formData, uploadedFiles]);

  const itemCompletions = useMemo(() => {
    const map = {};
    EVIDENCE_ITEMS.forEach(item => { map[item.id] = getItemCompletion(item); });
    return map;
  }, [getItemCompletion]);

  // Weighted completion: C1 highest (multi-control), C2 next, then C3-C6 (5.1 cluster), C7-C8, C9 lowest (advisory)
  const weights = { C1: 22, C2: 14, C3: 12, C4: 12, C5: 12, C6: 8, C7: 8, C8: 8, C9: 4 };
  const overallCompletion = useMemo(() => {
    let total = 0;
    Object.entries(weights).forEach(([id, w]) => { total += (itemCompletions[id] || 0) * w / 100; });
    return Math.round(total);
  }, [itemCompletions]);

  const controlScores = useMemo(() => {
    const scores = {};
    ALL_CONTROLS.forEach(cid => {
      const items = EVIDENCE_ITEMS.filter(it => it.controls.some(c => c.id === cid));
      if (items.length === 0) { scores[cid] = 0; return; }
      scores[cid] = Math.round(items.reduce((s, it) => s + itemCompletions[it.id], 0) / items.length);
    });
    return scores;
  }, [itemCompletions]);

  const activeItemData = EVIDENCE_ITEMS.find(it => it.id === activeItem);

  const renderInput = (inp, keyPrefix) => {
    const key = keyPrefix ? `${activeItemData.id}.${keyPrefix}.${inp.id}` : `${activeItemData.id}.${inp.id}`;
    if (inp.type === "file") {
      const uploaded = uploadedFiles[key];
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <div onClick={() => markFileUploaded(key)}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
            {uploaded ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span className="text-sm text-emerald-700 font-medium">Uploaded</span>
                <button onClick={e => { e.stopPropagation(); setUploadedFiles(prev => { const n={...prev}; delete n[key]; return n; }); setEvaluated(false); }}
                  className="text-xs text-slate-400 hover:text-red-500 ml-2">Remove</button>
              </div>
            ) : (
              <div className="text-slate-400 text-sm">↑ Drop or click · {inp.accept}</div>
            )}
          </div>
        </div>
      );
    }
    if (inp.type === "checkbox") {
      return (
        <label key={key} className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" checked={!!formData[key]} onChange={e => updateField(key, e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900">{inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}</span>
        </label>
      );
    }
    if (inp.type === "select") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <select value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
            <option value="">Select...</option>
            {(inp.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    if (inp.type === "textarea") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label}</label>
          <textarea value={formData[key] || ""} onChange={e => updateField(key, e.target.value)} rows={2}
            placeholder={inp.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-y" />
        </div>
      );
    }
    return (
      <div key={key}>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
        <input type={inp.type === "date" ? "date" : "text"} value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
          placeholder={inp.placeholder}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none" />
      </div>
    );
  };

  // Get missing inputs for gap analysis
  const getMissingInputs = (item) => {
    return item.inputs.filter(inp => {
      if (!inp.required) return false;
      if (item.perQuarter && inp.scope === "per-quarter") {
        return REVIEW_QUARTERS.some(q => {
          const k = `${item.id}.${q}.${inp.id}`;
          return inp.type === "file" ? !uploadedFiles[k] : inp.type === "checkbox" ? !formData[k] : !formData[k];
        });
      }
      const k = `${item.id}.${inp.id}`;
      return inp.type === "file" ? !uploadedFiles[k] : inp.type === "checkbox" ? !formData[k] : !formData[k];
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#1e293b" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 border-b border-slate-200" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white" }}>C</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">Access Management</h1>
                <p className="text-slate-400 text-xs">9 evidence items · 8 controls · 4 sub-groups</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <ScoreRing pct={overallCompletion} />
              <div className="hidden lg:flex items-center gap-1 flex-wrap">
                {ALL_CONTROLS.map(cid => (
                  <div key={cid} className="h-5 rounded text-xs font-bold flex items-center justify-center text-white px-1.5"
                    style={{ background: getStatusColor(controlScores[cid]) }} title={`${cid}: ${controlScores[cid]}%`}>{cid}</div>
                ))}
              </div>
              <button onClick={() => setEvaluated(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 2px 12px rgba(124,58,237,0.3)" }}>
                Evaluate All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto flex" style={{ minHeight: "calc(100vh - 72px)" }}>
        {/* ── LEFT RAIL ── */}
        <div className="w-56 shrink-0 border-r border-slate-200 sticky top-[72px] self-start overflow-y-auto" style={{ maxHeight: "calc(100vh - 72px)", background: "#ffffff" }}>
          <div className="p-3">
            {SUB_GROUPS.map(group => (
              <div key={group.name} className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 flex items-center gap-2" style={{ color: group.color }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                  {group.name}
                </div>
                {EVIDENCE_ITEMS.filter(it => group.items.includes(it.id)).map(item => {
                  const pct = itemCompletions[item.id];
                  const active = activeItem === item.id;
                  const color = getStatusColor(pct);
                  return (
                    <button key={item.id} onClick={() => { setActiveItem(item.id); setEvaluated(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${active ? 'ring-1 ring-purple-300 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={active ? { background: "#f5f3ff" } : {}}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base" style={{ color }}>{getStatusIcon(pct)}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-700">{item.id}</div>
                            <div className="text-xs text-slate-400 truncate" style={{ maxWidth: 100 }}>{item.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded font-bold ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : item.priority === 'MEDIUM' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                          {item.priority === 'CRITICAL' ? 'C' : item.priority === 'HIGH' ? 'H' : 'M'}
                        </span>
                      </div>
                      <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0 p-6">
          {activeItemData && (
            <div className="max-w-4xl">
              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-slate-900">{activeItemData.id}</span>
                  <span className="text-lg font-semibold text-slate-700">{activeItemData.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeItemData.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : activeItemData.priority === 'MEDIUM' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                    {activeItemData.priority}
                  </span>
                  {activeItemData.isAdvisory && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Advisory</span>}
                </div>
                <p className="text-sm text-slate-500 mb-3">{activeItemData.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-xs text-slate-400 mr-1">Satisfies:</span>
                  {activeItemData.controls.map(c => <ControlBadge key={c.id} ctrl={c} />)}
                </div>
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>
                  📉 {activeItemData.reductionNote}
                </div>
              </div>

              {/* Required Columns (for spreadsheet-type items) */}
              {activeItemData.requiredColumns && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Required Columns in Export</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {activeItemData.requiredColumns.map(col => (
                      <span key={col} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium">{col}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quarter Selector (for C5 quarterly reviews) */}
              {activeItemData.perQuarter && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Access Review Quarters (minimum 4 required in 12-month period)</div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedQuarter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedQuarter === "all" ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      All Quarters ({REVIEW_QUARTERS.length})
                    </button>
                    {REVIEW_QUARTERS.map(q => {
                      const qComplete = activeItemData.inputs.filter(i => i.required && i.scope === "per-quarter").every(inp => {
                        const k = `${activeItemData.id}.${q}.${inp.id}`;
                        return inp.type === "file" ? uploadedFiles[k] : inp.type === "checkbox" ? formData[k] : formData[k];
                      });
                      return (
                        <button key={q} onClick={() => setSelectedQuarter(q)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedQuarter === q ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${qComplete ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── INPUTS ── */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700 text-sm">Evidence Inputs</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${itemCompletions[activeItemData.id]}%`, background: getStatusColor(itemCompletions[activeItemData.id]) }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(itemCompletions[activeItemData.id]) }}>{itemCompletions[activeItemData.id]}%</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {activeItemData.perQuarter ? (
                    <>
                      {activeItemData.inputs.filter(i => !i.scope || i.scope !== "per-quarter").map(inp => renderInput(inp))}
                      {(selectedQuarter === "all" ? REVIEW_QUARTERS : [selectedQuarter]).map(q => (
                        <div key={q} className="p-3 rounded-lg border border-purple-100 bg-purple-50/30">
                          <div className="text-xs font-bold text-purple-600 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />{q}
                          </div>
                          <div className="space-y-3">
                            {activeItemData.inputs.filter(i => i.scope === "per-quarter").map(inp => renderInput(inp, q))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    activeItemData.inputs.map(inp => renderInput(inp))
                  )}
                </div>
              </div>

              {/* ── SUFFICIENCY DIMENSIONS ── */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <button onClick={() => setExpandedSuff(p => ({...p, [activeItemData.id]: !p[activeItemData.id]}))}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                  <h3 className="font-semibold text-slate-700 text-sm">Sufficiency Dimensions — What Will Be Evaluated</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{activeItemData.sufficiency.length} dimensions</span>
                    <span className="text-slate-400">{expandedSuff[activeItemData.id] ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expandedSuff[activeItemData.id] && (
                  <div className="p-5 border-t border-slate-100">
                    {activeItemData.sufficiency.map((s, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg mb-1" style={{ background: i%2 === 0 ? "#f8fafc" : "transparent" }}>
                        <span className="text-xs font-mono font-bold text-purple-600 shrink-0 mt-0.5">{s.dim}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{s.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.why}</div>
                        </div>
                        {s.controlRef && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium shrink-0 self-start">{s.controlRef}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PER-CONTROL SUFFICIENCY ── */}
              {activeItemData.perControlSufficiency && activeItemData.perControlSufficiency.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <button onClick={() => setExpandedPerControl(p => ({...p, [activeItemData.id]: !p[activeItemData.id]}))}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                    <h3 className="font-semibold text-slate-700 text-sm">Per-Control Sufficiency Requirements</h3>
                    <span className="text-slate-400">{expandedPerControl[activeItemData.id] ? '▲' : '▼'}</span>
                  </button>
                  {expandedPerControl[activeItemData.id] && (
                    <div className="divide-y divide-slate-100">
                      {activeItemData.perControlSufficiency.map(pcs => {
                        const ctrl = activeItemData.controls.find(c => c.id === pcs.controlId);
                        const score = controlScores[pcs.controlId] || 0;
                        return (
                          <div key={pcs.controlId} className="px-5 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                {ctrl && <ControlBadge ctrl={ctrl} />}
                                <span className="text-sm font-medium text-slate-600">{ctrl?.name || pcs.controlId}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                                </div>
                                <span className="text-xs font-bold" style={{ color: getStatusColor(score) }}>{getStatusLabel(score)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 pl-1">{pcs.requirement}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── CONTROL MAPPING SUMMARY ── */}
              {activeItemData.controls.length > 1 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-700 text-sm">Control Satisfaction Status</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activeItemData.controls.map(ctrl => {
                      const score = controlScores[ctrl.id] || 0;
                      return (
                        <div key={ctrl.id} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ControlBadge ctrl={ctrl} />
                            <span className="text-sm text-slate-600">{ctrl.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: getStatusColor(score) }}>{getStatusLabel(score)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── EVALUATE BUTTON ── */}
              <div className="flex justify-center mb-5">
                <button onClick={() => setEvaluated(true)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.25)" }}>
                  Evaluate Sufficiency for {activeItemData.id}
                </button>
              </div>

              {/* ── EVALUATION RESULTS ── */}
              {evaluated && (
                <div className="rounded-xl border-2 overflow-hidden mb-5" style={{ borderColor: getStatusColor(itemCompletions[activeItemData.id]) }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: getStatusColor(itemCompletions[activeItemData.id]) + "12" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(itemCompletions[activeItemData.id])}</span>
                      <div>
                        <div className="font-bold text-slate-900">{getStatusLabel(itemCompletions[activeItemData.id])}</div>
                        <div className="text-xs text-slate-500">{activeItemData.id} — {activeItemData.name}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: getStatusColor(itemCompletions[activeItemData.id]) }}>{itemCompletions[activeItemData.id]}%</div>
                  </div>
                  <div className="p-5 bg-slate-50/80">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Gap Analysis & Remediation</h4>
                    {itemCompletions[activeItemData.id] >= 90 ? (
                      <div className="p-3 rounded-lg text-sm" style={{ background: "#ecfdf5", color: "#047857" }}>
                        All required inputs complete. Ready for reviewer assessment.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getMissingInputs(activeItemData).map(inp => (
                          <div key={inp.id} className="flex gap-3 p-3 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <span className="text-amber-500 shrink-0">⚠</span>
                            <div>
                              <div className="text-sm font-medium text-slate-700">{inp.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {activeItemData.perQuarter && inp.scope === "per-quarter"
                                  ? `Missing for: ${REVIEW_QUARTERS.filter(q => { const k=`${activeItemData.id}.${q}.${inp.id}`; return inp.type==="file" ? !uploadedFiles[k] : !formData[k]; }).join(", ")}`
                                  : inp.type === "file" ? "Upload required evidence file."
                                  : inp.type === "checkbox" ? "Confirm this attestation."
                                  : "Complete this required field."}
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Sufficiency dimension gaps */}
                        {itemCompletions[activeItemData.id] < 60 && (
                          <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50">
                            <div className="text-xs font-semibold text-red-700 mb-2">Sufficiency Dimensions at Risk</div>
                            {activeItemData.sufficiency.slice(0, 3).map((s, i) => (
                              <div key={i} className="text-xs text-red-600 mb-1">
                                <span className="font-mono font-bold">{s.dim}</span> — {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-56 shrink-0 border-l border-slate-200 sticky top-[72px] self-start hidden xl:block overflow-y-auto" style={{ maxHeight: "calc(100vh - 72px)", background: "#ffffff" }}>
          <div className="p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Control Sufficiency</div>
            {ALL_CONTROLS.map(cid => {
              const score = controlScores[cid];
              const color = getStatusColor(score);
              const ctrl = EVIDENCE_ITEMS.flatMap(it => it.controls).find(c => c.id === cid);
              const items = EVIDENCE_ITEMS.filter(it => it.controls.some(c => c.id === cid)).map(it => it.id);
              return (
                <div key={cid} className="mb-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-700">{cid} <span className={ctrl?.ma === "M" ? "text-amber-600" : "text-sky-600"}>{ctrl?.ma}</span></span>
                    <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1 leading-snug">{ctrl?.name || cid}</div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-0.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                  </div>
                  <div className="text-xs text-slate-400">{items.join(", ")}</div>
                </div>
              );
            })}

            {/* Cross-domain note */}
            <div className="mt-4 p-2 rounded-lg border border-purple-100 bg-purple-50/50">
              <div className="text-xs font-semibold text-purple-700 mb-1">Cross-Domain Links</div>
              <div className="text-xs text-purple-600 leading-relaxed">
                C1 policy covers controls also served by Domain B (1.2, 2.6, 4.2). C2 privileged accounts should match B1 OS hardening evidence.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

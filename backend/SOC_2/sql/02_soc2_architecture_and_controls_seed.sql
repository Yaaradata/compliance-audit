-- ============================================================
-- SOC 2 — Seed architecture_details (JSONB long-text fields)
-- Run after 01_soc2_schema.sql
-- ============================================================

BEGIN;

SET search_path TO soc2, public;

-- ============================================================
-- OVERVIEW rows
-- ============================================================

INSERT INTO soc2.architecture_details (
    architecture_code, name, category,
    what_it_defines, detailed_description,
    controls_available, mandatory_controls, advisory_controls,
    soc_version, sort_order
) VALUES

-- ── OVERVIEW ─────────────────────────────────────────────────
(
  'OVERVIEW',
  'SOC 2 Framework Overview',
  'overview',

  /* what_it_defines */
  '{
    "summary": "SOC 2 is a report on controls at a service organization relevant to security, availability, processing integrity, confidentiality, or privacy."
  }',

  /* detailed_description */
  '{
    "summary": "SOC 2 examinations are based on the AICPA Trust Services Criteria (TSC). Security is the only mandatory category; the other four are optional and chosen based on customer commitments and system description.",
    "points": [
      "Security is the only mandatory Trust Services Category.",
      "Availability, Processing Integrity, Confidentiality, and Privacy are optional — selected based on customer commitments.",
      "The architecture choice (scope + deployment) drives the audit scope and evidence requirements."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    },
    "note": "Optional TSC (Availability, Processing Integrity, Confidentiality, Privacy) each add their own criteria when in scope."
  }',

  /* mandatory_controls */
  '{
    "summary": "All nine Common Criteria (CC1–CC9) and their points of focus are mandatory when Security is in scope.",
    "items": [
      "CC1 — Control Environment",
      "CC2 — Communication and Information",
      "CC3 — Risk Assessment",
      "CC4 — Monitoring Activities",
      "CC5 — Control Activities",
      "CC6 — Logical and Physical Access Controls",
      "CC7 — System Operations",
      "CC8 — Change Management",
      "CC9 — Risk Mitigation"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "None for Security. Optional TSC may include advisory points of focus per AICPA guidance.",
    "items": []
  }',

  '2022', 1
),

-- ── STRUCTURE ────────────────────────────────────────────────
(
  'STRUCTURE',
  'How SOC 2 Is Organized',
  'overview',

  /* what_it_defines */
  '{
    "summary": "The framework has five Trust Service Criteria; Security contains nine Common Criteria (CC1–CC9)."
  }',

  /* detailed_description */
  '{
    "summary": "The framework has five Trust Service Criteria categories. Under Security, nine Common Criteria (CC1–CC9) form the mandatory foundation. Users choose a scope and a deployment type; that selection determines which controls and evidence items apply.",
    "points": [
      "Five Trust Service Categories: Security, Availability, Processing Integrity, Confidentiality, Privacy.",
      "CC1–CC9 are the mandatory Common Criteria under Security.",
      "Each criterion has control objectives and points of focus evaluated by auditors.",
      "Scope selection (which TSC) and deployment type (where the system runs) determine applicable controls."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    }
  }',

  /* mandatory_controls */
  '{
    "summary": "CC1–CC9 and all associated points of focus when Security is in scope.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "N/A",
    "items": []
  }',

  '2022', 2
),

-- ── CHOOSING ARCHITECTURE ────────────────────────────────────
(
  'CHOOSING_ARCHITECTURE',
  'Choosing Your Architecture',
  'overview',

  /* what_it_defines */
  '{
    "summary": "Select one scope (which TSC) and one deployment (where the system runs)."
  }',

  /* detailed_description */
  '{
    "summary": "Your scope and deployment choices determine which controls and evidence are in scope for the assessment.",
    "points": [
      "Scope options: Security Only; Security + Availability; Security + Processing Integrity; Security + Confidentiality; Security + Privacy; All Five TSC.",
      "Deployment options: Cloud-Only; Hybrid (Cloud + On-Premises); On-Premises; SaaS / Multi-Tenant.",
      "Security controls (CC1–CC9) apply to all scope selections.",
      "Optional TSC add their own criteria when selected."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    },
    "note": "Deployment affects how physical and logical controls are evidenced (e.g. cloud vs on-prem)."
  }',

  /* mandatory_controls */
  '{
    "summary": "Security scope: all CC1–CC9 mandatory. Other TSC: mandatory controls apply when that TSC is in scope.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "N/A",
    "items": []
  }',

  '2022', 3
)

ON CONFLICT (architecture_code) DO UPDATE SET
    name                 = EXCLUDED.name,
    category             = EXCLUDED.category,
    what_it_defines      = EXCLUDED.what_it_defines,
    detailed_description = EXCLUDED.detailed_description,
    controls_available   = EXCLUDED.controls_available,
    mandatory_controls   = EXCLUDED.mandatory_controls,
    advisory_controls    = EXCLUDED.advisory_controls,
    soc_version          = EXCLUDED.soc_version,
    sort_order           = EXCLUDED.sort_order,
    updated_at           = now();


-- ============================================================
-- SCOPE rows
-- ============================================================

INSERT INTO soc2.architecture_details (
    architecture_code, name, category,
    what_it_defines, detailed_description,
    controls_available, mandatory_controls, advisory_controls,
    soc_version, sort_order
) VALUES

-- ── SECURITY ONLY ────────────────────────────────────────────
(
  'SECURITY_ONLY',
  'Security Only',
  'scope',

  /* what_it_defines */
  '{
    "summary": "Only the Security category is in scope. All nine Common Criteria (CC1–CC9) apply."
  }',

  /* detailed_description */
  '{
    "summary": "The minimum scope for any SOC 2 examination. Most common when customers need assurance over security controls only.",
    "points": [
      "No additional Trust Service Criteria (Availability, Processing Integrity, Confidentiality, Privacy) are evaluated.",
      "Use when your commitment to customers is limited to security.",
      "Reduces audit scope and evidence compared to adding other TSC."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    }
  }',

  /* mandatory_controls */
  '{
    "summary": "All CC1–CC9 and their points of focus. No optional TSC controls.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "None.",
    "items": []
  }',

  '2022', 10
),

-- ── SECURITY + AVAILABILITY ──────────────────────────────────
(
  'SECURITY_AVAILABILITY',
  'Security + Availability',
  'scope',

  /* what_it_defines */
  '{
    "summary": "Security (CC1–CC9) plus Availability criteria are in scope."
  }',

  /* detailed_description */
  '{
    "summary": "Availability addresses whether the system is available for operation and use as committed or agreed. Typical for SaaS, hosting, or any service where uptime is part of the value proposition.",
    "points": [
      "Use when you commit to uptime/SLAs or when customers rely on your system availability.",
      "Auditors evaluate both security controls and availability-related controls.",
      "Evidence includes capacity management, redundancy, and incident response affecting availability."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "A1"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation",
      "A1":  "Availability Criteria"
    }
  }',

  /* mandatory_controls */
  '{
    "summary": "Security CC1–CC9 mandatory. Availability: all A1.x criteria mandatory when Availability is in scope.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9",
      "A1.1 — Capacity Management",
      "A1.2 — Recovery Infrastructure",
      "A1.3 — Recovery Plan Testing"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "Per AICPA TSC; any advisory points of focus for Availability.",
    "items": []
  }',

  '2022', 11
),

-- ── SECURITY + PROCESSING INTEGRITY ─────────────────────────
(
  'SECURITY_PI',
  'Security + Processing Integrity',
  'scope',

  /* what_it_defines */
  '{
    "summary": "Security (CC1–CC9) plus Processing Integrity (PI) are in scope."
  }',

  /* detailed_description */
  '{
    "summary": "Processing Integrity addresses whether system processing is complete, valid, accurate, timely, and authorized. Relevant for payment processing, data transformation, or any system where correctness is critical.",
    "points": [
      "Use when you process transactions or data that must be accurate and complete.",
      "PI1.x criteria cover completeness, accuracy, timeliness, and authorization of processing.",
      "Common for fintech, healthcare data pipelines, and ETL-heavy systems."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "PI1"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation",
      "PI1": "Processing Integrity Criteria"
    }
  }',

  /* mandatory_controls */
  '{
    "summary": "Security CC1–CC9 mandatory. Processing Integrity: all PI1.x mandatory when PI is in scope.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9",
      "PI1.1 — Quality Information for Processing",
      "PI1.2 — Input Controls",
      "PI1.3 — Processing Controls",
      "PI1.4 — Output Controls",
      "PI1.5 — Storage Controls"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "Per AICPA TSC.",
    "items": []
  }',

  '2022', 12
),

-- ── SECURITY + CONFIDENTIALITY ───────────────────────────────
(
  'SECURITY_CONFIDENTIALITY',
  'Security + Confidentiality',
  'scope',

  /* what_it_defines */
  '{
    "summary": "Security (CC1–CC9) plus Confidentiality are in scope."
  }',

  /* detailed_description */
  '{
    "summary": "Confidentiality addresses protection of information designated as confidential. Common when handling customer confidential data, trade secrets, or regulated data where disclosure would cause harm.",
    "points": [
      "Use when confidentiality of data is an explicit commitment or regulatory requirement.",
      "C1.x criteria cover classification, handling, and protection of confidential information.",
      "Relevant for legal, financial, IP-heavy, or B2B SaaS with NDA-protected data."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "C1"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation",
      "C1":  "Confidentiality Criteria"
    }
  }',

  /* mandatory_controls */
  '{
    "summary": "Security CC1–CC9 mandatory. Confidentiality: all C1.x mandatory when Confidentiality is in scope.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9",
      "C1.1 — Identifies and Maintains Confidential Information",
      "C1.2 — Disposes of Confidential Information"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "Per AICPA TSC.",
    "items": []
  }',

  '2022', 13
),

-- ── SECURITY + PRIVACY ───────────────────────────────────────
(
  'SECURITY_PRIVACY',
  'Security + Privacy',
  'scope',

  /* what_it_defines */
  '{
    "summary": "Security (CC1–CC9) plus Privacy are in scope."
  }',

  /* detailed_description */
  '{
    "summary": "Privacy addresses collection, use, retention, disclosure, and disposal of personal information. Required when the system processes personal information and privacy is part of the service commitment.",
    "points": [
      "Use when you process PII and have privacy commitments or regulations (e.g. GDPR, CCPA, HIPAA).",
      "P1.x–P8.x criteria cover notice, choice, consent, collection, use, retention, disclosure, quality, and disposal.",
      "Largest additional criteria set — adds 20 criteria on top of CC1–CC9."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation",
      "P1":  "Notice and Communication",
      "P2":  "Choice and Consent",
      "P3":  "Collection",
      "P4":  "Use, Retention and Disposal",
      "P5":  "Access",
      "P6":  "Disclosure and Notification",
      "P7":  "Quality",
      "P8":  "Monitoring and Enforcement"
    }
  }',

  /* mandatory_controls */
  '{
    "summary": "Security CC1–CC9 mandatory. Privacy: applicable P1.x–P8.x criteria mandatory when Privacy is in scope.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9",
      "P1.1 — Notice to Data Subjects",
      "P2.1 — Choice and Consent",
      "P3.1 — Collection",
      "P3.2 — Explicit Consent",
      "P4.1 — Use Limitation",
      "P4.2 — Retention",
      "P4.3 — Disposal",
      "P5.1 — Access",
      "P5.2 — Correction",
      "P6.1 — Disclosure with Consent",
      "P6.2 — Authorised Disclosure Records",
      "P6.3 — Unauthorised Disclosure Records",
      "P6.4 — Third-Party Privacy Commitments",
      "P6.5 — Third-Party Reporting Commitments",
      "P6.6 — Breach Notification",
      "P6.7 — Accounting of PI Held",
      "P7.1 — Data Quality",
      "P8.1 — Monitoring and Enforcement"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "Per AICPA TSC.",
    "items": []
  }',

  '2022', 14
),

-- ── ALL FIVE TSC ─────────────────────────────────────────────
(
  'ALL_FIVE_TSC',
  'All Five Trust Service Criteria',
  'scope',

  /* what_it_defines */
  '{
    "summary": "Security, Availability, Processing Integrity, Confidentiality, and Privacy are all in scope."
  }',

  /* detailed_description */
  '{
    "summary": "The broadest SOC 2 scope. Requires the most evidence and control coverage. Appropriate for comprehensive assurance across all five trust service categories.",
    "points": [
      "Use when customers or regulators expect full TSC coverage (e.g. enterprise, healthcare, financial services).",
      "Covers 67 criteria total: 33 Common Criteria + 3 Availability + 5 PI + 2 Confidentiality + 20 Privacy + 4 additional.",
      "Highest evidence burden — plan for significant uplift in documentation and controls."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1","CC2","CC3","CC4","CC5","CC6","CC7","CC8","CC9","A1","PI1","C1","P1","P2","P3","P4","P5","P6","P7","P8"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation",
      "A1":  "Availability",
      "PI1": "Processing Integrity",
      "C1":  "Confidentiality",
      "P1":  "Notice and Communication",
      "P2":  "Choice and Consent",
      "P3":  "Collection",
      "P4":  "Use, Retention and Disposal",
      "P5":  "Access",
      "P6":  "Disclosure and Notification",
      "P7":  "Quality",
      "P8":  "Monitoring and Enforcement"
    },
    "total_criteria": 67
  }',

  /* mandatory_controls */
  '{
    "summary": "All mandatory controls under Security, Availability, Processing Integrity, Confidentiality, and Privacy per AICPA TSC.",
    "items": [
      "CC1–CC9 (33 Common Criteria)",
      "A1.1, A1.2, A1.3 (Availability)",
      "PI1.1–PI1.5 (Processing Integrity)",
      "C1.1, C1.2 (Confidentiality)",
      "P1.1–P8.1 (Privacy — 20 criteria)"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "Advisory points of focus as defined in AICPA TSC for each category.",
    "items": [
      "Advisory points of focus under each of the five Trust Service Categories"
    ]
  }',

  '2022', 15
)

ON CONFLICT (architecture_code) DO UPDATE SET
    name                 = EXCLUDED.name,
    category             = EXCLUDED.category,
    what_it_defines      = EXCLUDED.what_it_defines,
    detailed_description = EXCLUDED.detailed_description,
    controls_available   = EXCLUDED.controls_available,
    mandatory_controls   = EXCLUDED.mandatory_controls,
    advisory_controls    = EXCLUDED.advisory_controls,
    soc_version          = EXCLUDED.soc_version,
    sort_order           = EXCLUDED.sort_order,
    updated_at           = now();


-- ============================================================
-- DEPLOYMENT rows
-- ============================================================

INSERT INTO soc2.architecture_details (
    architecture_code, name, category,
    what_it_defines, detailed_description,
    controls_available, mandatory_controls, advisory_controls,
    soc_version, sort_order
) VALUES

-- ── CLOUD ONLY ───────────────────────────────────────────────
(
  'CLOUD_ONLY',
  'Cloud-Only',
  'deployment',

  /* what_it_defines */
  '{
    "summary": "All system components and data reside in public or private cloud."
  }',

  /* detailed_description */
  '{
    "summary": "All infrastructure in public or private cloud (e.g. AWS, Azure, GCP). No on-premises data centers in scope. Physical security is largely inherited from the cloud provider.",
    "points": [
      "Physical security and facility controls evidenced via cloud provider SOC 2 reports or certifications.",
      "Logical access, change management, and monitoring focus on cloud-native tools and IAM.",
      "Physical access (CC6.4) addressed via cloud provider attestations — no on-prem evidence required.",
      "Shared responsibility model must be documented to delineate provider vs. organization controls."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    },
    "evidence_source": "cloud_provider_reports",
    "provider_examples": ["AWS", "Azure", "GCP"]
  }',

  /* mandatory_controls */
  '{
    "summary": "CC1–CC9 apply; physical access (CC6.4) satisfied via provider attestations. All other CC controls mandatory with cloud-based evidence.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5",
      "CC6 — logical access; CC6.4 physical via cloud provider report",
      "CC7", "CC8", "CC9"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "None.",
    "items": []
  }',

  '2022', 20
),

-- ── HYBRID ───────────────────────────────────────────────────
(
  'HYBRID',
  'Hybrid (Cloud + On-Premises)',
  'deployment',

  /* what_it_defines */
  '{
    "summary": "The system spans both cloud and on-premises infrastructure."
  }',

  /* detailed_description */
  '{
    "summary": "Some components or data are in the cloud; others are in corporate data centers or offices. Evidence must cover both segments.",
    "points": [
      "Cloud segments: evidence via provider SOC 2 reports and cloud-native control outputs.",
      "On-premises segments: direct evidence for physical access, environmental controls, and facility procedures.",
      "Control applicability may differ by component location — document the split clearly.",
      "Shared responsibility model and asset inventory must clearly identify where each component resides."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    },
    "evidence_source": "mixed",
    "segments": ["cloud", "on_premises"]
  }',

  /* mandatory_controls */
  '{
    "summary": "All CC1–CC9 mandatory; evidence required for both cloud and on-premises in-scope components.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "None.",
    "items": []
  }',

  '2022', 21
),

-- ── ON PREMISES ──────────────────────────────────────────────
(
  'ON_PREMISES',
  'On-Premises',
  'deployment',

  /* what_it_defines */
  '{
    "summary": "System components and data are primarily or entirely in organization-owned or leased facilities."
  }',

  /* detailed_description */
  '{
    "summary": "Data center, server rooms, or offices entirely under organizational control. All physical and logical controls are directly evidenced by the organization.",
    "points": [
      "Full control over physical security, environmental controls, and facility access.",
      "Physical access (CC6.4), environmental protections, and secure disposal (CC6.5) require detailed organizational evidence.",
      "No reliance on cloud provider attestations — all evidence is organization-owned.",
      "Higher evidence burden for physical controls compared to cloud-only deployments."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    },
    "evidence_source": "organization_owned",
    "physical_controls_in_scope": true
  }',

  /* mandatory_controls */
  '{
    "summary": "All CC1–CC9 mandatory with full organization-owned evidence for physical and logical controls.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5",
      "CC6 — full physical access evidence required (CC6.4, CC6.5)",
      "CC7", "CC8", "CC9"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "None.",
    "items": []
  }',

  '2022', 22
),

-- ── SAAS / MULTI-TENANT ──────────────────────────────────────
(
  'SAAS_MULTI_TENANT',
  'SaaS / Multi-Tenant',
  'deployment',

  /* what_it_defines */
  '{
    "summary": "Software-as-a-service offering with multiple tenants on shared or logically separated infrastructure."
  }',

  /* detailed_description */
  '{
    "summary": "You operate a SaaS platform with multiple customers (tenants). Scope includes logical separation, tenant isolation, and access controls that prevent one tenant from affecting another.",
    "points": [
      "Tenant isolation, data separation, and RBAC per tenant are key control areas.",
      "Often combined with Security + Availability or All Five TSC scopes.",
      "Evidence must demonstrate that one tenant cannot access or affect another tenant''s data.",
      "Availability SLA documentation and capacity management are typically required."
    ]
  }',

  /* controls_available */
  '{
    "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"],
    "labels": {
      "CC1": "Control Environment",
      "CC2": "Communication and Information",
      "CC3": "Risk Assessment",
      "CC4": "Monitoring Activities",
      "CC5": "Control Activities",
      "CC6": "Logical and Physical Access Controls",
      "CC7": "System Operations",
      "CC8": "Change Management",
      "CC9": "Risk Mitigation"
    },
    "evidence_source": "mixed",
    "key_focus_areas": ["tenant_isolation", "data_separation", "rbac_per_tenant", "availability_sla"]
  }',

  /* mandatory_controls */
  '{
    "summary": "All CC1–CC9 mandatory; tenant isolation and access controls are critical. Availability mandatory if that TSC is in scope.",
    "items": [
      "CC1", "CC2", "CC3", "CC4", "CC5",
      "CC6 — tenant-level logical access and isolation evidence required",
      "CC7", "CC8", "CC9",
      "A1.1, A1.2, A1.3 — mandatory if Availability TSC is in scope"
    ]
  }',

  /* advisory_controls */
  '{
    "summary": "None.",
    "items": []
  }',

  '2022', 23
)

ON CONFLICT (architecture_code) DO UPDATE SET
    name                 = EXCLUDED.name,
    category             = EXCLUDED.category,
    what_it_defines      = EXCLUDED.what_it_defines,
    detailed_description = EXCLUDED.detailed_description,
    controls_available   = EXCLUDED.controls_available,
    mandatory_controls   = EXCLUDED.mandatory_controls,
    advisory_controls    = EXCLUDED.advisory_controls,
    soc_version          = EXCLUDED.soc_version,
    sort_order           = EXCLUDED.sort_order,
    updated_at           = now();

COMMIT;
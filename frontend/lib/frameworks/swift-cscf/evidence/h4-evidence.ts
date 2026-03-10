import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H4_EVIDENCE_ITEM_ID = "H4";

export const H4_UPLOAD_GUIDANCE = [
  { id: "1", label: "Security awareness programme documentation covering all required topics" },
  { id: "2", label: "SWIFT product/service training content (Swift Smart modules)" },
  { id: "3", label: "Cyber threat awareness materials relevant to financial services" },
  { id: "4", label: "Training topics: cloud risks, password security, device security, phishing, safe browsing, reporting suspicious events" },
  { id: "5", label: "Target audience definition (all SWIFT access staff + additional for privileged users)" },
  { id: "6", label: "Delivery method documentation (e-learning, classroom, workshop)" },
  { id: "7", label: "Programme update process and annual review cycle" },
];

export const H4_FIELDS: FieldDef[] = [
  {
    key: "programme_version_date",
    label: "Programme version/last update date",
    type: "date",
  },
  {
    key: "programme_owner",
    label: "Programme owner/responsible party",
    type: "text",
    placeholder: "e.g. CISO, Security Awareness Manager, HR Training Lead",
  },
  {
    key: "swift_product_training",
    label: "SWIFT products/services training (Swift Smart modules) included",
    type: "select",
    options: [
      "Swift Smart modules or equivalent SWIFT-specific training included",
      "General SWIFT awareness without Swift Smart modules",
      "SWIFT products mentioned but not trained in detail",
      "No SWIFT-specific training content",
    ],
  },
  {
    key: "cyber_threat_awareness",
    label: "Cyber threat awareness for financial services included",
    type: "select",
    options: [
      "Comprehensive — financial sector threats, recent attack case studies",
      "General cyber awareness with some financial sector content",
      "Generic cyber awareness — not financial-sector specific",
      "Not included",
    ],
  },
  {
    key: "cloud_deployment_risks",
    label: "Cloud deployment risk awareness included",
    type: "select",
    options: [
      "Dedicated cloud risk module included",
      "Cloud risks mentioned within broader training",
      "Not specifically covered",
      "Not applicable — no cloud deployment",
    ],
  },
  {
    key: "topics_covered",
    label: "Security topics covered in programme",
    type: "textarea",
    placeholder: "List topics: password security, device security, phishing/spear phishing recognition, safe download practices, safe browsing, reporting suspicious events, social engineering — note any missing topics",
    rows: 4,
  },
  {
    key: "target_audience_coverage",
    label: "Target audience coverage",
    type: "select",
    options: [
      "All staff with SWIFT access required to complete training",
      "Most SWIFT access staff covered — some exemptions",
      "Limited to specific teams only",
      "No defined target audience",
    ],
  },
  {
    key: "privileged_user_training",
    label: "Additional training for privileged/admin users",
    type: "select",
    options: [
      "Dedicated additional training module for privileged users",
      "Enhanced content within standard programme for privileged users",
      "Same training as regular users — no additional content",
      "No privileged user-specific training",
    ],
  },
  {
    key: "training_frequency",
    label: "Training frequency",
    type: "select",
    options: [
      "Annual mandatory training plus ad hoc updates for emerging threats",
      "Annual mandatory training",
      "Semi-annual training",
      "One-time at onboarding only",
      "No defined frequency",
    ],
  },
  {
    key: "delivery_method",
    label: "Training delivery method",
    type: "select",
    options: [
      "Blended: e-learning, classroom, and workshops",
      "E-learning platform with assessments",
      "Classroom/in-person sessions only",
      "Self-study materials distributed (no formal delivery)",
    ],
  },
  {
    key: "programme_update_process",
    label: "Programme update and review process",
    type: "textarea",
    placeholder: "Describe how the programme is updated: triggers for updates (new threats, incidents, SWIFT advisories), review cycle, who approves changes, how content currency is maintained",
    rows: 3,
  },
  {
    key: "known_gaps",
    label: "Known gaps in training programme or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any missing topics, uncovered audiences, outdated content, or planned programme enhancements",
    rows: 3,
  },
];

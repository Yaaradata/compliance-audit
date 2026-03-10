import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H8_EVIDENCE_ITEM_ID = "H8";

export const H8_UPLOAD_GUIDANCE = [
  { id: "1", label: "RMA management process documentation including KYC due diligence and approval workflow" },
  { id: "2", label: "Annual RMA relationship review evidence (date, reviewer, scope, counts)" },
  { id: "3", label: "Identification and removal of unused, dormant, or unwanted relationships" },
  { id: "4", label: "RMA inventory (counterparty name, creation date, last review, status)" },
  { id: "5", label: "Latest review evidence with reviewer name, reviewed count, removed count, justified count" },
];

export const H8_FIELDS: FieldDef[] = [
  {
    key: "rma_process_documented",
    label: "RMA management process documented",
    type: "select",
    options: [
      "Comprehensive process: KYC, approval, annual review, removal procedures",
      "Process exists but missing some elements",
      "Basic guidance only — no formal process",
      "No process documented",
    ],
  },
  {
    key: "kyc_due_diligence",
    label: "KYC due diligence for new RMA relationships",
    type: "select",
    options: [
      "Formal KYC performed and documented for all new relationships",
      "KYC performed for most new relationships",
      "Informal checks — not formally documented",
      "No KYC due diligence performed",
    ],
  },
  {
    key: "approval_process",
    label: "RMA relationship approval process",
    type: "select",
    options: [
      "Formal multi-level approval (requestor, compliance, management)",
      "Single-level approval by designated authority",
      "Informal approval — no documented workflow",
      "No approval process",
    ],
  },
  {
    key: "annual_review_conducted",
    label: "Annual review of ALL RMA relationships conducted",
    type: "select",
    options: [
      "Comprehensive annual review of all relationships completed",
      "Review conducted but not all relationships covered",
      "Review conducted less frequently than annually",
      "No periodic review conducted",
    ],
  },
  {
    key: "latest_review_date",
    label: "Date of latest RMA relationship review",
    type: "date",
  },
  {
    key: "reviewer_name",
    label: "Reviewer name/role for latest review",
    type: "text",
    placeholder: "e.g. Compliance Officer, SWIFT Operations Manager",
  },
  {
    key: "total_relationships_reviewed",
    label: "Total relationships reviewed",
    type: "text",
    placeholder: "e.g. 150 RMA relationships reviewed",
  },
  {
    key: "relationships_removed",
    label: "Relationships removed (unused, dormant, unwanted)",
    type: "text",
    placeholder: "e.g. 12 removed (8 dormant, 3 unused >12 months, 1 unwanted)",
  },
  {
    key: "relationships_justified",
    label: "Relationships justified and retained",
    type: "text",
    placeholder: "e.g. 138 justified and retained with business rationale documented",
  },
  {
    key: "dormant_unused_identification",
    label: "Unused, dormant, and unwanted relationship identification process",
    type: "select",
    options: [
      "Systematic identification: dormancy thresholds, usage analysis, business validation",
      "Basic identification — relationships flagged manually",
      "Ad hoc identification — no defined criteria",
      "No identification process",
    ],
  },
  {
    key: "timely_removal",
    label: "Timeliness of obsolete relationship removal",
    type: "select",
    options: [
      "Removed within 30 days of identification",
      "Removed within 90 days of identification",
      "Removal delayed beyond 90 days",
      "Identified but not yet removed",
    ],
  },
  {
    key: "rma_inventory_maintained",
    label: "RMA inventory maintained (counterparty, creation date, last review, status)",
    type: "select",
    options: [
      "Complete inventory with all required fields maintained",
      "Inventory maintained but missing some fields",
      "Partial inventory only",
      "No inventory maintained",
    ],
  },
  {
    key: "next_review_date",
    label: "Next scheduled RMA review date",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps in RMA management or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any unreviewed relationships, inventory gaps, process deficiencies, or planned improvements",
    rows: 3,
  },
];

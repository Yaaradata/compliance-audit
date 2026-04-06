// ─────────────────────────────────────────────────────────
//  ROLE DEFINITIONS
//  Single source of truth for every role in the platform.
//  Add new roles here — the rest of the app picks them up.
// ─────────────────────────────────────────────────────────

export const ROLES = {
  COMPLIANCE_OFFICER: "Compliance Officer",
  EVIDENCE_UPLOADER:  "Evidence Uploader",
  REVIEWER:           "Reviewer",
  APPROVER:           "Approver",
};

// Visual identity per role
export const ROLE_META = {
  [ROLES.COMPLIANCE_OFFICER]: {
    color:  "#1D4ED8",
    bg:     "#EFF6FF",
    border: "#BFDBFE",
    icon:   "🏛",
    short:  "CO",
  },
  [ROLES.EVIDENCE_UPLOADER]: {
    color:  "#6D28D9",
    bg:     "#EDE9FE",
    border: "#C4B5FD",
    icon:   "📂",
    short:  "EU",
  },
  [ROLES.REVIEWER]: {
    color:  "#0369A1",
    bg:     "#E0F2FE",
    border: "#BAE6FD",
    icon:   "🔍",
    short:  "RV",
  },
  [ROLES.APPROVER]: {
    color:  "#065F46",
    bg:     "#D1FAE5",
    border: "#A7F3D0",
    icon:   "✍",
    short:  "AP",
  },
};

// Task action verbs per role — drives task item labels
export const ROLE_TASK_VERBS = {
  [ROLES.EVIDENCE_UPLOADER]: {
    upload:   "Upload",
    reupload: "Re-upload",
    comment:  "Comment",
  },
  [ROLES.REVIEWER]: {
    review:  "Review",
    comment: "Add comment",
    approve: "Approve item",
    reject:  "Reject item",
  },
  [ROLES.APPROVER]: {
    approve: "Sign off",
    risk:    "Accept risk",
    review:  "Final review",
  },
  [ROLES.COMPLIANCE_OFFICER]: {
    assign:   "Assign",
    configure:"Configure",
    review:   "Review",
  },
};

// Framework design tokens
export const FRAMEWORK_META = {
  SWIFT: { accent: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  SOC2:  { accent: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  ISO:   { accent: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
  PCI:   { accent: "#7E22CE", bg: "#FAF5FF", border: "#DDD6FE" },
};

// Cycle status tokens
export const STATUS_META = {
  "on-track":         { label: "On track",        dot: "#10B981", text: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  "needs-attention":  { label: "Needs attention",  dot: "#F59E0B", text: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  "urgent":           { label: "Urgent",           dot: "#EF4444", text: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },
  "completed":        { label: "Completed",        dot: "#6B7280", text: "#374151", bg: "#F9FAFB", border: "#E5E7EB" },
};

export const PRIORITY_META = {
  high: { label: "High",   color: "#DC2626", bg: "#FEF2F2" },
  med:  { label: "Med",    color: "#D97706", bg: "#FFFBEB" },
  low:  { label: "Low",    color: "#6B7280", bg: "#F9FAFB" },
};

export const PHASES = ["Setup", "Collection", "Review", "Approval"];

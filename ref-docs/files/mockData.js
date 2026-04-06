// ─────────────────────────────────────────────────────────
//  MOCK DATA
//  In production, replace these with API responses.
//  Shape must match exactly — components depend on this contract.
// ─────────────────────────────────────────────────────────

import { ROLES } from "../constants/roles";

// Logged-in user profile returned by /api/me
export const MOCK_USER = {
  id:       "usr_riya_001",
  name:     "Riya Sharma",
  initials: "RS",
  title:    "Senior Compliance Analyst",
  email:    "riya.sharma@acmecorp.com",
  org:      "AcmeCorp",
  // cycleRoles: maps cycleId → role assigned in that cycle
  cycleRoles: {
    "CYC-2026-72A489": ROLES.EVIDENCE_UPLOADER,
    "CYC-2026-853C2E": ROLES.REVIEWER,
    "CYC-2025-F3A921": ROLES.APPROVER,
  },
};

// Cycles returned by /api/cycles?userId=...
export const MOCK_CYCLES = [
  {
    id:            "CYC-2026-72A489",
    name:          "SWIFT CSCF 2026",
    framework:     "SWIFT CSCF",
    frameworkTag:  "SWIFT",
    icon:          "🏦",
    year:          2026,
    phase:         "Collection",
    phaseIndex:    1,          // 0=Setup 1=Collection 2=Review 3=Approval
    deadline:      "Mar 31, 2026",
    daysLeft:      8,
    createdDate:   "Mar 1, 2026",
    lastActivity:  "2 hours ago",
    status:        "needs-attention",
    overallProgress: 45,
    controls: {
      total: 48, compliant: 21,
      inReview: 8, pending: 15, overdue: 4,
    },
    evidence: {
      total: 89, uploaded: 54,
      aiPassed: 42, pendingReview: 12,
    },
    myTasks: { total: 13, completed: 8, pending: 5 },
    teamMembers: [
      { initials: "AM", color: "#3B82F6", name: "Arjun M.",  role: ROLES.REVIEWER  },
      { initials: "PD", color: "#10B981", name: "Priya D.",  role: ROLES.APPROVER  },
      { initials: "KJ", color: "#8B5CF6", name: "Karan J.",  role: ROLES.EVIDENCE_UPLOADER },
    ],
    tasks: [
      { id: 1, title: "Upload evidence for control 2.1 — Internal Data Flow Security",     type: "upload",   priority: "high", due: "Today",   done: false },
      { id: 2, title: "Re-upload firewall_policy.pdf — AI score below threshold (34/100)", type: "reupload", priority: "high", due: "Today",   done: false },
      { id: 3, title: "Submit screenshots for control 6.1 — Anomaly Detection",            type: "upload",   priority: "med",  due: "Mar 26",  done: false },
      { id: 4, title: "Provide supporting doc for control 5.2 — Logical Access",           type: "upload",   priority: "med",  due: "Mar 27",  done: false },
      { id: 5, title: "Clarify metadata on patch_log_feb.xlsx with reviewer",              type: "comment",  priority: "low",  due: "Mar 29",  done: false },
    ],
  },
  {
    id:            "CYC-2026-853C2E",
    name:          "SOC 2 Type II 2026",
    framework:     "SOC 2 Type II",
    frameworkTag:  "SOC2",
    icon:          "🔐",
    year:          2026,
    phase:         "Review",
    phaseIndex:    2,
    deadline:      "Apr 15, 2026",
    daysLeft:      23,
    createdDate:   "Mar 10, 2026",
    lastActivity:  "Yesterday",
    status:        "on-track",
    overallProgress: 68,
    controls: {
      total: 61, compliant: 38,
      inReview: 14, pending: 6, overdue: 3,
    },
    evidence: {
      total: 203, uploaded: 187,
      aiPassed: 171, pendingReview: 16,
    },
    myTasks: { total: 17, completed: 14, pending: 3 },
    teamMembers: [
      { initials: "NK", color: "#F59E0B", name: "Nikhil K.", role: ROLES.EVIDENCE_UPLOADER },
      { initials: "PD", color: "#10B981", name: "Priya D.",  role: ROLES.APPROVER  },
    ],
    tasks: [
      { id: 6, title: "Review access_control_policy.pdf — uploaded by N. Kumar",     type: "review",  priority: "high", due: "Mar 24", done: false },
      { id: 7, title: "Review encryption_certificate_2026.pdf — AI score 88",         type: "review",  priority: "med",  due: "Mar 25", done: false },
      { id: 8, title: "Add clarification comment on incident_log.xlsx",               type: "comment", priority: "low",  due: "Mar 28", done: false },
    ],
  },
  {
    id:            "CYC-2025-F3A921",
    name:          "ISO 27001 : 2025",
    framework:     "ISO 27001",
    frameworkTag:  "ISO",
    icon:          "🛡️",
    year:          2025,
    phase:         "Approval",
    phaseIndex:    3,
    deadline:      "Mar 25, 2026",
    daysLeft:      2,
    createdDate:   "Jan 15, 2026",
    lastActivity:  "3 hours ago",
    status:        "urgent",
    overallProgress: 94,
    controls: {
      total: 114, compliant: 107,
      inReview: 4, pending: 2, overdue: 1,
    },
    evidence: {
      total: 412, uploaded: 412,
      aiPassed: 401, pendingReview: 0,
    },
    myTasks: { total: 24, completed: 22, pending: 2 },
    teamMembers: [
      { initials: "SP", color: "#6366F1", name: "Sanjay P.", role: ROLES.EVIDENCE_UPLOADER },
      { initials: "AM", color: "#3B82F6", name: "Arjun M.",  role: ROLES.REVIEWER },
    ],
    tasks: [
      { id: 9,  title: "Final sign-off — all 114 controls reviewed, cycle ready for submission", type: "approve", priority: "high", due: "Today",  done: false },
      { id: 10, title: "Accept formal risk acceptance for control A.12.6",                       type: "risk",    priority: "high", due: "Mar 25", done: false },
    ],
  },
];

// Activity feed returned by /api/activity?userId=...
export const MOCK_ACTIVITY = [
  { icon: "✓", color: "#10B981", bg: "#ECFDF5", text: "Your submission for control 1.1 was approved by A. Mehta",       cycle: "SWIFT CSCF",  cycleTag: "SWIFT", time: "1h ago" },
  { icon: "↩", color: "#F59E0B", bg: "#FFFBEB", text: "firewall_policy.pdf rejected — AI confidence score too low (34)", cycle: "SWIFT CSCF",  cycleTag: "SWIFT", time: "3h ago" },
  { icon: "▶", color: "#6366F1", bg: "#EEF2FF", text: "ISO 27001 cycle moved to Approval — sign-off required",           cycle: "ISO 27001",   cycleTag: "ISO",   time: "Yesterday" },
  { icon: "↑", color: "#3B82F6", bg: "#EFF6FF", text: "14 controls marked compliant in SOC 2 Review phase",              cycle: "SOC 2",       cycleTag: "SOC2",  time: "2 days ago" },
  { icon: "⚑", color: "#EF4444", bg: "#FEF2F2", text: "4 controls overdue in SWIFT CSCF — deadline was Mar 20",          cycle: "SWIFT CSCF",  cycleTag: "SWIFT", time: "3 days ago" },
];

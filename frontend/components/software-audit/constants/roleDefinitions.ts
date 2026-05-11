import type { RoleVisualKey } from "./roleVisuals";

export const ROLE_DEFINITIONS = [
  { role: "Admin", repoAccess: "Full", prApproval: true, infraAccess: "Full", prodAccess: true, dbAccess: true, mfaRequired: true },
  { role: "Architect", repoAccess: "Read", prApproval: true, infraAccess: "Read", prodAccess: false, dbAccess: false, mfaRequired: true },
  { role: "Senior Engineer", repoAccess: "Write", prApproval: true, infraAccess: "Limited", prodAccess: false, dbAccess: false, mfaRequired: false },
  { role: "Junior Engineer", repoAccess: "Write", prApproval: false, infraAccess: "None", prodAccess: false, dbAccess: false, mfaRequired: false },
  { role: "Infra Engineer", repoAccess: "None", prApproval: false, infraAccess: "Full", prodAccess: true, dbAccess: false, mfaRequired: true },
  { role: "QA/Reviewer", repoAccess: "Read", prApproval: true, infraAccess: "None", prodAccess: false, dbAccess: false, mfaRequired: false },
  { role: "External User", repoAccess: "Read", prApproval: false, infraAccess: "None", prodAccess: false, dbAccess: false, mfaRequired: true },
];

export const ROLE_ORDER: RoleVisualKey[] = [
  "Admin",
  "Architect",
  "Senior Engineer",
  "Junior Engineer",
  "Infra Engineer",
  "QA/Reviewer",
  "External User",
];

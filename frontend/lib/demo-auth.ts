import type { UserRole } from "@/lib/types";

export type DemoRole = Extract<
  UserRole,
  | "compliance_officer"
  | "it_sme"
  | "internal_reviewer_l1"
  | "internal_reviewer_l2"
  | "external_assessor"
>;

export type DemoRoleStep = {
  role: DemoRole;
  step: number;
};

/** Public demo flow metadata. Credentials are deliberately absent. */
export const DEMO_ROLE_STEPS: readonly DemoRoleStep[] = [
  { role: "compliance_officer", step: 1 },
  { role: "it_sme", step: 2 },
  { role: "internal_reviewer_l1", step: 3 },
  { role: "internal_reviewer_l2", step: 4 },
  { role: "external_assessor", step: 5 },
];

const DEMO_ROLES = new Set<DemoRole>(DEMO_ROLE_STEPS.map(({ role }) => role));

export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === "string" && DEMO_ROLES.has(value as DemoRole);
}

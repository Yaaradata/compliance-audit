import type { UserRole } from "@/lib/types";
import type { QuickAction, RoleHighlights } from "./types";

export function quickActionsForRole(
  role: UserRole | string | null | undefined,
  activeCycleId: string | null
): QuickAction[] {
  const base = activeCycleId ? `/cycles/${activeCycleId}` : null;
  const actions: QuickAction[] = [
    { href: "/assessments/new", label: "Assessment cycles", description: "Create, open, or switch SWIFT CSCF assessments" },
  ];

  if (role === "compliance_officer" || role === "tenant_admin") {
    actions.push({ href: "/users-groups", label: "Users & groups", description: "Manage participants and assignments" });
  }
  if (role === "it_sme") {
    actions.push({ href: "/aws", label: "AWS evidence", description: "Connect workloads and upload cloud evidence" });
  }
  if (base && (role === "internal_reviewer_l1" || role === "internal_reviewer_l2")) {
    actions.push({ href: `${base}/review`, label: "Review queue", description: "Completeness and quality reviews" });
  }
  if (base && role === "compliance_officer") {
    actions.push(
      { href: `${base}/review`, label: "Review queue", description: "Monitor L1/L2 progress" },
      { href: `${base}/approval`, label: "Approval", description: "Track sign-off status" },
      { href: `${base}/report`, label: "Report", description: "Reporting and exports" }
    );
  }
  if (base && role === "external_assessor") {
    actions.push({ href: `${base}/review`, label: "Review queue", description: "Final assessment and sign-off" });
  }
  if (base && role === "tenant_admin") {
    actions.push({ href: `${base}/report`, label: "Report", description: "Cycle reporting" });
  }
  if (base && role === "it_sme") {
    actions.unshift({ href: `${base}/dashboard`, label: "Collection workspace", description: "Domains, controls, and evidence intake" });
  }

  let primaryHref = "/assessments/new";
  if (base && role === "it_sme") primaryHref = `${base}/dashboard`;
  else if (base && (role === "internal_reviewer_l1" || role === "internal_reviewer_l2" || role === "external_assessor")) {
    primaryHref = `${base}/review`;
  }

  return actions.map((a) => ({ ...a, primary: a.href === primaryHref }));
}

export function roleHighlights(role: UserRole | string | null | undefined): RoleHighlights {
  switch (role) {
    case "compliance_officer":
      return {
        title: "Your compliance cockpit",
        bullets: [
          "Spin up cycles, define architecture, and steer collection.",
          "Watch phase health across setup → collection → review → approval.",
          "Jump into domains once a cycle is open from the sidebar.",
        ],
      };
    case "tenant_admin":
      return {
        title: "Tenant overview",
        bullets: [
          "Govern users and groups alongside assessment activity.",
          "Open a cycle to unlock domain navigation and reporting.",
        ],
      };
    case "it_sme":
      return {
        title: "Evidence & intake",
        bullets: [
          "Pick a cycle, then work controls from the collection dashboard.",
          "Use AWS shortcuts when your scope includes cloud evidence.",
        ],
      };
    case "internal_reviewer_l1":
    case "internal_reviewer_l2":
      return {
        title: "Review focus",
        bullets: [
          "Your queue is cycle-scoped — open a cycle to load pending items.",
          "Prioritize items in review and approval phases.",
        ],
      };
    case "external_assessor":
      return {
        title: "Approver lens",
        bullets: [
          "Final sign-off happens from the review queue for your cycle.",
          "Use assessment cycles to switch context when you support multiple audits.",
        ],
      };
    default:
      return {
        title: "Welcome",
        bullets: [
          "Choose or create an assessment cycle to get assigned work.",
          "Contact your Compliance Officer if you need a role on a cycle.",
        ],
      };
  }
}

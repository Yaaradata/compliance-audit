export const CHANGE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "process", label: "Process & SDLC" },
  { id: "findings", label: "Findings" },
];

export const CONTROL_CARDS = [
  {
    id: "approval",
    label: "Change Approval / CAB",
    iconKey: "approval",
    desc: "Every change must pass CAB. Emergency changes need post-hoc approval within policy window.",
  },
  {
    id: "sod",
    label: "Dev-to-Production Segregation",
    iconKey: "sod",
    desc: "Developer and production deployer must be different identities.",
  },
  {
    id: "testing",
    label: "Pre-deployment Testing Gates",
    iconKey: "testing",
    desc: "Unit, integration, UAT and security scan are required before deployment.",
  },
  {
    id: "freeze",
    label: "Change Freeze Adherence",
    iconKey: "freeze",
    desc: "Changes deployed in freeze must have approved exception.",
  },
  {
    id: "rollback",
    label: "Rollback Capability",
    iconKey: "rollback",
    desc: "Rollback plans must exist and be validated in pre-prod.",
  },
];

export const CHANGE_TYPE_META: Record<
  string,
  { short: string; definition: string; dot: string }
> = {
  "Normal Change": {
    short: "Planned, non-urgent production change following the full standard workflow.",
    definition:
      "Planned, non-urgent production change following the full standard workflow: ticket -> CAB approval -> testing -> deployment.",
    dot: "bg-emerald-500",
  },
  "Emergency Change": {
    short: "Urgent change to fix/contain a live production issue with post-hoc governance checks.",
    definition:
      "Urgent change made to quickly fix/contain a production issue; usually allows faster execution with post-hoc governance checks.",
    dot: "bg-cyan-500",
  },
  "Standard Change": {
    short: "Pre-approved, low-risk, repeatable change with known procedure.",
    definition:
      "Pre-approved, low-risk, repeatable change with known procedure (still tracked, but generally simpler control path).",
    dot: "bg-amber-500",
  },
  "Major Change": {
    short: "High-impact or technically complex change with broader risk.",
    definition:
      "High-impact or complex change with broader business/technical risk; requires stricter scrutiny and governance.",
    dot: "bg-red-500",
  },
  UNLOGGED: {
    short: "Evidence exists but no linked Jira ticket was found for the key.",
    definition:
      "Change evidence exists (for example deployment/session logs) but no linked Jira change ticket was found; treated as an untracked change.",
    dot: "bg-indigo-500",
  },
};

export const CHANGE_TYPE_ORDER = [
  "Normal Change",
  "Emergency Change",
  "Standard Change",
  "Major Change",
  "UNLOGGED",
];

export const SDLC_STAGES = [
  { k: "alert", l: "Alert", fn: (c: any) => c.alrt, ref: (c: any) => c.alrt?.id, req: (c: any) => c.emergency },
  { k: "incident", l: "Incident", fn: (c: any) => c.inc, ref: (c: any) => c.inc?.number, req: (c: any) => c.emergency },
  { k: "ticket", l: "Ticket", fn: (c: any) => !c.noTicket, ref: (c: any) => c.key, req: () => true },
  {
    k: "snChange",
    l: "SN Change",
    fn: (c: any) => c.snC,
    ref: (c: any) => c.snC?.number,
    req: (c: any) => c.emergency || c.risk === "Critical",
  },
  { k: "pr", l: "PR", fn: (c: any) => c.pr, ref: (c: any) => (c.pr ? `#${c.pr.number}` : null), req: (c: any) => !c.noTicket },
  { k: "pipeline", l: "Pipeline", fn: (c: any) => c.run, ref: (c: any) => (c.run ? "✓" : null), req: (c: any) => !c.noTicket },
  { k: "deploy", l: "Deploy", fn: (c: any) => c.dep, ref: (c: any) => c.dep?.environment, req: () => true },
];

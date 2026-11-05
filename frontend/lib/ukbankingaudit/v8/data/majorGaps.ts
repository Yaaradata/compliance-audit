/** Remediation tracker for obligations that are thinly covered or uncovered in the RCSA. */
export type MajorGapStatus = "Not started" | "In progress";

export type MajorGapPlan = {
  obligationId: string;
  action: string;
  targetDate: string;
  status: MajorGapStatus;
};

export const MAJOR_GAP_PLANS: MajorGapPlan[] = [
  {
    obligationId: "OBL-DISP-003",
    action: "Map complaints root cause review and 8-week closure controls to DISP 1.6",
    targetDate: "2026-12-31",
    status: "In progress",
  },
  {
    obligationId: "OBL-CD-001",
    action: "Map Consumer Duty outcomes monitoring and fair value controls to PRIN 12",
    targetDate: "2026-12-31",
    status: "Not started",
  },
  {
    obligationId: "OBL-SS1-23-001",
    action: "Map credit model validation controls to SS1/23",
    targetDate: "2027-01-29",
    status: "In progress",
  },
  {
    obligationId: "OBL-MLR-009",
    action: "Add PEP screening at onboarding as a second control for Reg 35",
    targetDate: "2027-01-29",
    status: "In progress",
  },
  {
    obligationId: "OBL-JMLSG-003",
    action: "Add independent QA over SAR decisions to strengthen POCA s.330 coverage",
    targetDate: "2027-02-26",
    status: "Not started",
  },
  {
    obligationId: "OBL-OFSI-001",
    action: "Add sanctions list update timeliness as a second control for SAMLA and ECTEA",
    targetDate: "2026-12-18",
    status: "In progress",
  },
  {
    obligationId: "OBL-PSR-APP-001",
    action: "Add authorised push payment fraud interdiction as a second control for PS23/3",
    targetDate: "2027-01-29",
    status: "Not started",
  },
  {
    obligationId: "OBL-OR-DISC",
    action: "Add material outsourcing oversight as a second control for SS2/21",
    targetDate: "2027-02-26",
    status: "In progress",
  },
];

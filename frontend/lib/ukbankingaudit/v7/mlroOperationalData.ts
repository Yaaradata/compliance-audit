/**
 * v7 MLRO Operational Dashboard — appetite, tier splits, and source metadata
 * that must not live in shared mockDataV2 (used by v2–v6). Overlay via mockDataV7.ts.
 *
 * EDD past-due appetite mirrors KRI-FC-017 bands in mockDataV2:
 *   green [0, 5] · amber [5, 15] · red [15, …]
 * Anchored to the SOP already cited on eddPipelineItems:
 *   "Past-due target: 10 BD per the firm's MLR Reg 28 / Reg 35 SOP".
 *
 * Alert L1/L2/L3 tiers split each amlAlertsByWeek row so tier backlogs sum to
 * openBacklog and tier SLA breaches sum to slaBreaches — v7 must not contradict v6.
 */

export type EddPastDueAppetite = {
  /** Maximum past-due cases still within appetite (KRI green upper bound). */
  appetite: number;
  /** At or above this count the band is red (KRI red lower bound). */
  redThreshold: number;
  /** Named system of record — same grammar as ExposureCount.sourceLabel. */
  sourceLabel: string;
  /** Business-day completion target from the Reg 28 / Reg 35 SOP. */
  completionTargetBusinessDays: number;
  sopReference: string;
};

export const EDD_PAST_DUE_APPETITE: EddPastDueAppetite = {
  appetite: 5,
  redThreshold: 15,
  sourceLabel: "KYC System · EDD case register",
  completionTargetBusinessDays: 10,
  sopReference: "MLR Reg 28 / Reg 35 SOP · 10 BD past-due target",
};

export type EddPastDueBand = "green" | "amber" | "red";

/** pastDue vs appetite: within → green; at/approaching → amber; beyond → red. */
export function eddPastDueBand(pastDue: number, cfg: EddPastDueAppetite = EDD_PAST_DUE_APPETITE): EddPastDueBand {
  if (pastDue < cfg.appetite) return "green";
  if (pastDue < cfg.redThreshold) return "amber";
  return "red";
}

// ─── Alert backlog L1 / L2 / L3 ───────────────────────────────────────────────

export type AlertTierId = "L1" | "L2" | "L3";

export type AlertTierAppetite = {
  id: AlertTierId;
  label: string;
  /** Max backlog still within appetite. */
  appetite: number;
  /** At or above → red. */
  redThreshold: number;
  slaLabel: string;
  sourceLabel: string;
};

/**
 * Three teams, three SLAs. Absolute backlog appetites (not %): L2 is the
 * investigation bottleneck as demand rises against fixed capacity.
 */
export const ALERT_TIER_APPETITES: AlertTierAppetite[] = [
  {
    id: "L1",
    label: "L1 triage",
    appetite: 120,
    redThreshold: 350,
    slaLabel: "same-day triage",
    sourceLabel: "Transaction Monitoring · L1 triage queue",
  },
  {
    id: "L2",
    label: "L2 investigation",
    appetite: 280,
    redThreshold: 750,
    slaLabel: "5 BD investigation",
    sourceLabel: "Transaction Monitoring · L2 investigation queue",
  },
  {
    id: "L3",
    label: "L3 complex / escalated",
    appetite: 40,
    redThreshold: 120,
    slaLabel: "15 BD complex case",
    sourceLabel: "Transaction Monitoring · L3 escalations",
  },
];

export type AlertTierSnapshot = {
  id: AlertTierId;
  backlog: number;
  slaBreaches: number;
  appetite: number;
  redThreshold: number;
  band: EddPastDueBand;
  label: string;
  slaLabel: string;
  sourceLabel: string;
};

export type AmlAlertWeekTiered = {
  weekIndex: number;
  weekLabel: string;
  generated: number;
  dispositioned: number;
  slaBreaches: number;
  openBacklog: number;
  band: string;
  tiers: AlertTierSnapshot[];
  /** Worst tier band — drives the widget. */
  worstBand: EddPastDueBand;
};

type AmlAlertWeekRow = {
  weekIndex: number;
  weekLabel: string;
  generated: number;
  dispositioned: number;
  slaBreaches: number;
  openBacklog: number;
  band: string;
};

const BAND_RANK: Record<EddPastDueBand, number> = { green: 0, amber: 1, red: 2 };

function tierBand(backlog: number, appetite: number, redThreshold: number): EddPastDueBand {
  if (backlog < appetite) return "green";
  if (backlog < redThreshold) return "amber";
  return "red";
}

function worstBand(bands: EddPastDueBand[]): EddPastDueBand {
  return bands.reduce<EddPastDueBand>((w, b) => (BAND_RANK[b] > BAND_RANK[w] ? b : w), "green");
}

/**
 * Split an integer total into three parts with the given weights.
 * Remainder goes to the heaviest weight (L2) so the story stays consistent.
 */
function splitInteger(total: number, weights: [number, number, number]): [number, number, number] {
  if (total <= 0) return [0, 0, 0];
  const sumW = weights[0] + weights[1] + weights[2];
  const raw = weights.map((w) => (total * w) / sumW);
  const floors = raw.map((v) => Math.floor(v)) as [number, number, number];
  let remainder = total - (floors[0] + floors[1] + floors[2]);
  // Prefer L2 (index 1), then L1, then L3 for leftover units.
  const order: [number, number, number] = [1, 0, 2];
  let i = 0;
  while (remainder > 0) {
    floors[order[i % 3]] += 1;
    remainder -= 1;
    i += 1;
  }
  return floors;
}

/**
 * Capacity fixed / demand rising → weight backlog into L2 as the series progresses.
 * Oldest week (index 0 in chronological array): L1-heavier.
 * Current week: L2 ~70%, L1 ~18%, L3 ~12%.
 */
function tierWeights(progress01: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, progress01));
  const l2 = 0.35 + 0.35 * t;
  const l3 = 0.1 + 0.05 * t;
  const l1 = 1 - l2 - l3;
  return [l1, l2, l3];
}

/** Build v7 tier overlay from shared amlAlertsByWeek rows (does not mutate mockDataV2). */
export function buildAmlAlertTiersByWeek(weeks: AmlAlertWeekRow[]): AmlAlertWeekTiered[] {
  if (!weeks.length) return [];
  const n = weeks.length;
  return weeks.map((w, i) => {
    const progress = n === 1 ? 1 : i / (n - 1);
    const weights = tierWeights(progress);
    const [l1Backlog, l2Backlog, l3Backlog] = splitInteger(w.openBacklog, weights);
    const [l1Sla, l2Sla, l3Sla] = splitInteger(w.slaBreaches, weights);
    const backlogs = [l1Backlog, l2Backlog, l3Backlog];
    const slas = [l1Sla, l2Sla, l3Sla];
    const tiers: AlertTierSnapshot[] = ALERT_TIER_APPETITES.map((cfg, ti) => {
      const backlog = backlogs[ti];
      const band = tierBand(backlog, cfg.appetite, cfg.redThreshold);
      return {
        id: cfg.id,
        backlog,
        slaBreaches: slas[ti],
        appetite: cfg.appetite,
        redThreshold: cfg.redThreshold,
        band,
        label: cfg.label,
        slaLabel: cfg.slaLabel,
        sourceLabel: cfg.sourceLabel,
      };
    });
    return {
      ...w,
      tiers,
      worstBand: worstBand(tiers.map((t) => t.band)),
    };
  });
}

export const ALERT_BACKLOG_SOURCE_LABEL = "Transaction Monitoring · alert case register";

/** Card-face sources for the six Operational Dashboard widgets (Saurabh sheet). */
export const OPERATIONAL_WIDGET_SOURCES = {
  alertBacklog: ALERT_BACKLOG_SOURCE_LABEL,
  sarTimeliness: "NCA SAR Online · SAR filing register",
  eddPipeline: "KYC System · EDD case register",
  sanctions: "Sanctions team",
  fraud: "Fraud Operations / Finance (source to confirm)",
  fcTraining: "Learning management system · financial crime programme",
} as const;

/** MLRO tabs — two only (Operational Dashboard / Client Risk View). Fraud is a widget, not a tab. */
export const MLRO_DASHBOARD_LENSES = [
  { id: "assurance", label: "Operational Dashboard" },
  { id: "exposure", label: "Client Risk View" },
] as const;

// ─── Systems & data health (TM / txn screening / name screening) ─────────────
// Shared shape for all three. Transaction screening ≠ name screening — keep separate.
// Sources carry Saurabh's "?" forward: "(source to confirm)".

export type SystemOutage = {
  start: string;
  end: string;
  durationMinutes: number;
  alertsOrItemsMissed: number;
  backfilled: boolean;
  loggedBy: string;
  escalationRef: string;
};

export type SystemDataQualityIssue = {
  id: string;
  description: string;
  detectedDate: string;
  status: "open" | "mitigated" | "closed";
  impact: string;
};

export type SystemHealthWindow = {
  /** Inclusive window label as Saurabh specified. */
  id: "last_month" | "last_3_months";
  label: string;
  from: string;
  to: string;
};

export type SystemHealth = {
  systemId: string;
  systemName: string;
  sourceLabel: string;
  pathToGreenRef: string;
  windows: SystemHealthWindow[];
  outages: SystemOutage[];
  dataQualityIssues: SystemDataQualityIssue[];
};

/** As-of for window filters — aligns with board pack demo date. */
export const SYSTEM_HEALTH_AS_OF = "2026-07-10";

export const SYSTEM_HEALTH_WINDOWS: SystemHealthWindow[] = [
  {
    id: "last_month",
    label: "Last month",
    from: "2026-06-10",
    to: SYSTEM_HEALTH_AS_OF,
  },
  {
    id: "last_3_months",
    label: "Last 3 months",
    from: "2026-04-10",
    to: SYSTEM_HEALTH_AS_OF,
  },
];

function outageInWindow(o: SystemOutage, w: SystemHealthWindow): boolean {
  // Outage overlaps window if it started on/before window.to and ended on/after window.from.
  return o.start <= w.to && o.end >= w.from;
}

export function outagesForWindow(health: SystemHealth, windowId: SystemHealthWindow["id"]): SystemOutage[] {
  const w = health.windows.find((x) => x.id === windowId);
  if (!w) return [];
  return health.outages.filter((o) => outageInWindow(o, w));
}

export function dataQualityForWindow(
  health: SystemHealth,
  windowId: SystemHealthWindow["id"],
): SystemDataQualityIssue[] {
  const w = health.windows.find((x) => x.id === windowId);
  if (!w) return [];
  return health.dataQualityIssues.filter((dq) => dq.detectedDate >= w.from && dq.detectedDate <= w.to);
}

/**
 * Band: unbackfilled outage → red (coverage gap with a date).
 * Open DQ or only-backfilled outages → amber. Clean → green.
 */
export function systemHealthBand(health: SystemHealth, windowId: SystemHealthWindow["id"] = "last_3_months"): EddPastDueBand {
  const outages = outagesForWindow(health, windowId);
  const dq = dataQualityForWindow(health, windowId);
  if (outages.some((o) => !o.backfilled)) return "red";
  if (outages.length > 0 || dq.some((d) => d.status === "open")) return "amber";
  return "green";
}

export function systemHealthWorstBand(health: SystemHealth): EddPastDueBand {
  return worstBand([systemHealthBand(health, "last_month"), systemHealthBand(health, "last_3_months")]);
}

/** TM engine — Widget 2. Source uncertainty printed, not resolved. */
export const TM_SYSTEM_HEALTH: SystemHealth = {
  systemId: "tm-engine",
  systemName: "Transaction Monitoring system",
  sourceLabel: "TM tech team / escalations register (source to confirm)",
  pathToGreenRef: "tm-system-health",
  windows: SYSTEM_HEALTH_WINDOWS,
  outages: [
    {
      start: "2026-06-22T08:10:00Z",
      end: "2026-06-22T14:25:00Z",
      durationMinutes: 375,
      alertsOrItemsMissed: 1840,
      backfilled: false,
      loggedBy: "TM Platform Ops",
      escalationRef: "ESC-TM-2026-0611",
    },
    {
      start: "2026-05-03T02:00:00Z",
      end: "2026-05-03T03:40:00Z",
      durationMinutes: 100,
      alertsOrItemsMissed: 410,
      backfilled: true,
      loggedBy: "TM Platform Ops",
      escalationRef: "ESC-TM-2026-0488",
    },
  ],
  dataQualityIssues: [
    {
      id: "TM-DQ-2026-014",
      description: "Scenario parameter drift on cross-border cash structuring rules after May release.",
      detectedDate: "2026-06-18",
      status: "open",
      impact: "Elevated false-negative risk on structuring typology until re-tuned.",
    },
    {
      id: "TM-DQ-2026-009",
      description: "Incomplete customer risk-tier feed for 0.4% of retail book overnight batch.",
      detectedDate: "2026-05-12",
      status: "closed",
      impact: "Temporary under-scoring; reprocessed same day.",
    },
  ],
};

/** Payment / transaction sanctions screening — Widget 4. Separate from name screening. */
export const TXN_SCREENING_SYSTEM_HEALTH: SystemHealth = {
  systemId: "txn-screening",
  systemName: "Transaction screening system",
  sourceLabel: "Sanctions team, IT team (source to confirm)",
  pathToGreenRef: "txn-screening-system-health",
  windows: SYSTEM_HEALTH_WINDOWS,
  outages: [
    {
      start: "2026-06-28T11:00:00Z",
      end: "2026-06-28T12:15:00Z",
      durationMinutes: 75,
      alertsOrItemsMissed: 22600,
      backfilled: true,
      loggedBy: "Payments Filtering Ops",
      escalationRef: "ESC-SCF-2026-0221",
    },
    {
      start: "2026-04-19T16:40:00Z",
      end: "2026-04-19T18:05:00Z",
      durationMinutes: 85,
      alertsOrItemsMissed: 18400,
      backfilled: true,
      loggedBy: "Payments Filtering Ops",
      escalationRef: "ESC-SCF-2026-0174",
    },
  ],
  dataQualityIssues: [
    {
      id: "TXN-DQ-2026-007",
      description: "BIC/IBAN normalisation gap dropped secondary-field matches on SEPA instant rails.",
      detectedDate: "2026-06-30",
      status: "open",
      impact: "Partial match coverage on instant payments until patch.",
    },
  ],
};

/** Customer / counterparty name screening — Widget 4. Separate from transaction screening. */
export const NAME_SCREENING_SYSTEM_HEALTH: SystemHealth = {
  systemId: "name-screening",
  systemName: "Name screening system",
  sourceLabel: "Sanctions team, IT team (source to confirm)",
  pathToGreenRef: "name-screening-system-health",
  windows: SYSTEM_HEALTH_WINDOWS,
  outages: [
    {
      start: "2026-07-02T09:30:00Z",
      end: "2026-07-02T11:00:00Z",
      durationMinutes: 90,
      alertsOrItemsMissed: 312,
      backfilled: false,
      loggedBy: "Sanctions Screening Ops",
      escalationRef: "ESC-NSC-2026-0092",
    },
    {
      start: "2026-05-21T21:00:00Z",
      end: "2026-05-21T21:45:00Z",
      durationMinutes: 45,
      alertsOrItemsMissed: 88,
      backfilled: true,
      loggedBy: "Sanctions Screening Ops",
      escalationRef: "ESC-NSC-2026-0061",
    },
  ],
  dataQualityIssues: [
    {
      id: "NAME-DQ-2026-004",
      description: "Transliteration dictionary lag for Cyrillic PEPs after OFSI list refresh.",
      detectedDate: "2026-06-12",
      status: "mitigated",
      impact: "Elevated FP rate; fuzzy thresholds temporarily tightened.",
    },
    {
      id: "NAME-DQ-2026-011",
      description: "Onboarding batch skipped adverse-media overlay for 47 high-risk corporates.",
      detectedDate: "2026-07-05",
      status: "open",
      impact: "Name screen completed without adverse-media layer for that cohort.",
    },
  ],
};

export const SYSTEM_HEALTH_BY_ID: Record<string, SystemHealth> = {
  [TM_SYSTEM_HEALTH.systemId]: TM_SYSTEM_HEALTH,
  [TXN_SCREENING_SYSTEM_HEALTH.systemId]: TXN_SCREENING_SYSTEM_HEALTH,
  [NAME_SCREENING_SYSTEM_HEALTH.systemId]: NAME_SCREENING_SYSTEM_HEALTH,
};

// ─── Sanctions posture (v7 overlay — do not edit mockDataV2) ─────────────────

const SOURCE_SANCTIONS_TEAM = "Sanctions team";
const SOURCE_HOLD_TIME =
  "Txn filtering system, Sanctions team, Txn filtering operations team";

export type SanctionsOfsiReport = {
  id: string;
  /** Calendar days late; 0 = on time. */
  daysLate: number;
  dueDate: string;
  submittedDate: string | null;
};

export type SanctionsOfsiReporting = {
  dueThisPeriod: number;
  submitted: number;
  /** Breach count — appetite is zero; any late report is a breach. */
  breachCount: number;
  appetite: 0;
  reports: SanctionsOfsiReport[];
  lastSubmitted: string;
  sourceLabel: string;
};

export type SanctionsOfacUsReporting = {
  /** Explicit US Treasury obligation — not a stand-in for UK OFSI. */
  jurisdictionLabel: "US · OFAC";
  dueThisPeriod: number;
  submitted: number;
  breachCount: number;
  appetite: 0;
  lastSubmitted: string;
  sourceLabel: string;
};

export type SanctionsListUpdate = {
  id: string;
  listName: string;
  regulator: string;
  publishedAt: string;
  ingestedAt: string;
  lagHours: number;
  appetiteHours: number;
  redThresholdHours: number;
  band: EddPastDueBand;
  sourceLabel: string;
};

export type SanctionsHoldTime = {
  averageHoldHours: number;
  appetiteHours: number;
  redThresholdHours: number;
  band: EddPastDueBand;
  sourceLabel: string;
  /** Dual audience: sanctions ops + Consumer Duty. */
  audiences: readonly ["Sanctions", "Consumer Duty"];
};

type SanctionsBase = {
  asOfDate?: string;
  payments?: Record<string, unknown>;
  customers?: Record<string, unknown>;
  reportingStatus?: Record<string, unknown>;
  postureBand?: string;
  postureNarrative?: string;
};

function hoursBand(value: number, appetite: number, redThreshold: number): EddPastDueBand {
  if (value < appetite) return "green";
  if (value < redThreshold) return "amber";
  return "red";
}

function breachBand(breachCount: number): EddPastDueBand {
  // Appetite is zero — any breach is beyond appetite.
  return breachCount > 0 ? "red" : "green";
}

/** OFSI freeze reporting — breach metric (count + days late), appetite zero. */
export const OFSI_FREEZE_REPORTS_V7: SanctionsOfsiReporting = {
  dueThisPeriod: 2,
  submitted: 2,
  breachCount: 1,
  appetite: 0,
  reports: [
    {
      id: "OFSI-FRZ-2026-041",
      daysLate: 0,
      dueDate: "2026-04-15",
      submittedDate: "2026-04-14",
    },
    {
      id: "OFSI-FRZ-2026-052",
      daysLate: 2,
      dueDate: "2026-04-20",
      submittedDate: "2026-04-22",
    },
  ],
  lastSubmitted: "2026-04-22",
  sourceLabel: SOURCE_SANCTIONS_TEAM,
};

/** OFSI block reports — UK regime (replaces OFAC standing in for the UK obligation). */
export const OFSI_BLOCK_REPORTS_V7: SanctionsOfsiReporting = {
  dueThisPeriod: 1,
  submitted: 1,
  breachCount: 0,
  appetite: 0,
  reports: [
    {
      id: "OFSI-BLK-2026-018",
      daysLate: 0,
      dueDate: "2026-04-18",
      submittedDate: "2026-04-17",
    },
  ],
  lastSubmitted: "2026-04-17",
  sourceLabel: SOURCE_SANCTIONS_TEAM,
};

/** Separate US OFAC line — firm has US correspondent exposure; not the UK obligation. */
export const OFAC_US_BLOCKING_REPORTS_V7: SanctionsOfacUsReporting = {
  jurisdictionLabel: "US · OFAC",
  dueThisPeriod: 0,
  submitted: 0,
  breachCount: 0,
  appetite: 0,
  lastSubmitted: "—",
  sourceLabel: SOURCE_SANCTIONS_TEAM,
};

/** Gap between regulator publication and bank list ingestion (hours). */
export const SANCTIONS_LIST_UPDATES_V7: SanctionsListUpdate[] = [
  {
    id: "lst-ofsi-consolidated",
    listName: "OFSI Consolidated List",
    regulator: "OFSI",
    publishedAt: "2026-04-28T09:00:00Z",
    ingestedAt: "2026-04-28T14:20:00Z",
    lagHours: 5.3,
    appetiteHours: 6,
    redThresholdHours: 24,
    band: "green",
    sourceLabel: SOURCE_SANCTIONS_TEAM,
  },
  {
    id: "lst-un-consolidated",
    listName: "UN Security Council Consolidated List",
    regulator: "UN",
    publishedAt: "2026-04-26T12:00:00Z",
    ingestedAt: "2026-04-27T06:30:00Z",
    lagHours: 18.5,
    appetiteHours: 12,
    redThresholdHours: 48,
    band: "amber",
    sourceLabel: SOURCE_SANCTIONS_TEAM,
  },
  {
    id: "lst-eu-consolidated",
    listName: "EU Consolidated Financial Sanctions List",
    regulator: "EU",
    publishedAt: "2026-04-25T08:00:00Z",
    ingestedAt: "2026-04-25T11:45:00Z",
    lagHours: 3.8,
    appetiteHours: 12,
    redThresholdHours: 48,
    band: "green",
    sourceLabel: SOURCE_SANCTIONS_TEAM,
  },
];

/**
 * Payments hold time — promoted from a buried sub-line.
 * Base averageHoldHours (2.1) preserved; appetite stated for Sanctions + Consumer Duty.
 */
export function buildSanctionsHoldTime(averageHoldHours: number): SanctionsHoldTime {
  const appetiteHours = 2;
  const redThresholdHours = 8;
  return {
    averageHoldHours,
    appetiteHours,
    redThresholdHours,
    band: hoursBand(averageHoldHours, appetiteHours, redThresholdHours),
    sourceLabel: SOURCE_HOLD_TIME,
    audiences: ["Sanctions", "Consumer Duty"] as const,
  };
}

/** Merge shared sanctionsScreeningMetrics with v7 OFSI / lag / hold overlays. */
export function buildSanctionsScreeningMetricsV7(base: SanctionsBase) {
  const payments = (base.payments || {}) as Record<string, number>;
  const averageHoldHours = typeof payments.averageHoldHours === "number" ? payments.averageHoldHours : 2.1;
  const holdTime = buildSanctionsHoldTime(averageHoldHours);

  // Ensure list-update bands stay consistent with stated appetites.
  const listUpdates = SANCTIONS_LIST_UPDATES_V7.map((u) => ({
    ...u,
    band: hoursBand(u.lagHours, u.appetiteHours, u.redThresholdHours),
  }));

  const freezeBand = breachBand(OFSI_FREEZE_REPORTS_V7.breachCount);
  const blockBand = breachBand(OFSI_BLOCK_REPORTS_V7.breachCount);
  const ofacBand = breachBand(OFAC_US_BLOCKING_REPORTS_V7.breachCount);
  const listWorst = worstBand(listUpdates.map((u) => u.band));
  const postureBand = worstBand([freezeBand, blockBand, ofacBand, listWorst, holdTime.band]);

  const breachBits: string[] = [];
  if (OFSI_FREEZE_REPORTS_V7.breachCount > 0) {
    breachBits.push(
      `${OFSI_FREEZE_REPORTS_V7.breachCount} OFSI freeze-report breach(es) (appetite 0)`,
    );
  }
  if (listWorst !== "green") {
    breachBits.push("list-update lag outside appetite on at least one list");
  }
  if (holdTime.band !== "green") {
    breachBits.push(`payments hold ${holdTime.averageHoldHours}h vs appetite ${holdTime.appetiteHours}h`);
  }

  return {
    ...base,
    payments: {
      ...payments,
      holdTime,
    },
    customers: base.customers || {},
    reportingStatus: {
      ofsiFreezeReports: OFSI_FREEZE_REPORTS_V7,
      ofsiBlockReports: OFSI_BLOCK_REPORTS_V7,
      ofacUsBlockingReports: OFAC_US_BLOCKING_REPORTS_V7,
      nonComplianceWaivers:
        (base.reportingStatus as { nonComplianceWaivers?: unknown } | undefined)?.nonComplianceWaivers ?? {
          open: 0,
          lastClosed: "2026-02-10",
        },
    },
    listUpdates,
    postureBand,
    postureNarrative:
      postureBand === "green"
        ? "Screening at full coverage; OFSI freeze and block reports within appetite; list-update lag and payments hold within threshold."
        : `UK OFSI reporting and screening posture under pressure: ${breachBits.join("; ")}. US OFAC line tracked separately where the firm has US exposure.`,
  };
}

// ─── Financial crime training (v7 overlay) ───────────────────────────────────
// Firm-wide % is NOT invented — it is the figure already asserted in the MLRO
// Annual Report narrative (mockDataV3 AP-MLRO-2025 Pack §5.1): 98.4%.
// Overdue counts are new LMS fields; high-risk split is grounded in GSR-ABC-03-01
// (advanced training for high-risk roles, benchmark 80%).

export type FcTrainingPosture = {
  /** From AP-MLRO-2025 narrative — do not invent a different firm-wide %. */
  trainedPct: 98.4;
  programmeTargetPct: number;
  programmeTargetConfigurable: true;
  populationInScope: number;
  trainedCount: number;
  overdueCount: number;
  overduePct: number;
  /** Firm-set overdue appetite (% of population) — low by design; labelled configurable. */
  overdueAppetitePct: number;
  overdueAppetiteConfigurable: true;
  overdueRedThresholdPct: number;
  highRisk: {
    population: number;
    overdueCount: number;
    overduePct: number;
    /** From GSR-ABC-03-01 — advanced training benchmark for high-risk roles. */
    advancedTrainingBenchmarkPct: 80;
    racmRef: "ABC.01.03.01";
  };
  otherRoles: {
    population: number;
    overdueCount: number;
    overduePct: number;
  };
  linkedControlObjectives: readonly string[];
  linkedGsrRefs: readonly string[];
  narrativeSource: string;
  sourceLabel: string;
  pathToGreenRef: string;
};

/**
 * Population chosen so 98.4% yields an integer headcount (12,500 × 0.984 = 12,300).
 * Overdue = complement of attestation for the same programme population (1.6%).
 */
export const FC_TRAINING_POSTURE: FcTrainingPosture = {
  trainedPct: 98.4,
  programmeTargetPct: 95,
  programmeTargetConfigurable: true,
  populationInScope: 12500,
  trainedCount: 12300,
  overdueCount: 200,
  overduePct: 1.6,
  overdueAppetitePct: 1.0,
  overdueAppetiteConfigurable: true,
  overdueRedThresholdPct: 3.0,
  highRisk: {
    population: 640,
    overdueCount: 48,
    overduePct: 7.5,
    advancedTrainingBenchmarkPct: 80,
    racmRef: "ABC.01.03.01",
  },
  otherRoles: {
    population: 11860,
    overdueCount: 152,
    overduePct: 1.28,
  },
  linkedControlObjectives: ["CO-AML-12", "CO-FRD-01", "CO-ABC-03", "CO-PTE-03"],
  linkedGsrRefs: ["AML.01.12.01", "FRD.01.01.01", "ABC.01.03.01", "PTE.01.03.01"],
  narrativeSource: "AP-MLRO-2025 · Pack §5.1 (mockDataV3 narrative)",
  sourceLabel: "Learning management system · financial crime programme",
  pathToGreenRef: "AML.01.12.01",
};

/** higher-is-worse overdue % vs configurable appetite. */
export function fcTrainingOverdueBand(
  overduePct: number,
  appetitePct: number = FC_TRAINING_POSTURE.overdueAppetitePct,
  redThresholdPct: number = FC_TRAINING_POSTURE.overdueRedThresholdPct,
): EddPastDueBand {
  if (overduePct < appetitePct) return "green";
  if (overduePct < redThresholdPct) return "amber";
  return "red";
}

/** Firm-wide trained % vs programme target (higher is better). */
export function fcTrainingCompletionBand(
  trainedPct: number,
  targetPct: number = FC_TRAINING_POSTURE.programmeTargetPct,
): EddPastDueBand {
  if (trainedPct >= targetPct) return "green";
  if (trainedPct >= targetPct - 5) return "amber";
  return "red";
}

export function fcTrainingWidgetBand(posture: FcTrainingPosture = FC_TRAINING_POSTURE): EddPastDueBand {
  return worstBand([
    fcTrainingCompletionBand(posture.trainedPct, posture.programmeTargetPct),
    fcTrainingOverdueBand(posture.overduePct, posture.overdueAppetitePct, posture.overdueRedThresholdPct),
    fcTrainingOverdueBand(posture.highRisk.overduePct, posture.overdueAppetitePct, posture.overdueRedThresholdPct),
  ]);
}

/**
 * UK Process Audit — v2 Journey Command Center data.
 *
 * Builds the exact `RccDomain` funnel/case contract consumed by the Indian
 * Process Audit v3 journey-command-center components, driven entirely by the UK
 * control library + SOP stages (`getUkProcessAuditData()`).
 *
 * Design (mirrors Indian v3):
 *   - A realistic, *narrowing* population funnel per domain.
 *   - A SHORT list of only the actionable cases (Critical / Exception) for
 *     drill-down; completed cases are counted, never enumerated.
 *   - Concise, one-line observations / exceptions so the intel panels read
 *     cleanly instead of flooding text.
 *
 * Everything is deterministic (seeded from domain + control ids) so re-renders
 * are stable and the numbers stay consistent across the dashboard.
 */
import type {
  RccCase,
  RccControlCheck,
  RccDomain,
  RccEvidenceItem,
  RccJourneyStepStatus,
  RccStage,
} from "@/lib/Indian_Process_Audit/riskCommandCenter/types";
import { getUkProcessAuditData } from "@/lib/UK_Process_Audit";
import type {
  UkAuditControl,
  UkDomainSop,
  UkProcessAuditDomainId,
} from "@/lib/UK_Process_Audit";
import { SEGMENTS_BY_DOMAIN } from "@/lib/UK_Process_Audit/journeyConfig";

// --- deterministic helpers -------------------------------------------------

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic ordering of the 8 domains — used to give each domain its own
 * offset window into the shared name/company pools so subjects and owners do
 * not repeat unnecessarily across domains.
 */
const DOMAIN_ORDER: UkProcessAuditDomainId[] = [
  "ONB",
  "DEP",
  "PAY",
  "LEN",
  "COL",
  "FC",
  "FRD",
  "CMP",
];

function domainOffset(id: UkProcessAuditDomainId): number {
  const i = DOMAIN_ORDER.indexOf(id);
  return (i < 0 ? 0 : i) * 5;
}

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/**
 * Realistic UK banking people (case owners + subjects). Large pool so each of
 * the 8 domains can draw from its own window (see `domainOffset`) and names do
 * not repeat unnecessarily across domains.
 */
const UK_PEOPLE = [
  "James Whitfield",
  "Priya Sharma",
  "Aisha Khan",
  "Oliver Bennett",
  "Sophie Clarke",
  "Mohammed Ali",
  "Emma Thompson",
  "Daniel O'Connor",
  "Grace Adeyemi",
  "Liam Murphy",
  "Chloe Roberts",
  "Harpreet Singh",
  "Rebecca Hughes",
  "Thomas Walsh",
  "Fatima Begum",
  "Nathan Cole",
  "Isabella Rossi",
  "George Fletcher",
  "Zara Ahmed",
  "Ethan Campbell",
  "Olivia Bennett",
  "Callum Fraser",
  "Amara Okafor",
  "Ruby Patel",
  "Joshua Reid",
  "Freya Lindqvist",
  "Samuel Owusu",
  "Lucy Harrington",
  "Aaron Goldberg",
  "Meera Iyer",
  "Connor Doyle",
  "Hannah Blackwood",
  "Yusuf Rahman",
  "Eleanor Vance",
  "Dominic Pryce",
  "Sana Mahmood",
  "Toby Sinclair",
  "Naomi Adeyemi",
  "Marcus Bell",
  "Iris Chambers",
];

const UK_COMPANIES = [
  "Meridian Foods Ltd",
  "Northgate Logistics Ltd",
  "Brookline Traders Ltd",
  "Kestrel Digital Ltd",
  "Pennine Retail Group",
  "Harbourview Estates Ltd",
  "Ashcroft Engineering Ltd",
  "Veritas Consulting Ltd",
  "Bluewater Imports Ltd",
  "Camden Textiles Ltd",
  "Riverside Care Ltd",
  "Stonebridge Motors Ltd",
  "Falcon Freight Ltd",
  "Whitby Marine Ltd",
  "Aldergate Pharma Ltd",
  "Thornhill Joinery Ltd",
  "Sable & Finch Ltd",
  "Greenfield Agri Ltd",
  "Marlow Print Ltd",
  "Beacon Security Ltd",
  "Oakwell Interiors Ltd",
  "Tideway Seafoods Ltd",
  "Larkspur Events Ltd",
  "Ironbridge Metals Ltd",
];

const UK_PAYEES = [
  "Fastline Utilities",
  "QuickPay Solutions",
  "BuildRight Supplies",
  "Zenith Telecom",
  "Everdene Property",
  "Apex Recruitment",
  "Cardinal Wholesale",
  "Halcyon Insurance",
  "Peak Energy Ltd",
  "Silverline Leasing",
  "Orchard Facilities",
  "Vantage Logistics",
];

const SITE_POOL = [
  "London HQ",
  "Manchester Ops",
  "Leeds Hub",
  "Edinburgh",
  "Birmingham Br",
  "Bristol Ops",
  "Glasgow Ops",
  "Cardiff Br",
  "Nottingham",
  "Sheffield Ops",
];

const MONTHS = ["Feb", "Mar", "Apr", "May"];

/** Regulated domains whose failures are reg-reportable (drives reg-exposure panel). */
const REG_DOMAINS = new Set<UkProcessAuditDomainId>(["ONB", "PAY", "FC", "FRD", "CMP"]);

/** Case bucket — mirrors Indian v3: critical fails, review is in-flight, exception is waived. */
type CaseKind = "critical" | "review" | "exception";

interface DomainProfile {
  total: number;
  completed: number;
  critical: number;
  exception: number;
  review: number;
}

/**
 * Per-domain headline counts copied 1:1 from Indian Process Audit v3
 * (`auditData.ts`). Each UK domain reuses one Indian domain's exact count
 * profile so the KPI ribbon + funnel read identically. Invariant enforced:
 * total === completed + critical + exception + review.
 *
 *   Indian source domain          total/completed/crit/exc/rev
 *   ONB ← customer-kyc            120 / 115 / 2 / 2 / 1
 *   DEP ← fin-reporting            48 /  45 / 2 / 0 / 1
 *   PAY ← transactions            142 / 139 / 2 / 0 / 1
 *   LEN ← credit-loans             86 /  82 / 2 / 1 / 1
 *   COL ← ops-3p                   39 /  36 / 2 / 0 / 1
 *   FC  ← aml                      64 /  60 / 2 / 1 / 1
 *   FRD ← infra-cyber              73 /  69 / 3 / 0 / 1
 *   CMP ← data-gov                 91 /  87 / 3 / 0 / 1
 */
const DOMAIN_PROFILES: Record<UkProcessAuditDomainId, DomainProfile> = {
  ONB: { total: 120, completed: 115, critical: 2, exception: 2, review: 1 },
  DEP: { total: 48, completed: 45, critical: 2, exception: 0, review: 1 },
  PAY: { total: 142, completed: 139, critical: 2, exception: 0, review: 1 },
  LEN: { total: 86, completed: 82, critical: 2, exception: 1, review: 1 },
  COL: { total: 39, completed: 36, critical: 2, exception: 0, review: 1 },
  FC: { total: 64, completed: 60, critical: 2, exception: 1, review: 1 },
  FRD: { total: 73, completed: 69, critical: 3, exception: 0, review: 1 },
  CMP: { total: 91, completed: 87, critical: 3, exception: 0, review: 1 },
};

function shortDomainName(label: string): string {
  return label.split(/[/&(]/)[0].trim();
}

function shortStage(label: string): string {
  return clip(label.split(/[/(]/)[0].trim(), 30);
}

function stageKeyFor(name: string, stepNo: number, used: Set<string>): string {
  const cleaned = name.replace(/[^A-Za-z ]/g, "").trim();
  const first = cleaned.split(/\s+/)[0] || `S${stepNo}`;
  const base = first.toUpperCase().slice(0, 5) || `S${stepNo}`;
  let key = base;
  let n = 2;
  while (used.has(key)) {
    key = `${base.slice(0, 4)}${n}`;
    n += 1;
  }
  used.add(key);
  return key;
}

function evidenceSize(name: string): string {
  const kb = 60 + (hashString(name) % 1900);
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

function evExt(evidenceType: string): string {
  const s = evidenceType.toLowerCase();
  if (s.includes("screenshot") || s.includes("config")) return "png";
  if (s.includes("log") || s.includes("export") || s.includes("json")) return "json";
  if (s.includes("report") || s.includes("reconcil") || s.includes("sample")) return "xlsx";
  return "pdf";
}

function shortControlLabel(control: UkAuditControl | undefined, controlId: string): string {
  if (!control) return controlId;
  const step = control.sopStep || control.controlDescription || controlId;
  return step.length > 40 ? `${step.slice(0, 38)}…` : step;
}

function shortPerson(name: string): string {
  const parts = name.split(" ");
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

function productFromSegment(seg: string): string {
  const p = seg.split("·");
  return (p[p.length - 1] || seg).trim();
}

function amount(seed: string): string {
  const v = 1200 + (hashString(seed) % 48000);
  return v.toLocaleString("en-GB");
}

function dateFor(seed: string): string {
  const day = 1 + (hashString(`${seed}d`) % 28);
  const mon = MONTHS[hashString(`${seed}m`) % MONTHS.length];
  const hh = 8 + (hashString(`${seed}h`) % 10);
  const mm = hashString(`${seed}min`) % 60;
  return `${String(day).padStart(2, "0")} ${mon} 2026 · ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Split a UK risk statement ("Failure to X could result in Y") into the control
 * aim (X) and the downside impact (Y) so cases read as short, realistic lines.
 */
function riskParts(rs: string): { aim: string | null; impact: string } {
  const m = rs.match(/^Failure to\s+(.+?)\s+could result in\s+(.+)$/i);
  if (m) return { aim: m[1].trim(), impact: m[2].trim().replace(/\.$/, "") };
  return { aim: null, impact: rs.trim().replace(/\.$/, "") };
}

/** Short, Indian-style exception tag derived from the SOP step keywords. */
function shortException(sopStep: string, critical: boolean): string {
  const s = sopStep.toLowerCase();
  const pairs: Array<[RegExp, string, string]> = [
    [/sanction|pep|adverse|watchlist|screening/, "Screening miss", "Screening pending"],
    [/identity|\bcdd\b|\bkyc\b|verif/, "CDD / ID gap", "CDD pending"],
    [/ubo|beneficial|ownership/, "UBO gap", "UBO review"],
    [/edd|enhanced|source of|high-risk/, "EDD incomplete", "EDD pending"],
    [/afford|creditworth|underwrit/, "Affordability breach", "Affordability review"],
    [/collateral|valuation/, "Collateral gap", "Valuation review"],
    [/sar|suspicious|disclosure to nca|nominated officer/, "SAR delay", "SAR review"],
    [/reconcil|settlement|nostro|suspense/, "Recon break", "Recon pending"],
    [/confirmation of payee|\bcop\b/, "CoP mismatch", "CoP review"],
    [/reimburs|liability|app scam|claim/, "Reimbursement error", "Reimbursement review"],
    [/fraud|scam|mule|intervention/, "Fraud control gap", "Fraud review"],
    [/complaint|final response|\bfos\b|redress|root cause/, "DISP breach", "DISP review"],
    [/forbearance|arrears|collection|difficulty|vulnerab/, "Forbearance gap", "Forbearance review"],
    [/interest|fee|charge|capitalis/, "Charging error", "Charging review"],
    [/dormant|\bscv\b|depositor|fscs/, "Depositor-protection gap", "DP review"],
    [/mandate|signator|standing data|maintenance/, "Mandate control gap", "Mandate review"],
    [/consent|disclos|terms|consumer|communication/, "Disclosure gap", "Disclosure review"],
    [/offboard|exit|closure|retention|record/, "Exit / records gap", "Exit review"],
    [/safeguard|segregat|e-money/, "Safeguarding gap", "Safeguarding review"],
    [/report|return|\bmi\b|rep-|rep0|governance/, "Reporting error", "Reporting review"],
    [/eligibil|complete|intake|capture|application/, "Data / eligibility gap", "Data review"],
  ];
  for (const [re, crit, rev] of pairs) {
    if (re.test(s)) return critical ? crit : rev;
  }
  return critical ? "Control failure" : "Awaiting evidence";
}

/** Short exception tag for the action-queue subtitle (Indian v3 style). */
function caseException(control: UkAuditControl, kind: CaseKind): string {
  const step = control.sopStep.toLowerCase();
  if (kind === "exception") {
    // Documented / waived — passed all controls, flagged for monitoring.
    if (/score|rating|behaviour|monitor/i.test(step)) return "Low score — monitor";
    if (/waiver|deviation|approval|committee/i.test(step)) return "Approved deviation";
    return `${shortException(control.sopStep, true)} — waived`;
  }
  if (kind === "review") {
    if (/investigation|triage/i.test(step)) return "Awaiting: Investigation gap";
    if (/evidence|sample|attestation/i.test(step)) return "Awaiting: Evidence gap";
    const tag = shortException(control.sopStep, false);
    if (/^awaiting/i.test(tag)) return tag;
    return `Awaiting: ${tag}`;
  }
  if (/sar|suspicious|nominated officer/i.test(step)) return "STR timeliness";
  if (/sanction|screening|pep|adverse/i.test(step)) return "Screening / freeze gap";
  if (/transaction.?monitor|alert/i.test(step)) return "TM / SLA gap";
  if (/complaint|disp|final response|fos/i.test(step)) return "DISP breach";
  if (/reconcil|nostro|settlement|suspense/i.test(step)) return "Recon break";
  if (/afford|creditworth|underwrit/i.test(step)) return "Affordability breach";
  return shortException(control.sopStep, true);
}

function accountRef(seed: string): string {
  const n = 1000 + (hashString(seed) % 8999);
  return `****${String(n).slice(-4)}`;
}

/** Case title — Indian v3 style (alert / account / product led, not bare person names). */
function makeCaseTitle(
  domainId: UkProcessAuditDomainId,
  segment: string,
  caseIndex: number,
  off: number,
  seed: string,
): string {
  const person = UK_PEOPLE[(off + caseIndex) % UK_PEOPLE.length];
  const company = UK_COMPANIES[(off + caseIndex) % UK_COMPANIES.length];
  const seg = productFromSegment(segment);
  const acct = accountRef(seed);

  switch (domainId) {
    case "FC":
      if (/sanction/i.test(segment)) return `Sanctions hit — corp A/c ${acct}`;
      if (/PEP/i.test(segment)) return `PEP review — relationship ${acct}`;
      if (/SAR/i.test(segment)) return `STR escalation — A/c ${acct}`;
      if (/EDD|high-risk/i.test(segment)) return `EDD relationship — A/c ${acct}`;
      return `TM alert — A/c ${acct}`;
    case "FRD":
      return `${seg} — ${shortPerson(person)}`;
    case "PAY":
      return `£${amount(seed)} → ${UK_PAYEES[(off + caseIndex) % UK_PAYEES.length]}`;
    case "ONB":
      return /Corporate|SME|KYB|Commercial/i.test(segment)
        ? `SME onboarding — ${company}`
        : `Retail CDD — ${shortPerson(person)}`;
    case "DEP":
      return /Corporate|SME|Business/i.test(segment)
        ? `Business deposit — ${company}`
        : `Retail account — A/c ${acct}`;
    case "LEN":
      return `${seg} — ${/Commercial|SME|Buy-to-let/i.test(segment) ? company : shortPerson(person)}`;
    case "COL":
      return `${seg} — ${shortPerson(person)}`;
    case "CMP":
      return `DISP — ${seg}`;
    default:
      return person;
  }
}

/** Observation sentence for regulatory / AI panels (Indian v3 pattern). */
function buildObservation(
  control: UkAuditControl,
  kind: CaseKind,
  domainId: UkProcessAuditDomainId,
): string {
  const cid = control.controlId;
  const regSuffix = REG_DOMAINS.has(domainId) ? " — reg-reportable" : "";
  const step = control.sopStep.toLowerCase();

  if (kind === "exception") {
    return "All controls satisfied; no control failure. Documented and waived at committee — retained for periodic monitoring.";
  }

  if (kind === "critical") {
    if (/sar|suspicious|nominated officer/i.test(step)) {
      return `STR filed outside statutory window vs MLR expectation. Control ${cid} failed${regSuffix}.`;
    }
    if (/sanction|screening|interdiction/i.test(step)) {
      return `Sanctions true-match not frozen within required timeframe. Control ${cid} failed${regSuffix}.`;
    }
    if (/transaction.?monitor|alert/i.test(step)) {
      return `Alert open beyond SLA without escalation. Control ${cid} failed.`;
    }
    if (/complaint|disp|final response/i.test(step)) {
      return `DISP deadline breached on final response. Control ${cid} failed${regSuffix}.`;
    }
    if (/reconcil|nostro|settlement|suspense/i.test(step)) {
      return `Reconciliation break aged beyond tolerance. Control ${cid} failed.`;
    }
    if (/confirmation of payee|\bcop\b/i.test(step)) {
      return `CoP mismatch not actioned before payment release. Control ${cid} failed${regSuffix}.`;
    }
    const parts = riskParts(control.riskStatement);
    const impact = parts.impact.charAt(0).toUpperCase() + parts.impact.slice(1);
    return `${clip(impact, 72)}. Control ${cid} failed${regSuffix}.`;
  }

  if (/investigation|triage/i.test(step)) {
    return "Awaiting investigation evidence before disposition.";
  }
  const src = control.evidenceSourceSystem.split(";")[0].trim();
  return `Awaiting ${control.evidenceType.toLowerCase()} from ${src}; pending within SLA window.`;
}

// --- per-domain build ------------------------------------------------------

type Flagged = { control: UkAuditControl; idx: number; kind: CaseKind };

function buildRccDomain(
  domainId: UkProcessAuditDomainId,
  label: string,
  sop: UkDomainSop,
  controls: UkAuditControl[],
  entity: string,
  segments: string[],
): RccDomain {
  const controlsById: Record<string, UkAuditControl> = Object.fromEntries(
    controls.map((c) => [c.controlId, c]),
  );

  const used = new Set<string>();
  const stageDefs = sop.stages.map((def) => ({
    def,
    key: stageKeyFor(def.name, def.no, used),
  }));
  const nStages = stageDefs.length;

  const stageIdxByControl = new Map<string, number>();
  stageDefs.forEach((sd, i) => sd.def.controlIds.forEach((cid) => stageIdxByControl.set(cid, i)));

  // Rank controls by residual risk (violations then exceptions) so the flagged
  // cases sit on the genuinely riskiest stages of the process.
  const ranked = [...controls].sort(
    (a, b) =>
      b.violations * 10 + b.exceptions - (a.violations * 10 + a.exceptions) ||
      hashString(a.controlId) - hashString(b.controlId),
  );

  // Exact per-domain counts, copied from Indian Process Audit v3.
  const profile = DOMAIN_PROFILES[domainId];
  const total = profile.total;

  // Pick distinct-stage controls per bucket (critical → review → exception) so a
  // stage is never reused and every case maps to a unique control.
  const chosen: Flagged[] = [];
  const usedIdx = new Set<number>();
  const usedControlIds = new Set<string>();
  const take = (kind: CaseKind, target: number) => {
    let taken = 0;
    for (const c of ranked) {
      if (taken >= target) break;
      if (usedControlIds.has(c.controlId)) continue;
      const idx = stageIdxByControl.get(c.controlId);
      if (idx == null || usedIdx.has(idx)) continue;
      usedIdx.add(idx);
      usedControlIds.add(c.controlId);
      chosen.push({ control: c, idx, kind });
      taken += 1;
    }
  };
  take("critical", profile.critical);
  take("review", profile.review);
  take("exception", profile.exception);
  chosen.sort((a, b) => a.idx - b.idx);

  // Funnel: criticals narrow via `failed`, reviews via `review`; exceptions pass
  // through as documented/waived (exactly the Indian v3 behaviour).
  const failedAt = new Array<number>(nStages).fill(0);
  const reviewAt = new Array<number>(nStages).fill(0);
  for (const c of chosen) {
    if (c.kind === "critical") failedAt[c.idx] += 1;
    else if (c.kind === "review") reviewAt[c.idx] += 1;
  }

  let reached = total;
  const stages: RccStage[] = stageDefs.map(({ def, key }, i) => {
    const failed = failedAt[i];
    const review = reviewAt[i];
    const passed = Math.max(0, reached - failed - review);
    const stage: RccStage = { key, label: def.name, reached, passed, failed, review };
    reached = passed;
    return stage;
  });

  const off = domainOffset(domainId);

  const rccCases: RccCase[] = chosen.map(({ control, idx, kind }, n) => {
    const seed = `${domainId}-${control.controlId}`;
    const id = `${domainId}-2026-${control.controlId}`;
    const segment = segments[n % segments.length];
    const title = makeCaseTitle(domainId, segment, n, off, seed);
    const stageLabel = stageDefs[idx].def.name;
    const isCritical = kind === "critical";
    const isPassThrough = kind === "exception";
    const failedStage = isPassThrough ? null : stageDefs[idx].key;
    const parts = riskParts(control.riskStatement);

    const journey: Record<string, RccJourneyStepStatus> = {};
    stageDefs.forEach((sd, i) => {
      if (isPassThrough) {
        journey[sd.key] = "pass";
      } else {
        journey[sd.key] =
          i < idx ? "pass" : i === idx ? (isCritical ? "fail" : "review") : "blocked";
      }
    });

    // Control chips: the failed control + up to two preceding (passed) ones.
    // Pass-through cases cleared the whole chain, so anchor on the last stage.
    const anchorIdx = isPassThrough ? nStages - 1 : idx;
    const chipIdxs: number[] = [];
    for (let j = anchorIdx; j >= 0 && chipIdxs.length < 3; j--) chipIdxs.push(j);
    chipIdxs.reverse();
    const controlsList: RccControlCheck[] = chipIdxs.map((j) => {
      const c2 = stageDefs[j].def.controlIds[0];
      return {
        id: c2,
        label: shortControlLabel(controlsById[c2], c2),
        status: j === idx && isCritical ? "fail" : "pass",
      };
    });

    const evidence: RccEvidenceItem[] = chipIdxs.map((j) => {
      const c2id = stageDefs[j].def.controlIds[0];
      const c2 = controlsById[c2id];
      const ext = evExt(c2?.evidenceType ?? "");
      const name = `${c2id}_${id}.${ext}`;
      return {
        name,
        source: c2?.evidenceSourceSystem ?? "Core banking",
        kind: ext.toUpperCase(),
        size: evidenceSize(name),
      };
    });

    const owner = {
      name: UK_PEOPLE[(off + n + 17) % UK_PEOPLE.length],
      role: control.controlOwnerRole,
      emp: `EMP-${1000 + (hashString(`${seed}e`) % 8999)}`,
      site: SITE_POOL[(off + n) % SITE_POOL.length],
      time: dateFor(seed),
    };

    return {
      id,
      title,
      subtitle: segment,
      status: isCritical ? "Critical" : "Exception",
      exception: caseException(control, kind),
      failedStage,
      stageLabel,
      purpose: parts.aim ? clip(`Ensures ${parts.aim}.`, 120) : undefined,
      accountable: clip(`${control.evidenceType} — ${control.evidenceSourceSystem}`, 70),
      journey,
      owner,
      controls: controlsList,
      evidence,
      observation: buildObservation(control, kind, domainId),
    };
  });

  const uniqueCases = uniqueByCaseId(rccCases);

  return {
    id: domainId,
    name: label,
    short: shortDomainName(label),
    entity,
    total,
    completed: profile.completed,
    critical: profile.critical,
    exception: profile.exception,
    review: profile.review,
    stages,
    stageKeys: stages.map((s) => s.key),
    cases: uniqueCases,
  };
}

function uniqueByCaseId(cases: RccCase[]): RccCase[] {
  const map = new Map<string, RccCase>();
  for (const c of cases) map.set(c.id, c);
  return [...map.values()];
}

// --- public API ------------------------------------------------------------

let cache: Map<string, RccDomain> | null = null;

function buildAll(): Map<string, RccDomain> {
  const snap = getUkProcessAuditData();
  const map = new Map<string, RccDomain>();
  for (const def of snap.domains) {
    if (def.id === "overview") continue;
    const id = def.id as UkProcessAuditDomainId;
    const entity = snap.entityByDomain[id]?.entity ?? "case";
    const segments = SEGMENTS_BY_DOMAIN[id] ?? ["Retail · standard"];
    map.set(
      id,
      buildRccDomain(id, def.label, snap.sopByDomain[id], snap.controlsByDomain[id] ?? [], entity, segments),
    );
  }
  return map;
}

export function getUkRccDomain(domainId: string): RccDomain | undefined {
  if (!cache) cache = buildAll();
  return cache.get(domainId);
}

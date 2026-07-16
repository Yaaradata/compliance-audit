/**
 * v5-only curated insights that fill persona-specific coverage gaps.
 *
 * These are deterministic demo records, not generated runtime output. Each has:
 *  - one primary persona owner;
 *  - one owning screen (`aiInsights`);
 *  - a unique model + subject fingerprint;
 *  - named source records and an explicit method.
 */
import type { AIInsightV5 } from "./aiContract";

export const PERSONA_INSIGHT_MINIMUM = 5;

const GENERATED_AT = "2026-07-10T00:00:00.000Z";

export const V5_PERSONA_INSIGHTS = [
  // ── CRO (SMF4) ─────────────────────────────────────────────────────────
  {
    id: "V5-CRO-LIQUIDITY-HEADROOM",
    type: "appetite_headroom",
    title: "Liquidity remains compliant but internal headroom narrowed",
    summary:
      "June LCR is 148%, above the 100% regulatory minimum. The management buffer has narrowed for three consecutive reviews, so the next Board pack should distinguish regulatory compliance from internal appetite headroom.",
    derivation: "RULE",
    confidenceBand: "high",
    confidenceBasis: "June LCR return compared with the internal management-buffer trend.",
    severity: "medium",
    modelId: "liquidity-headroom",
    modelVersion: "1.0.0",
    generatedAt: GENERATED_AT,
    methodology:
      "Deterministic comparison of the latest LCR artefact with the regulatory floor and prior management-buffer observations.",
    personaRelevance: ["cro"],
    screenRelevance: ["aiInsights"],
    sourceRecordIds: [
      {
        type: "evidence",
        id: "EVID-LIQ-LCR-2026-06",
        label: "June 2026 LCR regulatory return",
      },
    ],
    counterfactual:
      "If the management buffer returns to its Q1 level, escalation remains unnecessary despite the unchanged regulatory floor.",
    inputsNotSeen: ["July wholesale funding execution", "Latest deposit concentration forecast"],
    humanActionStatus: "review_at_next_board",
    independenceLineage: {
      inputsFromLOD1: true,
      inputsFromLOD2: false,
      inputsFromLOD3: false,
    },
    relatedEntityIds: [{ type: "domain", id: "liquidity" }],
  },
  {
    id: "V5-CRO-MARKET-RISK-OWNERSHIP",
    type: "accountability_gap",
    title: "Market risk status has evidence but no named SMF owner",
    summary:
      "The VaR artefact is current, but the responsibilities map has no named owner for the market-risk domain. Evidence freshness does not cure an accountability gap.",
    derivation: "RULE",
    confidenceBand: "high",
    confidenceBasis: "Direct join of DOMAIN_EVIDENCE with DOMAIN_ACCOUNTABILITY.",
    severity: "high",
    modelId: "domain-accountability-join",
    modelVersion: "1.0.0",
    generatedAt: GENERATED_AT,
    methodology:
      "Domain is flagged when a current evidence artefact exists while the accountability record is explicitly unowned.",
    personaRelevance: ["cro"],
    screenRelevance: ["aiInsights"],
    sourceRecordIds: [
      {
        type: "evidence",
        id: "EVID-MARKET-VAR-2026",
        label: "Market risk VaR evidence",
      },
      {
        type: "domain",
        id: "market",
        label: "Market Risk accountability record",
      },
    ],
    counterfactual:
      "A named SMF owner with a mapped prescribed responsibility would close the accountability gap without changing the VaR result.",
    inputsNotSeen: ["Pending management responsibilities map amendment"],
    humanActionStatus: "owner_assignment_required",
    independenceLineage: {
      inputsFromLOD1: true,
      inputsFromLOD2: true,
      inputsFromLOD3: false,
    },
    relatedEntityIds: [{ type: "domain", id: "market" }],
  },
  {
    id: "V5-CRO-CREDIT-VALIDATION-DEPENDENCY",
    type: "concentration_risk",
    title: "Credit validation is current but dependent on one evidence source",
    summary:
      "The annual credit-model validation is in cadence, but the GREEN status is supported by one registered artefact. The Board conclusion is valid today but has no independent corroborating source.",
    derivation: "RULE",
    confidenceBand: "medium",
    confidenceBasis: "Single-source count on the credit status-evidence record.",
    severity: "medium",
    modelId: "evidence-source-concentration",
    modelVersion: "1.0.0",
    generatedAt: GENERATED_AT,
    methodology:
      "Counts distinct evidence artefacts supporting the domain status and flags a single-source dependency.",
    personaRelevance: ["cro"],
    screenRelevance: ["aiInsights"],
    sourceRecordIds: [
      {
        type: "evidence",
        id: "EVID-CREDIT-VALIDATION-2026",
        label: "2026 credit model validation",
      },
    ],
    counterfactual:
      "An independent challenge record or committee approval artefact would remove the single-source dependency.",
    inputsNotSeen: ["Model Risk Committee challenge minutes"],
    humanActionStatus: "corroboration_requested",
    independenceLineage: {
      inputsFromLOD1: true,
      inputsFromLOD2: false,
      inputsFromLOD3: false,
    },
    relatedEntityIds: [{ type: "domain", id: "credit" }],
  },

  // ── Head of Compliance Monitoring (SMF16) ───────────────────────────────
  {
    id: "V5-SMF16-CONSUMER-DUTY-CADENCE",
    type: "monitoring_cadence",
    title: "Consumer Duty annual cadence creates an interim blind spot",
    summary:
      "The Consumer Duty monitoring expectation is annual. Even after the missing current artefact is supplied, a 365-day cycle leaves no formal checkpoint for outcome deterioration between annual reviews.",
    derivation: "RULE",
    confidenceBand: "high",
    confidenceBasis: "Expected cadence of 365 days compared with quarterly conduct reporting.",
    severity: "medium",
    modelId: "monitoring-cadence-gap",
    modelVersion: "1.0.0",
    generatedAt: GENERATED_AT,
    methodology:
      "Compares expectedCadenceDays with the quarterly oversight cycle and flags monitoring windows longer than one committee quarter.",
    personaRelevance: ["smf16"],
    screenRelevance: ["aiInsights"],
    sourceRecordIds: [
      {
        type: "domain",
        id: "conduct",
        label: "Consumer Duty status evidence row",
      },
    ],
    counterfactual:
      "A quarterly outcome-indicator checkpoint between annual deep dives would close the interim monitoring blind spot.",
    inputsNotSeen: ["Approved 2026 Consumer Duty monitoring plan"],
    humanActionStatus: "cadence_review_required",
    independenceLineage: {
      inputsFromLOD1: false,
      inputsFromLOD2: true,
      inputsFromLOD3: false,
    },
    relatedEntityIds: [{ type: "domain", id: "conduct" }],
  },
  {
    id: "V5-SMF16-REGULATORY-FINDINGS-CADENCE",
    type: "monitoring_cadence",
    title: "Regulatory findings register is current with limited review headroom",
    summary:
      "The Q2 findings register was refreshed within its 90-day cadence. On the current schedule, any delay to the next review would make the SMF16 oversight conclusion stale before quarter-end.",
    derivation: "RULE",
    confidenceBand: "high",
    confidenceBasis: "Artefact timestamp compared with the 90-day expected cadence.",
    severity: "medium",
    modelId: "regulatory-register-cadence",
    modelVersion: "1.0.0",
    generatedAt: GENERATED_AT,
    methodology:
      "Adds expectedCadenceDays to artefactTs and compares the due date with the next committee cycle.",
    personaRelevance: ["smf16"],
    screenRelevance: ["aiInsights"],
    sourceRecordIds: [
      {
        type: "evidence",
        id: "EVID-REG-FINDINGS-2026-Q2",
        label: "Q2 regulatory findings register",
      },
    ],
    counterfactual:
      "Advancing the next refresh by two weeks would restore a full committee-cycle buffer.",
    inputsNotSeen: ["Next Compliance Committee agenda lock date"],
    humanActionStatus: "schedule_refresh",
    independenceLineage: {
      inputsFromLOD1: false,
      inputsFromLOD2: true,
      inputsFromLOD3: false,
    },
    relatedEntityIds: [{ type: "domain", id: "regulatory" }],
  },
  {
    id: "V5-SMF16-BOARD-OVERSIGHT-CONTROL",
    type: "control_assurance",
    title: "Board oversight control is GREEN but has no mechanism-specific evidence",
    summary:
      "AML.01.04.01 identifies the board member responsible for MLR oversight and is marked GREEN. The control carries an accountability tag, but no dedicated execution artefact is linked to this review.",
    derivation: "RULE",
    confidenceBand: "medium",
    confidenceBasis: "CRSA control status joined to mechanism tags and evidence references.",
    severity: "medium",
    modelId: "crsa-assurance-linkage",
    modelVersion: "1.0.0",
    generatedAt: GENERATED_AT,
    methodology:
      "Flags a GREEN tagged CRSA control when the current review has no execution evidence reference for that control.",
    personaRelevance: ["smf16"],
    screenRelevance: ["aiInsights"],
    sourceRecordIds: [
      {
        type: "crsaRef",
        id: "AML.01.04.01",
        label: "Board member oversight CRSA control",
      },
    ],
    counterfactual:
      "A dated responsibilities-map approval and committee acknowledgement would provide direct execution evidence.",
    inputsNotSeen: ["Signed MRM approval record"],
    humanActionStatus: "assurance_follow_up",
    independenceLineage: {
      inputsFromLOD1: true,
      inputsFromLOD2: true,
      inputsFromLOD3: false,
    },
    relatedEntityIds: [{ type: "crsaRef", id: "AML.01.04.01" }],
  },
  {
    id: "V5-SMF16-SANCTIONS-CONTROL-READACROSS",
    type: "enforcement_read_across",
    title: "Sanctions screening control needs evidence-led read-across",
    summary:
      "SCTN.01.01.01 is GREEN while the sanctions-screening evidence row has no artefact. The Starling screening failure makes list completeness and population definition the required monitoring questions.",
    derivation: "LLM",
    confidenceBand: "medium",
    confidenceBasis:
      "Notice mechanism extracted from the published action and matched to the tagged CRSA control; human-confirmed.",
    severity: "high",
    modelId: "enforcement-control-read-across",
    modelVersion: "1.0.0",
    generatedAt: GENERATED_AT,
    methodology:
      "Human-confirmed mechanism extraction followed by deterministic intersection with CRSA_MECHANISM_TAGS.",
    personaRelevance: ["smf16"],
    screenRelevance: ["aiInsights"],
    sourceRecordIds: [
      {
        type: "precedent",
        id: "uk-starling-2024",
        label: "FCA · Starling Bank Limited · 2024-09-27",
      },
      {
        type: "crsaRef",
        id: "SCTN.01.01.01",
        label: "Sanctions screening CRSA control",
      },
    ],
    counterfactual:
      "A current artefact proving the complete list version and screened population would rebut the read-across.",
    inputsNotSeen: ["Current screening-engine configuration export"],
    humanActionStatus: "monitoring_test_required",
    independenceLineage: {
      inputsFromLOD1: true,
      inputsFromLOD2: true,
      inputsFromLOD3: false,
    },
    relatedEntityIds: [{ type: "crsaRef", id: "SCTN.01.01.01" }],
  },
] satisfies AIInsightV5[];

/**
 * UK Banking Audit v3 — v2 graph with 5-line pack narratives and no Head of ERM persona.
 */
import mockV2 from "@/lib/ukbankingaudit/mockDataV2";

const AP_S165_NARRATIVE = [
  "This response covers AML alert disposition and SAR filing for 2024-01-01 to 2026-03-31 [Pack §1.0].",
  "The firm generated 24,841 alerts via aml_engine 7.2; disposition operated under AML-C002 against the period SLA [Pack §2.1].",
  "A Q1 2026 backlog acceleration produced self-identified issue ISS-2026-009; remediation ACT-2026-009-01/02 closed the capacity gap [Pack §4.1].",
  "The MLRO (SMF17, Priya Patel) recorded reasonable steps on 2026-04-22 and approved +8 FTE surge resourcing [Pack §6.1–6.2].",
  "The pack includes 4,217 hash-verified evidence records and a signed chain-of-custody manifest [Pack §3.1].",
].join("\n");

const AP_MLRO_NARRATIVE = [
  "The MLRO Annual Report 2025 covers 2025-01-01 to 2025-12-31 across scenario coverage, alerts, SARs, and training [Pack §1.0].",
  "Alert disposition remained under AML-C002 with SAR timeliness within expectation for 11 of 12 months [Pack §2.1–3.2].",
  "Backlog pressure in Q1 2026 (ISS-2026-009) was escalated and resourced under MLRO-approved surge capacity [Pack §4.1].",
  "Firm-wide training attestation reached 98.4% against the annual programme target [Pack §5.1].",
  "The forward look flags 8–12% projected alert growth with continued capacity monitoring [Pack §6.0].",
].join("\n");

const AP_OPRES_NARRATIVE = [
  "The OpRes Self-Assessment 2025 covers 2025-04-01 to 2026-03-31 across IBS mapping, dependencies, and scenario outcomes [Pack §1.0].",
  "All five registered IBS completed annual scenario exercises within the assessment window [Pack §2.1].",
  "The payments IBS exercise on 2026-02-14 breached RTO; ACT-2026-012-01 remediated within the agreed timeline [Pack §2.3].",
  "Critical cloud third-party concentration remains within board-approved thresholds [Pack §3.1].",
  "Issues ISS-2026-012 and ISS-2025-098 remain open to Q3 2026; SMF24 attested reasonable steps on 2026-04-18 [Pack §4.0–5.1].",
].join("\n");

function withFiveLineNarratives<T extends { id: string; generatedNarrative: string }>(
  packs: T[],
): T[] {
  const narratives: Record<string, string> = {
    "AP-S165-FCC-001": AP_S165_NARRATIVE,
    "AP-MLRO-2025": AP_MLRO_NARRATIVE,
    "AP-OPRES-SA-2025": AP_OPRES_NARRATIVE,
  };
  return packs.map((pack) => ({
    ...pack,
    generatedNarrative: narratives[pack.id] ?? pack.generatedNarrative,
  }));
}

const personas = mockV2.personas.filter((p) => p.id !== "head_of_erm");

const navigationItems = mockV2.navigationItems
  .filter((n) => n.screen !== "headOfERMWorkspace")
  .map((n) => ({
    ...n,
    visibleForPersonas: n.visibleForPersonas.filter((id) => id !== "head_of_erm"),
  }));

const metrics = {
  ...mockV2.metrics,
  byPersona: Object.fromEntries(
    Object.entries(mockV2.metrics.byPersona).filter(([id]) => id !== "head_of_erm"),
  ),
};

const auditPacks = withFiveLineNarratives(mockV2.auditPacks);

export default {
  ...mockV2,
  personas,
  navigationItems,
  metrics,
  auditPacks,
};

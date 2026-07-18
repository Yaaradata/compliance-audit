/**
 * greenWithoutEvidence — THE FLAGSHIP detector. derivation "RULE".
 */
import { DOMAIN_EVIDENCE } from "../riskDomainsV6";
import type { BoardSignal } from "../types";
import {
  COVERAGE_WINDOW_DAYS,
  DAY_MS,
  EVALUATED_AT,
  NOW_MS,
  accountabilityFor,
  domainName,
  greenWithoutEvidencePrecedentTags,
  isoDate,
  matchPrecedentsForDomain,
  precedentFields,
  statusOf,
} from "./_shared";

export const GREEN_WITHOUT_EVIDENCE_TITLE = "Green Without Evidence" as const;

const ALTERNATIVE_EXPLANATION =
  "The artefact may be filed against the parent domain, or the sub-category may have been " +
  "retired without updating the register. Both are testable from the evidence store — " +
  "neither is present here.";

const HIGH_SEVERITY_DOMAINS = new Set(["fincrime", "conduct"]);

export function detectGreenWithoutEvidence(): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const e of DOMAIN_EVIDENCE) {
    if (e.cadenceSource !== "human-confirmed") continue;
    if (e.artefactId !== null) continue;
    if (e.expectedCadenceDays == null) continue;

    const status = statusOf(e.domainId, e.subCategory);
    if (status !== "GREEN") continue;

    const cadence = e.expectedCadenceDays;
    const missedCycles = Math.floor(COVERAGE_WINDOW_DAYS / cadence);
    if (missedCycles < 1) continue;

    const missing: string[] = [];
    for (let i = 1; i <= missedCycles; i++) {
      missing.push(
        `Expected evidence artefact ~${isoDate(NOW_MS - i * cadence * DAY_MS)} — none on record`,
      );
    }

    const target = e.subCategory ?? domainName(e.domainId);
    const severity = HIGH_SEVERITY_DOMAINS.has(e.domainId) ? "S1" : "S2";
    const precedentTags = greenWithoutEvidencePrecedentTags(e.domainId, e.subCategory);
    const { precedents, primaryPrecedent: primary } = precedentFields(
      matchPrecedentsForDomain(precedentTags, "UK", e.domainId),
    );

    signals.push({
      id: `green-without-evidence-${e.domainId}-${(e.subCategory ?? "domain")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}`,
      title: GREEN_WITHOUT_EVIDENCE_TITLE,
      mechanism: "assertion-unevidenced",
      severity,
      status: "DETECTED_SIGNAL",
      domainId: e.domainId,
      domainName: domainName(e.domainId),
      subCategory: e.subCategory,
      signalObserved: `${target} is GREEN with no evidence artefact on record`,
      soWhat: `${target} is GREEN. No evidence artefact has been produced against it for ${missedCycles} expected cycles.`,
      primaryMetric: { value: 0, label: "artefacts" },
      expected: `An evidence artefact within the ${cadence}-day cadence`,
      observed: "0 artefacts. Last evidence: none on record.",
      evidenceRefs: [],
      missingEvidence: missing,
      precedents,
      primaryPrecedent: primary,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: "artefactId is null on a human-confirmed (armed) status past cadence",
      },
      detectionVersion: "green-without-evidence@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability: accountabilityFor(e.domainId),
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger:
        'status === "GREEN" && artefactId === null && cadenceSource === "human-confirmed" && now > lastExpected + grace',
    });
  }

  return signals;
}

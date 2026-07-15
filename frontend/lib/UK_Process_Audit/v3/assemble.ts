import { assembleUkProcessAuditSnapshot } from "../assembleSnapshot";
import type { UkProcessAuditDomainId } from "../types";
import { evaluateAllCadence } from "./cadence";
import { buildAuditClaims } from "./claims";
import { evaluatePopulationClaims } from "./populationClaims";
import { renderablePrecedents } from "./precedents";
import type { UkProcessAuditV3Snapshot } from "./types";
import { UKPA_V3_AS_OF } from "./types";

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

/**
 * Assemble the v3 snapshot: base UK data + cadence evaluation + population
 * claim checks + real precedents + evidence-bound RULE/LLM claims.
 */
export function assembleUkProcessAuditV3Snapshot(
  asOf: string = UKPA_V3_AS_OF,
): UkProcessAuditV3Snapshot {
  const base = assembleUkProcessAuditSnapshot();
  const allControls = DOMAIN_ORDER.flatMap((id) => base.controlsByDomain[id] ?? []);

  const { byId: cadenceByControlId, rollup: cadenceRollup, byDomain: cadenceByDomain } =
    evaluateAllCadence(allControls, asOf);

  const populationChecks = evaluatePopulationClaims(allControls).filter(
    (c) => c.predicate === "EVIDENCE_GAP_OBSERVED",
  );

  const precedents = renderablePrecedents();

  const claims = buildAuditClaims({
    controls: allControls,
    cadenceById: cadenceByControlId,
    populationChecks,
    precedents,
  });

  const controlsWithCadence = allControls.map((c) => ({
    ...c,
    cadence: cadenceByControlId[c.controlId]!,
  }));

  return {
    base,
    asOf,
    cadenceByControlId,
    cadenceRollup,
    cadenceByDomain,
    populationChecks,
    precedents,
    claims,
    controlsWithCadence,
  };
}

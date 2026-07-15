import type { FailureMechanism } from "./types";

/**
 * Mechanism tags by control id — tagged by failure mechanism, not keyword.
 *
 * Coverage (of 104 CSV controls): 37 tagged · 67 left empty.
 * Untagged is intentional: no precedent match is correct and honest.
 *
 * Only non-empty entries appear here. parseUkControlRows() defaults missing ids to [].
 */
export const MECHANISM_TAGS_BY_CONTROL: Record<string, FailureMechanism[]> = {
  // --- ONB: CDD / KYC refresh / sanctions / onboarding decisioning / attestations ---
  "ONB-03": ["cdd-coverage-shortfall"],
  "ONB-05": ["sanctions-screening-misconfigured"],
  "ONB-06": ["cdd-coverage-shortfall"],
  "ONB-07": ["assertion-unevidenced", "cdd-coverage-shortfall"],
  "ONB-08": ["assertion-unevidenced", "restriction-breach"],
  "ONB-11": ["periodic-review-absent", "cdd-coverage-shortfall"],
  "ONB-12": ["periodic-review-absent", "cdd-coverage-shortfall", "risk-tolerated-past-expiry"],

  // --- DEP: CDD gate / restriction & freeze lifecycle ---
  "DEP-02": ["cdd-coverage-shortfall"],
  "DEP-11": ["restriction-breach", "post-lift-drift"],

  // --- CMP: complaint outcomes / redress / remediation / manual cadence ---
  "CMP-03": ["periodic-review-absent"],
  "CMP-05": ["assertion-unevidenced", "periodic-review-absent"],
  "CMP-06": ["redress-population-incomplete", "remediation-unevidenced"],
  "CMP-10": ["redress-population-incomplete", "remediation-unevidenced"],
  "CMP-11": ["assertion-unevidenced"],

  // --- FC: TM, sanctions, CDD/risk profile, restrictions, attestations, manual cadence ---
  "FC-01": ["periodic-review-absent"],
  "FC-02": ["periodic-review-absent"],
  "FC-03": ["cdd-coverage-shortfall", "tm-ingestion-gap"],
  "FC-04": ["sanctions-screening-misconfigured"],
  "FC-05": ["tm-scope-gap", "tm-ingestion-gap", "alert-suppression"],
  "FC-06": ["alert-suppression", "disposition-quality"],
  "FC-07": ["sanctions-screening-misconfigured"],
  "FC-10": ["restriction-breach"],
  "FC-11": ["assertion-unevidenced"],
  "FC-12": ["assertion-unevidenced", "restriction-breach", "cdd-coverage-shortfall"],
  "FC-13": ["assertion-unevidenced"],

  // --- FRD: disposition / manual investigation / reimbursement population ---
  "FRD-03": ["disposition-quality"],
  "FRD-06": ["periodic-review-absent"],
  "FRD-08": ["redress-population-incomplete"],

  // --- LEN: attestations / manual underwriting & QA cadence ---
  "LEN-06": ["assertion-unevidenced"],
  "LEN-07": ["assertion-unevidenced", "periodic-review-absent"],
  "LEN-08": ["assertion-unevidenced"],
  "LEN-12": ["periodic-review-absent"],

  // --- COL: forbearance / litigation attestations / manual cadence ---
  "COL-04": ["assertion-unevidenced"],
  "COL-06": ["assertion-unevidenced", "periodic-review-absent"],
  "COL-08": ["assertion-unevidenced"],

  // --- PAY: payment-rail sanctions screening / PCI attestation ---
  "PAY-03": ["sanctions-screening-misconfigured"],
  "PAY-10": ["assertion-unevidenced"],
};

/** Total controls in the embedded CSV (source of truth). */
export const UK_CONTROL_LIBRARY_SIZE = 104;

export const MECHANISM_TAGS_TAGGED_COUNT = Object.keys(MECHANISM_TAGS_BY_CONTROL).length;
export const MECHANISM_TAGS_UNTAGGED_COUNT =
  UK_CONTROL_LIBRARY_SIZE - MECHANISM_TAGS_TAGGED_COUNT;

/** Dev-only coverage report at module load. */
function logMechanismTagCoverage(): void {
  if (process.env.NODE_ENV === "production") return;
  console.info(
    `[UKPA signals] mechanism tags: ${MECHANISM_TAGS_TAGGED_COUNT} tagged · ${MECHANISM_TAGS_UNTAGGED_COUNT} untagged (of ${UK_CONTROL_LIBRARY_SIZE})`,
  );
}

logMechanismTagCoverage();

export function tagsForControl(controlId: string): FailureMechanism[] {
  return MECHANISM_TAGS_BY_CONTROL[controlId] ?? [];
}

/**
 * v6 Exposure lens PREVIEW specs for domains that intentionally stay
 * dataAvailable: false — cyber (CISO attack-surface, not a CRO concentration
 * lens) and regulatory (Enforcement Read-Across already lives on Coverage Map).
 *
 * TEXT only — no fabricated numbers. Connected domains (fincrime, credit,
 * liquidity, conduct, opsres, market, climate) do not use this module.
 */

export type ExposurePreview = {
  domainId: string;
  /** The Block-1 question this domain's exposure lens would answer. */
  concentrationQuestion: string;
  /** What the appetite line would be measured against. */
  appetiteBasis: string;
  /** Block-2 style count labels only — never values. */
  exampleCounts: string[];
  /** UK regime that makes this a real lens. */
  ukAnchor: string;
};

const PREVIEWS: Record<string, ExposurePreview> = {
  cyber: {
    domainId: "cyber",
    concentrationQuestion:
      "Attack-surface exposure is owned by the CISO, not a board concentration view — this lens is intentionally not a CRO tool.",
    appetiteBasis:
      "Board cyber appetite and critical-system exposure limits sit with the CISO; they are not expressed as a client/book concentration metric for the Exposure lens",
    exampleCounts: [
      "Internet-facing critical systems",
      "Vendor concentration on critical stack",
      "Unpatched critical CVEs by surface",
    ],
    ukAnchor: "PRA SS1/21 · FCA SYSC cyber expectations · CISO tooling (not a CRO concentration lens)",
  },
  regulatory: {
    domainId: "regulatory",
    concentrationQuestion:
      "This domain's second lens is Enforcement Read-Across on the Coverage Map — not a client-concentration Exposure view.",
    appetiteBasis:
      "Use Coverage Map Enforcement Read-Across for obligation / notice concentration; do not invent a parallel exposure book here",
    exampleCounts: [
      "Open high-severity obligations",
      "Enforcement-theme concentration",
      "Unremediated skilled-person findings",
    ],
    ukAnchor: "Coverage Map · Enforcement Read-Across (already live) · FCA / PRA notice corpus",
  },
};

export function getExposurePreview(domainId: string): ExposurePreview | null {
  return PREVIEWS[domainId] ?? null;
}

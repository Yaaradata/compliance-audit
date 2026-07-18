"use client";

import { DOMAIN_EVIDENCE } from "@/lib/ukbankingaudit/v6/riskDomainsV6";

export type EvidenceState = "filled" | "hollow" | "hatched";

/**
 * Evidence state for a domain tile — ONE encoded dimension:
 *   filled   evidenced within cadence (human-confirmed + artefact)
 *   hollow   asserted, no artefact (armed but artefactId === null)
 *   hatched  cadence unconfirmed — UNARMED (register / policy-extracted / unmapped)
 * Hatched is slate, never red: an unevidenced green is an unknown, not a failure.
 */
export function evidenceStateForDomain(domainId: string): EvidenceState {
  const evidence = DOMAIN_EVIDENCE.find((e) => e.domainId === domainId);
  if (!evidence || evidence.cadenceSource !== "human-confirmed") return "hatched";
  if (evidence.artefactId === null) return "hollow";
  return "filled";
}

const RAIL_META: Record<EvidenceState, { title: string; className: string; style?: React.CSSProperties }> = {
  filled: { title: "Evidenced within cadence", className: "bg-slate-700" },
  hollow: { title: "Asserted — no evidence artefact", className: "border border-slate-400 bg-transparent" },
  hatched: {
    title: "Cadence unconfirmed — unarmed",
    className: "",
    style: { backgroundImage: "repeating-linear-gradient(45deg,#e2e8f0 0 2px,#f8fafc 2px 4px)" },
  },
};

/** A 3px evidence bar rendered beneath a tile's RAG badge. */
export function EvidenceRail({ state }: { state: EvidenceState }) {
  const meta = RAIL_META[state];
  return (
    <div
      role="img"
      aria-label={meta.title}
      title={meta.title}
      className={`box-border h-[3px] w-full rounded-full ${meta.className}`}
      style={meta.style}
    />
  );
}

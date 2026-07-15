/**
 * v5 signal copy — generated from a closed enum of PREDICATES, never free prose.
 *
 * A board pack lives or dies on its language. The failure mode is a developer (or a
 * model) writing "has breached" / "illegal" / "at risk" into a card at 2am. The fix
 * is structural: card and drawer copy is COMPOSED from Predicate clauses here, and an
 * ESLint no-restricted-syntax rule bans the overstated literals across all of v5.
 *
 * WHY it matters: the Nationwide Final Notice calls the firm's re-notification
 * procedure INAPPROPRIATE — not illegal, not systemic, not concealment. One
 * overstated word in a room where someone has read the notice ends the catalogue.
 */

export type Predicate =
  | "SIGNAL_FIRED"
  | "EVIDENCE_GAP_OBSERVED"
  | "PRECEDENT_MATCHED"
  | "HUMAN_REVIEW_REQUIRED";

/** The only sanctioned clause for each predicate. Measured, non-conclusory. */
export const PREDICATE_CLAUSE: Record<Predicate, string> = {
  SIGNAL_FIRED: "Signal fired",
  PRECEDENT_MATCHED: "precedent matched",
  EVIDENCE_GAP_OBSERVED: "evidence gap observed",
  HUMAN_REVIEW_REQUIRED: "human review required",
};

/** The standing disclaimer. This is a screening aid, not an adjudication. */
export const DISCLAIMER =
  "This is not a finding, not a legal conclusion, and not a breach determination.";

/** Compose a clause string from predicates, in the order supplied. */
export function renderCardCopy(predicates: Predicate[]): string {
  return predicates.map((p) => PREDICATE_CLAUSE[p]).join(" \u00B7 ");
}

/** The footer shown on every investigation drawer, generated from the enum. */
export function signalFooter(): string {
  const clause = renderCardCopy([
    "SIGNAL_FIRED",
    "PRECEDENT_MATCHED",
    "EVIDENCE_GAP_OBSERVED",
    "HUMAN_REVIEW_REQUIRED",
  ]);
  return `${clause}. ${DISCLAIMER}`;
}

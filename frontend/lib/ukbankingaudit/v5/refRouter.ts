/**
 * Route a v5 evidence / claim reference to a drawer entity kind by PREFIX.
 * Call sites must not hardcode a single entityType — refs span six namespaces.
 */

export type V5RefKind =
  | "precedent"
  | "derivation"
  | "statusEvidence"
  | "crsaRef"
  | "evidence"
  | "kri"
  | "control";

export function v5RefKind(ref: string): V5RefKind {
  if (/^PREC-(uk|us)-/.test(ref)) return "precedent"; // a real notice
  if (/^(PREC-|LLM-CLAIM-|RULE-DENOM-)/.test(ref)) return "derivation";
  if (ref === "DISP-REASON-META" || ref === "ENF-NOTICE-QUEUE") return "derivation";
  if (/^APPETITE-BREACH-/.test(ref)) return "derivation";
  if (/^EVID-/.test(ref)) return "statusEvidence";
  if (/^[A-Z]{3,4}\.\d{2}\.\d{2}\.\d{2}$/.test(ref)) return "crsaRef";
  if (/^EV-/.test(ref)) return "evidence"; // real v2 record
  if (/^KRI-/.test(ref)) return "kri";
  if (/^[A-Z]{2,4}-C\d{3}$/.test(ref)) return "control";
  return "derivation"; // never return a type that cannot render
}

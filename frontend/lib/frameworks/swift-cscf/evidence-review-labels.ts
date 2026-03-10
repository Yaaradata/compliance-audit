/**
 * Maps form_data keys to the same labels and order as the evidence (submission) page (SWIFT CSCF).
 * Review page uses this so evidence displays identically (no raw JSON, proper table and labels).
 */
import { A2_FORM_LABELS, A2_SPREADSHEET_COLUMNS } from "./evidence/a2-evidence";

const EVIDENCE_FIELD_LABELS: Record<string, Record<string, string>> = {
  A2: {
    inventory_rows: "SWIFT Component Inventory",
    ...A2_FORM_LABELS,
  },
};

const EVIDENCE_FIELD_ORDER: Record<string, string[]> = {
  A2: ["inventory_rows", "exclusion_justification", "co_hosting_notes", "customer_zone_notes"],
};

const EVIDENCE_TABLE_COLUMN_LABELS: Record<string, Record<string, Record<string, string>>> = {
  A2: {
    inventory_rows: Object.fromEntries(A2_SPREADSHEET_COLUMNS.map((c) => [c.key, c.label])),
  },
};

export function getEvidenceFieldLabel(evidenceItemId: string | null | undefined, key: string): string {
  if (!evidenceItemId) return key.replace(/_/g, " ");
  const id = evidenceItemId.trim().toUpperCase();
  const labels = EVIDENCE_FIELD_LABELS[id];
  if (labels && key in labels) return labels[key];
  return key.replace(/_/g, " ");
}

export function getOrderedEvidenceKeys(evidenceItemId: string | null | undefined, formKeys: string[]): string[] {
  if (!evidenceItemId || formKeys.length === 0) return formKeys;
  const id = evidenceItemId.trim().toUpperCase();
  const order = EVIDENCE_FIELD_ORDER[id];
  if (!order) return formKeys;
  const ordered: string[] = [];
  const set = new Set(formKeys);
  for (const k of order) {
    if (set.has(k)) ordered.push(k);
  }
  for (const k of formKeys) {
    if (!ordered.includes(k)) ordered.push(k);
  }
  return ordered;
}

export function getEvidenceTableColumnLabels(
  evidenceItemId: string | null | undefined,
  formKey: string
): Record<string, string> | null {
  if (!evidenceItemId || !formKey) return null;
  const id = evidenceItemId.trim().toUpperCase();
  const byKey = EVIDENCE_TABLE_COLUMN_LABELS[id];
  if (!byKey) return null;
  return byKey[formKey] ?? null;
}

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface EvidenceFormMetadata {
  field_labels: Record<string, string>;
  key_order: string[];
  table_column_labels: Record<string, Record<string, string>>;
}

export function useEvidenceFormMetadata(
  evidenceItemId: string | null | undefined,
  cycleId: string | null | undefined
): EvidenceFormMetadata | null {
  const [metadata, setMetadata] = useState<EvidenceFormMetadata | null>(null);

  useEffect(() => {
    if (!evidenceItemId || !cycleId) {
      setMetadata(null);
      return;
    }
    setMetadata(null);
    api
      .get<EvidenceFormMetadata>(`/ref/evidence-items/${evidenceItemId}/form-metadata?cycle_id=${cycleId}`)
      .then(setMetadata)
      .catch(() => setMetadata(null));
  }, [evidenceItemId, cycleId]);

  return metadata;
}

export function getFieldLabelFromMetadata(
  metadata: EvidenceFormMetadata | null,
  key: string
): string {
  if (!metadata) return key.replace(/_/g, " ");
  return metadata.field_labels[key] ?? key.replace(/_/g, " ");
}

export function getOrderedKeysFromMetadata(
  metadata: EvidenceFormMetadata | null,
  formKeys: string[]
): string[] {
  if (!metadata || metadata.key_order.length === 0) return formKeys;
  const orderSet = new Set(metadata.key_order);
  const ordered: string[] = [];
  for (const k of metadata.key_order) {
    if (formKeys.includes(k)) ordered.push(k);
  }
  for (const k of formKeys) {
    if (!ordered.includes(k)) ordered.push(k);
  }
  return ordered;
}

export function getTableColumnLabelsFromMetadata(
  metadata: EvidenceFormMetadata | null,
  formKey: string
): Record<string, string> | null {
  if (!metadata) return null;
  return metadata.table_column_labels[formKey] ?? null;
}

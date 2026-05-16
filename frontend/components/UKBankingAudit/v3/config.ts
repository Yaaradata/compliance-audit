export type UkAuditVariant = "v2" | "v3";

export type RssComponentDef = {
  key: string;
  label: string;
  /** When set, score is the rounded average of these component keys. */
  mergeKeys?: string[];
};

export const UK_AUDIT_UI = {
  v2: {
    whatChangedTitle: "What changed this week",
    narrativeSubtitle: "AI-drafted with per-paragraph citations",
    rssComponents: [
      { key: "oversightCadenceEvidence", label: "Oversight Cadence" },
      { key: "escalationEvidence", label: "Escalation" },
      { key: "attestationFreshness", label: "Attestation Freshness" },
      { key: "issueAwareness", label: "Issue Awareness" },
      { key: "decisionLogCompleteness", label: "Decision Log" },
      { key: "mrmAlignment", label: "MRM Alignment" },
      { key: "sorAlignment", label: "SoR Alignment" },
    ] as RssComponentDef[],
    rssComponentCount: 7,
  },
  v3: {
    whatChangedTitle: "What Changed from Last Review",
    narrativeSubtitle: "AI-drafted · five-line narrative with inline citations",
    rssComponents: [
      { key: "oversightCadenceEvidence", label: "Oversight Cadence" },
      { key: "issueAwareness", label: "Issue Awareness" },
      {
        key: "mrmSorCompleteness",
        label: "MRM & SoR completeness",
        mergeKeys: ["mrmAlignment", "sorAlignment"],
      },
    ] as RssComponentDef[],
    rssComponentCount: 3,
  },
} as const;

export function getUkAuditUi(variant: UkAuditVariant) {
  return UK_AUDIT_UI[variant];
}

export function resolveRssComponentScore(
  components: Record<string, number>,
  def: RssComponentDef,
): number {
  if (def.mergeKeys?.length) {
    const values = def.mergeKeys.map((k) => components[k] ?? 0);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  return components[def.key] ?? 0;
}

export function computeRssScore(
  components: Record<string, number>,
  defs: RssComponentDef[],
): number {
  if (!defs.length) return 0;
  const total = defs.reduce((sum, def) => sum + resolveRssComponentScore(components, def), 0);
  return Math.round(total / defs.length);
}

/**
 * UK Banking Audit v6 — v5 graph with display labels that omit SMF codes
 * from the persona switcher and landing headers (role names only).
 */
import mockV5 from "@/lib/ukbankingaudit/mockDataV5";

const PERSONA_DISPLAY_LABEL: Record<string, string> = {
  cro: "CRO",
  smf16: "Head of Compliance Monitoring",
  smf17: "MLRO",
};

const personas = (mockV5.personas || []).map((p: { id: string }) => {
  const label = PERSONA_DISPLAY_LABEL[p.id];
  if (!label) return p;
  return { ...p, label, smfDesignation: null };
});

export default {
  ...mockV5,
  personas,
};

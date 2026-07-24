/**
 * UK Banking Audit v6 — v5 graph with SMF-aligned persona display labels
 * for the switcher and landing headers.
 *
 * Format: "{Role} (SMF{n})" — matches SYSC Senior Management Function codes.
 */
import mockV5 from "@/lib/ukbankingaudit/mockDataV5";

type PersonaDisplay = {
  label: string;
  smfDesignation: string;
};

/** Canonical heading / switcher labels per persona id. */
const PERSONA_DISPLAY: Record<string, PersonaDisplay> = {
  cro: {
    label: "CRO (SMF4)",
    smfDesignation: "SMF4",
  },
  smf16: {
    label: "Head of Compliance Monitoring (SMF16)",
    smfDesignation: "SMF16",
  },
  smf17: {
    label: "MLRO (SMF17)",
    smfDesignation: "SMF17",
  },
};

const personas = (mockV5.personas || []).map(
  (p: { id: string; label?: string; smfDesignation?: string | null }) => {
    const display = PERSONA_DISPLAY[p.id];
    if (!display) return p;
    return {
      ...p,
      label: display.label,
      smfDesignation: display.smfDesignation,
    };
  },
);

export default {
  ...mockV5,
  personas,
};

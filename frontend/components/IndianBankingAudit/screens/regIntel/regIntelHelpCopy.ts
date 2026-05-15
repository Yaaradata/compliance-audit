/** Tooltip copy — REG_INTEL_SPEC Pass 7 (G). */
export const REG_INTEL_HELP = {
  materialityScore:
    'ORI materiality score (0–100) from obligation breadth, penalty exposure, and time to effective date. Red ring ≥80, amber ≥60, grey below.',
  hitlStatus:
    'Human-in-the-Loop review. Every AI-extracted obligation must be reviewed and approved by an ORM analyst before the CCO can proceed to Stage 2.',
  coverageStatus:
    'UNCOVERED: no active control claims this obligation. PARTIAL: control exists but CES < 80. COVERED: at least one control with CES ≥ 80. UNKNOWN: mapping not yet classified.',
  governanceTrack:
    'EMERGENCY: ≤14 days + uncovered. EXPEDITED: 15–60 days + uncovered. STANDARD: >60 days. ADVISORY: drafts.',
  aiCitations:
    'Number of obligation references the AI model cited in its narrative. Each citation chip links to the corresponding obligation row.',
  sourceHash:
    'Cryptographic hash of the source document payload at last sync. Used for audit trail integrity.',
} as const;

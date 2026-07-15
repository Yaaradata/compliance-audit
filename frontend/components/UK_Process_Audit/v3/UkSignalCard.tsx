"use client";

/**
 * Re-export — canonical card lives in ./signal/UkSignalCard.tsx
 * (required ClaimLine artefactRef · compact eight-field face).
 */
export { UkSignalCard } from "./signal/UkSignalCard";
export type { UkSignalCardPrecedent, UkSignalCardProps } from "./signal/UkSignalCard";
export { ClaimLine, ClaimLineLegend } from "./signal/ClaimLine";
export type { ClaimLineProps } from "./signal/ClaimLine";
export { UkSignalCardFixtureGallery } from "./signal/UkSignalCard.fixture";

"use client";

import { create } from "zustand";
import seed from "./keystone.seed.json";
import type {
  EvidencePackItem,
  KeystoneData,
  KeystoneStore,
} from "./types";

/** Excise pack id — the regulator whose pack receives the C1 resolution item. */
const EXCISE_REGULATOR_ID = "reg-excise";
/** EXCISE × DUTY posture cell — the hero cell that flips OK on reconcile. */
const EXCISE_DUTY_CELL_ID = "pg-excise-duty";
/** packagedVolume / stickersConsumed stream keys (B.4 mutation targets). */
const PACKAGED_VOLUME_KEY = "packagedVolume";
const STICKERS_CONSUMED_KEY = "stickersConsumed";

/**
 * The C1 resolution-confirmation item appended at runtime (T9 / B.4).
 * Absent at boot; this is the only item the reconcile action adds.
 */
const C1_RECONCILE_ITEM: EvidencePackItem = {
  id: "ep-excise-c1-recon",
  regulatorId: EXCISE_REGULATOR_ID,
  label: "Four-way reconciliation — May 2026 (from C1)",
  derivedFrom: "C1",
  status: "CHECKED",
};

/** Fresh, deeply-cloned copy of the seed so the imported module is never mutated. */
function bootData(): KeystoneData {
  return structuredClone(seed) as KeystoneData;
}

export const useKeystoneStore = create<KeystoneStore>((set, get) => ({
  ...bootData(),

  resetDemo: () => set(bootData()),

  reconcileVariance: () => {
    const state = get();

    // Guard: idempotent — the resolution item must never be appended twice.
    if (state.reconciliation.nodeState === "RECONCILED") return;

    const matchedCount =
      state.reconciliation.streams.find((s) => s.key === PACKAGED_VOLUME_KEY)
        ?.value.value ?? null;

    set((prev) => {
      const recon = prev.reconciliation;

      // B.4: stickersConsumed → AGREE at the matched count.
      const streams = recon.streams.map((s) =>
        s.key === STICKERS_CONSUMED_KEY
          ? { ...s, status: "AGREE" as const, value: { ...s.value, value: matchedCount } }
          : s,
      );

      // B.4: append exactly one C1 resolution item to the EXCISE pack.
      const excisePackPresent = prev.evidencePacks.some(
        (p) =>
          p.regulatorId === EXCISE_REGULATOR_ID &&
          p.items.some((i) => i.id === C1_RECONCILE_ITEM.id),
      );
      const evidencePacks = prev.evidencePacks.map((p) =>
        p.regulatorId === EXCISE_REGULATOR_ID && !excisePackPresent
          ? { ...p, items: [...p.items, C1_RECONCILE_ITEM] }
          : p,
      );

      // B.4: flip EXCISE × DUTY posture cell → OK.
      const postureGrid = prev.postureGrid.map((c) =>
        c.id === EXCISE_DUTY_CELL_ID ? { ...c, status: "OK" as const } : c,
      );

      return {
        reconciliation: {
          ...recon,
          streams,
          // B.4: nodeState → RECONCILED.
          nodeState: "RECONCILED",
          // B.4: variance → CLEARED, amount → Rs 0.
          variance: {
            ...recon.variance,
            status: "CLEARED",
            amount: { ...recon.variance.amount, amount: 0 },
          },
        },
        evidencePacks,
        postureGrid,
        // company.exposureBand + headlineMetrics intentionally untouched.
      };
    });
  },
}));

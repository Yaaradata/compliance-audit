"use client";

import { create } from "zustand";
import seed from "./keystone.seed.json";
import type { EvidencePackItem } from "../types";
import type { KeystoneStoreV2 } from "./types";

const EXCISE_REGULATOR_ID = "reg-excise";
const EXCISE_DUTY_CELL_ID = "pg-excise-duty";
const PACKAGED_VOLUME_KEY = "packagedVolume";
const STICKERS_CONSUMED_KEY = "stickersConsumed";

const C1_RECONCILE_ITEM: EvidencePackItem = {
  id: "ep-excise-c1-recon",
  regulatorId: EXCISE_REGULATOR_ID,
  label: "Four-way reconciliation — May 2026",
  derivedFrom: "C1",
  status: "CHECKED",
};

function bootData() {
  return structuredClone(seed) as Omit<KeystoneStoreV2, "resetDemo" | "reconcileVariance">;
}

export const useKeystoneV2Store = create<KeystoneStoreV2>((set, get) => ({
  ...bootData(),

  resetDemo: () => set(bootData()),

  reconcileVariance: () => {
    const state = get();
    if (state.reconciliation.nodeState === "RECONCILED") return;

    const matchedCount =
      state.reconciliation.streams.find((s) => s.key === PACKAGED_VOLUME_KEY)?.value.value ?? null;

    set((prev) => {
      const recon = prev.reconciliation;
      const streams = recon.streams.map((s) =>
        s.key === STICKERS_CONSUMED_KEY
          ? { ...s, status: "AGREE" as const, value: { ...s.value, value: matchedCount } }
          : s,
      );

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

      const postureGrid = prev.postureGrid.map((c) =>
        c.id === EXCISE_DUTY_CELL_ID ? { ...c, status: "OK" as const } : c,
      );

      return {
        reconciliation: {
          ...recon,
          streams,
          nodeState: "RECONCILED",
          variance: {
            ...recon.variance,
            status: "CLEARED",
            amount: { ...recon.variance.amount, amount: 0 },
          },
        },
        evidencePacks,
        postureGrid,
      };
    });
  },
}));

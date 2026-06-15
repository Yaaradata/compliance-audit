"use client";

import { useState } from "react";
import { CheckCircle2, FileCheck, FolderCheck, FlaskConical, Stamp, Receipt, ScrollText } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { getEvidencePack } from "@/lib/Srilanka_Retail/derivations";
import type { EvidenceSource } from "@/lib/Srilanka_Retail/types";
import { Card } from "../primitives/ui";
import { SourceChip } from "../primitives";

const C1_RECONCILE_ITEM_ID = "ep-excise-c1-recon";

const FROM_ICON: Record<EvidenceSource, typeof Receipt> = {
  C1: Receipt,
  C2: FlaskConical,
  C3: Stamp,
};

export function C4Screen() {
  const regulators = useKeystoneStore((s) => s.regulators);
  const data = useKeystoneStore((s) => s);
  const [sel, setSel] = useState("reg-excise");

  const pack = getEvidencePack(data, sel);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <FolderCheck size={18} style={{ color: "var(--ks-dim)" }} />
          <div>
            <div className="text-sm font-semibold">Evidence packs</div>
            <div className="text-[11px]" style={{ color: "var(--ks-faint)" }}>
              Assembled continuously as the plant runs · QA / Finance / Compliance
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {regulators.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSel(r.id)}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
              style={{
                background: sel === r.id ? "var(--ks-accent-dim)" : "var(--ks-panel-alt)",
                color: sel === r.id ? "var(--ks-accent)" : "var(--ks-dim)",
                border: `1px solid ${sel === r.id ? "var(--ks-accent-edge)" : "var(--ks-border-soft)"}`,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {pack?.items.map((it) => {
            const Icon = FROM_ICON[it.derivedFrom] ?? ScrollText;
            const fresh = it.id === C1_RECONCILE_ITEM_ID;
            return (
              <div
                key={it.id}
                className="flex items-center justify-between rounded-lg px-3.5 py-3"
                style={{
                  background: "var(--ks-panel-alt)",
                  border: `1px solid ${fresh ? "var(--ks-green-edge)" : "var(--ks-border-soft)"}`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} style={{ color: "var(--ks-green)" }} />
                  <span className="text-[13px]">{it.label}</span>
                </div>
                <span
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ background: "var(--ks-raise)", color: "var(--ks-faint)" }}
                >
                  <Icon size={11} /> from {it.derivedFrom}
                </span>
              </div>
            );
          })}
        </div>

        {pack && (
          <div
            className="mt-4 flex flex-wrap items-center gap-2 rounded-lg p-3 text-sm"
            style={{
              background: "var(--ks-green-dim)",
              border: "1px solid var(--ks-green-edge)",
              color: "var(--ks-green)",
            }}
          >
            <FileCheck size={15} /> Pack ready — on-demand. Prep baseline: {pack.prepBaseline.value}{" "}
            <SourceChip tag={pack.prepBaseline.sourceTag} />
          </div>
        )}
      </Card>
    </div>
  );
}

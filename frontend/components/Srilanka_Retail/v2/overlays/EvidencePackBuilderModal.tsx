"use client";

import { useMemo, useState } from "react";
import type { PackScope } from "../context/AppContext";
import type { RegulatorFormat } from "@/lib/Srilanka_Retail/v2/types";
import { useApp } from "../context/AppContext";
import { AiBadge, Btn, Mono } from "../primitives";
import { Modal } from "./Shells";

const REGULATORS: RegulatorFormat[] = ["SLSI", "EXCISE", "NATA", "CUSTOMS", "BOARD"];

interface ChecklistItem {
  label: string;
  count: number;
}
interface TocRow {
  section: string;
  title: string;
  count: number;
  status: "complete" | "gap";
  gapNote?: string;
}

const CHECKLISTS: Record<string, ChecklistItem[]> = {
  SLSI: [
    { label: "QC test results", count: 126 },
    { label: "Batch release logs", count: 14 },
    { label: "Lab COA certificates", count: 14 },
    { label: "SLSI inspection log", count: 1 },
    { label: "Non-conformance register", count: 3 },
  ],
  EXCISE: [
    { label: "Removal records", count: 1287 },
    { label: "FPS reconciliation", count: 18 },
    { label: "Transport permits", count: 1287 },
    { label: "Duty declarations", count: 2 },
    { label: "Variance analysis (AI-generated)", count: 1 },
  ],
  BOARD: [
    { label: "Domain health summary", count: 7 },
    { label: "Open findings", count: 6 },
    { label: "Resolution log", count: 45 },
  ],
  NATA: [{ label: "Advertising compliance log", count: 4 }],
  CUSTOMS: [{ label: "Export document bundles", count: 3 }, { label: "ASYCUDA CusDecs", count: 3 }],
  FCAU: [{ label: "Free-sale certificates", count: 2 }],
  CEA: [{ label: "Effluent test reports", count: 6 }],
};

const TOC: Record<string, TocRow[]> = {
  SLSI: [
    { section: "1", title: "QC Test Results — batch release micro results", count: 14, status: "complete" },
    { section: "2", title: "Lab COA — incoming material COAs", count: 14, status: "gap", gapNote: "1 missing (malt lot ML-2026-0337)" },
    { section: "3", title: "Batch logs — process logs Jun 2026", count: 8, status: "complete" },
    { section: "4", title: "Inspection log — SLSI visit register", count: 1, status: "complete" },
    { section: "5", title: "NC register — non-conformances", count: 3, status: "complete" },
  ],
  EXCISE: [
    { section: "1", title: "Removal records — June 2026", count: 1287, status: "complete" },
    { section: "2", title: "FPS reconciliation — sticker tie-out", count: 18, status: "complete" },
    { section: "3", title: "Transport permits", count: 1287, status: "complete" },
    { section: "4", title: "Variance analysis — AI-attributed", count: 1, status: "complete" },
  ],
  BOARD: [
    { section: "1", title: "Domain health summary", count: 7, status: "complete" },
    { section: "2", title: "Open findings register", count: 6, status: "complete" },
  ],
  NATA: [{ section: "1", title: "Advertising compliance log", count: 4, status: "complete" }],
  CUSTOMS: [{ section: "1", title: "Export document bundles", count: 3, status: "complete" }],
  FCAU: [{ section: "1", title: "Free-sale certificates", count: 2, status: "complete" }],
  CEA: [{ section: "1", title: "Effluent test reports", count: 6, status: "complete" }],
};

export function EvidencePackBuilderModal({ scope, format }: { scope: PackScope; format: RegulatorFormat }) {
  const { closeTopOverlay, pushToast } = useApp();
  const [regulator, setRegulator] = useState<RegulatorFormat>(format);
  const [stage, setStage] = useState<"idle" | "collecting" | "verifying" | "compiling" | "ready">("idle");

  const checklist = CHECKLISTS[regulator] ?? [];
  const toc = TOC[regulator] ?? [];
  const hasGap = toc.some((t) => t.status === "gap");
  const completeness = useMemo(() => {
    const total = toc.reduce((s, t) => s + t.count, 0);
    const present = toc.filter((t) => t.status === "complete").reduce((s, t) => s + t.count, 0);
    return total ? present / total : 1;
  }, [toc]);

  function generate() {
    setStage("collecting");
    setTimeout(() => setStage("verifying"), 600);
    setTimeout(() => setStage("compiling"), 1200);
    setTimeout(() => setStage("ready"), 1800);
  }

  return (
    <Modal
      title="Evidence Pack Builder"
      subtitle={`Scope: ${scope.type} ${scope.ref} · ${regulator}`}
      width={920}
      zIndex={65}
      onClose={closeTopOverlay}
    >
      <div className="grid grid-cols-1 md:grid-cols-[40%_60%]">
        {/* Config */}
        <div className="p-6" style={{ borderRight: "1px solid var(--border-subtle)" }}>
          <Label>Pack for</Label>
          <div className="mb-4 flex flex-wrap gap-2">
            {REGULATORS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRegulator(r); setStage("idle"); }}
                className="rounded-full px-3 py-1.5 text-[12px] transition-colors"
                style={{ backgroundColor: regulator === r ? "var(--ai-accent)" : "var(--surface-raised)", color: regulator === r ? "#fff" : "var(--text-secondary)" }}
              >
                {r}
              </button>
            ))}
          </div>

          <Label>Period</Label>
          <div className="mb-4 rounded-md px-3 py-2 text-[13px]" style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }}>
            01 Jun 2026 – 16 Jun 2026
          </div>

          <Label>Include</Label>
          <div className="mb-4 flex flex-col gap-1.5">
            {checklist.map((c) => (
              <div key={c.label} className="flex items-center justify-between rounded-md px-3 py-2 text-[12px]" style={{ backgroundColor: "var(--surface-raised)" }}>
                <span style={{ color: "var(--text-primary)" }}>✓ {c.label}</span>
                <Mono style={{ color: "var(--text-secondary)" }}>{c.count}</Mono>
              </div>
            ))}
          </div>

          <AiBadge reasoning="based on last inspection scope (SLSI-BIY-2025-09-04)">
            {checklist.length} sections auto-selected for {regulator}
          </AiBadge>

          <div className="mt-5">
            {stage === "ready" ? (
              <div className="flex gap-2">
                <Btn variant="primary" onClick={() => pushToast(`Downloading ${regulator} pack — 47 documents`)}>Download PDF</Btn>
                <Btn onClick={() => pushToast("Pack link copied", "info")}>Copy link</Btn>
              </div>
            ) : stage === "idle" ? (
              <Btn variant="primary" full onClick={generate}>Generate Pack</Btn>
            ) : (
              <div className="rounded-md p-3 text-[13px]" style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }}>
                {stage === "collecting" ? "Collecting records…" : stage === "verifying" ? "Verifying completeness…" : "Compiling pack…"}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {regulator} Evidence Pack — Biyagama · Jun 2026
          </div>
          {stage === "ready" ? (
            <div className="mt-2 text-[12px]" style={{ color: "var(--status-healthy)" }}>✓ Pack ready — 47 documents, 12.3 MB</div>
          ) : null}

          <div className="mt-3 overflow-hidden rounded-lg" style={{ border: "1px solid var(--border-subtle)" }}>
            <div className="grid grid-cols-[0.4fr_2fr_0.6fr_1fr] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div>#</div><div>Document</div><div>Recs</div><div>Status</div>
            </div>
            {toc.map((t) => (
              <div key={t.section} className="grid grid-cols-[0.4fr_2fr_0.6fr_1fr] items-center gap-2 px-3 py-2.5 text-[12px]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <Mono style={{ color: "var(--text-secondary)" }}>{t.section}</Mono>
                <span style={{ color: "var(--text-primary)" }}>{t.title}</span>
                <Mono style={{ color: "var(--text-secondary)" }}>{t.count}</Mono>
                <span className="text-[11px]" style={{ color: t.status === "gap" ? "var(--status-watch)" : "var(--status-healthy)" }}>
                  {t.status === "gap" ? `⚠ ${t.gapNote}` : "✓ Complete"}
                </span>
              </div>
            ))}
          </div>

          {hasGap ? (
            <div className="mt-3">
              <AiBadge reasoning="Flag to QA before submitting — low-risk but auditor may query">
                1 gap detected: malt COA missing for lot ML-2026-0337
              </AiBadge>
            </div>
          ) : null}

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
              <span>Completeness</span>
              <span>{(completeness * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--surface-raised)" }}>
              <div className="h-full rounded-full" style={{ width: `${completeness * 100}%`, backgroundColor: "var(--ai-accent)" }} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
      {children}
    </div>
  );
}

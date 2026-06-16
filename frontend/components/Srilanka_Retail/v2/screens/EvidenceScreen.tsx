"use client";

import { mockData } from "@/lib/Srilanka_Retail/v2/mockData";
import { formatDateTime } from "@/lib/Srilanka_Retail/v2/format";
import type { EvidencePack } from "@/lib/Srilanka_Retail/v2/types";
import { useApp } from "../context/AppContext";
import { Btn, Card, Mono, SectionHeading, StatusBadge } from "../primitives";
import { ScreenTitle } from "./Dashboard";

const packs = mockData.entities.evidencePacks;

export function EvidenceScreen() {
  const { openEvidencePack } = useApp();
  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <div className="mb-5 flex items-center justify-between">
        <ScreenTitle title="Evidence Packs" subtitle="Regulator-ready dossiers · hashed and version-controlled" />
        <Btn variant="primary" onClick={() => openEvidencePack({ type: "period", ref: "2026-06" }, "EXCISE")}>
          New evidence pack
        </Btn>
      </div>

      <SectionHeading>Generated packs</SectionHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packs.map((p) => (
          <PackCard key={p.packId} p={p} onOpen={() => openEvidencePack(p.scopeRef, p.format)} />
        ))}
      </div>
    </div>
  );
}

function PackCard({ p, onOpen }: { p: EvidencePack; onOpen: () => void }) {
  const status = p.status === "ready" ? "healthy" : p.status === "stale" ? "watch" : "neutral";
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Mono className="text-[12px]" style={{ color: "var(--text-primary)" }}>{p.packId}</Mono>
        <StatusBadge status={status} label={p.status.toUpperCase()} />
      </div>
      <div className="mt-2 text-[13px] font-semibold uppercase" style={{ color: "var(--text-primary)" }}>{p.format}</div>
      <div className="mt-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
        Scope: {p.scopeRef.type} {p.scopeRef.ref}
      </div>
      {p.generatedTs ? (
        <div className="mt-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          Generated {formatDateTime(p.generatedTs)} · {p.docCount} docs · {p.sizeMb} MB
        </div>
      ) : (
        <div className="mt-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>Not yet generated</div>
      )}
      {p.completenessScore !== null ? (
        <div className="mt-2 text-[11px]" style={{ color: p.completenessScore < 1 ? "var(--status-watch)" : "var(--status-healthy)" }}>
          Completeness {(p.completenessScore * 100).toFixed(1)}%
          {p.gaps.length ? ` · ${p.gaps.length} gap` : ""}
        </div>
      ) : null}
      {p.hash ? (
        <Mono className="mt-2 block truncate text-[10px]" style={{ color: "var(--text-secondary)" }}>{p.hash}</Mono>
      ) : null}
      <div className="mt-3">
        <Btn size="sm" full onClick={onOpen}>{p.status === "idle" ? "Generate" : "Open builder"}</Btn>
      </div>
    </Card>
  );
}

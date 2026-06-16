"use client";

import { findingsForDomain, domainHealthById } from "@/lib/Srilanka_Retail/v2/mockData";
import type { DomainId } from "@/lib/Srilanka_Retail/v2/types";
import { useApp } from "../context/AppContext";
import { Btn, OwnerChip, SeverityBadge, StatusBadge } from "../primitives";
import { SlideOver } from "./Shells";

export function DomainDrillSlideOver({ domainId }: { domainId: DomainId }) {
  const { closeTopOverlay, openFinding, openEvidencePack, resolvedFindings } = useApp();
  const domain = domainHealthById[domainId];
  const findings = findingsForDomain(domainId);

  return (
    <SlideOver
      width={480}
      zIndex={50}
      onClose={closeTopOverlay}
      title={
        <span className="flex items-center gap-2">
          {domain?.label ?? domainId}
          {domain ? <StatusBadge status={domain.status} /> : null}
        </span>
      }
      subtitle={domain ? `Score ${domain.score}/100 · ${domain.openFindingsCount} open findings` : undefined}
      footer={
        <Btn variant="primary" full onClick={() => openEvidencePack({ type: "domain", ref: domainId }, "BOARD")}>
          Generate Evidence Pack
        </Btn>
      }
    >
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Open Findings
      </div>
      {findings.length === 0 ? (
        <div className="rounded-lg p-4 text-[13px]" style={{ backgroundColor: "var(--surface-card)", color: "var(--text-secondary)" }}>
          ✓ No open findings in this domain.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {findings.map((f) => {
            const closed = resolvedFindings.has(f.findingId) || f.capaStatus === "closed";
            return (
              <button
                key={f.findingId}
                type="button"
                onClick={() => openFinding(f.findingId)}
                className="rounded-lg p-3 text-left transition-colors hover:brightness-110"
                style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <SeverityBadge severity={f.severity} />
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {closed ? "resolved" : `${f.ageHours}h`}
                  </span>
                </div>
                <div className="mt-1.5 text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {f.title}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <OwnerChip name={f.ownerName} />
                  <span className="text-[11px] font-medium" style={{ color: "var(--ai-accent)" }}>
                    View detail →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </SlideOver>
  );
}

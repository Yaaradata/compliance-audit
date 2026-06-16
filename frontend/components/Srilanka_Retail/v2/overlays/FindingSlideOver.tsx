"use client";

import { findingById, mockData } from "@/lib/Srilanka_Retail/v2/mockData";
import { formatDateTime } from "@/lib/Srilanka_Retail/v2/format";
import { useApp } from "../context/AppContext";
import {
  AiReasoningBlock,
  Btn,
  EvidenceLink,
  OwnerChip,
  SectionHeading,
  SeverityBadge,
} from "../primitives";
import { SlideOver } from "./Shells";

export function FindingSlideOver({ findingId }: { findingId: string }) {
  const { closeTopOverlay, closeAllOverlays, pushToast, resolveFinding, resolvedFindings } = useApp();
  const finding = findingById[findingId];
  if (!finding) return null;
  const thread = mockData.entities.resolutionThreads[findingId] ?? [];
  const closed = resolvedFindings.has(findingId) || finding.capaStatus === "closed";

  return (
    <SlideOver
      width={560}
      zIndex={55}
      onClose={closeTopOverlay}
      title={
        <span className="flex items-center gap-2">
          Finding <SeverityBadge severity={finding.severity} />
        </span>
      }
      subtitle={finding.title}
      footer={
        <div className="flex gap-2">
          <Btn
            variant="primary"
            onClick={() => {
              resolveFinding(findingId);
              pushToast(`Resolution logged — ${finding.ownerName ?? "owner"} notified`);
              closeAllOverlays();
            }}
            disabled={closed}
          >
            {closed ? "Resolved" : "Approve resolution"}
          </Btn>
          <Btn onClick={() => pushToast("Escalated to Plant Manager", "info")}>Escalate</Btn>
          <Btn onClick={() => pushToast("Note added to finding", "info")}>Add note</Btn>
        </div>
      }
    >
      <SectionHeading>What happened</SectionHeading>
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {finding.whatFailed}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Required action: {finding.requiredAction}
      </p>

      <div className="mt-4">
        <AiReasoningBlock
          reasoning={finding.aiReasoning}
          confidence={finding.aiConfidence}
          metric={finding.metricBreach}
        />
      </div>

      {finding.evidence.length > 0 ? (
        <div className="mt-4">
          <SectionHeading>Evidence links</SectionHeading>
          <div className="flex flex-col gap-2">
            {finding.evidence.map((ev) => (
              <EvidenceLink key={ev.id} link={ev} onOpen={() => pushToast(`Opening ${ev.label}`, "info")} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <SectionHeading>Owner</SectionHeading>
        <div className="flex items-center gap-3">
          <OwnerChip name={finding.ownerName} />
          {finding.ownerRole ? (
            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
              {finding.ownerRole.replace("_", " ")}
            </span>
          ) : null}
          <Btn size="sm" onClick={() => pushToast("Reassign owner — picker not in MVP", "info")}>
            Reassign
          </Btn>
        </div>
      </div>

      {thread.length > 0 ? (
        <div className="mt-4">
          <SectionHeading>Resolution thread</SectionHeading>
          <div className="flex flex-col gap-2.5">
            {thread.map((ev, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ev.isAi ? "var(--ai-accent)" : "var(--status-neutral)" }} />
                <div>
                  <div className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                    {ev.isAi ? "✦ " : ""}
                    {ev.text}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {formatDateTime(ev.ts)} · {ev.actor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SlideOver>
  );
}

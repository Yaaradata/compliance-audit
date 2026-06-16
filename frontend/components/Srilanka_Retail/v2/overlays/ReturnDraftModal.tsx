"use client";

import { mockData } from "@/lib/Srilanka_Retail/v2/mockData";
import { formatLKR, formatNumber } from "@/lib/Srilanka_Retail/v2/format";
import { useApp } from "../context/AppContext";
import { AiBadge, Btn, Mono } from "../primitives";
import { Modal } from "./Shells";

const decl = mockData.entities.exciseDeclarations.find((d) => d.period === "2026-06")!;

export function ReturnDraftModal() {
  const { closeTopOverlay, pushToast } = useApp();

  const rowsData: [string, string][] = [
    ["Total units removed", formatNumber(decl.totalUnitsRemoved)],
    ["Total volume", `${formatNumber(decl.totalVolumeL)} L`],
    ["Total LPA", formatNumber(decl.totalLpa)],
    ["Duty payable", formatLKR(decl.dutyAmountLkr)],
    ["Sticker variance", `${formatNumber(decl.stickerVariance)} units`],
    ["Total variance flagged", formatLKR(decl.totalVarianceLkr)],
  ];

  return (
    <Modal
      title="Draft Excise Return — June 2026"
      subtitle="Auto-drafted from reconciliation data · review required before filing"
      onClose={closeTopOverlay}
      width={620}
      footer={
        <div className="flex justify-end gap-2">
          <Btn onClick={closeTopOverlay}>Cancel</Btn>
          <Btn onClick={() => pushToast("Evidence pack downloading", "info")}>Download PDF</Btn>
          <Btn variant="primary" onClick={() => { pushToast("June return signed & submitted to Excise portal"); closeTopOverlay(); }}>
            Sign &amp; Submit
          </Btn>
        </div>
      }
    >
      <div className="p-6">
        <div className="overflow-hidden rounded-lg" style={{ border: "1px solid var(--border-subtle)" }}>
          {rowsData.map(([label, value], i) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: i < rowsData.length - 1 ? "1px solid var(--border-subtle)" : undefined, backgroundColor: i % 2 ? "var(--surface-card)" : "transparent" }}
            >
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
              <Mono className="text-[13px] font-semibold" style={{ color: label.includes("variance") ? "var(--status-risk)" : "var(--text-primary)" }}>
                {value}
              </Mono>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <AiBadge reasoning="Human review required before filing — 4 breaks remain open (1 critical)">
            Auto-drafted from reconciliation data
          </AiBadge>
        </div>
      </div>
    </Modal>
  );
}

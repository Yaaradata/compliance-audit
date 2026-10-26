"use client";

import { useMemo, useState } from "react";
import {
  matchPrecedents,
  resolvePrecedent,
} from "@/lib/ukbankingaudit/v7/precedentCorpus";
import type { AuditEntry, DispositionKind } from "@/lib/ukbankingaudit/v7/dispositions";
import { RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v7/riskDomainsV7";
import type { BoardSignal, Precedent } from "@/lib/ukbankingaudit/v7/types";
import { RegulatoryLandscapeCard } from "./RegulatoryLandscapeCard";
import { useJurisdiction } from "./jurisdictionContext";
import { SignalInvestigationDrawer } from "./SignalInvestigationDrawer";

type Props = {
  signals: BoardSignal[];
  /** Domain open on the left categories panel — null = firm-wide. */
  expandedId: string | null;
  onClearDomain: () => void;
};

function domainLabel(domainId: string): string {
  return RISK_DOMAINS_V4.find((d) => d.id === domainId)?.name ?? domainId;
}

/**
 * Precedent for a card. When a domain is open, re-match via matchPrecedents for
 * that domain — never attach a precedent whose domainScope does not include it.
 */
function precedentForSignal(
  jurisdiction: "UK" | "US",
  signal: BoardSignal,
  domainFilter: string | null,
): Precedent | undefined {
  if (domainFilter) {
    return matchPrecedents([signal.mechanism], jurisdiction, domainFilter)[0];
  }
  return resolvePrecedent(
    jurisdiction,
    signal.precedents,
    signal.mechanism,
    signal.domainId,
  );
}

/** Regulatory landscape zone: up to four cards, plus the investigation drawer and audit log. */
export function RegulatoryLandscapePanel({
  signals,
  expandedId,
  onClearDomain,
}: Props) {
  const jurisdiction = useJurisdiction();
  const [openId, setOpenId] = useState<string | null>(null);
  const [initialAction, setInitialAction] = useState<DispositionKind | null>(null);
  const [log, setLog] = useState<Record<string, AuditEntry[]>>({});

  const scopedSignals = useMemo(() => {
    if (!expandedId) return signals;
    return signals.filter((s) => s.domainId === expandedId);
  }, [signals, expandedId]);

  const shown = scopedSignals.slice(0, 4);
  const openSignal = shown.find((s) => s.id === openId) ?? null;
  /** At most one card may use red — the highest-severity firm-likely hit in the strip. */
  const firmLikelyId = shown.find((s) => s.severity === "S1")?.id ?? null;
  const filterLabel = expandedId ? domainLabel(expandedId) : null;

  const openDrawer = (signal: BoardSignal, action: DispositionKind | null) => {
    setOpenId(signal.id);
    setInitialAction(action);
  };

  const appendEntry = (entry: AuditEntry) => {
    setLog((prev) => ({ ...prev, [entry.signalId]: [...(prev[entry.signalId] ?? []), entry] }));
  };

  const filterLine =
    filterLabel !== null ? (
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2 text-[12px] text-slate-600">
        <span>
          Showing: <span className="font-semibold text-slate-800">{filterLabel}</span>
        </span>
        <button
          type="button"
          onClick={onClearDomain}
          className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          clear
        </button>
      </div>
    ) : null;

  if (shown.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
        <h2 className="mb-3 shrink-0 text-base font-bold text-slate-900">Regulatory Landscape</h2>
        {filterLine}
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-[13px] font-medium text-slate-600">
          {expandedId
            ? "No enforcement precedent matched for this domain."
            : "No signals this cycle. 3 domains unarmed — evidence cadence unconfirmed."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <h2 className="mb-3 shrink-0 text-base font-bold text-slate-900">Regulatory Landscape</h2>
      {filterLine}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <div className="flex flex-col gap-2.5 pb-1">
          {shown.map((signal) => (
            <RegulatoryLandscapeCard
              key={signal.id}
              signal={signal}
              firmLikely={signal.id === firmLikelyId}
              precedent={precedentForSignal(jurisdiction, signal, expandedId)}
              onInvestigate={(s) => openDrawer(s, null)}
              onAccept={(s) => openDrawer(s, "accept")}
            />
          ))}
        </div>
      </div>

      {openSignal ? (
        <SignalInvestigationDrawer
          signal={openSignal}
          precedent={precedentForSignal(jurisdiction, openSignal, expandedId)}
          auditEntries={log[openSignal.id] ?? []}
          initialAction={initialAction}
          onRecord={appendEntry}
          onClose={() => {
            setOpenId(null);
            setInitialAction(null);
          }}
        />
      ) : null}
    </div>
  );
}

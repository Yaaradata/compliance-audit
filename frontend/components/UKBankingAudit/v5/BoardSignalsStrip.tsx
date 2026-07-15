"use client";

import { useState } from "react";
import { resolvePrecedent } from "@/lib/ukbankingaudit/v5/precedentCorpus";
import type { AuditEntry, DispositionKind } from "@/lib/ukbankingaudit/v5/dispositions";
import type { BoardSignal } from "@/lib/ukbankingaudit/v5/types";
import { BoardSignalCard } from "./BoardSignalCard";
import { useJurisdiction } from "./jurisdictionContext";
import { SignalInvestigationDrawer } from "./SignalInvestigationDrawer";

type Props = {
  signals: BoardSignal[];
};

/** Board-signals zone: up to four cards, plus the investigation drawer and audit log. */
export function BoardSignalsStrip({ signals }: Props) {
  const jurisdiction = useJurisdiction();
  const [openId, setOpenId] = useState<string | null>(null);
  const [initialAction, setInitialAction] = useState<DispositionKind | null>(null);
  const [log, setLog] = useState<Record<string, AuditEntry[]>>({});

  const shown = signals.slice(0, 4);
  const openSignal = shown.find((s) => s.id === openId) ?? null;

  const openDrawer = (signal: BoardSignal, action: DispositionKind | null) => {
    setOpenId(signal.id);
    setInitialAction(action);
  };

  const appendEntry = (entry: AuditEntry) => {
    setLog((prev) => ({ ...prev, [entry.signalId]: [...(prev[entry.signalId] ?? []), entry] }));
  };

  if (shown.length === 0) {
    return (
      <div>
        <h2 className="mb-3 text-base font-bold text-slate-900">Board signals</h2>
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-[13px] font-medium text-slate-600">
          No signals this cycle. 3 domains unarmed — evidence cadence unconfirmed.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-slate-900">Board signals</h2>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {shown.map((signal) => (
          <BoardSignalCard
            key={signal.id}
            signal={signal}
            precedent={resolvePrecedent(
              jurisdiction,
              signal.precedents,
              signal.mechanism,
              signal.domainId,
            )}
            onInvestigate={(s) => openDrawer(s, null)}
            onAccept={(s) => openDrawer(s, "accept")}
          />
        ))}
      </div>

      {openSignal ? (
        <SignalInvestigationDrawer
          signal={openSignal}
          precedent={resolvePrecedent(
            jurisdiction,
            openSignal.precedents,
            openSignal.mechanism,
            openSignal.domainId,
          )}
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

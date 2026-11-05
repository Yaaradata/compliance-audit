"use client";

import { useMemo, useState } from "react";
import { groupSetRequirements, smfHolders } from "@/components/UKBankingAudit/ukTraceRuntime";
import { formatDate } from "@/lib/ukbankingaudit/v8/boardView";
import { categoryLabel } from "@/lib/ukbankingaudit/v8/config";
import { HORIZON_ITEMS } from "@/lib/ukbankingaudit/v8/data/horizon";
import type { AuditEntry, DispositionKind } from "@/lib/ukbankingaudit/v8/dispositions";
import { buildEnforcementNotices } from "@/lib/ukbankingaudit/v8/enforcementCoverage";
import {
  horizonItemToSignal,
  noticeToSignal,
  precedentToSignal,
  readAcrossPrecedents,
} from "@/lib/ukbankingaudit/v8/horizonSignals";
import { matchPrecedents, resolvePrecedent } from "@/lib/ukbankingaudit/v8/precedentCorpus";
import type { BoardSignal, HorizonItem, Precedent } from "@/lib/ukbankingaudit/v8/types";
import { HorizonCard } from "./HorizonCard";
import { useJurisdiction } from "./jurisdictionContext";
import { RegulatoryLandscapeCard } from "./RegulatoryLandscapeCard";
import { SignalInvestigationDrawer } from "./SignalInvestigationDrawer";

type Props = {
  signals: BoardSignal[];
  /** Domain open on the left categories panel. Null means firm-wide. */
  expandedId: string | null;
  onClearDomain: () => void;
};

type TabId = "all" | "regulatory" | "industry" | "emerging";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "regulatory", label: "Regulatory" },
  { id: "industry", label: "Industry events" },
  { id: "emerging", label: "Emerging risks" },
];

const RELEVANCE: { value: HorizonItem["relevance"]; label: string }[] = [
  { value: "not_assessed", label: "Not assessed" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

/** A green-without-evidence result is a control testing gap, not an external event. */
function isExternalSignal(signal: BoardSignal): boolean {
  return signal.title !== "Green Without Evidence";
}

/**
 * Precedent for a card. When a domain is open, re-match via matchPrecedents for
 * that domain: never attach a precedent whose domainScope does not include it.
 */
function precedentForSignal(
  jurisdiction: "UK" | "US",
  signal: BoardSignal,
  domainFilter: string | null,
): Precedent | undefined {
  if (signal.primaryPrecedent && signal.detectionVersion === "horizon-scan@1.0.0") {
    return signal.primaryPrecedent;
  }
  if (domainFilter) {
    return matchPrecedents([signal.mechanism], jurisdiction, domainFilter)[0];
  }
  return resolvePrecedent(jurisdiction, signal.precedents, signal.mechanism, signal.domainId);
}

/** The full external environment: regulatory signals, industry events and emerging risks. */
export function HorizonScanningPanel({ signals, expandedId, onClearDomain }: Props) {
  const jurisdiction = useJurisdiction();
  const [tab, setTab] = useState<TabId>("all");
  const [open, setOpen] = useState<{ signal: BoardSignal; action: DispositionKind | null } | null>(null);
  const [log, setLog] = useState<Record<string, AuditEntry[]>>({});
  const [relevance, setRelevance] = useState<Record<string, HorizonItem["relevance"]>>({});

  const inScope = (domainId: string) => !expandedId || domainId === expandedId;

  const precedentSignals = useMemo(
    () => signals.filter(isExternalSignal).filter((s) => !expandedId || s.domainId === expandedId).slice(0, 4),
    [signals, expandedId],
  );
  const firmLikelyId = precedentSignals.find((s) => s.severity === "S1")?.id ?? null;

  const notices = useMemo(
    () =>
      buildEnforcementNotices({ groupSetRequirements })
        .filter((n) => n.applicabilityStatus !== "completed")
        .sort((a, b) => b.ageDays - a.ageDays),
    [],
  );
  const queue = notices.filter((n) => inScope(n.precedent.domainScope[0] ?? "regulatory"));
  const readAcross = useMemo(
    () => readAcrossPrecedents(smfHolders, new Set(notices.map((n) => n.id))),
    [notices],
  ).filter((p) => inScope(p.domainScope[0] ?? "regulatory"));
  const industry = HORIZON_ITEMS.filter((h) => h.type === "industry" && inScope(h.categoryId));
  const emerging = HORIZON_ITEMS.filter((h) => h.type === "emerging" && inScope(h.categoryId));

  const showRegulatory = tab === "all" || tab === "regulatory";
  const showIndustry = tab === "all" || tab === "industry";
  const showEmerging = tab === "all" || tab === "emerging";
  const nothingToShow =
    (!showRegulatory || (precedentSignals.length === 0 && queue.length === 0 && readAcross.length === 0)) &&
    (!showIndustry || industry.length === 0) &&
    (!showEmerging || emerging.length === 0);

  const openDrawer = (signal: BoardSignal, action: DispositionKind | null) => setOpen({ signal, action });
  const appendEntry = (entry: AuditEntry) => {
    setLog((prev) => ({ ...prev, [entry.signalId]: [...(prev[entry.signalId] ?? []), entry] }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <h2 className="mb-2 shrink-0 text-base font-bold text-slate-900">Horizon Scanning</h2>

      <div role="tablist" aria-label="Horizon scanning filter" className="mb-3 flex shrink-0 flex-wrap gap-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
              tab === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {expandedId ? (
        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2 text-[12px] text-slate-600">
          <span>
            Showing: <span className="font-semibold text-slate-800">{categoryLabel(expandedId)}</span>
          </span>
          <button
            type="button"
            onClick={onClearDomain}
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            clear
          </button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <div className="flex flex-col gap-2.5 pb-1">
          {nothingToShow ? (
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-[13px] font-medium text-slate-600">
              Nothing in this view for the current selection.
            </div>
          ) : null}

          {showRegulatory
            ? precedentSignals.map((signal) => (
                <RegulatoryLandscapeCard
                  key={signal.id}
                  signal={signal}
                  firmLikely={signal.id === firmLikelyId}
                  precedent={precedentForSignal(jurisdiction, signal, expandedId)}
                  onInvestigate={(s) => openDrawer(s, null)}
                  onAccept={(s) => openDrawer(s, "accept")}
                />
              ))
            : null}

          {showRegulatory
            ? queue.map((notice) => {
                const signal = noticeToSignal(notice);
                return (
                  <HorizonCard
                    key={notice.id}
                    kicker="Enforcement applicability queue"
                    title={notice.precedent.respondent}
                    source={notice.regulatorBody}
                    sourceUrl={notice.precedent.sourceUrl || undefined}
                    date={formatDate(notice.publishedDate)}
                    summary={`${notice.ageDays} days ${notice.applicabilityStatus === "in_progress" ? "with assessment in progress" : "not assessed"}. ${notice.precedent.hook}`}
                    categoryLabel={categoryLabel(signal.domainId)}
                    onInvestigate={() => openDrawer(signal, null)}
                    onAccept={() => openDrawer(signal, "accept")}
                  />
                );
              })
            : null}

          {showRegulatory
            ? readAcross.map((precedent) => {
                const signal = precedentToSignal(precedent);
                return (
                  <HorizonCard
                    key={precedent.id}
                    kicker="Enforcement read-across"
                    title={precedent.respondent}
                    source={precedent.regulator}
                    sourceUrl={precedent.sourceUrl || undefined}
                    date={formatDate(precedent.noticeDate)}
                    summary={precedent.hook}
                    categoryLabel={categoryLabel(signal.domainId)}
                    onInvestigate={() => openDrawer(signal, null)}
                    onAccept={() => openDrawer(signal, "accept")}
                  />
                );
              })
            : null}

          {showIndustry
            ? industry.map((item) => {
                const signal = horizonItemToSignal(item);
                const selectId = `relevance-${item.id}`;
                return (
                  <HorizonCard
                    key={item.id}
                    kicker="Industry event"
                    title={item.title}
                    source={item.source}
                    sourceUrl={item.sourceUrl}
                    date={formatDate(item.date)}
                    summary={item.summary}
                    categoryLabel={categoryLabel(item.categoryId)}
                    onInvestigate={() => openDrawer(signal, null)}
                    onAccept={() => openDrawer(signal, "accept")}
                  >
                    <div className="mt-2 flex items-center gap-2">
                      <label htmlFor={selectId} className="text-[11px] font-semibold text-slate-700">
                        Relevant to us?
                      </label>
                      <select
                        id={selectId}
                        value={relevance[item.id] ?? item.relevance}
                        onChange={(e) =>
                          setRelevance((prev) => ({
                            ...prev,
                            [item.id]: e.target.value as HorizonItem["relevance"],
                          }))
                        }
                        className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-700"
                      >
                        {RELEVANCE.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </HorizonCard>
                );
              })
            : null}

          {showEmerging
            ? emerging.map((item) => {
                const signal = horizonItemToSignal(item);
                return (
                  <HorizonCard
                    key={item.id}
                    kicker="Emerging risk"
                    title={item.title}
                    source={item.source}
                    sourceUrl={item.sourceUrl}
                    date={formatDate(item.date)}
                    summary={item.summary}
                    categoryLabel={categoryLabel(item.categoryId)}
                    owner={item.owner}
                    onInvestigate={() => openDrawer(signal, null)}
                    onAccept={() => openDrawer(signal, "accept")}
                  />
                );
              })
            : null}
        </div>
      </div>

      {open ? (
        <SignalInvestigationDrawer
          signal={open.signal}
          precedent={precedentForSignal(jurisdiction, open.signal, expandedId)}
          auditEntries={log[open.signal.id] ?? []}
          initialAction={open.action}
          onRecord={appendEntry}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}

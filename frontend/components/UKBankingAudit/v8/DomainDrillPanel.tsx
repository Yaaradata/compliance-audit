"use client";

import { useMemo, useState, type ReactNode } from "react";
import { formatDate } from "@/lib/ukbankingaudit/v8/boardView";
import { buildCategoryDrill, pathSummaryText } from "@/lib/ukbankingaudit/v8/categoryDrillView";
import { getOwnershipState } from "@/lib/ukbankingaudit/v8/ownershipData";
import { matchPrecedents } from "@/lib/ukbankingaudit/v8/precedentCorpus";
import {
  CRSA_DATA,
  CRSA_MECHANISM_TAGS,
  DOMAIN_ACCOUNTABILITY,
} from "@/lib/ukbankingaudit/v8/riskDomainsV8";
import type { ControlResult, IncidentControlLink, Precedent } from "@/lib/ukbankingaudit/v8/types";
import { CrsaTable } from "./CrsaTable";
import { RagBadge } from "./FirmPostureSummary";
import { OwnerChip } from "./OwnerChip";
import { PathToGreenDrawer, type PathTarget } from "./PathToGreenDrawer";
import { PrecedentBanner } from "./PrecedentBanner";
import { RAG_STYLES } from "./ragTokens";
import { RatingTrendChip } from "./RatingTrendChip";
import { RemediationTimeline } from "./RemediationTimeline";
import type { RagStatus, RiskDomainV4 } from "./types";
import { useRiskState } from "./useRiskStore";

type Props = {
  domain: RiskDomainV4;
  onClose: () => void;
};

const RESULT_LABEL: Record<ControlResult, string> = {
  effective: "Effective",
  partially_effective: "Partially effective",
  not_effective: "Not effective",
};

const WORKED_LABEL: Record<IncidentControlLink["controlWorked"], { text: string; className: string }> = {
  worked: { text: "Control worked", className: "text-emerald-700" },
  partial: { text: "Control partially worked", className: "text-amber-700" },
  failed: { text: "Control failed", className: "text-red-700" },
};

const TREND_ARROW = {
  worse: { arrow: "▲", className: "text-red-700", label: "Worse than last period" },
  better: { arrow: "▼", className: "text-emerald-700", label: "Better than last period" },
  flat: { arrow: "▬", className: "text-slate-500", label: "No change from last period" },
};

function DrillSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-200 pt-4">
      <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">{title}</h3>
      {children}
    </section>
  );
}

/** Accountable owner and SMF for the open category. */
function AccountableOwner({ domainId }: { domainId: string }) {
  const own = getOwnershipState(domainId);
  const acc = DOMAIN_ACCOUNTABILITY[domainId];

  if (own.state === "UNALLOCATED") {
    return (
      <p className="text-[11.5px] leading-snug text-slate-600">
        Accountable owner: <span className="font-semibold text-red-600">unallocated</span>
        {" — SYSC 26 requires an allocated holder"}
      </p>
    );
  }
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] leading-snug text-slate-600">
      <span>Accountable owner:</span>
      {acc ? <OwnerChip accountability={acc} /> : null}
      {own.trailAgeDays !== null ? (
        <span>
          · last step{" "}
          <span className={own.state === "OWNED_STALE" ? "font-semibold text-amber-600" : undefined}>
            {own.trailAgeDays} days ago
          </span>
        </span>
      ) : null}
    </p>
  );
}

/** For a CRSA area, the precedents matched by any control's mechanism tags (deduped by precedent). */
function crsaPrecedentMatches(area: string, domainId: string): { precedent: Precedent; crsaRef: string }[] {
  const rows = CRSA_DATA[area] ?? [];
  const seen = new Set<string>();
  const matches: { precedent: Precedent; crsaRef: string }[] = [];
  for (const row of rows) {
    const tags = CRSA_MECHANISM_TAGS[row.ref];
    if (!tags) continue;
    for (const precedent of matchPrecedents(tags, "UK", domainId)) {
      if (seen.has(precedent.id)) continue;
      seen.add(precedent.id);
      matches.push({ precedent, crsaRef: row.ref });
    }
  }
  return matches;
}

function ExpandButton({ open, onClick, children }: { open: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      {open ? "▴" : "▾"} {children}
    </button>
  );
}

/** One scrolling category page, the same five sections in the same order for every category. */
export function DomainDrillPanel({ domain, onClose }: Props) {
  const { data } = useRiskState();
  const [expandedSub, setExpandedSub] = useState<number | null>(null);
  const [showRemediation, setShowRemediation] = useState(false);
  const [showCrsa, setShowCrsa] = useState(false);
  const [pathTarget, setPathTarget] = useState<PathTarget | null>(null);

  const drill = useMemo(() => buildCategoryDrill(domain.id, data.config.currentPeriod, data), [domain.id, data]);
  const { tile, tests } = drill;
  const rag = RAG_STYLES[tile.colour];
  const precedentMatches = useMemo(
    () => (domain.crsa ? crsaPrecedentMatches(domain.crsa, domain.id) : []),
    [domain.crsa, domain.id],
  );
  const nextPath = drill.nextPath;

  return (
    <div
      className={`uk-v4-slide-down overflow-hidden rounded-b-[10px] border-[1.5px] border-t-0 bg-white ${rag.border}`}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="space-y-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-[11.5px] text-slate-400 hover:text-slate-600"
          >
            Enterprise Risk Profile
          </button>
          <span className="text-[11px] text-slate-300">›</span>
          <span className="text-[11.5px] font-semibold text-slate-700">{tile.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-900">Residual rating:</span>
          <RagBadge status={tile.colour.toUpperCase() as RagStatus} />
          <RatingTrendChip trend={tile.trend} showText />
        </div>
        <p className="text-[12.5px] leading-snug text-slate-700">{tile.why}</p>
        {tile.colour !== "green" ? (
          tile.path ? (
            <button
              type="button"
              onClick={() =>
                tile.path &&
                setPathTarget({
                  targetType: tile.path.targetType,
                  targetId: tile.path.targetId,
                  label: `${tile.label}: ${tile.path.targetId}`,
                  owner: tile.path.owner,
                })
              }
              className="rounded border border-slate-200 bg-white px-2 py-1 text-left text-[11px] font-semibold text-slate-700 hover:border-slate-400"
            >
              Path to green: {tile.path.targetLabel} · {tile.path.owner}
            </button>
          ) : (
            <span className="inline-block rounded border border-red-300 bg-white px-2 py-1 text-[11px] font-bold text-red-700">
              No path to green
            </span>
          )
        ) : null}
        <AccountableOwner domainId={domain.id} />
      </header>

      {domain.subCategories.length > 0 ? (
        <div className="flex flex-col gap-1 px-[18px] pt-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Level-2 risks</div>
          {domain.subCategories.map((sub, idx) => {
            const srag = RAG_STYLES[sub.status === "RED" ? "red" : sub.status === "AMBER" ? "amber" : "green"];
            const open = expandedSub === idx;
            return (
              <div key={sub.name}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setExpandedSub(open ? null : idx)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all ${
                    open ? `${srag.bg} ${srag.border} rounded-b-none` : "border-slate-200 bg-stone-50/80"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${srag.dot}`} />
                  <span className="flex-1 text-[13px] font-semibold text-slate-900">{sub.name}</span>
                  <RagBadge status={sub.status} />
                  <span className={`text-[11px] text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
                </button>
                {open ? (
                  <div className={`uk-v4-slide-down-fast rounded-b-lg border border-t-0 bg-white px-3.5 py-3 ${srag.border}`}>
                    <p className="text-xs leading-relaxed text-slate-600">{sub.desc}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-4 p-[18px]">
        <DrillSection title="Risk appetite">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[12.5px]">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-1 pr-3">RAM</th>
                  <th scope="col" className="pr-3 text-right">Value</th>
                  <th scope="col" className="pr-3 text-right">Limit</th>
                  <th scope="col" className="pr-3 text-right">Tolerance</th>
                  <th scope="col" className="pr-3">Status</th>
                  <th scope="col">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drill.rams.map((ram) => {
                  const chip = RAG_STYLES[ram.status];
                  const trend = TREND_ARROW[ram.trend];
                  return (
                    <tr key={ram.id}>
                      <td className="py-1.5 pr-3 font-medium text-slate-900">
                        {ram.status === "green" ? (
                          ram.name
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setPathTarget({ targetType: "ram", targetId: ram.id, label: ram.name, owner: ram.owner })
                            }
                            className="text-left text-indigo-700 underline decoration-indigo-300 underline-offset-2"
                          >
                            {ram.name}
                          </button>
                        )}
                      </td>
                      <td className="pr-3 text-right font-semibold text-slate-900">{ram.valueText}</td>
                      <td className="pr-3 text-right text-slate-600">{ram.limitText}</td>
                      <td className="pr-3 text-right text-slate-600">{ram.toleranceText}</td>
                      <td className="pr-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${chip.badge} ${chip.badgeText}`}>
                          {ram.status}
                        </span>
                      </td>
                      <td>
                        <span title={trend.label} aria-label={trend.label} className={`font-bold ${trend.className}`}>
                          {trend.arrow}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DrillSection>

        <DrillSection title="Control effectiveness">
          <p className="text-[13px] font-semibold text-slate-800">
            Critical controls effective: {drill.effectivePct}%
            {drill.previousEffectivePct !== null ? (
              <span className="font-normal text-slate-600">
                {" "}
                ({drill.previousLabel}: {drill.previousEffectivePct}%)
              </span>
            ) : null}
          </p>
          {drill.weakControls.length > 0 ? (
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {drill.weakControls.map((control) => (
                <li key={control.id} className="px-3 py-2 text-[12px] text-slate-700">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-mono text-[11px] text-slate-500">{control.id}</span>
                    <span className="font-semibold text-slate-900">{control.name}</span>
                    <span className="font-semibold text-red-700">{RESULT_LABEL[control.result]}</span>
                    <span className="text-slate-500">Last tested {formatDate(control.lastTested)}</span>
                  </div>
                  <p className="mt-0.5">{control.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-slate-600">All critical controls tested effective.</p>
          )}
        </DrillSection>

        <DrillSection title="Testing & evidence">
          <dl className="grid grid-cols-2 gap-3 text-[12px] md:grid-cols-4">
            <div>
              <dt className="text-slate-500">Critical controls</dt>
              <dd className="font-semibold text-slate-900">{tests.criticalCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tests due in 30 days</dt>
              <dd className="font-semibold text-slate-900">{tests.dueNext30Days}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tests overdue</dt>
              <dd className={`font-semibold ${tests.overdue.length ? "text-red-700" : "text-slate-900"}`}>
                {tests.overdue.length}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Latest evidence</dt>
              <dd className="font-semibold text-slate-900">
                {tests.latestEvidenceDate ? formatDate(tests.latestEvidenceDate) : "None on record"}
              </dd>
            </div>
          </dl>
          {tests.overdue.map((row) => (
            <p key={row.id} className="mt-2 text-[12px] text-red-700">
              Overdue: {row.id} {row.name}, due {formatDate(row.dueDate)}
            </p>
          ))}
          {tile.colour === "green" && tests.withoutEvidence.length > 0 ? (
            <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-[12px] font-medium text-amber-900">
              ⚠ Green without evidence: {tests.withoutEvidence.map((c) => c.name).join(", ")} have no evidence artefact
              this cycle.
            </p>
          ) : null}
          {tile.colour !== "green" && tests.withoutEvidence.length > 0 ? (
            <p className="mt-2 text-[12px] text-amber-800">
              No evidence artefact this cycle: {tests.withoutEvidence.map((c) => c.name).join(", ")}.
            </p>
          ) : null}
          {domain.crsa ? (
            <div className="mt-3">
              <ExpandButton open={showCrsa} onClick={() => setShowCrsa((v) => !v)}>
                CRSA controls
              </ExpandButton>
              {showCrsa ? (
                <div className="mt-3">
                  {precedentMatches.map((m) => (
                    <PrecedentBanner key={m.precedent.id} precedent={m.precedent} crsaRef={m.crsaRef} />
                  ))}
                  <CrsaTable area={domain.crsa} domainName={tile.label} />
                </div>
              ) : null}
            </div>
          ) : null}
        </DrillSection>

        <DrillSection title="Trend">
          <ol className="flex flex-wrap items-center gap-1.5">
            {drill.history.map((point, i) => (
              <li key={point.period} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-slate-400" aria-hidden="true">→</span> : null}
                <span className="text-[11px] text-slate-600">{point.label}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${RAG_STYLES[point.colour].badge} ${RAG_STYLES[point.colour].badgeText}`}>
                  {point.colour}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[12.5px] text-slate-700">{drill.trendCause}</p>
          {drill.earlyWarning ? (
            <p className={`mt-1 text-[12px] ${drill.earlyWarning.flagged ? "font-medium text-amber-800" : "text-slate-600"}`}>
              {drill.earlyWarning.text}
            </p>
          ) : null}
        </DrillSection>

        <DrillSection title="Incidents">
          {drill.incidents.length === 0 ? (
            <p className="text-xs text-slate-600">No open or new Sev-1 or Sev-2 incidents.</p>
          ) : (
            <ul className="space-y-2">
              {drill.incidents.map((incident) => (
                <li key={incident.id} className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-700">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-bold text-slate-900">{incident.severity}</span>
                    <span className="font-semibold text-slate-900">{incident.title}</span>
                    <span className="text-slate-500">
                      {formatDate(incident.date)} · {incident.status}
                    </span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {incident.links.map((link) => (
                      <li key={link.controlId}>
                        {link.controlId} {link.controlName}:{" "}
                        <span className={`font-semibold ${WORKED_LABEL[link.worked].className}`}>
                          {WORKED_LABEL[link.worked].text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </DrillSection>

        {domain.remediation ? (
          <DrillSection title="Path to green">
            {nextPath ? (
              <p className="text-[12.5px] text-slate-700">{pathSummaryText(nextPath)}</p>
            ) : (
              <p className="text-[12.5px] font-semibold text-red-700">No path to green</p>
            )}
            <div className="mt-2">
              <ExpandButton open={showRemediation} onClick={() => setShowRemediation((v) => !v)}>
                Remediation detail
              </ExpandButton>
            </div>
            {showRemediation ? (
              <div className="mt-3">
                <RemediationTimeline domainName={tile.label} plan={domain.remediation} />
              </div>
            ) : null}
          </DrillSection>
        ) : null}
      </div>

      {pathTarget ? <PathToGreenDrawer target={pathTarget} onClose={() => setPathTarget(null)} /> : null}
    </div>
  );
}

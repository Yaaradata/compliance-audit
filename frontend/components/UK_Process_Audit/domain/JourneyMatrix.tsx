"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
} from "lucide-react";
import type {
  UkAuditControl,
  UkCaseTrailItem,
  UkDomainEntity,
  UkDomainSop,
  UkJourneyCase,
} from "@/lib/UK_Process_Audit/types";
import {
  Avatar,
  JourneyAuditPill,
  JourneyStageCell,
  StageStatusChip,
} from "../shared/journeyUi";

type CasePanel =
  | { caseId: string; view: "full" }
  | { caseId: string; view: "stage"; stageIndex: number }
  | null;

function auditCategory(kase: UkJourneyCase): "compliant" | "exception" | "critical" {
  if (kase.overallStatus === "failure") return "critical";
  if (kase.overallStatus === "pending") return "exception";
  return "compliant";
}

export function JourneyMatrix({
  sop,
  cases,
  entity,
  journeyTitle,
  controls,
  controlExceptionLabelById,
  onOpenEvidence,
}: {
  sop: UkDomainSop;
  cases: UkJourneyCase[];
  entity: UkDomainEntity;
  journeyTitle: string;
  controls: UkAuditControl[];
  controlExceptionLabelById: Record<string, string>;
  onOpenEvidence: (control: UkAuditControl) => void;
}) {
  const [panel, setPanel] = useState<CasePanel>(null);
  const controlsById = useMemo(
    () => Object.fromEntries(controls.map((c) => [c.controlId, c])),
    [controls],
  );
  const stageColSpan = 3 + sop.stages.length;

  const toggleFull = (caseId: string) =>
    setPanel((prev) => (prev?.caseId === caseId && prev.view === "full" ? null : { caseId, view: "full" }));

  const toggleStage = (caseId: string, stageIndex: number, status: string) => {
    if (status !== "accepted" && status !== "rejected") return;
    setPanel((prev) =>
      prev?.caseId === caseId && prev.view === "stage" && prev.stageIndex === stageIndex
        ? null
        : { caseId, view: "stage", stageIndex },
    );
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 bg-slate-100/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-hidden />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.06em] text-indigo-950 md:text-xs">{journeyTitle}</h3>
        </div>
        <p className="mt-1 pl-4 text-[11px] leading-relaxed text-slate-600">
          Each column is an SOP stage. <span className="font-semibold text-emerald-700">Green</span> = passed,{" "}
          <span className="font-semibold text-red-700">Red</span> = failed,{" "}
          <span className="font-semibold text-sky-700">R</span> = in review, <span className="font-semibold text-slate-500">Grey</span> = blocked.
          Click the <span className="font-semibold text-slate-700">{entity.singular}</span> for all stages; click a green or red cell for one stage.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <th className="whitespace-nowrap px-3 py-2.5 pl-4">{entity.singular}</th>
              {sop.stages.map((st) => (
                <th key={st.id} className="px-1 py-2.5 text-center font-semibold" title={st.name}>
                  {st.header}
                </th>
              ))}
              <th className="min-w-[140px] px-2 py-2.5">Exception</th>
              <th className="whitespace-nowrap px-3 py-2.5 pr-4 text-center">Audit status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.map((kase) => {
              const panelOpen = panel?.caseId === kase.id;
              const showFull = panelOpen && panel.view === "full";
              const showStage =
                panelOpen &&
                panel.view === "stage" &&
                (kase.trail[panel.stageIndex]?.status === "accepted" ||
                  kase.trail[panel.stageIndex]?.status === "rejected");
              const cat = auditCategory(kase);
              const excText = kase.journeyException ?? "—";

              return (
                <Fragment key={kase.id}>
                  <tr className="bg-white transition-colors hover:bg-slate-50/80">
                    <td className="max-w-[220px] px-3 py-2.5 pl-4 align-middle">
                      <button
                        type="button"
                        onClick={() => toggleFull(kase.id)}
                        className="-m-1 flex w-full items-start gap-2 rounded-md p-1 text-left hover:bg-slate-100/80"
                        aria-expanded={showFull}
                      >
                        <span className="mt-0.5 shrink-0 text-slate-400">
                          {panelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold leading-snug text-slate-900">{kase.subject}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-slate-500">{kase.id}</div>
                          <div className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{kase.segment}</div>
                        </div>
                      </button>
                    </td>
                    {kase.trail.map((t, stageIdx) => (
                      <td key={t.stage.id} className="px-1 py-2 text-center align-middle">
                        <JourneyStageCell
                          status={t.status}
                          stageName={t.stage.name}
                          isSelected={showStage && panel.view === "stage" && panel.stageIndex === stageIdx}
                          onSelect={() => toggleStage(kase.id, stageIdx, t.status)}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 align-middle">
                      {cat !== "compliant" && excText !== "—" ? (
                        <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200">
                          {excText}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 pr-4 text-center align-middle">
                      <JourneyAuditPill category={cat} />
                    </td>
                  </tr>

                  {(showFull || showStage) && (
                    <tr className="bg-slate-50/90">
                      <td colSpan={stageColSpan} className="border-t border-slate-100 px-4 py-4">
                        {showFull ? (
                          <FullCaseTrail kase={kase} controlsById={controlsById} onOpenEvidence={onOpenEvidence} onClose={() => setPanel(null)} />
                        ) : (
                          <StageDetailBlock
                            kase={kase}
                            item={kase.trail[panel.view === "stage" ? panel.stageIndex : 0]}
                            idx={panel.view === "stage" ? panel.stageIndex : 0}
                            controlsById={controlsById}
                            controlExceptionLabelById={controlExceptionLabelById}
                            onOpenEvidence={onOpenEvidence}
                            onClose={() => setPanel(null)}
                          />
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {cases.length === 0 && (
              <tr>
                <td colSpan={stageColSpan} className="py-10 text-center text-sm text-slate-500">
                  No {entity.plural.toLowerCase()} configured for this domain yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StageDetailBlock({
  kase,
  item,
  idx,
  controlsById,
  controlExceptionLabelById,
  onOpenEvidence,
  onClose,
  embedded = false,
}: {
  kase: UkJourneyCase;
  item: UkCaseTrailItem;
  idx: number;
  controlsById: Record<string, UkAuditControl>;
  controlExceptionLabelById: Record<string, string>;
  onOpenEvidence: (control: UkAuditControl) => void;
  onClose?: () => void;
  embedded?: boolean;
}) {
  const ringMap: Record<string, string> = {
    accepted: "ring-emerald-200 bg-white",
    rejected: "ring-red-300 bg-red-50/30",
    pending: "ring-amber-300 bg-amber-50/30",
    blocked: "ring-slate-200 bg-slate-50/60",
  };

  return (
    <div>
      {!embedded && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Stage detail · {item.stage.name} · {kase.id}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto shrink-0 rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
            >
              Close
            </button>
          )}
        </div>
      )}
      <div className={`rounded-lg p-4 ring-1 ${ringMap[item.status] ?? ringMap.blocked}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Stage {idx + 1} · {item.stage.name}</span>
              <StageStatusChip status={item.status} />
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {item.stage.owner.role} · {item.stage.owner.team}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name={item.submittedBy?.name} />
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-900">{item.submittedBy?.name ?? "Not yet submitted"}</div>
              <div className="text-[10px] text-slate-500">{item.submittedBy?.empId ?? "—"} · {item.submittedAt ?? "—"}</div>
            </div>
          </div>
        </div>

        {item.evidenceItems.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {item.evidenceItems.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span className="truncate text-[11px] font-medium text-slate-700">{ev.name}</span>
                <span className="ml-auto text-[10px] uppercase text-slate-400">{ev.type}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 space-y-1.5">
          {item.stage.controlIds.map((cid) => {
            const control = controlsById[cid];
            if (!control) return null;
            const result = item.controlResults[cid] ?? "not-started";
            const resultTone: Record<string, string> = {
              pass: "text-emerald-700",
              fail: "text-red-700",
              pending: "text-amber-700",
              "not-started": "text-slate-400",
            };
            return (
              <div key={cid} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] font-semibold text-slate-700">{cid}</span>
                  <span className="ml-2 text-[12px] text-slate-700">{controlExceptionLabelById[cid] ?? control.sopStep}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold capitalize ${resultTone[result]}`}>{result.replace("-", " ")}</span>
                  <button
                    type="button"
                    onClick={() => onOpenEvidence(control)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-900 hover:text-white hover:ring-slate-900"
                  >
                    <Eye className="h-3 w-3" /> Evidence
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FullCaseTrail({
  kase,
  controlsById,
  onOpenEvidence,
  onClose,
}: {
  kase: UkJourneyCase;
  controlsById: Record<string, UkAuditControl>;
  onOpenEvidence: (control: UkAuditControl) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Full evidence trail · {kase.subject} · {kase.id}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
        >
          Close
        </button>
      </div>
      <div className="space-y-3">
        {kase.trail.map((item, idx) => (
          <StageDetailBlock
            key={item.stage.id}
            kase={kase}
            item={item}
            idx={idx}
            controlsById={controlsById}
            controlExceptionLabelById={{}}
            onOpenEvidence={onOpenEvidence}
            embedded
          />
        ))}
      </div>
    </div>
  );
}

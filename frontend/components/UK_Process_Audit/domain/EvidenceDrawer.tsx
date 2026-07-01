"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileCheck2,
  FileText,
  FolderSearch,
  GitBranch,
  MinusCircle,
  UserCheck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import type { UkControlResult, UkEvidencePack } from "@/lib/UK_Process_Audit/types";
import { Avatar, ComplianceCell, StatusBadge } from "../shared/journeyUi";
import { ResidualPill } from "../shared/pills";

export function EvidenceDrawer({
  evidence,
  onClose,
}: {
  evidence: UkEvidencePack | null;
  onClose: () => void;
}) {
  if (!evidence) return null;
  const {
    control: c,
    domainLabel,
    lastTested,
    tester,
    testingSteps,
    exceptionLog,
    sourceSystems,
    documents,
    auditorNote,
    mgmtResponse,
    stageSubmitters,
    sampleCaseTrails,
  } = evidence;

  const passed = c.sample - c.exceptions;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" aria-label="Close evidence" className="flex-1 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />

      <aside className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{domainLabel}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-[11px] text-slate-600">{c.controlId}</span>
                <StatusBadge status={c.status} />
              </div>
              <h3 className="text-base font-semibold leading-snug text-slate-900">{c.sopStep}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{c.controlDescription}</p>
            </div>
            <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            <StatBox label="Pass rate" sub="across sample" value={<ComplianceCell v={c.compliance} />} />
            <StatBox label="Sample in scope" sub="this quarter" value={<span className="text-base font-semibold text-slate-900">{c.sample.toLocaleString("en-GB")}</span>} />
            <StatBox label="Passed" sub="evidence accepted" tone="emerald" value={<span className="text-base font-semibold text-emerald-700">{passed.toLocaleString("en-GB")}</span>} />
            <StatBox
              label="Failed"
              sub="need remediation"
              tone="amber"
              value={
                <span className="text-base font-semibold text-amber-700">
                  {c.exceptions} <span className="text-[10px] font-medium text-red-700">({c.violations} critical)</span>
                </span>
              }
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <Section title="Control metadata">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Meta label="Owner" value={c.controlOwnerRole} />
              <Meta label="Frequency" value={c.testingFrequency} />
              <Meta label="Nature" value={`${c.controlNature} · ${c.controlSource} · ${c.automationLevel}`} full />
              <Meta label="Regulatory reference" value={`${c.primaryObligation} (${c.issuingBody})`} full />
              <Meta label="Last tested" value={lastTested} />
              <Meta label="Tester" value={tester} />
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-slate-500">Residual risk:</span>
                <ResidualPill risk={c.residualRisk} />
              </div>
            </div>
          </Section>

          {stageSubmitters.length > 0 && (
            <Section title="Accountable evidence submitters" icon={<UserRound className="h-3.5 w-3.5" />}>
              <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
                This control fires at {stageSubmitters.length} SOP stage{stageSubmitters.length > 1 ? "s" : ""}. At each stage the role below is
                accountable to submit the evidence.
              </p>
              <div className="space-y-2">
                {stageSubmitters.map(({ sopName, stage }, i) => (
                  <div key={i} className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{sopName}</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-900">Stage: {stage.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-900">{stage.owner.role}</div>
                        <div className="text-[11px] text-slate-500">{stage.owner.team}</div>
                      </div>
                    </div>
                    <div className="mt-2 rounded bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Submits: </span>
                      {stage.owner.submits}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {sampleCaseTrails.length > 0 && (
            <Section title={`Sample case evidence trails (${sampleCaseTrails.length})`} icon={<GitBranch className="h-3.5 w-3.5" />}>
              <div className="space-y-2">
                {sampleCaseTrails.map(({ kase, hit }, i) => {
                  const result: UkControlResult = hit.controlResults[c.controlId] ?? "not-started";
                  const resMap: Record<UkControlResult, { bg: string; fg: string; ring: string; label: string; icon: typeof CheckCircle2 }> = {
                    pass: { bg: "bg-emerald-50", fg: "text-emerald-700", ring: "ring-emerald-200", label: "Passed", icon: CheckCircle2 },
                    fail: { bg: "bg-red-50", fg: "text-red-700", ring: "ring-red-200", label: "Failed", icon: XCircle },
                    pending: { bg: "bg-amber-50", fg: "text-amber-700", ring: "ring-amber-200", label: "Pending", icon: Clock },
                    "not-started": { bg: "bg-slate-50", fg: "text-slate-500", ring: "ring-slate-200", label: "Not yet", icon: MinusCircle },
                  };
                  const r = resMap[result];
                  const ResIcon = r.icon;
                  return (
                    <div key={i} className={`rounded-md p-3 ring-1 ${r.ring} ${r.bg}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-600">{kase.id}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-xs font-semibold text-slate-900">{kase.subject}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">{kase.segment} · Opened {kase.opened}</div>
                          <div className="mt-1 text-[11px] text-slate-600">
                            <span className="font-semibold">Fired at: </span>Stage — {hit.stage.name}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[11px] font-semibold ring-1 ${r.fg} ${r.ring}`}>
                          <ResIcon className="h-3 w-3" /> {r.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 rounded bg-white px-2 py-1.5 ring-1 ring-slate-200">
                        <Avatar name={hit.submittedBy?.name} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] font-semibold text-slate-900">{hit.submittedBy?.name ?? "Not yet submitted"}</div>
                          <div className="truncate text-[10px] text-slate-500">{hit.stage.owner.role} · {hit.stage.owner.team}</div>
                        </div>
                        {hit.evidenceItems.length > 0 && (
                          <div className="whitespace-nowrap text-right text-[10px] text-slate-500">
                            <FileText className="-mt-0.5 mr-0.5 inline h-3 w-3" />
                            {hit.evidenceItems.length} file{hit.evidenceItems.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="Testing procedure performed" icon={<FileCheck2 className="h-3.5 w-3.5" />}>
            <ol className="list-inside list-decimal space-y-1.5 text-xs text-slate-700">
              {testingSteps.map((s, i) => (
                <li key={i} className="leading-relaxed">{s}</li>
              ))}
            </ol>
          </Section>

          <Section title={`Exception log (${c.exceptions})`} icon={<AlertTriangle className="h-3.5 w-3.5" />}>
            {exceptionLog.length === 0 ? (
              <div className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-emerald-200">
                No exceptions raised for this control this cycle.
              </div>
            ) : (
              <div className="overflow-hidden rounded-md ring-1 ring-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2 font-semibold">Ref</th>
                      <th className="px-3 py-2 font-semibold">Detail</th>
                      <th className="px-3 py-2 font-semibold">Severity</th>
                      <th className="px-3 py-2 font-semibold">SLA</th>
                      <th className="px-3 py-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceptionLog.map((e) => (
                      <tr key={e.ref} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{e.ref}</td>
                        <td className="px-3 py-2 text-slate-700">{e.detail}</td>
                        <td className="px-3 py-2"><ResidualPill risk={e.severity} /></td>
                        <td className="px-3 py-2">
                          <span className={e.sla === "Breached" ? "font-medium text-red-700" : "font-medium text-emerald-700"}>{e.sla}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{e.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Source systems & data pulled" icon={<Database className="h-3.5 w-3.5" />}>
            <div className="space-y-1.5">
              {sourceSystems.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-slate-500"> — {s.record}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Workpapers & supporting documents" icon={<FolderSearch className="h-3.5 w-3.5" />}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="truncate text-xs font-medium text-slate-800">{d.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-500">{d.type}</span>
                    <span className="text-[10px] text-slate-400">{d.size}</span>
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <section className="grid grid-cols-1 gap-3">
            <div className="rounded-md p-3 ring-1 ring-slate-200">
              <div className="mb-1.5 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Auditor conclusion</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">{auditorNote}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Management response</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">{mgmtResponse}</p>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div className="text-[11px] text-slate-500">Evidence schema v1.0 · Locked workpaper</div>
          <div className="flex gap-2">
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100">
              <Download className="h-3.5 w-3.5" /> Download pack
            </button>
            <button type="button" onClick={onClose} className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800">
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}

function StatBox({ label, sub, value, tone = "slate" }: { label: string; sub: string; value: React.ReactNode; tone?: "slate" | "emerald" | "amber" }) {
  const labelTone = tone === "emerald" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : "text-slate-500";
  return (
    <div className="rounded bg-slate-50 p-2.5">
      <div className={`text-[10px] font-semibold uppercase tracking-wider ${labelTone}`}>{label}</div>
      <div className="text-base font-semibold text-slate-900">{value}</div>
      <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}

function Meta({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <span className="text-slate-500">{label}: </span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

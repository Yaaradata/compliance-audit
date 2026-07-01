"use client";

import { useCallback, useMemo, useState } from "react";
import { Building2, Download, Eye, Filter } from "lucide-react";
import { buildUkEvidence, getUkProcessAuditData } from "@/lib/UK_Process_Audit";
import type {
  UkAuditControl,
  UkEvidencePack,
  UkProcessAuditDomainId,
  UkProcessAuditTabId,
} from "@/lib/UK_Process_Audit/types";
import { DomainSidebar } from "./DomainSidebar";
import { DomainWorkspace } from "./domain/DomainWorkspace";
import { EvidenceDrawer } from "./domain/EvidenceDrawer";
import { OverviewTab } from "./overview/OverviewTab";
import { useUkpaVersion } from "./ukpa/UkpaVersionProvider";

export default function UKProcessAuditDashboard() {
  const data = useMemo(() => getUkProcessAuditData(), []);
  const version = useUkpaVersion();
  const [activeTab, setActiveTab] = useState<UkProcessAuditTabId>("overview");
  const [evidence, setEvidence] = useState<UkEvidencePack | null>(null);

  const activeDomain = data.domains.find((d) => d.id === activeTab);
  const isOverview = activeTab === "overview";
  const domainId = activeTab as UkProcessAuditDomainId;

  const openEvidence = useCallback(
    (control: UkAuditControl) => {
      const id = control.domainCode;
      setEvidence(
        buildUkEvidence(control, {
          domainLabel: data.domainMeta[id].label,
          sop: data.sopByDomain[id],
          cases: data.casesByDomain[id],
        }),
      );
    },
    [data],
  );

  return (
    <div
      className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-100 text-slate-900"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif' }}
    >
      {/* Top bar */}
      <header className="z-30 shrink-0 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br from-sky-400 to-indigo-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">UK Banking Process Audit</div>
              <div className="text-[11px] leading-tight text-slate-400">
                Operational process &amp; control intelligence · {version.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-xs font-medium">Audit Lead</div>
              <div className="text-[10px] text-slate-400">{data.overview.lastAuditCycle}</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold">
              AL
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <DomainSidebar
          domains={data.domains}
          activeTab={activeTab}
          onSelect={setActiveTab}
          controlsByDomain={data.controlsByDomain}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto">
          <div className="mx-auto max-w-[1600px] px-6 py-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-slate-900">
                  {activeDomain?.label ?? "Overview"}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {isOverview
                    ? `Cross-domain compliance posture across ${data.overview.totalControls} controls and ${data.overview.totalDomains} process domains`
                    : "All controls in scope · SOP flow · regulatory references · evidence on demand"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" /> Filter
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" /> Export
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
                >
                  <Eye className="h-4 w-4" /> Auditor view
                </button>
              </div>
            </div>

            {isOverview ? (
              <OverviewTab
                overview={data.overview}
                domainCards={data.domainCards}
                onDrillDown={(id) => setActiveTab(id)}
              />
            ) : (
              <DomainWorkspace
                controls={data.controlsByDomain[domainId]}
                sop={data.sopByDomain[domainId]}
                cases={data.casesByDomain[domainId]}
                entity={data.entityByDomain[domainId]}
                journeyTitle={data.journeyTitleByDomain[domainId]}
                controlExceptionLabelById={data.controlExceptionLabelById}
                onOpenEvidence={openEvidence}
              />
            )}
          </div>
        </main>
      </div>

      <EvidenceDrawer evidence={evidence} onClose={() => setEvidence(null)} />
    </div>
  );
}

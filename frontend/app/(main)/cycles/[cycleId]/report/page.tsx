"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import type { ReportSection } from "@/lib/types";

interface ApiReport {
  id: string;
  cycle_id: string;
  report_kind: string;
  sections: ReportSection[];
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  { name: "Executive Summary", status: "draft", ai: true },
  { name: "Scope Statement", status: "draft", ai: false },
  { name: "Methodology", status: "draft", ai: false },
  { name: "Control Assessments", status: "draft", ai: true },
  { name: "Gap Analysis", status: "draft", ai: true },
  { name: "Evidence Index", status: "draft", ai: false },
  { name: "Glossary", status: "draft", ai: false },
];

export default function CycleReportPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!cycleId) { setSections([]); setLoading(false); return; }
    setLoading(true);
    api.get<ApiReport[]>(`/assessments/${cycleId}/reports`)
      .then((reports) => {
        if (reports.length > 0) {
          const latest = reports[0];
          setReportId(latest.id);
          setSections(latest.sections.length > 0 ? latest.sections : DEFAULT_SECTIONS);
        } else {
          setSections([]);
        }
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, [cycleId]);

  const completeSections = sections.filter((s) => s.status === "complete").length;
  const currentSection = sections[activeSection] ?? null;

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-sm">Loading reports…</div>;
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm mb-3">No reports yet. Reports will be generated once assessment data is available.</p>
        {cycleId && (
          <button
            onClick={() => {
              api.post<ApiReport>(`/assessments/${cycleId}/reports`, { report_kind: "draft" })
                .then((r) => {
                  setReportId(r.id);
                  setSections(r.sections.length > 0 ? r.sections : DEFAULT_SECTIONS);
                })
                .catch(() => {});
            }}
            className="px-4 py-2 rounded-lg bg-[#0c2340] text-white text-sm font-semibold hover:bg-[#0f2d52]"
          >
            Generate Draft Report
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[220px_1fr] gap-5">
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="text-sm font-semibold text-gray-700 mb-2.5">Report Sections</div>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(i)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left mb-0.5 transition-colors ${i === activeSection ? "bg-blue-50" : "hover:bg-gray-50"}`}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.status === "complete" ? "#059669" : s.status === "in_progress" ? "#d97706" : "#93c5fd" }} />
            <span className={`text-[11px] ${i === activeSection ? "text-blue-800 font-semibold" : "text-gray-700"}`}>{s.name}</span>
            {s.ai && <span className="text-[9px]">🤖</span>}
          </button>
        ))}
        <div className="mt-3 p-2 bg-gray-50 rounded-md text-[11px] text-gray-500 text-center">
          {completeSections}/{sections.length} sections complete
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col">
        {currentSection && (
          <>
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="text-xs font-medium text-gray-700">
                {currentSection.name}{" "}
                {currentSection.ai && <Badge text="AI Draft" color="#2563eb" bg="#dbeafe" />}
              </div>
              <div className="flex gap-1.5">
                <button className="px-2.5 py-1 border border-gray-300 rounded bg-white text-[10px] text-gray-700">🔄 Regenerate</button>
                <button className="px-2.5 py-1 border border-gray-300 rounded bg-white text-[10px] text-gray-700">✏️ Edit</button>
              </div>
            </div>
            <div className="p-6 text-sm text-gray-800 leading-relaxed flex-1 max-h-[380px] overflow-y-auto">
              <h2 className="text-lg font-bold text-[#0c2340] mb-3">{currentSection.name}</h2>
              <p className="text-gray-400 italic text-xs">
                {currentSection.status === "complete"
                  ? "This section has been completed."
                  : currentSection.ai
                    ? "This section will be drafted by AI once sufficient evidence is available."
                    : "This section is awaiting content."}
              </p>
            </div>
          </>
        )}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex gap-2">
            <button className="px-3.5 py-1.5 rounded-md bg-[#0c2340] text-white text-[11px] font-semibold">📄 Export PDF</button>
            <button className="px-3.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-[11px]">📝 Export Word</button>
            <button className="px-3.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-[11px]">📊 Export XML</button>
          </div>
          <div className="text-[11px] text-gray-500">
            {reportId ? `Report ID: ${reportId.slice(0, 8)}` : "No report"}
          </div>
        </div>
      </div>
    </div>
  );
}

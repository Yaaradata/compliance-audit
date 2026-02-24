"use client";

import { useState } from "react";
import { REPORT_SECTIONS } from "@/lib/data/report-sections";
import { Badge } from "@/components/ui/badge";

export default function ReportPage() {
  const [activeSection, setActiveSection] = useState(0);
  const completeSections = REPORT_SECTIONS.filter((s) => s.status === "complete").length;

  return (
    <div className="grid grid-cols-[220px_1fr] gap-5">
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="text-sm font-semibold text-gray-700 mb-2.5">Report Sections</div>
        {REPORT_SECTIONS.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(i)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left mb-0.5 transition-colors ${i === activeSection ? "bg-blue-50" : "hover:bg-gray-50"}`}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.status === "complete" ? "#059669" : s.status === "in_progress" ? "#d97706" : "#93c5fd" }} />
            <span className={`text-[11px] ${i === activeSection ? "text-blue-800 font-semibold" : "text-gray-700"}`}>{s.name}</span>
            {s.ai && <span className="text-[9px]">🤖</span>}
          </button>
        ))}
        <div className="mt-3 p-2 bg-gray-50 rounded-md text-[11px] text-gray-500 text-center">
          {completeSections}/{REPORT_SECTIONS.length} sections complete
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="text-xs font-medium text-gray-700">
            {REPORT_SECTIONS[activeSection].name}{" "}
            {REPORT_SECTIONS[activeSection].ai && <Badge text="AI Draft" color="#2563eb" bg="#dbeafe" />}
          </div>
          <div className="flex gap-1.5">
            <button className="px-2.5 py-1 border border-gray-300 rounded bg-white text-[10px] text-gray-700">🔄 Regenerate</button>
            <button className="px-2.5 py-1 border border-gray-300 rounded bg-white text-[10px] text-gray-700">✏️ Edit</button>
          </div>
        </div>
        <div className="p-6 text-sm text-gray-800 leading-relaxed flex-1 max-h-[380px] overflow-y-auto">
          <h2 className="text-lg font-bold text-[#0c2340] mb-3">Executive Summary</h2>
          <p className="mb-3">This report presents the findings of the 2025 SWIFT Customer Security Controls Framework (CSCF) compliance assessment for <strong>[Organization Name]</strong>, BIC code <strong>[BIC-CODE]</strong>, operating under Architecture Type <strong>A1</strong>.</p>
          <p className="mb-3">The assessment evaluated compliance across all 25 mandatory controls and 7 advisory controls. Of the mandatory controls, <strong>22 were found fully compliant</strong> (scoring above 90% sufficiency), <strong>2 require minor remediation</strong>, and <strong>1 has an identified gap</strong> requiring a risk acceptance decision.</p>
          <p className="mb-3 p-2.5 bg-amber-50 rounded-md border-l-3 border-amber-500 text-xs">
            <strong>Key Finding:</strong> Control 2.8 (Outsourced Critical Activity Protection) requires completion of security risk assessments for two third-party providers. Remediation plan targets completion by March 2026.
          </p>
          <p className="mb-3">Overall compliance posture is <strong>strong</strong>, with an aggregate mandatory control score of <strong>87%</strong>.</p>
          <p className="text-[10px] text-gray-400 italic">This section was drafted by AI and requires human review before finalization.</p>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex gap-2">
            <button className="px-3.5 py-1.5 rounded-md bg-[#0c2340] text-white text-[11px] font-semibold">📄 Export PDF</button>
            <button className="px-3.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-[11px]">📝 Export Word</button>
            <button className="px-3.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-[11px]">📊 Export XML</button>
          </div>
          <div className="text-[11px] text-gray-500">Last saved: 2 min ago | v3.1</div>
        </div>
      </div>
    </div>
  );
}

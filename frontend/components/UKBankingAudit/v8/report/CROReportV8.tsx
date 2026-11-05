"use client";

import { useRouter } from "next/navigation";
import { buildCroReport } from "@/lib/ukbankingaudit/v8/croReportView";
import { useRiskState } from "../useRiskStore";
import { CROReportDocument } from "./CROReportDocument";

/** The report page: a toolbar above the full-width paper. Reads the dashboard's live state. */
export function CROReportV8() {
  const router = useRouter();
  const { data, relevance, dispositions } = useRiskState();
  const report = buildCroReport(data.config.currentPeriod, data, { relevance, dispositions });

  return (
    <div className="report-root min-h-screen bg-white">
      <div className="report-no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 sm:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Board View
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Download PDF
        </button>
      </div>
      <CROReportDocument report={report} />
    </div>
  );
}

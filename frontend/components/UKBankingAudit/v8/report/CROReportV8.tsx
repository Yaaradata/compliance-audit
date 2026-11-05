"use client";

import { useRouter } from "next/navigation";
import { buildCroReport } from "@/lib/ukbankingaudit/v8/croReportView";
import { useRiskState } from "../useRiskStore";
import { CROReportDocument } from "./CROReportDocument";

/** The report page: a small toolbar around the A4 paper. */
export function CROReportV8() {
  const router = useRouter();
  const { data } = useRiskState();
  const report = buildCroReport(data.config.currentPeriod, data);

  return (
    <div className="report-root min-h-screen bg-slate-200 py-4">
      <div className="report-no-print mx-auto flex w-[210mm] max-w-full flex-wrap items-center justify-between gap-2 px-2">
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

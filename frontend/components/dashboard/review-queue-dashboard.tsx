"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ReviewQueueContent } from "@/components/review/review-queue-content";

interface ApprovalSummary {
  gates?: { gate_type: string; status: string; ready?: boolean }[];
}

export type ReviewLevel = "L1" | "L2" | "L3";

export interface ReviewQueueDashboardProps {
  cycleId: string;
  level: ReviewLevel;
}

export function ReviewQueueDashboard({ cycleId, level }: ReviewQueueDashboardProps) {
  const [approvalSummary, setApprovalSummary] = useState<ApprovalSummary | null>(null);

  useEffect(() => {
    if (level !== "L3" || !cycleId) return;
    api.get<ApprovalSummary>(`/assessments/${cycleId}/approval/summary`).then(setApprovalSummary).catch(() => setApprovalSummary(null));
  }, [cycleId, level]);

  const pendingGates = useMemo(() => {
    const gates = approvalSummary?.gates ?? [];
    return gates.filter((g) => g.status !== "approved");
  }, [approvalSummary]);

  return (
    <div className="space-y-6">
      {level === "L3" && pendingGates.length > 0 && (
        <div className="rounded-xl border border-(--border) bg-(--surface) p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Approval gates pending</p>
              <p className="text-xs text-(--foreground-muted) mt-0.5">
                {pendingGates.length} gate(s) awaiting approval before final attestation.
              </p>
            </div>
            <Link
              href={`/cycles/${cycleId}/approval`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-800/40 transition-colors"
            >
              Approval Gates
            </Link>
          </div>
        </div>
      )}
      <ReviewQueueContent
        cycleId={cycleId}
        level={level}
        embedded
        showLevelFilter={false}
        showSummaryKpi
      />
    </div>
  );
}

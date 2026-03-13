"use client";

import { ReviewQueueContent } from "@/components/review/review-queue-content";

export type ReviewLevel = "L1" | "L2" | "L3";

export interface ReviewQueueDashboardProps {
  cycleId: string;
  level: ReviewLevel;
}

export function ReviewQueueDashboard({ cycleId, level }: ReviewQueueDashboardProps) {
  return (
    <ReviewQueueContent
      cycleId={cycleId}
      level={level}
      embedded
      showLevelFilter={false}
      showSummaryKpi
    />
  );
}

"use client";

import { ReviewQueueDashboard } from "./review-queue-dashboard";

export function L3AssessorDashboard({ cycleId }: { cycleId: string }) {
  return <ReviewQueueDashboard cycleId={cycleId} level="L3" />;
}

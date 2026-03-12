"use client";

import { ReviewQueueDashboard } from "./review-queue-dashboard";

export function L2ReviewerDashboard({ cycleId }: { cycleId: string }) {
  return <ReviewQueueDashboard cycleId={cycleId} level="L2" />;
}

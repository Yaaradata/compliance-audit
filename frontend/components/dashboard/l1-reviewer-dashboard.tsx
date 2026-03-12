"use client";

import { ReviewQueueDashboard } from "./review-queue-dashboard";

export function L1ReviewerDashboard({ cycleId }: { cycleId: string }) {
  return <ReviewQueueDashboard cycleId={cycleId} level="L1" />;
}

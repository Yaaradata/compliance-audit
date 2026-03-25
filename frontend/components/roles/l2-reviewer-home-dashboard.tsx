"use client";

import type { ComponentProps } from "react";
import { ReviewerHomeDashboard } from "@/components/roles/shared/reviewer-home-dashboard-impl";

export type { CycleInsight } from "@/components/roles/shared/compliance-types";

/** L2 quality reviewer — same layout pattern as Compliance Officer home (hero, KPI grid, performance, deadlines, overview). */
export function L2ReviewerHomeDashboard(props: Omit<ComponentProps<typeof ReviewerHomeDashboard>, "tier">) {
  return <ReviewerHomeDashboard tier="l2" {...props} />;
}

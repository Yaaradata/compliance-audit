"use client";

import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ReviewQueueContent } from "@/components/review/review-queue-content";

const VALID_LEVELS = ["L1", "L2", "L3"] as const;

export default function CycleReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cycleId = params.cycleId as string;
  const { user } = useAuth();
  const userRole = user?.role || "compliance_officer";

  const roleLevel = userRole === "internal_reviewer_l1" ? "L1" : userRole === "internal_reviewer_l2" ? "L2" : userRole === "external_assessor" ? "L3" : null;
  const levelFromUrl = searchParams.get("level");
  const initialLevel = levelFromUrl && VALID_LEVELS.includes(levelFromUrl as (typeof VALID_LEVELS)[number]) ? levelFromUrl : (roleLevel ?? "all");

  const syncLevelToUrl = (lv: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (lv === "all") {
      next.delete("level");
    } else {
      next.set("level", lv);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname ?? "");
  };

  if (roleLevel) {
    return (
      <ReviewQueueContent
        cycleId={cycleId}
        level={roleLevel}
        embedded={false}
        showLevelFilter={false}
      />
    );
  }

  return (
    <ReviewQueueContent
      cycleId={cycleId}
      level="all"
      embedded={false}
      showLevelFilter
      levelFilter={initialLevel}
      onLevelFilterChange={syncLevelToUrl}
    />
  );
}

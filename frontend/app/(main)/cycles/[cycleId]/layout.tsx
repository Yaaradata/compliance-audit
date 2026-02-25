"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

/**
 * Layout for all cycle-scoped routes: /cycles/[cycleId]/...
 * - Syncs cycleId from URL to auth context so API calls use the correct cycle.
 * - Validates cycle exists and user has access; otherwise redirects to assessment list.
 */
export default function CycleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;
  const { setActiveCycleId, setArchitecture } = useAuth();

  useEffect(() => {
    if (!cycleId) return;
    setActiveCycleId(cycleId);
    api
      .get<{ id: string; label: string; cycle_year: number; display_id: string; architecture_type: string | null }>(`/assessments/${cycleId}`)
      .then((cycle) => {
        setActiveCycleId(cycleId, {
          label: cycle.label,
          cycle_year: cycle.cycle_year,
          display_id: cycle.display_id,
        });
        if (cycle.architecture_type) setArchitecture(cycle.architecture_type);
      })
      .catch(() => {
        router.replace("/assessments/new");
      });
  }, [cycleId, setActiveCycleId, setArchitecture, router]);

  return <>{children}</>;
}

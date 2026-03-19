"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoadingState } from "@/components/ui/loading-state";
import {
  ComplianceOfficerDashboard,
  ITSmeDashboard,
  L1ReviewerDashboard,
  L2ReviewerDashboard,
  L3AssessorDashboard,
} from "@/components/dashboard";

const DASHBOARD_BY_ROLE: Record<string, React.ComponentType<{ cycleId: string }>> = {
  compliance_officer: ComplianceOfficerDashboard,
  tenant_admin: ComplianceOfficerDashboard,
  it_sme: ITSmeDashboard,
  internal_reviewer_l1: L1ReviewerDashboard,
  internal_reviewer_l2: L2ReviewerDashboard,
  external_assessor: L3AssessorDashboard,
};

export default function CycleDashboardPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const { effectiveCycleRole } = useAuth();

  if (!cycleId) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          No assessment selected. Open an assessment from Your Assessment Cycles.
        </p>
      </div>
    );
  }

  if (effectiveCycleRole === undefined) {
    return <LoadingState message="Loading dashboard…" />;
  }

  const DashboardComponent =
    (effectiveCycleRole && DASHBOARD_BY_ROLE[effectiveCycleRole]) || ComplianceOfficerDashboard;

  return <DashboardComponent cycleId={cycleId} />;
}

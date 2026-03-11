"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ComplianceOfficerDashboard,
  ITSmeDashboard,
  L1ReviewerDashboard,
  L2ReviewerDashboard,
  L3AssessorDashboard,
} from "@/components/dashboard";

const DASHBOARD_BY_ROLE: Record<string, React.ComponentType<{ cycleId: string }>> = {
  compliance_officer: ComplianceOfficerDashboard,
  it_sme: ITSmeDashboard,
  internal_reviewer_l1: L1ReviewerDashboard,
  internal_reviewer_l2: L2ReviewerDashboard,
  external_assessor: L3AssessorDashboard,
};

export default function CycleDashboardPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const { user } = useAuth();
  const role = user?.role ?? "compliance_officer";

  const DashboardComponent =
    DASHBOARD_BY_ROLE[role] ?? ComplianceOfficerDashboard;

  if (!cycleId) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          No assessment selected. Open an assessment from Your Assessment Cycles.
        </p>
      </div>
    );
  }

  return <DashboardComponent cycleId={cycleId} />;
}

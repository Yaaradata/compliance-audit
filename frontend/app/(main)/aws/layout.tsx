"use client";

import { useAuth } from "@/lib/auth-context";
import { useGlobalRoleForRouting } from "@/lib/home-dashboard-role-context";
import { AwsPageShell } from "@/components/aws/aws-page-shell";

export default function AwsLayout({ children }: { children: React.ReactNode }) {
  const { user, activeCycleId, effectiveCycleRole } = useAuth();
  const globalRole = useGlobalRoleForRouting(user?.role);

  const role =
    activeCycleId && effectiveCycleRole !== undefined
      ? effectiveCycleRole ?? globalRole
      : globalRole;

  const canAccess = role === "it_sme";

  if (!canAccess) {
    return (
      <div className="p-4 md:p-6 min-h-[60vh] flex items-center justify-center">
        <div
          className="card rounded-xl p-8 max-w-md text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            You do not have access to AWS evidence. Only the Evidence Collection role can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 pb-4 md:pb-6 pt-0">
      <AwsPageShell>{children}</AwsPageShell>
    </div>
  );
}

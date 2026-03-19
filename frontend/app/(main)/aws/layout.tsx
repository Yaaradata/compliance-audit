"use client";

import { useAuth } from "@/lib/auth-context";
import { AwsPageShell } from "@/components/aws/aws-page-shell";

export default function AwsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const awsRoles = ["it_sme", "tenant_admin", "compliance_officer"];
  const canAccess = user?.role && awsRoles.includes(user.role);

  if (!canAccess) {
    return (
      <div className="p-4 md:p-6 min-h-[60vh] flex items-center justify-center">
        <div
          className="card rounded-xl p-8 max-w-md text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            You do not have access to AWS evidence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full">
      <AwsPageShell>{children}</AwsPageShell>
    </div>
  );
}

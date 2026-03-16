"use client";

import { useAuth } from "@/lib/auth-context";
import { AwsNav } from "@/components/aws/aws-nav";

export default function AwsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const canAccess = user?.role === "it_sme";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <AwsNav />
      {canAccess ? (
        <main className="min-w-0">{children}</main>
      ) : (
        <div className="card flex flex-1 items-center justify-center rounded-xl p-8">
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>You do not have access to AWS evidence.</p>
        </div>
      )}
    </div>
  );
}

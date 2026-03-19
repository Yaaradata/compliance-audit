"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Team setup has been replaced by Role & Evidence setup.
 * Redirect to role-evidence-setup for backward compatibility with bookmarks/links.
 */
export default function CycleTeamSetupPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;
  const { user, isPlatformAdmin } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isPlatformAdmin) {
      router.replace("/admin");
      return;
    }
    router.replace(`/cycles/${cycleId}/role-evidence-setup`);
  }, [user, isPlatformAdmin, cycleId, router]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-foreground-muted">Redirecting to Role & Evidence setup…</p>
      </main>
    </div>
  );
}

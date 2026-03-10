"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AppShell } from "@/app/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeCycleId, setActiveCycleId, setArchitecture, selectedArchitectureId, isPlatformAdmin, loading } = useAuth();

  const isCycleRoute = pathname?.startsWith("/cycles/");

  const urlCycleId = pathname?.match(/^\/cycles\/([^/]+)/)?.[1];

  useEffect(() => {
    if (urlCycleId && user && !isPlatformAdmin && urlCycleId !== activeCycleId) {
      api
        .get<{ id: string; label: string; cycle_year: number; display_id: string; architecture_type: string | null }>(`/assessments/${urlCycleId}`)
        .then((cycle) => {
          setActiveCycleId(urlCycleId, {
            label: cycle.label,
            display_id: cycle.display_id,
            cycle_year: cycle.cycle_year,
          });
          if (cycle.architecture_type) {
            setArchitecture(cycle.architecture_type);
          }
        })
        .catch(() => {});
    }
  }, [urlCycleId, user, isPlatformAdmin, activeCycleId, setActiveCycleId, setArchitecture]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isPlatformAdmin) {
      const tenantOnlyRoutes = ["/dashboard", "/evidence", "/review", "/approval", "/report", "/domains", "/assessments", "/cycles"];
      if (pathname === "/" || tenantOnlyRoutes.some((r) => pathname?.startsWith(r))) {
        router.replace("/admin");
      }
      return;
    }
    if (!activeCycleId && !selectedArchitectureId && !isCycleRoute) {
      router.replace("/assessments/new");
      return;
    }
    if (activeCycleId && !isCycleRoute && pathname) {
      if (pathname === "/dashboard") {
        router.replace(`/cycles/${activeCycleId}/dashboard`);
        return;
      }
      if (pathname.startsWith("/domains/")) {
        const rest = pathname.slice("/domains/".length);
        router.replace(`/cycles/${activeCycleId}/domains/${rest}`);
        return;
      }
      if (pathname === "/review") {
        router.replace(`/cycles/${activeCycleId}/review`);
        return;
      }
      if (pathname === "/approval") {
        router.replace(`/cycles/${activeCycleId}/approval`);
        return;
      }
      if (pathname === "/report") {
        router.replace(`/cycles/${activeCycleId}/report`);
        return;
      }
    }
  }, [user, activeCycleId, selectedArchitectureId, isPlatformAdmin, pathname, router, loading, isCycleRoute]);

  if (loading) return null;
  if (!user) return null;
  if (isPlatformAdmin && pathname !== "/admin") return null;
  if (!isPlatformAdmin && !activeCycleId && !selectedArchitectureId && !isCycleRoute) return null;

  // Team setup: standalone page without sidebar or main header
  if (pathname?.includes("/team-setup")) {
    return <>{children}</>;
  }

  // Control scoping: standalone page without sidebar or header (table-only view)
  if (pathname?.includes("/control-scoping")) {
    return <>{children}</>;
  }

  // Role-based route protection
  const role = user?.role;
  if (role && pathname) {
    const isReviewRoute = pathname.includes("/review");
    const isApprovalRoute = pathname.includes("/approval");
    const isDomainRoute = pathname.includes("/domains/");
    const isEvidenceRoute = isDomainRoute;

    if (role === "it_sme" && (isReviewRoute || isApprovalRoute)) {
      return (
        <AppShell>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">You do not have access to this page.</p>
          </div>
        </AppShell>
      );
    }
    if (role === "internal_reviewer" && isEvidenceRoute) {
      // Allow read-only — the page itself handles edit restrictions
    }
    if (role === "external_assessor" && isEvidenceRoute) {
      // Allow read-only
    }
    if (role === "approver" && isReviewRoute) {
      // Approvers can view review status but not take review actions — page handles this
    }
  }

  return <AppShell>{children}</AppShell>;
}

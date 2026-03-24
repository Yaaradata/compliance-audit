"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AppShell } from "@/app/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeCycleId, setActiveCycleId, setArchitecture, selectedArchitectureId, isPlatformAdmin, loading, effectiveCycleRole } = useAuth();

  const isCycleRoute = pathname?.startsWith("/cycles/");
  const isHomeDashboard = pathname === "/dashboard";

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
    // Approver (L3): redirect from Approval page to Dashboard; approval is done via Dashboard Review Queue
    const effectiveRole = (activeCycleId && effectiveCycleRole !== undefined) ? (effectiveCycleRole ?? user.role) : user.role;
    if (effectiveRole === "external_assessor" && pathname?.includes("/approval")) {
      router.replace(activeCycleId ? `/cycles/${activeCycleId}/dashboard` : "/dashboard");
      return;
    }
    const isAwsPage = pathname?.startsWith("/aws") && effectiveRole === "it_sme";
    const isUsersGroupsPage = pathname?.startsWith("/users-groups");
    const canAccessUsersGroups = (effectiveRole === "compliance_officer" || effectiveRole === "tenant_admin") && isUsersGroupsPage;
    const isAssessmentsPage = pathname?.startsWith("/assessments");
    if (!activeCycleId && !selectedArchitectureId && !isCycleRoute && !isAwsPage && !canAccessUsersGroups && !isAssessmentsPage && !isHomeDashboard) {
      router.replace("/assessments/new");
      return;
    }
    if (pathname?.startsWith("/aws") && effectiveRole !== "it_sme" && effectiveCycleRole !== undefined) {
      router.replace(activeCycleId ? `/cycles/${activeCycleId}/dashboard` : "/assessments/new");
      return;
    }
    if (activeCycleId && !isCycleRoute && pathname && !isAwsPage) {
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
  }, [user, activeCycleId, selectedArchitectureId, isPlatformAdmin, pathname, router, loading, isCycleRoute, effectiveCycleRole]);

  if (loading) return null;
  if (!user) return null;
  if (isPlatformAdmin && pathname !== "/admin") return null;
  const renderRole = (activeCycleId && effectiveCycleRole !== undefined) ? (effectiveCycleRole ?? user?.role) : user?.role;
  const allowAwsWithoutCycle = pathname?.startsWith("/aws") && renderRole === "it_sme";
  const allowUsersGroups = pathname?.startsWith("/users-groups") && (renderRole === "compliance_officer" || renderRole === "tenant_admin");
  const allowAssessmentsPage = pathname?.startsWith("/assessments");
  const allowHomeDashboard = pathname === "/dashboard";
  if (!isPlatformAdmin && !activeCycleId && !selectedArchitectureId && !isCycleRoute && !allowAwsWithoutCycle && !allowUsersGroups && !allowAssessmentsPage && !allowHomeDashboard) return null;

  // Team setup: standalone page without sidebar or main header
  if (pathname?.includes("/team-setup")) {
    return <>{children}</>;
  }

  // Control scoping: standalone page without sidebar or header (table-only view)
  if (pathname?.includes("/control-scoping")) {
    return <>{children}</>;
  }

  // Role-based route protection: use cycle role when in cycle context
  const role = (activeCycleId && effectiveCycleRole !== undefined) ? (effectiveCycleRole ?? user?.role) : user?.role;
  if (pathname) {
    const isReviewRoute = pathname.includes("/review");
    const isApprovalRoute = pathname.includes("/approval");
    const isDomainRoute = pathname.includes("/domains/");

    // Null-role users (unassigned) can only access dashboard and assessments list
    if (!role && (isReviewRoute || isApprovalRoute || isDomainRoute)) {
      return (
        <AppShell>
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <p className="text-sm text-gray-500">You have not been assigned to any cycle yet.</p>
            <p className="text-xs text-gray-400">Contact your Compliance Officer for role assignment.</p>
          </div>
        </AppShell>
      );
    }

    if (role === "it_sme" && (isReviewRoute || isApprovalRoute)) {
      return (
        <AppShell>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">You do not have access to this page.</p>
          </div>
        </AppShell>
      );
    }
    if ((role === "internal_reviewer_l1" || role === "internal_reviewer_l2") && (isApprovalRoute || isDomainRoute)) {
      return (
        <AppShell>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">You do not have access to this page.</p>
          </div>
        </AppShell>
      );
    }
    if (role === "external_assessor" && isDomainRoute) {
      return (
        <AppShell>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">You do not have access to this page.</p>
          </div>
        </AppShell>
      );
    }
  }

  // Approver (L3): no access to Approval page; redirect to Dashboard
  if (role === "external_assessor" && pathname?.includes("/approval")) {
    return null; // useEffect above will redirect
  }

  const showSidebar = !isHomeDashboard || role === "compliance_officer";
  return <AppShell showSidebar={showSidebar}>{children}</AppShell>;
}

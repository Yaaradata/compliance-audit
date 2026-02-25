"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/app/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeCycleId, selectedArchitectureId, isPlatformAdmin, loading } = useAuth();

  const isCycleRoute = pathname?.startsWith("/cycles/");

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
      if (pathname === "/evidence-model") {
        router.replace(`/cycles/${activeCycleId}/evidence-model`);
        return;
      }
    }
  }, [user, activeCycleId, selectedArchitectureId, isPlatformAdmin, pathname, router, loading, isCycleRoute]);

  if (loading) return null;
  if (!user) return null;
  if (isPlatformAdmin && pathname !== "/admin") return null;
  if (!isPlatformAdmin && !activeCycleId && !selectedArchitectureId && !isCycleRoute) return null;

  return <AppShell>{children}</AppShell>;
}

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/app/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeCycleId, selectedArchitectureId, isPlatformAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isPlatformAdmin) {
      const mainRoutes = ["/dashboard", "/evidence", "/review", "/approval", "/report", "/domains"];
      if (pathname === "/" || mainRoutes.some((r) => pathname?.startsWith(r))) {
        router.replace("/admin");
      }
      return;
    }
    if (!activeCycleId && !selectedArchitectureId) {
      router.replace("/assessments/new");
    }
  }, [user, activeCycleId, selectedArchitectureId, isPlatformAdmin, pathname, router, loading]);

  if (loading) return null;
  if (!user) return null;
  if (isPlatformAdmin && pathname !== "/admin") return null;
  if (!isPlatformAdmin && !activeCycleId && !selectedArchitectureId) return null;

  return <AppShell>{children}</AppShell>;
}

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/app/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, selectedArchitectureId, isPlatformAdmin } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isPlatformAdmin) {
      if (pathname?.startsWith("/dashboard") || pathname === "/" || pathname?.startsWith("/evidence") || pathname?.startsWith("/review") || pathname?.startsWith("/approval") || pathname?.startsWith("/report") || pathname?.startsWith("/domains")) {
        router.replace("/admin");
      }
      return;
    }
    if (!selectedArchitectureId && pathname !== "/select-architecture") {
      router.replace("/select-architecture");
    }
  }, [user, selectedArchitectureId, isPlatformAdmin, pathname, router]);

  if (!user) return null;
  if (isPlatformAdmin && pathname !== "/admin") return null;
  if (!isPlatformAdmin && !selectedArchitectureId) return null;

  return <AppShell>{children}</AppShell>;
}

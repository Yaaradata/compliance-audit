"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LandingPage } from "@/components/landing/landing-page";

export default function HomePage() {
  const router = useRouter();
  const { user, isPlatformAdmin, selectedArchitectureId } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (isPlatformAdmin) {
      router.replace("/admin");
      return;
    }
    if (!selectedArchitectureId) {
      router.replace("/select-architecture");
      return;
    }
    router.replace("/dashboard");
  }, [user, isPlatformAdmin, selectedArchitectureId, router]);

  if (user) return null;
  return <LandingPage />;
}

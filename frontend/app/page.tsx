"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LandingPage } from "@/components/landing/landing-page";

export default function HomePage() {
  const router = useRouter();
  const { user, isPlatformAdmin, activeCycleId, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (isPlatformAdmin) {
      router.replace("/admin");
      return;
    }
    if (activeCycleId) {
      router.replace(`/cycles/${activeCycleId}/dashboard`);
      return;
    }
    router.replace("/assessments/new");
  }, [user, isPlatformAdmin, activeCycleId, loading, router]);

  if (loading || user) return null;
  return <LandingPage />;
}

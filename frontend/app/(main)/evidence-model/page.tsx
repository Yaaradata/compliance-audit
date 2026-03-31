"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function EvidenceModelRedirectPage() {
  const router = useRouter();
  const { activeCycleId } = useAuth();

  useEffect(() => {
    if (activeCycleId) router.replace(`/cycles/${activeCycleId}/dashboard`);
    else router.replace("/dashboard");
  }, [activeCycleId, router]);

  return (
    <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
      Redirecting…
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ApprovalRedirectPage() {
  const router = useRouter();
  const { activeCycleId } = useAuth();

  useEffect(() => {
    if (activeCycleId) router.replace(`/cycles/${activeCycleId}/approval`);
    else router.replace("/assessments/new");
  }, [activeCycleId, router]);

  return (
    <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
      Redirecting…
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function EvidenceDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { activeCycleId } = useAuth();
  const _id = params.id as string;

  useEffect(() => {
    if (activeCycleId) router.replace(`/cycles/${activeCycleId}/dashboard`);
    else router.replace("/assessments/new");
  }, [activeCycleId, router]);

  return (
    <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
      Redirecting to dashboard…
    </div>
  );
}

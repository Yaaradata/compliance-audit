"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DomainRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.domainId as string;
  const { activeCycleId } = useAuth();

  useEffect(() => {
    if (activeCycleId && domainId) {
      router.replace(`/cycles/${activeCycleId}/domains/${domainId}`);
    } else if (activeCycleId) {
      router.replace(`/cycles/${activeCycleId}/dashboard`);
    } else {
      router.replace("/assessments/new");
    }
  }, [activeCycleId, domainId, router]);

  return (
    <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
      Redirecting…
    </div>
  );
}

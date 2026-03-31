"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DomainItemRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.domainId as string;
  const itemId = params.itemId as string;
  const { activeCycleId } = useAuth();

  useEffect(() => {
    if (activeCycleId && domainId && itemId) {
      router.replace(`/cycles/${activeCycleId}/domains/${domainId}/items/${itemId}`);
    } else if (activeCycleId) {
      router.replace(`/cycles/${activeCycleId}/dashboard`);
    } else {
      router.replace("/dashboard");
    }
  }, [activeCycleId, domainId, itemId, router]);

  return (
    <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
      Redirecting…
    </div>
  );
}

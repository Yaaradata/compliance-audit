"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { EvidenceDetailModal } from "@/components/review/evidence-viewer";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const cycleId = params.cycleId as string;
  const reviewId = params.reviewId as string;
  const userRole = user?.role ?? "compliance_officer";

  const handleAction = async (
    id: string,
    decision: "approve" | "return" | "hold",
    _comment?: string,
    checklistResults?: Record<string, { checked: boolean; note?: string | null }>
  ) => {
    try {
      await api.put(`/reviews/${id}`, {
        decision,
        checklist_results: checklistResults ?? null,
      });
      router.push(`/cycles/${cycleId}/review`);
    } catch {
      // leave user on page on error
    }
  };

  return (
    <EvidenceDetailModal
      cycleId={cycleId}
      reviewId={reviewId}
      userRole={userRole}
      onAction={(decision, comment, checklistResults) =>
        handleAction(reviewId, decision, comment, checklistResults)
      }
      onClose={() => router.push(`/cycles/${cycleId}/review`)}
      inline
    />
  );
}

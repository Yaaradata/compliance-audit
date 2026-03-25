"use client";

import { useRouter } from "next/navigation";
import { NewAssessmentCycleForm } from "@/components/assessments/new-assessment-cycle-form";
import type { AssessmentCycle } from "@/lib/types";

type NewAssessmentCycleModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewAssessmentCycleModal({ open, onClose }: NewAssessmentCycleModalProps) {
  const router = useRouter();
  if (!open) return null;

  const handleSuccess = (cycle: AssessmentCycle) => {
    router.push(`/cycles/${cycle.id}/role-evidence-setup`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-assessment-cycle-title"
    >
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl border p-5 shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="new-assessment-cycle-title" className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            New assessment cycle
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Close
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: "var(--foreground-muted)" }}>
          Create a SWIFT CSCF compliance assessment. You’ll continue with role and evidence setup next.
        </p>
        <NewAssessmentCycleForm onSuccess={handleSuccess} onCancel={onClose} />
      </div>
    </div>
  );
}

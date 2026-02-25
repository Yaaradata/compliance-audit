"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

/**
 * Evidence model is reference data; cycle layout already set architecture from cycle.
 * This page provides a cycle-scoped entry point and links to cycle domains.
 */
export default function CycleEvidenceModelPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const { selectedArchitectureId } = useAuth();

  return (
    <div>
      <div className="rounded-xl p-5 mb-5 text-white" style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 50%, #2E5984 100%)" }}>
        <div className="text-[11px] font-bold tracking-wider opacity-60 mb-1">SWIFT CSCF v2025 · Cycle-scoped</div>
        <h1 className="text-xl font-bold">Evidence Model</h1>
        <p className="text-xs opacity-60 mt-1">Architecture: {selectedArchitectureId ?? "—"}. Use the Dashboard and Domains to collect evidence for this cycle.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-600 mb-4">
          The canonical evidence model is shared across cycles. For this assessment cycle, collect evidence via the domains below.
        </p>
        {cycleId && (
          <Link href={`/cycles/${cycleId}/dashboard`} className="inline-block px-4 py-2 rounded-lg bg-[#1B3A5C] text-white text-sm font-semibold hover:opacity-90">
            ← Back to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

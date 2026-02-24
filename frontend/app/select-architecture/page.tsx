"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ARCHITECTURES } from "@/lib/data/architectures";
import { AppHeader } from "@/components/layout/app-header";

const TYPE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  A1: { bg: "#eff6ff", border: "#2563eb", badge: "#1e40af" },
  A2: { bg: "#f0fdf4", border: "#16a34a", badge: "#166534" },
  A3: { bg: "#fefce8", border: "#ca8a04", badge: "#854d0e" },
  A4: { bg: "#fff7ed", border: "#ea580c", badge: "#9a3412" },
  B:  { bg: "#faf5ff", border: "#9333ea", badge: "#6b21a8" },
};

function SelectArchitectureInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cycleId = searchParams.get("cycleId");
  const { user, isPlatformAdmin, setArchitecture, setActiveCycleId } = useAuth();
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.replace("/login");
    if (isPlatformAdmin) router.replace("/admin");
  }, [user, isPlatformAdmin, router]);

  const handleSelect = async (architectureId: string) => {
    setSelecting(architectureId);
    try {
      if (cycleId) {
        await api.put(`/assessments/${cycleId}`, { architecture_type: architectureId });
        setActiveCycleId(cycleId);
      }
      setArchitecture(architectureId);
      router.replace("/dashboard");
    } catch {
      setSelecting(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Select your SWIFT architecture type</h1>
          <p className="text-slate-600 mb-2">CSCF v2025 defines 5 architecture types. Your selection determines which controls and evidence items are in scope.</p>
          <p className="text-xs text-slate-500 mb-6">Mandatory + Advisory controls shown per type. Evidence collection domains adapt accordingly.</p>

          <div className="space-y-4">
            {ARCHITECTURES.map((arch) => {
              const colors = TYPE_COLORS[arch.id] ?? TYPE_COLORS.A1;
              const isSelecting = selecting === arch.id;
              const totalControls = arch.mandatoryControls.length + arch.advisoryControls.length;

              return (
                <div
                  key={arch.id}
                  onClick={() => !selecting && handleSelect(arch.id)}
                  onKeyDown={(e) => e.key === "Enter" && !selecting && handleSelect(arch.id)}
                  role="button"
                  tabIndex={0}
                  className="bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold shrink-0"
                      style={{ background: colors.badge }}
                    >
                      {arch.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-slate-900">{arch.name}</h2>
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: colors.bg, color: colors.badge }}>
                          {arch.subtitle}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{arch.description}</p>

                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="text-xs">
                          <span className="font-semibold text-slate-700">Mandatory:</span>{" "}
                          <span className="font-bold text-red-700">{arch.mandatoryControls.length}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-slate-700">Advisory:</span>{" "}
                          <span className="font-bold text-amber-700">{arch.advisoryControls.length}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-slate-700">Total:</span>{" "}
                          <span className="font-bold text-slate-800">{totalControls}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-slate-700">Domains:</span>{" "}
                          <span className="text-slate-600">{arch.domainIds.join(", ")}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1">In-scope components</div>
                        <div className="flex flex-wrap gap-1.5">
                          {arch.components.map((c) => (
                            <span key={c} className="text-[10px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">{c}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 mb-1">Controls</div>
                        <div className="flex flex-wrap gap-1">
                          {arch.mandatoryControls.map((c) => (
                            <span key={c} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">{c}</span>
                          ))}
                          {arch.advisoryControls.map((c) => (
                            <span key={c} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelect(arch.id); }}
                      disabled={!!selecting}
                      className="shrink-0 px-4 py-2 font-medium text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                      style={{ background: colors.badge }}
                    >
                      {isSelecting ? "Setting up..." : "Select"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <strong>CSCF v2025 note:</strong> Organisations previously attesting as Architecture B that use application-to-application flows (middleware, API, file transfer) must reclassify to A4. Only GUI-only access remains as B. New A4 controls are advisory in v2025 and become mandatory in v2026.
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            <Link href="/assessments/new" className="text-blue-600 hover:underline">Back to assessment cycles</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SelectArchitecturePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-sm text-slate-500">Loading...</div></div>}>
      <SelectArchitectureInner />
    </Suspense>
  );
}

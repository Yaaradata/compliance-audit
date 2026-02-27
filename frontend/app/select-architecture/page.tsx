"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  ARCHITECTURES,
  ARCHITECTURE_DIAGRAMS,
  getArchitectureDiagramUrl,
} from "@/lib/data/architectures";
import { AppHeader } from "@/components/layout/app-header";

const TYPE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  A1: { bg: "#eff6ff", border: "#2563eb", badge: "#1e40af" },
  A2: { bg: "#f0fdf4", border: "#16a34a", badge: "#166534" },
  A3: { bg: "#fefce8", border: "#ca8a04", badge: "#854d0e" },
  A4: { bg: "#fff7ed", border: "#ea580c", badge: "#9a3412" },
  B: { bg: "#faf5ff", border: "#9333ea", badge: "#6b21a8" },
};

const EVIDENCE_ITEM_A5 = "A5";

interface ArchitectureDiagramBlockProps {
  architectureId: string;
  name: string;
  selectedDiagram: string | null;
  onSelectDiagram: (filename: string) => void;
}

function ArchitectureDiagramBlock({
  architectureId,
  name,
  selectedDiagram,
  onSelectDiagram,
}: ArchitectureDiagramBlockProps) {
  const diagrams = ARCHITECTURE_DIAGRAMS[architectureId] ?? [];
  const displayFilename = selectedDiagram || diagrams[0];
  const hasMultiple = diagrams.length > 1;

  if (diagrams.length === 0) {
    return (
      <div className="w-full min-h-[180px] sm:min-h-[220px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
        <span className="text-sm text-slate-400">Diagram {architectureId}</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative w-full min-h-[180px] sm:min-h-[220px] rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-2">
        <img
          src={displayFilename ? getArchitectureDiagramUrl(displayFilename) : ""}
          alt={`${name} architecture diagram`}
          className="w-full h-full min-h-[160px] sm:min-h-[200px] object-contain"
        />
      </div>
      {hasMultiple && (
        <div className="flex gap-1.5 justify-center flex-wrap" role="group" aria-label="Select diagram">
          {diagrams.map((filename) => (
            <button
              key={filename}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectDiagram(filename);
              }}
              className={`w-10 h-8 sm:w-12 sm:h-9 rounded border overflow-hidden shrink-0 ${
                selectedDiagram === filename
                  ? "ring-2 ring-offset-1 ring-slate-600 border-slate-600"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <img
                src={getArchitectureDiagramUrl(filename)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectArchitectureInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cycleId = searchParams.get("cycleId");
  const { user, isPlatformAdmin, setArchitecture, setActiveCycleId } = useAuth();
  const [selecting, setSelecting] = useState<string | null>(null);
  /** Per-architecture selected diagram filename (e.g. A1-1.png). Used when architecture has multiple diagrams. */
  const [selectedDiagramByArch, setSelectedDiagramByArch] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) router.replace("/login");
    if (isPlatformAdmin) router.replace("/admin");
  }, [user, isPlatformAdmin, router]);

  const ensureA5EvidenceWithDiagram = useCallback(
    async (architectureId: string, diagramFilename: string) => {
      if (!cycleId) return;
      const list = await api.get<{ id: string; evidence_item_id: string }[]>(
        `/assessments/${cycleId}/evidence`
      );
      const a5 = list.find((s) => s.evidence_item_id === EVIDENCE_ITEM_A5);
      const formData = {
        architecture_type: architectureId,
        selected_diagram: diagramFilename,
      };

      let submissionId: string;
      if (a5) {
        submissionId = a5.id;
        await api.put(`/assessments/${cycleId}/evidence/${submissionId}`, { form_data: formData });
      } else {
        const created = await api.post<{ id: string }>(`/assessments/${cycleId}/evidence`, {
          evidence_item_id: EVIDENCE_ITEM_A5,
        });
        submissionId = created.id;
        await api.put(`/assessments/${cycleId}/evidence/${submissionId}`, { form_data: formData });
      }

      // Auto-attach the selected architecture diagram image as an evidence file
      if (diagramFilename && submissionId) {
        try {
          const diagramUrl = getArchitectureDiagramUrl(diagramFilename);
          const resp = await fetch(diagramUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            const file = new File([blob], diagramFilename, { type: blob.type || "image/png" });
            await api.upload(`/evidence/${submissionId}/files`, file);
          }
        } catch {
          // Diagram upload is best-effort; form_data reference is the primary record
        }
      }
    },
    [cycleId]
  );

  const handleSelect = async (architectureId: string) => {
    setSelecting(architectureId);
    try {
      const diagrams = ARCHITECTURE_DIAGRAMS[architectureId] ?? [];
      const selectedDiagram =
        selectedDiagramByArch[architectureId] || diagrams[0] || "";

      if (cycleId) {
        await api.put(`/assessments/${cycleId}`, { architecture_type: architectureId });
        if (selectedDiagram) {
          await ensureA5EvidenceWithDiagram(architectureId, selectedDiagram);
        }
        const cycle = await api.get<{
          id: string;
          label: string;
          cycle_year: number;
          display_id: string;
        }>(`/assessments/${cycleId}`);
        setActiveCycleId(cycleId, {
          label: cycle.label,
          cycle_year: cycle.cycle_year,
          display_id: cycle.display_id,
        });
      }
      setArchitecture(architectureId);
      router.replace(`/cycles/${cycleId}/dashboard`);
    } catch {
      setSelecting(null);
    }
  };

  const setDiagramForArch = useCallback((archId: string, filename: string) => {
    setSelectedDiagramByArch((prev) => ({ ...prev, [archId]: filename }));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            Select your SWIFT architecture type
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mb-1">
            CSCF v2025 defines 5 architecture types. Your selection determines which controls and
            evidence items are in scope.
          </p>
          <p className="text-xs text-slate-500 mb-4 sm:mb-6">
            Mandatory + Advisory controls shown per type. Select a diagram when multiple options
            are shown; your choice is saved as evidence for A5 (Architecture Type Declaration).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {ARCHITECTURES.map((arch) => {
              const colors = TYPE_COLORS[arch.id] ?? TYPE_COLORS.A1;
              const isSelecting = selecting === arch.id;
              const totalControls =
                arch.mandatoryControls.length + arch.advisoryControls.length;

              return (
                <article
                  key={arch.id}
                  onClick={() => !selecting && handleSelect(arch.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !selecting && handleSelect(arch.id)
                  }
                  role="button"
                  tabIndex={0}
                  className="bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex flex-col"
                  style={{ borderColor: colors.border }}
                >
                  <div className="p-3 sm:p-4">
                    <ArchitectureDiagramBlock
                      architectureId={arch.id}
                      name={arch.name}
                      selectedDiagram={selectedDiagramByArch[arch.id] ?? null}
                      onSelectDiagram={(filename) =>
                        setDiagramForArch(arch.id, filename)
                      }
                    />
                  </div>
                  <div className="px-4 pb-4 pt-0 flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: colors.badge }}
                      >
                        {arch.id}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-slate-900 truncate">
                          {arch.name}
                        </h2>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded inline-block mt-0.5"
                          style={{
                            background: colors.bg,
                            color: colors.badge,
                          }}
                        >
                          {arch.subtitle}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-3">
                      {arch.description}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-3">
                      <span>
                        <span className="font-semibold text-slate-700">Mandatory:</span>{" "}
                        <span className="font-bold text-red-700">{arch.mandatoryControls.length}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-slate-700">Advisory:</span>{" "}
                        <span className="font-bold text-amber-700">{arch.advisoryControls.length}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-slate-700">Total:</span>{" "}
                        <span className="font-bold text-slate-800">{totalControls}</span>
                      </span>
                      <span className="text-slate-600">Domains: {arch.domainIds.join(", ")}</span>
                    </div>
                    <details className="group mb-3">
                      <summary className="text-xs font-semibold text-slate-500 cursor-pointer list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
                        <span className="group-open:rotate-90 transition-transform">›</span>
                        In-scope components & controls
                      </summary>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {arch.components.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {arch.mandatoryControls.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200"
                            >
                              {c}
                            </span>
                          ))}
                          {arch.advisoryControls.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </details>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(arch.id);
                      }}
                      disabled={!!selecting}
                      className="mt-auto w-full py-2.5 font-medium text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                      style={{ background: colors.badge }}
                    >
                      {isSelecting ? "Setting up..." : "Select"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <strong>CSCF v2025 note:</strong> Organisations previously attesting as Architecture B
            that use application-to-application flows (middleware, API, file transfer) must
            reclassify to A4. Only GUI-only access remains as B. New A4 controls are advisory in
            v2025 and become mandatory in v2026.
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            <Link
              href="/assessments/new"
              className="text-blue-600 hover:underline"
            >
              Back to assessment cycles
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SelectArchitecturePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-500">Loading...</div>
        </div>
      }
    >
      <SelectArchitectureInner />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  ARCHITECTURES,
  ARCHITECTURE_DIAGRAMS,
  getArchitectureDiagramUrl,
  getArchitectureDiagramUrlAsync,
} from "@/lib/data/architectures";
import type { Architecture, CycleSchemaName } from "@/lib/types";
import { AppHeader } from "@/components/layout/app-header";

/** True when cycle uses 2026 framework (swift_2026 schema). Drives all version-specific copy and diagram requests. */
function is2026Schema(schemaName: CycleSchemaName | string | null | undefined): boolean {
  return String(schemaName).toLowerCase() === "swift_2026";
}

const TYPE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  A1: { bg: "#eff6ff", border: "#2563eb", badge: "#1e40af" },
  A2: { bg: "#f0fdf4", border: "#16a34a", badge: "#166534" },
  A3: { bg: "#fefce8", border: "#ca8a04", badge: "#854d0e" },
  A4: { bg: "#fff7ed", border: "#ea580c", badge: "#9a3412" },
  B: { bg: "#faf5ff", border: "#9333ea", badge: "#6b21a8" },
};

const EVIDENCE_ITEM_A5 = "A5";

/** Diagram caption / detailed identifier for the currently selected image */
function DiagramCaption({
  architectureId,
  architectureName,
  diagramFilename,
  diagramIndex,
  totalDiagrams,
}: {
  architectureId: string;
  architectureName: string;
  diagramFilename: string;
  diagramIndex: number;
  totalDiagrams: number;
}) {
  const label =
    totalDiagrams > 1
      ? `Drawing ${diagramIndex + 1}: ${architectureName} – Diagram ${diagramIndex + 1} of ${totalDiagrams}`
      : `Drawing: ${architectureName}`;
  return (
    <div className="mt-2 px-2 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
      <p className="text-xs font-semibold text-slate-700" aria-live="polite">
        {label}
      </p>
      <p className="text-[10px] text-slate-500 font-mono mt-0.5" title="File reference">
        {diagramFilename}
      </p>
    </div>
  );
}

/** Image that loads diagram URL from API when version is set and shouldLoad is true (lazy). */
function DiagramImage({
  filename,
  alt,
  version,
  className,
  shouldLoad = true,
}: {
  filename: string;
  alt: string;
  version?: string | null;
  className?: string;
  /** When false, use static placeholder only (lazy: load when slide is visible). */
  shouldLoad?: boolean;
}) {
  const staticUrl = getArchitectureDiagramUrl(filename);
  const [src, setSrc] = useState<string>(staticUrl);
  useEffect(() => {
    if (!shouldLoad) {
      setSrc(staticUrl);
      return;
    }
    if (version) {
      getArchitectureDiagramUrlAsync(filename, version).then(setSrc);
    } else {
      setSrc(staticUrl);
    }
  }, [filename, version, shouldLoad, staticUrl]);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Inner carousel: one architecture's diagrams with thumbnails and detailed caption. Only loads images when isVisible (lazy). */
function ArchitectureImageCarousel({
  arch,
  selectedDiagramFilename,
  onSelectDiagram,
  diagramVersion,
  isVisible,
}: {
  arch: Architecture;
  selectedDiagramFilename: string | null;
  onSelectDiagram: (filename: string) => void;
  diagramVersion?: string | null;
  /** When false, diagrams are not fetched (placeholder only) for lazy loading. */
  isVisible?: boolean;
}) {
  const diagrams = ARCHITECTURE_DIAGRAMS[arch.id] ?? [];
  const displayFilename = selectedDiagramFilename || diagrams[0];
  const hasMultiple = diagrams.length > 1;
  const [innerIndex, setInnerIndex] = useState(0);
  const effectiveIndex = displayFilename ? diagrams.indexOf(displayFilename) : 0;
  const shouldLoad = isVisible ?? true;

  useEffect(() => {
    setInnerIndex(effectiveIndex >= 0 ? effectiveIndex : 0);
  }, [effectiveIndex, arch.id]);

  const goPrev = () => {
    const next = innerIndex <= 0 ? diagrams.length - 1 : innerIndex - 1;
    setInnerIndex(next);
    if (diagrams[next]) onSelectDiagram(diagrams[next]);
  };
  const goNext = () => {
    const next = innerIndex >= diagrams.length - 1 ? 0 : innerIndex + 1;
    setInnerIndex(next);
    if (diagrams[next]) onSelectDiagram(diagrams[next]);
  };

  if (diagrams.length === 0) {
    return (
      <div className="w-full min-h-[200px] sm:min-h-[280px] rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
        <span className="text-sm text-slate-400">Diagram {arch.id}</span>
      </div>
    );
  }

  const currentFilename = diagrams[innerIndex] ?? diagrams[0];

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className="relative w-full min-h-[200px] sm:min-h-[280px] rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-3"
        style={{ borderColor: TYPE_COLORS[arch.id]?.border ?? "#e2e8f0" }}
      >
        {shouldLoad ? (
          <DiagramImage
            filename={currentFilename}
            alt={`${arch.name} – ${currentFilename}`}
            version={diagramVersion}
            className="w-full h-full min-h-[180px] sm:min-h-[260px] object-contain"
            shouldLoad={true}
          />
        ) : (
          <div className="w-full min-h-[180px] sm:min-h-[260px] flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
            {arch.id} diagram
          </div>
        )}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
              aria-label="Previous diagram"
            >
              <span className="sr-only">Previous</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
              aria-label="Next diagram"
            >
              <span className="sr-only">Next</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      {hasMultiple && shouldLoad && (
        <div className="flex gap-1.5 justify-center flex-wrap" role="group" aria-label="Select diagram">
          {diagrams.map((filename, i) => (
            <button
              key={filename}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInnerIndex(i);
                onSelectDiagram(filename);
              }}
              className={`w-10 h-8 sm:w-12 sm:h-9 rounded border overflow-hidden shrink-0 transition-all ${
                innerIndex === i
                  ? "ring-2 ring-offset-1 ring-slate-600 border-slate-600"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <DiagramImage
                filename={filename}
                alt={`Diagram ${i + 1}`}
                version={diagramVersion}
                className="w-full h-full object-cover"
                shouldLoad={true}
              />
            </button>
          ))}
        </div>
      )}
      {shouldLoad && (
        <DiagramCaption
          architectureId={arch.id}
          architectureName={arch.name}
          diagramFilename={currentFilename}
          diagramIndex={innerIndex}
          totalDiagrams={diagrams.length}
        />
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
  /** Cycle schema from backend: swift_2025 (2025) or swift_2026 (2026). Single source of truth for framework version. */
  const [schemaName, setSchemaName] = useState<CycleSchemaName | null>(null);
  const is2026 = is2026Schema(schemaName);
  /** Current architecture slide index (0 = A1, 1 = A2, …). */
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  /** Per-architecture selected diagram filename (e.g. A1-1.png). */
  const [selectedDiagramByArch, setSelectedDiagramByArch] = useState<Record<string, string>>({});
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const currentArch = ARCHITECTURES[currentSlideIndex] ?? ARCHITECTURES[0];
  const totalSlides = ARCHITECTURES.length;

  useEffect(() => {
    if (!user) router.replace("/login");
    if (isPlatformAdmin) router.replace("/admin");
  }, [user, isPlatformAdmin, router]);

  useEffect(() => {
    if (!cycleId) return;
    api
      .get<{ schema_name?: CycleSchemaName | string | null }>(`/assessments/${cycleId}`)
      .then((c) => {
        const raw = String(c.schema_name ?? "").toLowerCase();
        setSchemaName(raw === "swift_2026" ? "swift_2026" : "swift_2025");
      })
      .catch(() => setSchemaName("swift_2025"));
  }, [cycleId]);

  const goToSlide = useCallback((index: number) => {
    const i = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentSlideIndex(i);
    if (slideContainerRef.current) {
      const el = slideContainerRef.current;
      const width = el.offsetWidth;
      el.scrollTo({ left: i * width, behavior: "smooth" });
    }
  }, [totalSlides]);

  const goPrev = () => goToSlide(currentSlideIndex - 1);
  const goNext = () => goToSlide(currentSlideIndex + 1);

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
          const diagramUrl = await getArchitectureDiagramUrlAsync(diagramFilename, schemaName ?? undefined);
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
    [cycleId, schemaName]
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

  const handleScroll = useCallback(() => {
    if (!slideContainerRef.current) return;
    const el = slideContainerRef.current;
    const scrollLeft = el.scrollLeft;
    const width = el.offsetWidth;
    const index = Math.round(scrollLeft / width);
    if (index >= 0 && index < totalSlides) setCurrentSlideIndex(index);
  }, [totalSlides]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            Select your SWIFT architecture type
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mb-1">
            {schemaName == null ? (
              <span className="text-slate-500">Loading framework version…</span>
            ) : (
              <>CSCF {is2026 ? "v2026" : "v2025"} defines 5 architecture types. Your selection determines which controls and evidence items are in scope.</>
            )}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Use the carousel to view each architecture. Mandatory + Advisory controls shown per type.
            Select a diagram when multiple options are shown; your choice is saved as evidence for A5 (Architecture Type Declaration).
          </p>

          {/* Main carousel: one slide per architecture */}
          <div className="relative">
            <div
              ref={slideContainerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scroll-smooth scrollbar-thin"
              style={{ scrollbarWidth: "thin" }}
            >
              {ARCHITECTURES.map((arch, index) => {
                const colors = TYPE_COLORS[arch.id] ?? TYPE_COLORS.A1;
                return (
                  <section
                    key={arch.id}
                    data-slide-index={index}
                    className="shrink-0 w-full snap-center snap-always"
                    style={{ minWidth: "100%" }}
                  >
                    <div
                      className="bg-white rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row"
                      style={{ borderColor: colors.border }}
                    >
                      {/* Image carousel + caption (detailed identifier for selected image) */}
                      <div className="sm:w-1/2 shrink-0 p-4 sm:p-5">
                        <ArchitectureImageCarousel
                          arch={arch}
                          selectedDiagramFilename={selectedDiagramByArch[arch.id] ?? null}
                          onSelectDiagram={(filename) => setDiagramForArch(arch.id, filename)}
                          diagramVersion={schemaName}
                          isVisible={currentSlideIndex === index}
                        />
                      </div>
                      {/* Detailed identifier panel */}
                      <div className="sm:w-1/2 flex flex-col p-4 sm:p-5 border-t sm:border-t-0 sm:border-l border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: colors.badge }}
                          >
                            {arch.id}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-slate-900">{arch.name}</h2>
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded inline-block mt-0.5"
                              style={{ background: colors.bg, color: colors.badge }}
                            >
                              {arch.subtitle}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mb-3 flex-1">
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
                            <span className="font-bold text-slate-800">
                              {arch.mandatoryControls.length + arch.advisoryControls.length}
                            </span>
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
                          onClick={(e) => { e.stopPropagation(); handleSelect(arch.id); }}
                          disabled={!!selecting}
                          className="w-full py-2.5 font-medium text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                          style={{ background: colors.badge }}
                        >
                          {selecting === arch.id ? "Setting up..." : "Select"}
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Carousel controls: prev / next and dots */}
            <div className="flex items-center justify-between gap-4 mt-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous architecture"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Architecture slides">
                {ARCHITECTURES.map((arch, i) => (
                  <button
                    key={arch.id}
                    type="button"
                    role="tab"
                    aria-selected={currentSlideIndex === i}
                    aria-label={`${arch.name} (slide ${i + 1})`}
                    onClick={() => goToSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      currentSlideIndex === i
                        ? "bg-slate-700 scale-125"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={currentSlideIndex === totalSlides - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next architecture"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">
              {currentArch.name} · Slide {currentSlideIndex + 1} of {totalSlides}
            </p>
          </div>

          {schemaName != null && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              {is2026 ? (
                <>
                  <strong>CSCF v2026 note:</strong> Organisations previously attesting as Architecture B
                  that use application-to-application flows (middleware, API, file transfer) must
                  reclassify to A4. Only GUI-only access remains as B. A4 controls are mandatory in v2026.
                </>
              ) : (
                <>
                  <strong>CSCF v2025 note:</strong> Organisations previously attesting as Architecture B
                  that use application-to-application flows (middleware, API, file transfer) must
                  reclassify to A4. Only GUI-only access remains as B. New A4 controls are advisory in
                  v2025 and become mandatory in v2026.
                </>
              )}
            </div>
          )}

          <p className="mt-4 text-center text-sm text-slate-500">
            <Link href="/assessments/new" className="text-blue-600 hover:underline">
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

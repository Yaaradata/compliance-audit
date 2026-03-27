"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  getArchitectureVariantsForSchema,
  getArchitecturesForSchema,
  getArchitecture,
  type ArchitectureVariant,
} from "@/lib/frameworks/swift-cscf";
import type { Architecture, CycleSchemaName } from "@/lib/types";
import { AppShell } from "@/app/app-shell";

type WizardStep = "select-arch" | "select-variant" | "confirm";

interface ControlScopingItem {
  control_id: string;
  control_name: string;
  type: string;
  scoping_decision: string;
  scoping_justification_text: string | null;
  scoping_justification_file_path: string | null;
}

const DECISIONS = [
  { value: "applicable", label: "Applicable" },
  { value: "not_applicable", label: "Not applicable" },
  { value: "risk_accepted", label: "Accept risk" },
] as const;

function is2026Schema(schemaName: CycleSchemaName | string | null | undefined): boolean {
  return String(schemaName).toLowerCase() === "swift_2026";
}

const TYPE_PRESENTATION: Record<
  string,
  { icon: string; tagline: string; border: string; badge: string; bg: string }
> = {
  A1: {
    icon: "🏛️",
    tagline: "Complete on-premises ownership",
    border: "#2563eb",
    badge: "#1e40af",
    bg: "#eff6ff",
  },
  A2: {
    icon: "📡",
    tagline: "Local messaging, outsourced connectivity",
    border: "#0891b2",
    badge: "#155e75",
    bg: "#ecfeff",
  },
  A3: {
    icon: "🔌",
    tagline: "Lightweight connector, minimal footprint",
    border: "#0d9488",
    badge: "#134e4a",
    bg: "#f0fdfa",
  },
  A4: {
    icon: "⚙️",
    tagline: "Custom or middleware-based connection",
    border: "#7c3aed",
    badge: "#5b21b6",
    bg: "#faf5ff",
  },
  B: {
    icon: "☁️",
    tagline: "Fully outsourced or interactive-only access",
    border: "#ea580c",
    badge: "#9a3412",
    bg: "#fff7ed",
  },
};

function SelectArchitectureInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cycleId = searchParams.get("cycleId");
  const { user, isPlatformAdmin, setArchitecture, setActiveCycleId } = useAuth();

  const [schemaName, setSchemaName] = useState<CycleSchemaName | null>(null);
  const [step, setStep] = useState<WizardStep>("select-arch");
  const [selectedArch, setSelectedArch] = useState<Architecture | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ArchitectureVariant | null>(null);
  const [expandedComponents, setExpandedComponents] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [scopingItems, setScopingItems] = useState<ControlScopingItem[]>([]);
  const [scopingState, setScopingState] = useState<
    Record<string, { decision: string; justification: string; filePath: string; fileName: string }>
  >({});
  const [scopingLoading, setScopingLoading] = useState(false);
  const [scopingError, setScopingError] = useState("");
  const [uploadingControlId, setUploadingControlId] = useState<string | null>(null);
  const [scopingLoadedArchId, setScopingLoadedArchId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const is2026 = is2026Schema(schemaName);

  const architecturesList = useMemo(
    () => getArchitecturesForSchema(schemaName ?? undefined),
    [schemaName]
  );
  const architectureVariants = useMemo(
    () => getArchitectureVariantsForSchema(schemaName ?? undefined),
    [schemaName]
  );

  useEffect(() => {
    if (schemaName == null) return;
    setSelectedArch((prev) => {
      if (!prev) return prev;
      const fresh = getArchitecture(prev.id, schemaName);
      return fresh ?? prev;
    });
  }, [schemaName]);

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

  const handleArchSelect = (arch: Architecture) => {
    setSelectedArch(arch);
    setSelectedVariant(null);
    setExpandedComponents(false);
    setStep("select-variant");
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("select-variant");
      setSelectedVariant(null);
    } else if (step === "select-variant") {
      setStep("select-arch");
      setSelectedArch(null);
    }
  };

  const handleConfirm = useCallback(async () => {
    if (!selectedArch || !selectedVariant || !cycleId) return;
    const decisions = scopingItems.map((row) => {
      const state = scopingState[row.control_id] ?? {
        decision: "applicable",
        justification: "",
        filePath: "",
        fileName: "",
      };
      return {
        control_id: row.control_id,
        scoping_decision: state.decision,
        scoping_justification_text:
          state.decision !== "applicable" ? state.justification.trim() || null : null,
        scoping_justification_file_path:
          state.decision !== "applicable" ? state.filePath.trim() || null : null,
      };
    });
    const needsBoth = decisions.filter(
      (d) =>
        (d.scoping_decision === "not_applicable" || d.scoping_decision === "risk_accepted") &&
        (!(d.scoping_justification_text ?? "").trim() ||
          !(d.scoping_justification_file_path ?? "").trim())
    );
    if (needsBoth.length > 0) {
      setScopingError(
        `For "Not applicable" or "Accept risk", add both justification and document for: ${needsBoth
          .map((c) => c.control_id)
          .join(", ")}.`
      );
      return;
    }
    setSelecting(true);
    setScopingError("");
    try {
      await api.put(`/assessments/${cycleId}`, { architecture_type: selectedArch.id });
      await api.patch(`/assessments/${cycleId}/control-scoping`, { decisions });
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
      setArchitecture(selectedArch.id);
      router.replace(`/cycles/${cycleId}/dashboard`);
    } catch {
      setSelecting(false);
    }
  }, [
    selectedArch,
    selectedVariant,
    cycleId,
    scopingItems,
    scopingState,
    setActiveCycleId,
    setArchitecture,
    router,
  ]);

  useEffect(() => {
    const loadScoping = async () => {
      if (step !== "confirm" || !cycleId || !selectedArch || !selectedVariant) return;
      if (scopingLoadedArchId === selectedArch.id && scopingItems.length > 0) return;
      setScopingLoading(true);
      setScopingError("");
      try {
        await api.put(`/assessments/${cycleId}`, { architecture_type: selectedArch.id });
        const rows = await api.get<ControlScopingItem[]>(
          `/assessments/${cycleId}/control-scoping`
        );
        setScopingItems(rows);
        const nextState: Record<
          string,
          { decision: string; justification: string; filePath: string; fileName: string }
        > = {};
        rows.forEach((row) => {
          const filePath = row.scoping_justification_file_path ?? "";
          nextState[row.control_id] = {
            decision: row.scoping_decision || "applicable",
            justification: row.scoping_justification_text ?? "",
            filePath,
            fileName: filePath ? filePath.split("/").pop() ?? "" : "",
          };
        });
        setScopingState(nextState);
        setScopingLoadedArchId(selectedArch.id);
      } catch {
        setScopingItems([]);
        setScopingError("Failed to load controls for this architecture.");
      } finally {
        setScopingLoading(false);
      }
    };
    void loadScoping();
  }, [step, cycleId, selectedArch, selectedVariant, scopingItems.length, scopingLoadedArchId]);

  const setDecision = (controlId: string, decision: string) => {
    setScopingState((prev) => ({
      ...prev,
      [controlId]: {
        ...prev[controlId],
        decision,
        justification: decision === "applicable" ? "" : prev[controlId]?.justification ?? "",
        filePath: decision === "applicable" ? "" : prev[controlId]?.filePath ?? "",
        fileName: decision === "applicable" ? "" : prev[controlId]?.fileName ?? "",
      },
    }));
    setScopingError("");
  };

  const setJustification = (controlId: string, justification: string) => {
    setScopingState((prev) => ({ ...prev, [controlId]: { ...prev[controlId], justification } }));
    setScopingError("");
  };

  const handleFileSelect = async (controlId: string, file: File | null) => {
    if (!cycleId) return;
    if (!file) {
      setScopingState((prev) => ({
        ...prev,
        [controlId]: { ...prev[controlId], filePath: "", fileName: "" },
      }));
      return;
    }
    setUploadingControlId(controlId);
    setScopingError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("control_id", controlId);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("swift_compliance_token") : null;
      const res = await fetch(`/api/v1/assessments/${cycleId}/control-scoping/upload-justification`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Upload failed");
      }
      const data = (await res.json()) as { path: string; file_name: string };
      setScopingState((prev) => ({
        ...prev,
        [controlId]: {
          ...prev[controlId],
          filePath: data.path,
          fileName: data.file_name ?? file.name,
        },
      }));
    } catch (e) {
      setScopingError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingControlId(null);
    }
  };

  if (!user) return null;

  const arch = selectedArch;
  const variants = arch ? architectureVariants[arch.id] ?? [] : [];
  const mandatoryCount = arch?.mandatoryControls.length ?? 0;
  const advisoryCount = arch?.advisoryControls.length ?? 0;
  const totalControls = mandatoryCount + advisoryCount;

  return (
    <AppShell>
      <div className="w-full min-w-0 p-4 sm:p-6 bg-slate-50">
        <div className="w-full min-w-0">
          <div className="mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              CSCF {schemaName == null ? "…" : is2026 ? "v2026" : "v2025"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            Select your SWIFT architecture type
          </h1>
          <p className="text-sm text-slate-600 mb-1">
            {schemaName == null ? (
              <span className="text-slate-500">Loading framework version…</span>
            ) : (
              <>
                CSCF {is2026 ? "v2026" : "v2025"} defines 5 architecture types. Your selection determines which
                mandatory and advisory controls apply to your assessment.
              </>
            )}
          </p>
          {/* Stepper */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
            {(
              [
                { num: 1, label: "Architecture", key: "select-arch" as const },
                { num: 2, label: "Variant", key: "select-variant" as const },
                { num: 3, label: "Confirm", key: "confirm" as const },
              ] as const
            ).map((s, i) => {
              const isActive = step === s.key;
              const isDone =
                (step === "select-variant" && i === 0) || (step === "confirm" && i < 2);
              return (
                <div key={s.key} className="flex items-center gap-2 sm:gap-3">
                  {i > 0 && (
                    <div
                      className={`hidden sm:block w-6 h-0.5 ${isDone ? "bg-slate-700" : "bg-slate-200"}`}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? "bg-slate-800 text-white"
                          : isActive
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isDone ? "✓" : s.num}
                    </div>
                    <span
                      className={`text-xs sm:text-sm ${isActive ? "font-semibold text-slate-900" : "text-slate-500"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
                      </div>

          {/* Step 1 */}
          {step === "select-arch" && (
            <div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {architecturesList.map((a) => {
                  const pres = TYPE_PRESENTATION[a.id] ?? TYPE_PRESENTATION.A1;
                  const m = a.mandatoryControls.length;
                  const adv = a.advisoryControls.length;
                  const vCount = architectureVariants[a.id]?.length ?? 0;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleArchSelect(a)}
                      className="text-left rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      style={{ borderColor: undefined }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 text-white"
                            style={{ background: pres.badge }}
                          >
                            {pres.icon}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="inline-block text-[11px] font-bold text-white px-2 py-0.5 rounded mb-1"
                              style={{ background: pres.badge }}
                            >
                              {a.id}
                            </span>
                            <div className="font-semibold text-slate-900 text-sm leading-tight">{a.name}</div>
                          </div>
                        </div>
                        <span className="text-slate-400 shrink-0" aria-hidden>
                          →
                          </span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic mb-2">{pres.tagline}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{a.description}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                            {m} mandatory
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                            {adv} advisory
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {vCount} variant{vCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {schemaName != null && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  {is2026 ? (
                    <>
                      <strong>CSCF v2026 note:</strong> Organisations previously attesting as Architecture B that use
                      application-to-application flows (middleware, API, file transfer) must reclassify to A4. Only
                      GUI-only access remains as B.
                    </>
                  ) : (
                    <>
                      <strong>CSCF v2025 note:</strong> Organisations previously attesting as Architecture B that use
                      application-to-application flows must reclassify to A4. Only GUI-only access remains as B.
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === "select-variant" && arch && (
            <div>
              <div
                className="rounded-xl border-2 border-slate-200 bg-white p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ borderColor: TYPE_PRESENTATION[arch.id]?.border }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 text-white"
                  style={{ background: TYPE_PRESENTATION[arch.id]?.badge }}
                >
                  {TYPE_PRESENTATION[arch.id]?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold text-white px-2 py-0.5 rounded"
                      style={{ background: TYPE_PRESENTATION[arch.id]?.badge }}
                    >
                      {arch.id}
                    </span>
                    <span className="font-semibold text-slate-900">{arch.name}</span>
                  </div>
                  <p className="text-xs text-slate-600">{arch.description}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0 text-right">
                  <span className="text-[10px] font-semibold text-red-700">{mandatoryCount} mandatory</span>
                  <span className="text-[10px] font-semibold text-amber-800">{advisoryCount} advisory</span>
                </div>
              </div>

              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setExpandedComponents(!expandedComponents)}
                  className="text-sm font-semibold text-blue-700 flex items-center gap-1 hover:underline"
                >
                  <span>{expandedComponents ? "▾" : "▸"}</span>
                  In-scope components for {arch.id}
                </button>
                {expandedComponents && (
                  <div className="mt-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="flex flex-wrap gap-1.5">
                              {arch.components.map((c) => (
                                <span
                                  key={c}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Domains:</span>
                      {arch.domainIds.map((d) => (
                        <span
                          key={d}
                          className="w-6 h-6 rounded text-[10px] font-bold bg-slate-800 text-white flex items-center justify-center font-mono"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-sm font-bold text-slate-900 mb-3">Choose your deployment variant</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {variants.map((v) => {
                  const selected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`text-left rounded-xl border-2 p-4 transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selected
                          ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-200"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">{v.id}</span>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{v.label}</h3>
                        </div>
                        {selected && <span className="text-blue-600 text-lg shrink-0">✓</span>}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{v.description}</p>
                      <ul className="space-y-1">
                        {v.highlights.map((h) => (
                          <li key={h} className="text-[11px] text-green-800 flex gap-1.5 items-start">
                            <span className="text-green-600 shrink-0">✓</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!selectedVariant}
                  onClick={() => setStep("confirm")}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Review selection →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === "confirm" && arch && selectedVariant && (
            <div className="w-full space-y-5">
              <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
                <div
                  className="px-5 py-5 sm:px-6 sm:py-6 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${TYPE_PRESENTATION[arch.id]?.badge ?? "#0f172a"}, ${TYPE_PRESENTATION[arch.id]?.border ?? "#334155"})`,
                  }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">Selected architecture</p>
                  <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-2xl leading-none shrink-0" aria-hidden>
                        {TYPE_PRESENTATION[arch.id]?.icon}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold leading-snug">
                        {arch.id} — {arch.subtitle}
                      </h2>
                    </div>

                    <div className="rounded-lg bg-white/10 ring-1 ring-white/20 px-3 py-2 lg:min-w-[320px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/75">Variant</span>
                        <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums ring-1 ring-white/20">
                          {selectedVariant.id}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-snug text-white">{selectedVariant.label}</p>
                    </div>
                  </div>

                </div>
                <div className="p-5 sm:p-6 space-y-5 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                      <div className="text-[11px] font-semibold text-red-700">Mandatory controls</div>
                      <div className="mt-1 text-2xl font-bold text-red-800 font-mono">{mandatoryCount}</div>
                    </div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <div className="text-[11px] font-semibold text-amber-700">Advisory controls</div>
                      <div className="mt-1 text-2xl font-bold text-amber-800 font-mono">{advisoryCount}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-semibold text-slate-600">Total controls</div>
                      <div className="mt-1 text-2xl font-bold text-slate-900 font-mono">{totalControls}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-semibold text-slate-600">Domains in scope</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {arch.domainIds.map((d) => (
                          <span
                            key={d}
                            className="w-6 h-6 rounded text-[10px] font-bold bg-slate-800 text-white flex items-center justify-center font-mono"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Control applicability (select before continue)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    For Not applicable or Accept risk, justification text and supporting file are both required.
                  </p>
                </div>
                {scopingError && (
                  <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {scopingError}
                  </div>
                )}
                {scopingLoading ? (
                  <div className="px-5 py-8 text-sm text-slate-500">Loading controls…</div>
                ) : scopingItems.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-slate-500">
                    No controls loaded yet. Keep this architecture selected and try again.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[980px]">
                      <thead>
                        <tr className="bg-slate-50 border-y border-slate-100">
                          <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-600">Control</th>
                          <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-600">Name</th>
                          <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-600">Decision</th>
                          <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-600">Justification</th>
                          <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-600">Document</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scopingItems.map((row) => {
                          const state = scopingState[row.control_id] ?? {
                            decision: "applicable",
                            justification: "",
                            filePath: "",
                            fileName: "",
                          };
                          const needsJustification =
                            state.decision === "not_applicable" ||
                            state.decision === "risk_accepted";
                          return (
                            <tr key={row.control_id} className="border-b border-slate-100 align-top">
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    row.type === "M"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {row.control_id} {row.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-800">{row.control_name}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={state.decision}
                                  onChange={(e) => setDecision(row.control_id, e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
                                >
                                  {DECISIONS.map((d) => (
                                    <option key={d.value} value={d.value}>
                                      {d.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                {needsJustification ? (
                                  <textarea
                                    value={state.justification}
                                    onChange={(e) =>
                                      setJustification(row.control_id, e.target.value)
                                    }
                                    rows={2}
                                    placeholder="Add reason"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs resize-y"
                                  />
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {needsJustification ? (
                                  <div className="space-y-1">
                                    <input
                                      ref={(el) => {
                                        fileInputRefs.current[row.control_id] = el;
                                      }}
                                      type="file"
                                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        void handleFileSelect(row.control_id, f ?? null);
                                        e.target.value = "";
                                      }}
                                    />
                        <button
                          type="button"
                                      onClick={() => fileInputRefs.current[row.control_id]?.click()}
                                      disabled={uploadingControlId === row.control_id}
                                      className="text-xs font-medium text-blue-700 hover:underline disabled:opacity-60"
                                    >
                                      {uploadingControlId === row.control_id
                                        ? "Uploading…"
                                        : state.fileName
                                          ? "Replace file"
                                          : "Upload file"}
                        </button>
                                    {state.fileName && (
                                      <div className="text-[11px] text-slate-500 break-all">
                                        {state.fileName}
                      </div>
                                    )}
                    </div>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                );
              })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                    onClick={handleBack}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    ← Change variant
              </button>
              <button
                type="button"
                    onClick={handleConfirm}
                    disabled={selecting || !cycleId || scopingLoading}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40"
                  >
                    {selecting ? "Saving…" : "Save & continue"}
              </button>
            </div>
          </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/assessments/new" className="text-blue-600 hover:underline">
              Back to assessment cycles
            </Link>
          </p>
        </div>
    </div>
    </AppShell>
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

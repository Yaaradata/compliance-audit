"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

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

export default function ControlScopingPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;
  const { user, isPlatformAdmin, setActiveCycleId, setArchitecture } = useAuth();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [items, setItems] = useState<ControlScopingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cycleLabel, setCycleLabel] = useState("");
  const [architectureType, setArchitectureType] = useState<string | null>(null);
  const [localState, setLocalState] = useState<
    Record<string, { decision: string; justification: string; filePath: string; fileName: string }>
  >({});
  const [uploadingControlId, setUploadingControlId] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const fetchScoping = useCallback(async (showLoading = true) => {
    if (!cycleId) return;
    if (showLoading) setLoading(true);
    setError("");
    try {
      const [scoping, cycle] = await Promise.all([
        api.get<ControlScopingItem[]>(`/assessments/${cycleId}/control-scoping`),
        api.get<{ label: string; architecture_type: string | null }>(`/assessments/${cycleId}`),
      ]);
      const list = Array.isArray(scoping) ? scoping : [];
      setItems(list);
      setCycleLabel(cycle?.label ?? "");
      setArchitectureType(cycle?.architecture_type ?? null);
      const state: Record<string, { decision: string; justification: string; filePath: string; fileName: string }> = {};
      list.forEach((row) => {
        state[row.control_id] = {
          decision: row.scoping_decision || "applicable",
          justification: row.scoping_justification_text ?? "",
          filePath: row.scoping_justification_file_path ?? "",
          fileName: row.scoping_justification_file_path ? row.scoping_justification_file_path.split("/").pop() ?? "" : "",
        };
      });
      setLocalState(state);
    } catch {
      setItems([]);
      setError("Failed to load controls. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    if (!user) router.replace("/login");
    if (isPlatformAdmin) router.replace("/admin");
    if (user && !isPlatformAdmin) fetchScoping();
  }, [user, isPlatformAdmin, router, fetchScoping]);

  const setDecision = (controlId: string, decision: string) => {
    setLocalState((prev) => ({
      ...prev,
      [controlId]: {
        ...prev[controlId],
        decision,
        justification: decision === "applicable" ? "" : prev[controlId]?.justification ?? "",
        filePath: decision === "applicable" ? "" : prev[controlId]?.filePath ?? "",
        fileName: decision === "applicable" ? "" : prev[controlId]?.fileName ?? "",
      },
    }));
    setError("");
  };

  const setJustification = (controlId: string, justification: string) => {
    setLocalState((prev) => ({ ...prev, [controlId]: { ...prev[controlId], justification } }));
    setError("");
  };

  const handleFileSelect = async (controlId: string, file: File | null) => {
    if (!file) {
      setLocalState((prev) => ({
        ...prev,
        [controlId]: { ...prev[controlId], filePath: "", fileName: "" },
      }));
      return;
    }
    setUploadingControlId(controlId);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("control_id", controlId);
      const token = typeof window !== "undefined" ? localStorage.getItem("swift_compliance_token") : null;
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
      setLocalState((prev) => ({
        ...prev,
        [controlId]: { ...prev[controlId], filePath: data.path, fileName: data.file_name ?? file.name },
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingControlId(null);
    }
  };

  const saveScoping = async (): Promise<boolean> => {
    const decisions = items.map((row) => {
      const state = localState[row.control_id] ?? { decision: "applicable", justification: "", filePath: "", fileName: "" };
      return {
        control_id: row.control_id,
        scoping_decision: state.decision,
        scoping_justification_text: state.decision !== "applicable" ? (state.justification || null) : null,
        scoping_justification_file_path: state.decision !== "applicable" ? (state.filePath || null) : null,
      };
    });
    const needsBoth = decisions.filter(
      (d) =>
        (d.scoping_decision === "not_applicable" || d.scoping_decision === "risk_accepted") &&
        (!(d.scoping_justification_text ?? "").trim() || !(d.scoping_justification_file_path ?? "").trim())
    );
    if (needsBoth.length > 0) {
      setError(
        `For "Not applicable" or "Accept risk", both justification text and a supporting document are required for: ${needsBoth.map((c) => c.control_id).join(", ")}.`
      );
      return false;
    }
    setSaving(true);
    setError("");
    try {
      await api.patch(`/assessments/${cycleId}/control-scoping`, { decisions });
      return true;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to save.";
      setError(typeof msg === "string" ? msg : "Failed to save.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndGoToDashboard = async () => {
    const ok = await saveScoping();
    if (!ok) return;
    setRedirecting(true);
    try {
      const cycle = await api.get<{ id: string; label: string; cycle_year: number; display_id: string }>(`/assessments/${cycleId}`);
      setActiveCycleId(cycleId, {
        label: cycle.label,
        cycle_year: cycle.cycle_year,
        display_id: cycle.display_id,
      });
      if (architectureType) setArchitecture(architectureType);
      router.replace(`/cycles/${cycleId}/dashboard`);
    } finally {
      setRedirecting(false);
    }
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-foreground-muted">Loading control scoping…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="max-w-[1400px] w-full mx-auto">
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-3 gap-y-1 mb-2">
              <Link
                href={`/select-architecture?cycleId=${cycleId}`}
                className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors"
              >
                ← Back to architecture selection
              </Link>
              <span className="text-foreground-muted">·</span>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
              >
                Back to cycles
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Control Scoping & Applicability
            </h1>
            <p className="text-sm text-foreground-muted mt-1.5 max-w-2xl">
              For each control, choose <strong>Applicable</strong>, <strong>Not applicable</strong>, or <strong>Accept risk</strong>. For Not applicable or Accept risk, provide justification and upload a supporting document.
            </p>
            {cycleLabel && (
              <p className="text-xs text-foreground-muted mt-2">
                Cycle: <span className="font-medium text-foreground">{cycleLabel}</span>
              </p>
            )}
          </header>

          {error && (
            <div className="mb-5 p-4 rounded-lg border border-(--border) bg-(--error-bg) text-(--error) text-sm" role="alert">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center space-y-5">
              <p className="text-sm text-foreground-muted">
                {architectureType
                  ? "Controls could not be loaded. Select an architecture first, then return here."
                  : "No controls in scope yet. Select your architecture type first."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {architectureType && (
                  <button
                    type="button"
                    onClick={() => fetchScoping(true)}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-lg bg-(--primary) text-(--header-text) text-sm font-medium hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Loading…" : "Reload controls"}
                  </button>
                )}
                <Link
                  href={`/select-architecture?cycleId=${cycleId}`}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  Go to architecture selection →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-surface overflow-hidden overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse table-fixed">
                  <colgroup>
                    <col style={{ width: "7%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "38%" }} />
                    <col style={{ width: "19%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-(--primary-muted)/50">
                      <th className="py-3.5 px-5 text-xs font-semibold text-foreground uppercase tracking-wider">Control</th>
                      <th className="py-3.5 px-5 text-xs font-semibold text-foreground uppercase tracking-wider">Control name</th>
                      <th className="py-3.5 px-5 text-xs font-semibold text-foreground uppercase tracking-wider">Decision</th>
                      <th className="py-3.5 px-5 text-xs font-semibold text-foreground uppercase tracking-wider">Justification</th>
                      <th className="py-3.5 px-5 text-xs font-semibold text-foreground uppercase tracking-wider">Supporting document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, idx) => {
                      const state = localState[row.control_id] ?? {
                        decision: "applicable",
                        justification: "",
                        filePath: "",
                        fileName: "",
                      };
                      const showJustification = state.decision === "not_applicable" || state.decision === "risk_accepted";
                      return (
                        <tr
                          key={row.control_id}
                          className={`border-b border-border last:border-b-0 hover:bg-(--primary-muted)/20 ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                        >
                          <td className="py-3.5 px-5 align-top">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold shrink-0 ${
                                row.type === "M"
                                  ? "bg-(--danger-bg) text-(--danger)"
                                  : "bg-(--warning-bg) text-(--warning)"
                              }`}
                            >
                              {row.control_id} {row.type === "M" ? "M" : "A"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-sm text-foreground align-top pr-4">{row.control_name}</td>
                          <td className="py-3.5 px-5 align-top">
                            <select
                              value={state.decision}
                              onChange={(e) => setDecision(row.control_id, e.target.value)}
                              className="w-full py-2 px-3 text-sm rounded-lg border border-border bg-surface text-foreground focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) outline-none"
                              aria-label={`Decision for ${row.control_id}`}
                            >
                              {DECISIONS.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-5 align-top">
                            {showJustification ? (
                              <textarea
                                value={state.justification}
                                onChange={(e) => setJustification(row.control_id, e.target.value)}
                                placeholder="Explain why not applicable or why risk is accepted"
                                rows={3}
                                className="w-full min-h-[72px] px-3 py-2 text-sm rounded-lg border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) outline-none resize-y"
                              />
                            ) : (
                              <span className="text-foreground-muted text-sm">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 align-top">
                            {showJustification ? (
                              <div className="space-y-2">
                                <input
                                  ref={(el) => {
                                    fileInputRefs.current[row.control_id] = el;
                                  }}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    handleFileSelect(row.control_id, f ?? null);
                                    e.target.value = "";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => fileInputRefs.current[row.control_id]?.click()}
                                  disabled={uploadingControlId === row.control_id}
                                  className="text-sm font-medium text-(--primary) hover:underline disabled:opacity-60 block text-left"
                                >
                                  {uploadingControlId === row.control_id ? "Uploading…" : state.fileName ? `Replace: ${state.fileName}` : "Upload document"}
                                </button>
                                {state.fileName && (
                                  <p className="text-xs text-foreground-muted break-all" title={state.fileName}>
                                    {state.fileName}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-foreground-muted text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-5 rounded-xl border border-border bg-surface">
                <p className="text-xs text-foreground-muted mb-4">
                  Only controls marked as <strong>Applicable</strong> appear in evidence collection and the dashboard. Not applicable and Accept risk require both justification text and a supporting document.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSaveAndGoToDashboard}
                    disabled={saving || redirecting}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors min-w-[140px] bg-(--primary) text-(--header-text) hover:opacity-90 disabled:opacity-60"
                  >
                    {redirecting ? "Taking you to dashboard…" : saving ? "Saving…" : "Save"}
                  </button>
                </div>
                <p className="mt-3 text-xs text-foreground-muted">
                  Save stores your decisions and opens the cycle dashboard.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

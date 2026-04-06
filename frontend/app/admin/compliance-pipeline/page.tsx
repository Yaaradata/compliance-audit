"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/layout/app-header";

interface Pipeline {
  id: string;
  name: string;
  schema_name: string;
  status: string;
  current_stage: number;
  max_nav_stage?: number;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created:          { label: "Created",           color: "#6b7280" },
  stage_1_running:  { label: "Stage 1 Running",   color: "#3b82f6" },
  stage_1_review:   { label: "Stage 1 Review",    color: "#f59e0b" },
  stage_2_running:  { label: "Stage 2 Running",   color: "#3b82f6" },
  stage_2_review:   { label: "Stage 2 Review",    color: "#f59e0b" },
  stage_3_running:  { label: "Stage 3 Running",   color: "#3b82f6" },
  stage_3_review:   { label: "Stage 3 Review",    color: "#f59e0b" },
  finalizing:       { label: "Finalizing",         color: "#8b5cf6" },
  finalized:        { label: "Finalized",          color: "#10b981" },
  failed:           { label: "Failed",             color: "#ef4444" },
};

export default function CompliancePipelinePage() {
  const router = useRouter();
  const { user, isPlatformAdmin } = useAuth();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && !isPlatformAdmin) router.replace("/dashboard");
    if (!user) router.replace("/login");
  }, [user, isPlatformAdmin, router]);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    api.get<Pipeline[]>("/compliance-pipeline")
      .then(setPipelines)
      .catch(() => setPipelines([]))
      .finally(() => setLoading(false));
  }, [isPlatformAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pdfFile) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    const cleanName = name.trim();
    const derivedSchema = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "compliance";
    formData.append("name", cleanName);
    // Backward compatibility: older backend instances still require schema_name.
    formData.append("schema_name", /^[a-z]/.test(derivedSchema) ? derivedSchema : `c_${derivedSchema}`);
    formData.append("pdf", pdfFile);

    try {
      const token = localStorage.getItem("swift_compliance_token");
      const res = await fetch("/api/v1/compliance-pipeline", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      const pipeline = await res.json();
      setPipelines((prev) => [pipeline, ...prev]);
      setName("");
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push(`/admin/compliance-pipeline/${pipeline.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create pipeline");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <AppHeader />
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-52 flex flex-col shrink-0 p-3 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <nav className="flex flex-col gap-0.5">
            <Link href="/admin" className="nav-item flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--foreground-muted)" }}>Bank Onboarding</Link>
            <Link href="/admin/compliance-pipeline" className="nav-item flex items-center gap-2 px-3 py-2 text-xs font-semibold nav-item-active">New Compliance</Link>
            <Link href="/dashboard" className="nav-item flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--foreground-muted)" }}>Dashboard</Link>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold mb-6" style={{ color: "var(--foreground)" }}>New Compliance</h1>

            <form onSubmit={handleCreate} className="card rounded-xl p-6 mb-8">
              <h2 className="font-semibold text-slate-900 mb-4">Create a new compliance framework</h2>
              {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Compliance name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. PCI-DSS v4.0"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Compliance specification PDF</label>
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${pdfFile ? "border-blue-300 bg-blue-50" : "border-slate-300 hover:border-slate-400"}
                    `}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    />
                    {pdfFile ? (
                      <div>
                        <p className="text-sm font-medium text-blue-700">{pdfFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <p className="text-sm text-slate-500">Click to upload PDF</p>
                        <p className="text-xs text-slate-400 mt-1">Compliance specification document</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !pdfFile}
                  className="btn-primary px-4 py-2 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create & Start Pipeline"}
                </button>
              </div>
            </form>

            <div className="card rounded-xl overflow-hidden">
              <h2 className="font-semibold p-4 border-b" style={{ color: "var(--foreground)", borderColor: "var(--border)" }}>
                Compliance Pipelines
              </h2>
              {listError && (
                <div className="mx-4 mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{listError}</div>
              )}
              {loading ? (
                <p className="p-4 text-sm text-slate-400">Loading pipelines...</p>
              ) : pipelines.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No pipelines yet. Create one above.</p>
              ) : (
                <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {pipelines.map((p) => {
                    const st = STATUS_LABELS[p.status] || { label: p.status, color: "#6b7280" };
                    return (
                      <li key={p.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-3">
                        <Link href={`/admin/compliance-pipeline/${p.id}`} className="flex flex-1 min-w-0 justify-between items-center">
                          <div className="min-w-0">
                            <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{p.name}</span>
                            <span className="text-slate-500 text-xs ml-2 font-mono">({p.schema_name})</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: st.color + "15", color: st.color }}
                            >
                              {st.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(p.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === p.id}
                          className="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setListError(null);
                            if (
                              !confirm(
                                `Delete pipeline "${p.name}" and permanently drop schema "${p.schema_name}" (CASCADE)? This cannot be undone.`
                              )
                            ) {
                              return;
                            }
                            setDeletingId(p.id);
                            try {
                              // Prefer true DELETE; gracefully fallback for restrictive proxies.
                              try {
                                await api.del(`/compliance-pipeline/${p.id}`);
                              } catch {
                                try {
                                  await api.post(`/compliance-pipeline/${p.id}/delete`, {});
                                } catch {
                                  await api.post(`/compliance-pipeline/${p.id}`, {});
                                }
                              }
                              setPipelines((prev) => prev.filter((x) => x.id !== p.id));
                            } catch (err: unknown) {
                              setListError(err instanceof Error ? err.message : "Delete failed");
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                        >
                          {deletingId === p.id ? "…" : "Delete"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

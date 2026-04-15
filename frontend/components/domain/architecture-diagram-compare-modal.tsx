"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  getCloudDiagramCompareInventory,
  type AwsDiagramCompareResource,
} from "@/lib/aws-api";
import type { CloudEvidenceProvider } from "@/lib/cloud-evidence-api-paths";
import {
  getDiagramCompareCache,
  postDiagramCloudAiCompare,
  type DiagramCloudAiCompareResult,
  type DiagramCompareCacheResponse,
} from "@/lib/diagram-aws-ai-compare-api";

interface UploadedFile {
  id: string;
  file_name: string;
  file_type?: string;
}

function previewRank(fileName: string): number {
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return 0;
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return 1;
  return 9;
}

function pickPreviewFile(files: UploadedFile[]): UploadedFile | null {
  if (!files.length) return null;
  return [...files].sort((a, b) => previewRank(a.file_name) - previewRank(b.file_name))[0] ?? null;
}

function isCompareEligible(fileName: string): boolean {
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  return ["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(ext);
}

function getPreviewType(fileName: string, fileType?: string): "image" | "pdf" | "other" {
  const ext = (fileName?.split(".").pop() || fileType || "").toLowerCase().replace(/^.*\//, "");
  const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
  if (imageExts.includes(ext)) return "image";
  if (ext === "pdf" || (fileType && fileType.toLowerCase().includes("pdf"))) return "pdf";
  return "other";
}

function findResourceByAwsId(
  inventory: AwsDiagramCompareResource[],
  awsId: string,
  displayName?: string,
): AwsDiagramCompareResource | null {
  const idNorm = awsId.trim().toLowerCase();
  const nameNorm = (displayName || "").trim().toLowerCase();
  if (!idNorm && !nameNorm) return null;
  for (const r of inventory) {
    const rid = r.id.trim().toLowerCase();
    const rname = r.display_name.trim().toLowerCase();
    if (idNorm && (rid === idNorm || rid.includes(idNorm) || idNorm.includes(rid))) return r;
    if (nameNorm && rname === nameNorm) return r;
  }
  return null;
}

function providerShort(p: CloudEvidenceProvider): string {
  if (p === "gcp") return "GCP";
  if (p === "azure") return "Azure";
  return "AWS";
}

function inventoryConnectHint(p: CloudEvidenceProvider): string {
  if (p === "aws") return "Connect AWS and run evidence collection to load tagged resources.";
  if (p === "gcp") return "Run GCP evidence collection to load tagged resources.";
  return "Connect Azure and run evidence collection to load tagged resources.";
}

function syntheticFromAiMatched(m: DiagramCloudAiCompareResult["matched"][0]): AwsDiagramCompareResource {
  return {
    resource_type: "ai_match",
    id: m.aws_id || m.aws_display_name || "unknown",
    display_name: m.aws_display_name || m.aws_id || "Inventory resource",
    region: "",
    application: null,
    environment: null,
    service: null,
    tag_pairs: m.rationale ? [{ key: "AI rationale", value: m.rationale }] : [],
  };
}

function syntheticFromAiExtra(x: DiagramCloudAiCompareResult["extra_in_aws"][0]): AwsDiagramCompareResource {
  return {
    resource_type: "ai_extra",
    id: x.aws_id || x.aws_display_name || "unknown",
    display_name: x.aws_display_name || x.aws_id || "Inventory resource",
    region: "",
    application: null,
    environment: null,
    service: null,
    tag_pairs: x.rationale ? [{ key: "AI rationale", value: x.rationale }] : [],
  };
}

const COMPARE_PROVIDERS: CloudEvidenceProvider[] = ["aws", "gcp", "azure"];

function providerToggleButtonClass(p: CloudEvidenceProvider, active: boolean): string {
  const base =
    "text-[11px] font-semibold px-2.5 py-1.5 rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40";
  if (!active) {
    return `${base} border-transparent text-[var(--foreground-muted)] hover:bg-[var(--muted)]/50`;
  }
  if (p === "aws") return `${base} border-sky-500 bg-sky-500/15 text-sky-900 dark:text-sky-100`;
  if (p === "gcp") return `${base} border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100`;
  return `${base} border-blue-600 bg-blue-500/15 text-blue-900 dark:text-blue-100`;
}

export function ArchitectureDiagramCompareModal({
  open,
  onClose,
  cycleId,
  submissionId,
  defaultCompareProvider,
  inventoryLinkedByProvider,
}: {
  open: boolean;
  onClose: () => void;
  cycleId: string;
  submissionId: string | null;
  /** Initial tab when the modal opens (e.g. workspace suggest-from provider). */
  defaultCompareProvider: CloudEvidenceProvider;
  /** Whether “Refresh inventory” is allowed per cloud (e.g. AWS/Azure need connection). */
  inventoryLinkedByProvider: Record<CloudEvidenceProvider, boolean>;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const [inventory, setInventory] = useState<AwsDiagramCompareResource[]>([]);
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [selected, setSelected] = useState<AwsDiagramCompareResource | null>(null);

  const [aiResult, setAiResult] = useState<DiagramCloudAiCompareResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [compareCache, setCompareCache] = useState<DiagramCompareCacheResponse | null>(null);

  const [compareTarget, setCompareTarget] = useState<CloudEvidenceProvider>(defaultCompareProvider);

  const compareLinked = inventoryLinkedByProvider[compareTarget] === true;

  const compareEligibleFiles = useMemo(
    () => files.filter((f) => isCompareEligible(f.file_name)),
    [files],
  );

  useEffect(() => {
    if (!compareEligibleFiles.length) {
      setSelectedFileId(null);
      return;
    }
    if (!selectedFileId || !compareEligibleFiles.some((f) => f.id === selectedFileId)) {
      setSelectedFileId(pickPreviewFile(compareEligibleFiles)?.id ?? null);
    }
  }, [compareEligibleFiles, selectedFileId]);

  const previewFile = useMemo(
    () => compareEligibleFiles.find((f) => f.id === selectedFileId) ?? pickPreviewFile(compareEligibleFiles),
    [compareEligibleFiles, selectedFileId],
  );

  useEffect(() => {
    if (!open) {
      setAiResult(null);
      setAiError(null);
      setAiLoading(false);
      setCompareCache(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCompareTarget(defaultCompareProvider);
    setAiError(null);
    setSelected(null);
  }, [open, defaultCompareProvider]);

  useEffect(() => {
    if (!open || !submissionId || !cycleId) {
      return;
    }
    let cancelled = false;
    getDiagramCompareCache(cycleId, submissionId)
      .then((data) => {
        if (!cancelled) setCompareCache(data);
      })
      .catch(() => {
        if (!cancelled) setCompareCache({ by_provider: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [open, submissionId, cycleId]);

  useEffect(() => {
    if (!open || compareCache === null || !selectedFileId) return;
    const row = compareCache.by_provider?.[compareTarget]?.[selectedFileId];
    setAiResult(row ? { ...row } : null);
  }, [open, compareTarget, selectedFileId, compareCache]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !submissionId) {
      setFiles([]);
      return;
    }
    api
      .get<UploadedFile[]>(`/evidence/${submissionId}/files`)
      .then(setFiles)
      .catch(() => setFiles([]));
  }, [open, submissionId]);

  useEffect(() => {
    if (!open || !previewFile || !submissionId) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewUrl(null);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    const pType = getPreviewType(previewFile.file_name, previewFile.file_type);
    if (pType === "other") {
      setPreviewLoading(false);
      setPreviewError("Preview supports images and PDF for this flow.");
      return;
    }
    api
      .getBlob(`/evidence/${submissionId}/files/${previewFile.id}`)
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        blobUrlRef.current = objectUrl;
        setPreviewUrl(objectUrl);
      })
      .catch((err) => {
        setPreviewError(err?.message || "Could not load file.");
      })
      .finally(() => setPreviewLoading(false));

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [open, previewFile?.id, submissionId, previewFile]);

  const loadInventory = useCallback(() => {
    const p = compareTarget;
    const linked = inventoryLinkedByProvider[p] === true;
    if (!linked || !cycleId) {
      setInventory([]);
      setInventoryMessage(inventoryConnectHint(p));
      return;
    }
    setInventoryLoading(true);
    setInventoryMessage(null);
    getCloudDiagramCompareInventory(p, cycleId)
      .then((res) => {
        setInventory(res.resources ?? []);
        setInventoryMessage(res.message || (res.resources?.length ? null : "No resources returned."));
      })
      .catch((e) => {
        setInventory([]);
        setInventoryMessage(
          e instanceof Error ? e.message : `Could not load ${providerShort(p)} inventory.`,
        );
      })
      .finally(() => setInventoryLoading(false));
  }, [compareTarget, inventoryLinkedByProvider, cycleId]);

  useEffect(() => {
    if (!open) return;
    loadInventory();
  }, [open, compareTarget, loadInventory]);

  const selectCompareProvider = useCallback((p: CloudEvidenceProvider) => {
    if (p === compareTarget) return;
    setCompareTarget(p);
    setAiError(null);
    setSelected(null);
  }, [compareTarget]);

  const runAiCompare = useCallback(async () => {
    if (!submissionId || !cycleId || !selectedFileId) {
      setAiError("Select a diagram file and ensure the submission is saved.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await postDiagramCloudAiCompare(cycleId, {
        submission_id: submissionId,
        attachment_id: selectedFileId,
        cloud_provider: compareTarget,
      });
      setAiResult(res);
      try {
        const fresh = await getDiagramCompareCache(cycleId, submissionId);
        setCompareCache(fresh);
      } catch {
        /* keep prior cache; aiResult already set */
      }
      loadInventory();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI comparison failed.");
    } finally {
      setAiLoading(false);
    }
  }, [submissionId, cycleId, selectedFileId, compareTarget, loadInventory]);

  const aiSummaryCounts = useMemo(() => {
    if (!aiResult) return { matched: 0, missing: 0, extra: 0 };
    return {
      matched: aiResult.matched?.length ?? 0,
      missing: aiResult.missing_in_aws?.length ?? 0,
      extra: aiResult.extra_in_aws?.length ?? 0,
    };
  }, [aiResult]);

  const invBrand = providerShort(compareTarget);

  if (!open) return null;

  const pType = previewFile ? getPreviewType(previewFile.file_name, previewFile.file_type) : "other";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagram-compare-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-[1200px] max-h-[92vh] flex flex-col overflow-hidden">
        <div className="shrink-0 border-b border-[var(--border)] px-4 py-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <h2 id="diagram-compare-title" className="text-sm font-semibold text-[var(--foreground)]">
                Architecture diagram vs {invBrand} evidence
              </h2>
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Cloud platform for comparison">
                <span className="text-[11px] font-medium text-[var(--foreground-muted)] shrink-0">Compare against</span>
                <div className="inline-flex flex-wrap gap-0.5 rounded-lg border border-[var(--border)] p-0.5 bg-[var(--background)]/70">
                  {COMPARE_PROVIDERS.map((p) => {
                    const active = compareTarget === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-pressed={active}
                        onClick={() => selectCompareProvider(p)}
                        className={providerToggleButtonClass(p, active)}
                      >
                        {providerShort(p)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--muted)]/50 text-[var(--foreground-muted)] shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[var(--border)]">
          <div className="min-h-[220px] lg:min-h-0 flex flex-col border-b lg:border-b-0 border-[var(--border)] p-4 overflow-hidden">
            <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
              Uploaded diagram
            </p>
            {compareEligibleFiles.length > 1 && (
              <label className="block text-[11px] text-[var(--foreground-muted)] mb-2">
                File for preview &amp; AI analysis
                <select
                  value={selectedFileId ?? ""}
                  onChange={(e) => setSelectedFileId(e.target.value || null)}
                  className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs py-1.5 px-2"
                >
                  {compareEligibleFiles.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.file_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex-1 min-h-[180px] rounded-xl border border-[var(--border)] bg-[var(--background)]/60 overflow-hidden flex flex-col">
              {!submissionId && (
                <p className="text-sm text-[var(--foreground-muted)] m-auto px-4 text-center">
                  Save the submission to attach a diagram, then reopen Compare.
                </p>
              )}
              {submissionId && !previewFile && !previewLoading && (
                <p className="text-sm text-[var(--foreground-muted)] m-auto px-4 text-center">
                  Upload a PDF or image diagram. AI comparison uses the same file.
                </p>
              )}
              {previewLoading && (
                <p className="text-sm text-[var(--foreground-muted)] m-auto">Loading preview…</p>
              )}
              {previewError && (
                <p className="text-sm text-amber-700 dark:text-amber-300 m-auto px-4 text-center">{previewError}</p>
              )}
              {previewUrl && pType === "image" && (
                <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-2">
                  <img src={previewUrl} alt="Architecture diagram" className="max-w-full max-h-[min(55vh,480px)] object-contain" />
                </div>
              )}
              {previewUrl && pType === "pdf" && (
                <iframe title="Diagram PDF" src={previewUrl} className="w-full flex-1 min-h-[280px] border-0 bg-white" />
              )}
            </div>
          </div>

          <div className="min-h-[280px] lg:min-h-0 flex flex-col p-4 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
                {invBrand} evidence &amp; comparison
              </p>
              <button
                type="button"
                onClick={() => loadInventory()}
                disabled={inventoryLoading || !compareLinked}
                className="text-[11px] font-semibold px-2 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--muted)]/40 disabled:opacity-50"
              >
                Refresh inventory
              </button>
              <button
                type="button"
                onClick={() => void runAiCompare()}
                disabled={
                  aiLoading ||
                  !submissionId ||
                  !selectedFileId ||
                  !compareEligibleFiles.length
                }
                className="text-[11px] font-semibold px-2 py-1 rounded-md border border-sky-500/60 bg-sky-500/10 text-sky-800 dark:text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
              >
                {aiLoading ? "Running AI…" : "Run AI comparison"}
              </button>
            </div>

            {aiError && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-2" role="alert">
                {aiError}
              </p>
            )}

            {aiResult?.summary && (
              <p className="text-xs text-[var(--foreground)] mb-2 leading-relaxed border-l-2 border-sky-500/50 pl-2">
                {aiResult.summary}
              </p>
            )}
            {aiResult?.compared_at && (
              <p className="text-[10px] text-[var(--foreground-muted)] mb-2">
                Last compared: {new Date(aiResult.compared_at).toLocaleString()}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5">
                Matched: {aiSummaryCounts.matched}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 text-red-800 dark:text-red-200 px-2 py-0.5">
                Missing: {aiSummaryCounts.missing}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 text-amber-900 dark:text-amber-100 px-2 py-0.5">
                Extra: {aiSummaryCounts.extra}
              </span>
            </div>

            {!aiResult && inventoryMessage && (
              <p className="text-xs text-[var(--foreground-muted)] mb-2">{inventoryMessage}</p>
            )}
            {(aiResult?.inventory_message ?? aiResult?.aws_inventory_message) && (
              <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                {aiResult.inventory_message ?? aiResult.aws_inventory_message}
              </p>
            )}
            {inventoryLoading && <p className="text-xs text-[var(--foreground-muted)] mb-2">Loading inventory…</p>}

            <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {aiLoading && (
                <p className="text-sm text-[var(--foreground-muted)] p-4">Running AI comparison…</p>
              )}
              {!aiResult && !aiLoading && (
                <p className="text-sm text-[var(--foreground-muted)] p-4">
                  Click <strong>Run AI comparison</strong> to send this diagram and your latest {invBrand} collector snapshot
                  to the model. Results list matched labels, gaps (on diagram but not in {invBrand}), and extras (in {invBrand}{" "}
                  but not on the diagram).
                </p>
              )}
              {aiResult && (
                <>
                  {(aiResult.matched ?? []).map((m, idx) => {
                    const r =
                      findResourceByAwsId(inventory, m.aws_id, m.aws_display_name) ?? syntheticFromAiMatched(m);
                    const active = selected?.id === r.id && selected?.resource_type === r.resource_type;
                    return (
                      <button
                        type="button"
                        key={`ai-m-${idx}-${m.aws_id}`}
                        onClick={() => setSelected(r)}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition hover:bg-[var(--muted)]/30 ${active ? "bg-emerald-500/10" : "bg-emerald-500/5"}`}
                      >
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-2">Matched</span>
                        <span className="text-[var(--foreground)]">{m.diagram_label}</span>
                        <span className="text-[var(--foreground-muted)]"> → </span>
                        <span className="text-[var(--foreground)]">{m.aws_display_name || m.aws_id}</span>
                        <span className="text-[var(--foreground-muted)] ml-1 text-[11px]">
                          ({m.confidence})
                        </span>
                        {(r.application || r.environment || r.service) && (
                          <span className="block mt-0.5 text-[11px] text-[var(--foreground-muted)] pl-1">
                            {[r.application, r.environment, r.service].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {(aiResult.missing_in_aws ?? []).map((m, idx) => (
                    <div
                      key={`ai-miss-${idx}-${m.diagram_label}`}
                      className="px-3 py-2 text-xs sm:text-sm bg-red-500/5 border-l-2 border-red-500/70"
                    >
                      <span className="text-red-600 dark:text-red-400 font-semibold mr-2">Missing in {invBrand}</span>
                      <span className="text-[var(--foreground)]">{m.diagram_label}</span>
                      {m.rationale && (
                        <span className="block mt-1 text-[11px] text-[var(--foreground-muted)]">{m.rationale}</span>
                      )}
                    </div>
                  ))}
                  {(aiResult.extra_in_aws ?? []).map((x, idx) => {
                    const r =
                      findResourceByAwsId(inventory, x.aws_id, x.aws_display_name) ?? syntheticFromAiExtra(x);
                    const active = selected?.id === r.id && selected?.resource_type === r.resource_type;
                    return (
                      <button
                        type="button"
                        key={`ai-x-${idx}-${x.aws_id}`}
                        onClick={() => setSelected(r)}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition hover:bg-[var(--muted)]/30 ${active ? "bg-amber-500/15" : "bg-amber-400/8"}`}
                      >
                        <span className="text-amber-700 dark:text-amber-300 font-semibold mr-2">Extra in {invBrand}</span>
                        <span className="text-[var(--foreground)]">{x.aws_display_name || x.aws_id}</span>
                        {x.rationale && (
                          <span className="block mt-1 text-[11px] text-[var(--foreground-muted)]">{x.rationale}</span>
                        )}
                        {(r.application || r.environment || r.service) && (
                          <span className="block mt-0.5 text-[11px] text-[var(--foreground-muted)] pl-1">
                            App: {r.application ?? "—"} · Env: {r.environment ?? "—"} · Service: {r.service ?? "—"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {selected && (
              <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--background)]/80 p-3 max-h-[200px] overflow-y-auto">
                <p className="text-xs font-semibold text-[var(--foreground)] mb-2">
                  Tags — {selected.display_name}
                </p>
                {selected.tag_pairs.length === 0 ? (
                  <p className="text-xs text-[var(--foreground-muted)]">No tags on this resource.</p>
                ) : (
                  <table className="w-full text-[11px]">
                    <tbody>
                      {selected.tag_pairs.map((t, ti) => (
                        <tr key={`${t.key}-${ti}`} className="border-t border-[var(--border)] first:border-t-0">
                          <td className="py-1 pr-2 font-medium text-[var(--foreground-muted)] align-top whitespace-nowrap">
                            {t.key}
                          </td>
                          <td className="py-1 text-[var(--foreground)] break-all">{t.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DomainWorkspaceLayout } from "@/components/domain/dashboard/domain-workspace-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { A2_EVIDENCE_ITEM_ID } from "@/lib/data/a2-evidence";
import type { DomainConfig, EvidenceItem, ControlCriteria, AiEvaluationResult as AiEvalResultType } from "@/lib/types";

interface ApiDomain {
  id: string;
  name: string;
  color: string | null;
  accent_color: string | null;
  item_count: number;
  sort_order: number;
}

interface ApiEvidenceItem {
  id: string;
  domain_id: string;
  sort_order: number;
  name: string;
  priority: string;
  evidence_type: string;
  description: string;
  reduction_note: string | null;
  control_count: number;
  per_system: boolean;
  per_zone: boolean;
  per_quarter: boolean;
  per_access_point: boolean;
  is_advisory: boolean;
  is_conditional: boolean;
  controls?: { control_id: string; ma: string }[];
  matrix?: ControlCriteria[];
}

type EvaluationEditsMap = Record<string, { met: boolean; description: string | null }>;

interface ApiSubmission {
  id: string;
  evidence_item_id: string;
  status: string;
  form_data: Record<string, string>;
  completion_pct: number;
  last_evaluation?: {
    evidence_item_id: string;
    overall_met: boolean;
    sufficiency_results: { id: string; label: string; met: boolean; description?: string | null }[];
    criteria: { id: string; label: string; met: boolean; description?: string | null }[];
    summary?: string | null;
    remediation?: string | null;
  } | null;
  evaluation_edits?: EvaluationEditsMap;
}

const GRADIENTS: Record<string, string> = {
  A: "linear-gradient(135deg, #0F4C75 0%, #1B6FA0 100%)",
  B: "linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)",
  C: "linear-gradient(135deg, #E65100 0%, #FB8C00 100%)",
  D: "linear-gradient(135deg, #B71C1C 0%, #E53935 100%)",
  E: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)",
  F: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
  G: "linear-gradient(135deg, #F57F17 0%, #FFB300 100%)",
  H: "linear-gradient(135deg, #BF360C 0%, #E64A19 100%)",
};

function applyEditsToResult(
  result: AiEvalResultType,
  edits: EvaluationEditsMap
): AiEvalResultType {
  if (Object.keys(edits).length === 0) return result;
  const apply = (list: { id: string; label: string; met: boolean; description?: string | null }[]) =>
    list.map((c) => {
      const e = edits[c.id];
      if (!e) return c;
      return { ...c, met: e.met, description: e.description ?? c.description ?? null };
    });
  const sufficiency_results = apply(result.sufficiency_results ?? []);
  const criteria = apply(result.criteria);
  const overall_met =
    sufficiency_results.every((c) => c.met) && criteria.every((c) => c.met);
  return {
    ...result,
    sufficiency_results,
    criteria,
    overall_met,
  };
}

function toEvidenceItem(a: ApiEvidenceItem): EvidenceItem {
  const controls = (a.controls ?? []).map((c) => ({ id: c.control_id, name: "", ma: c.ma as "M" | "A" }));
  return {
    id: a.id,
    order: a.sort_order,
    name: a.name,
    priority: a.priority as EvidenceItem["priority"],
    type: a.evidence_type,
    controls,
    controlCount: a.control_count,
    description: a.description,
    matrix: a.matrix ?? [],
    inputs: [],
    sufficiency: [],
    reductionNote: a.reduction_note ?? "",
    perSystem: a.per_system,
    perZone: a.per_zone,
    perQuarter: a.per_quarter,
    perAccessPoint: a.per_access_point,
    isAdvisory: a.is_advisory,
    conditional: a.is_conditional,
  };
}

export default function CycleDomainPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const domainId = (params.domainId as string)?.toUpperCase();
  const { activeCycleId } = useAuth();

  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [evaluated, setEvaluated] = useState(false);
  const [aiEvaluationLoading, setAiEvaluationLoading] = useState(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<AiEvalResultType | null>(null);
  const [aiEvaluationError, setAiEvaluationError] = useState<string | null>(null);
  const [submissionMap, setSubmissionMap] = useState<Record<string, string>>({});
  const [controlScores, setControlScores] = useState<Record<string, number>>({});
  const [lastEvaluationByItem, setLastEvaluationByItem] = useState<Record<string, AiEvalResultType>>({});
  const [completionPctByItem, setCompletionPctByItem] = useState<Record<string, number>>({});
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [a2Rows, setA2Rows] = useState<Record<string, string>[]>([{}]);
  const [submitForReviewLoading, setSubmitForReviewLoading] = useState(false);
  const [submissionStatusMap, setSubmissionStatusMap] = useState<Record<string, string>>({});
  const [evaluationEditsByItem, setEvaluationEditsByItem] = useState<Record<string, EvaluationEditsMap>>({});

  useEffect(() => {
    setSelectedControlId(null);
  }, [activeItem]);

  useEffect(() => {
    if (!cycleId || !domainId) return;
    setLoading(true);

    const refPromise = api.get<{ domain: ApiDomain | null; evidence_items: ApiEvidenceItem[] }>(`/ref/domains/${domainId}?cycle_id=${cycleId}`);
    const subsPromise = api.get<ApiSubmission[]>(`/assessments/${cycleId}/evidence?domain=${domainId}`);
    const controlsPromise = api.get<{ id: string; score: number }[]>(`/assessments/${cycleId}/controls`);

    Promise.all([refPromise, subsPromise, controlsPromise])
      .then(([refRes, subs, controlsData]) => {
        if (!refRes.domain) { setConfig(null); return; }
        const d = refRes.domain;
        const evidenceItems = refRes.evidence_items.map(toEvidenceItem);
        const allControls = [...new Set(evidenceItems.flatMap((i) => i.controls.map((c) => c.id)))];
        setConfig({
          id: d.id,
          name: d.name,
          color: d.color ?? "#666",
          gradient: GRADIENTS[d.id] ?? "linear-gradient(135deg, #666 0%, #999 100%)",
          accentColor: d.accent_color ?? "#eee",
          evidenceItems,
          allControls,
          subGroups: [],
          weights: {},
        });
        if (evidenceItems.length > 0) setActiveItem(evidenceItems[0].id);

        const data: Record<string, string> = {};
        const sMap: Record<string, string> = {};
        const statusMap: Record<string, string> = {};
        const evalByItem: Record<string, AiEvalResultType> = {};
        const completionByItem: Record<string, number> = {};
        const editsByItem: Record<string, EvaluationEditsMap> = {};
        subs.forEach((s) => {
          sMap[s.evidence_item_id] = s.id;
          statusMap[s.evidence_item_id] = s.status;
          if (s.form_data) {
            Object.entries(s.form_data).forEach(([k, v]) => {
              data[`${s.evidence_item_id}_${k}`] = String(v);
            });
          }
          const edits = s.evaluation_edits ?? {};
          editsByItem[s.evidence_item_id] = edits;
          if (s.last_evaluation) {
            const base = {
              evidence_item_id: s.last_evaluation.evidence_item_id,
              overall_met: s.last_evaluation.overall_met,
              sufficiency_results: s.last_evaluation.sufficiency_results?.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })) ?? [],
              criteria: s.last_evaluation.criteria?.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })) ?? [],
              summary: s.last_evaluation.summary ?? null,
              remediation: s.last_evaluation.remediation ?? null,
            };
            evalByItem[s.evidence_item_id] = applyEditsToResult(base, edits);
          }
          if (s.completion_pct != null && s.completion_pct > 0) {
            completionByItem[s.evidence_item_id] = Math.round(s.completion_pct);
          }
        });
        setEvaluationEditsByItem(editsByItem);
        subs.forEach((s) => {
          if (s.evidence_item_id === A2_EVIDENCE_ITEM_ID && s.form_data?.inventory_rows) {
            try {
              const parsed = JSON.parse(s.form_data.inventory_rows);
              if (Array.isArray(parsed) && parsed.length > 0) setA2Rows(parsed);
            } catch { /* ignore */ }
          }
        });
        setFormData(data);
        setSubmissionMap(sMap);
        setSubmissionStatusMap(statusMap);
        setLastEvaluationByItem(evalByItem);
        setCompletionPctByItem(completionByItem);

        const scores: Record<string, number> = {};
        controlsData.forEach((c) => { scores[c.id] = Math.round(c.score); });
        setControlScores(scores);
      })
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, [cycleId, domainId]);

  useEffect(() => {
    if (!activeItem) return;
    const stored = lastEvaluationByItem[activeItem];
    if (stored) {
      setAiEvaluationResult(stored);
      setEvaluated(true);
    } else {
      setAiEvaluationResult(null);
      setEvaluated(false);
    }
  }, [activeItem, lastEvaluationByItem]);

  const fetchControlScores = useCallback(async () => {
    if (!cycleId) return;
    try {
      const data = await api.get<{ id: string; score: number }[]>(`/assessments/${cycleId}/controls`);
      const scores: Record<string, number> = {};
      data.forEach((c) => { scores[c.id] = Math.round(c.score); });
      setControlScores(scores);
    } catch { /* ignore */ }
  }, [cycleId]);

  const ensureSubmission = useCallback(async (itemId: string): Promise<string> => {
    if (submissionMap[itemId]) return submissionMap[itemId];
    const sub = await api.post<{ id: string }>(`/assessments/${cycleId}/evidence`, { evidence_item_id: itemId });
    setSubmissionMap((prev) => ({ ...prev, [itemId]: sub.id }));
    return sub.id;
  }, [cycleId, submissionMap]);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setEvaluated(false);
    setAiEvaluationResult(null);
  }, []);

  const currentItem = useMemo(() => config?.evidenceItems.find((e) => e.id === activeItem), [config, activeItem]);
  const currentSubmissionId = activeItem ? submissionMap[activeItem] ?? null : null;

  const getItemCompletion = useCallback((itemId: string) => {
    const item = config?.evidenceItems.find((e) => e.id === itemId);
    if (!item || !item.inputs.length) return 0;
    const filled = item.inputs.filter((inp) => formData[`${itemId}_${inp.id}`]).length;
    return Math.round((filled / item.inputs.length) * 100);
  }, [config, formData]);

  const overallCompletion = useMemo(() => {
    if (!config) return 0;
    const total = config.evidenceItems.reduce((a, i) => a + Math.max(i.inputs.length, 1), 0);
    const filled = config.evidenceItems.reduce((a, item) => a + item.inputs.filter((inp) => formData[`${item.id}_${inp.id}`]).length, 0);
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }, [config, formData]);

  const completionByItem = useMemo(() => {
    const out: Record<string, number> = {};
    config?.evidenceItems.forEach((i) => {
      out[i.id] = completionPctByItem[i.id] ?? getItemCompletion(i.id);
    });
    return out;
  }, [config, completionPctByItem, getItemCompletion]);

  /* --- Generic form data for current item --- */
  const itemFormData = useMemo(() => {
    if (!activeItem) return {};
    const prefix = `${activeItem}_`;
    const out: Record<string, string> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v;
    });
    return out;
  }, [formData, activeItem]);

  const handleItemFormChange = useCallback((key: string, value: string) => {
    if (!activeItem) return;
    updateField(`${activeItem}_${key}`, value);
  }, [activeItem, updateField]);

  const handleItemFormBlur = useCallback(async () => {
    if (!cycleId || !activeItem) return;
    let sid = submissionMap[activeItem];
    if (!sid) {
      try { sid = await ensureSubmission(activeItem); } catch { return; }
    }
    const prefix = `${activeItem}_`;
    const fd: Record<string, string> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (k.startsWith(prefix)) fd[k.slice(prefix.length)] = v;
    });
    if (activeItem === A2_EVIDENCE_ITEM_ID) {
      fd.inventory_rows = JSON.stringify(a2Rows);
    }
    try { await api.put(`/assessments/${cycleId}/evidence/${sid}`, { form_data: fd }); } catch { /* ignore */ }
  }, [cycleId, activeItem, submissionMap, formData, ensureSubmission, a2Rows]);

  /* --- A2 spreadsheet row handlers --- */
  const handleA2RowChange = useCallback((index: number, key: string, value: string) => {
    setA2Rows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }, []);

  const handleA2AddRow = useCallback(() => {
    setA2Rows((prev) => [...prev, {}]);
  }, []);

  const handleA2RemoveRow = useCallback((index: number) => {
    setA2Rows((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitForReview = useCallback(async () => {
    if (!currentItem || !cycleId) return;
    const subId = submissionMap[currentItem.id];
    if (!subId) return;
    setSubmitForReviewLoading(true);
    try {
      await api.post(`/assessments/${cycleId}/evidence/${subId}/submit`, {});
      setSubmissionStatusMap((prev) => ({ ...prev, [currentItem.id]: "submitted" }));
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    } catch { /* ignore */ }
    setSubmitForReviewLoading(false);
  }, [currentItem, cycleId, submissionMap]);

  const handleEvaluateEvidence = useCallback(async () => {
    if (!currentItem || !cycleId) return;
    setAiEvaluationLoading(true);
    setEvaluated(true);
    setAiEvaluationResult(null);
    setAiEvaluationError(null);

    let subId = currentSubmissionId;
    if (!subId) {
      try {
        subId = await ensureSubmission(currentItem.id);
      } catch {
        subId = null;
      }
    }

    try {
      const res = await api.postDirect<{
        evidence_item_id: string;
        overall_met: boolean;
        sufficiency_results: { id: string; label: string; met: boolean; description?: string | null }[];
        criteria: { id: string; label: string; met: boolean; description?: string | null }[];
        summary?: string | null;
        remediation?: string | null;
      }>(
        `/assessments/${cycleId}/evidence/evaluate`,
        { evidence_item_id: currentItem.id, submission_id: subId }
      );

      setAiEvaluationResult({
        evidence_item_id: res.evidence_item_id,
        overall_met: res.overall_met,
        sufficiency_results: res.sufficiency_results?.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })) ?? [],
        criteria: res.criteria.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })),
        summary: res.summary ?? null,
        remediation: res.remediation ?? null,
      });

      setLastEvaluationByItem((prev) => ({
        ...prev,
        [currentItem.id]: {
          evidence_item_id: res.evidence_item_id,
          overall_met: res.overall_met,
          sufficiency_results: res.sufficiency_results?.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })) ?? [],
          criteria: res.criteria.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })),
          summary: res.summary ?? null,
          remediation: res.remediation ?? null,
        },
      }));
      setEvaluationEditsByItem((prev) => ({ ...prev, [currentItem.id]: {} }));

      fetchControlScores();
      api.get<ApiSubmission[]>(`/assessments/${cycleId}/evidence?domain=${domainId}`).then((subs) => {
        const completionByItem: Record<string, number> = {};
        subs.forEach((s) => {
          if (s.completion_pct != null && s.completion_pct > 0) completionByItem[s.evidence_item_id] = Math.round(s.completion_pct);
        });
        setCompletionPctByItem((prev) => ({ ...prev, ...completionByItem }));
      }).catch(() => {});
    } catch (err: unknown) {
      setAiEvaluationResult(null);
      const detail =
        (err as { response?: { data?: { detail?: string }; status?: number } })?.response?.data?.detail ??
        (err instanceof Error ? err.message : null);
      const message =
        typeof detail === "string" && detail.length > 0
          ? detail
          : "Evaluation failed. Check your connection and try again.";
      setAiEvaluationError(message);
    } finally {
      setAiEvaluationLoading(false);
    }
  }, [currentItem, cycleId, currentSubmissionId, ensureSubmission, fetchControlScores, domainId]);

  const handleEvaluationEdit = useCallback(async (updated: AiEvalResultType, edits: EvaluationEditsMap) => {
    if (!currentItem || !cycleId) return;
    setAiEvaluationResult(updated);
    setLastEvaluationByItem((prev) => ({ ...prev, [currentItem.id]: updated }));
    setEvaluationEditsByItem((prev) => ({ ...prev, [currentItem.id]: edits }));

    const subId = submissionMap[currentItem.id];
    if (!subId) return;
    try {
      await api.put(`/assessments/${cycleId}/evidence/${subId}`, {
        evaluation_edits: edits,
      });
    } catch { /* save best-effort */ }
  }, [currentItem, cycleId, submissionMap]);

  if (loading) {
    return <LoadingState message="Loading domain…" />;
  }

  if (!config) {
    const backCycleId = cycleId || activeCycleId;
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="mb-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>Domain not found or not in your selected architecture scope.</p>
        <p className="text-xs mb-4" style={{ color: "var(--foreground-muted)" }}>Ensure the backend reference data is seeded (evidence_domains, canonical_evidence_items).</p>
        {backCycleId ? (
          <Link href={`/cycles/${backCycleId}/dashboard`} className="text-sm font-medium hover:underline inline-block" style={{ color: "var(--primary)" }}>← Back to Dashboard</Link>
        ) : (
          <Link href="/assessments/new" className="text-sm font-medium hover:underline inline-block" style={{ color: "var(--primary)" }}>← Your Assessment Cycles</Link>
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] min-h-[360px] flex flex-col overflow-hidden -m-5">
      <DomainWorkspaceLayout
        cycleId={cycleId}
        domainId={domainId}
        config={config}
        activeItem={activeItem}
        onSelectItem={setActiveItem}
        selectedControlId={selectedControlId}
        onSelectControl={setSelectedControlId}
        completionByItem={completionByItem}
        overallCompletion={overallCompletion}
        controlScores={controlScores}
        submissionMap={submissionMap}
        currentItem={currentItem ?? null}
        evaluated={evaluated}
        aiEvaluationLoading={aiEvaluationLoading}
        aiEvaluationResult={aiEvaluationResult}
        completionPctByItem={completionPctByItem}
        getItemCompletion={getItemCompletion}
        ensureSubmission={ensureSubmission}
        fetchControlScores={fetchControlScores}
        onEvaluateEvidence={handleEvaluateEvidence}
        onSubmitForReview={handleSubmitForReview}
        submitForReviewLoading={submitForReviewLoading}
        submissionStatus={currentItem ? submissionStatusMap[currentItem.id] : undefined}
        aiEvaluationError={aiEvaluationError}
        itemFormData={itemFormData}
        onItemFormChange={handleItemFormChange}
        onItemFormBlur={handleItemFormBlur}
        a2Rows={a2Rows}
        onA2RowChange={handleA2RowChange}
        onA2AddRow={handleA2AddRow}
        onA2RemoveRow={handleA2RemoveRow}
        onEvaluationEdit={handleEvaluationEdit}
        evaluationEdits={currentItem ? evaluationEditsByItem[currentItem.id] : undefined}
      />
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { getAwsCredentialsForCycle } from "@/lib/aws-api";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { EvidenceQuestionsForm } from "@/components/domain/evidence-questions-form";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";
import { PerControlPanel } from "@/components/domain/per-control-panel";
import { EvidenceCriteriaSections } from "@/components/domain/evidence-criteria-sections";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import "@/components/review/swift-review-template/swift-review-template.css";
import { PerControlEvidence } from "@/components/domain/per-control-evidence";
import { getStatusColor, getStatusIcon } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { A5_ARCHITECTURE_KEYS } from "@/lib/frameworks/swift-cscf/constants";
import type { EvidenceItem, ControlRef, ControlCriteria, EvidenceQuestion, AiEvaluationResult as AiEvalResultType, AiCriterionResult } from "@/lib/types";
import {
  validateEvidenceQuestionsForEvaluation,
  EVIDENCE_EVALUATION_REQUIRED_SHORT_HINT,
  evaluationRequiredFieldsHintClassName,
  buildRequiredFieldsTopHint,
  buildEffectiveFormDataForEvaluation,
} from "@/lib/evidence-evaluation-validation";

const EVIDENCE_ITEM_A5 = "A5";

function getControlStatusColor(
  controlId: string,
  sufficiencyResults: AiCriterionResult[] | null | undefined,
  criteriaResults: AiCriterionResult[] | null | undefined,
): "white" | "green" | "orange" | "red" {
  const prefix = `${controlId}_`;
  const relevant = [
    ...(sufficiencyResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
    ...(criteriaResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
  ];
  if (relevant.length === 0) return "white";
  const met = relevant.filter((r) => r.met).length;
  const ratio = met / relevant.length;
  if (ratio >= 1) return "green";
  if (ratio >= 0.5) return "orange";
  return "red";
}

function getControlCriteriaScore(
  controlId: string,
  sufficiencyResults: AiCriterionResult[] | null | undefined,
  criteriaResults: AiCriterionResult[] | null | undefined,
): number {
  const prefix = `${controlId}_`;
  const relevant = [
    ...(sufficiencyResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
    ...(criteriaResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
  ];
  if (relevant.length === 0) return 0;
  return Math.round((relevant.filter((r) => r.met).length / relevant.length) * 100);
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
}

interface ItemDetailResponse {
  item: ApiEvidenceItem | null;
  controls: { evidence_item_id: string; control_id: string; is_primary: boolean }[];
}

const DOMAIN_COLORS: Record<string, { color: string; gradient: string }> = {
  A: { color: "#0F4C75", gradient: "linear-gradient(135deg,#0F4C75,#1B6FA0)" },
  B: { color: "#1B5E20", gradient: "linear-gradient(135deg,#1B5E20,#388E3C)" },
  C: { color: "#E65100", gradient: "linear-gradient(135deg,#E65100,#FB8C00)" },
  D: { color: "#B71C1C", gradient: "linear-gradient(135deg,#B71C1C,#E53935)" },
  E: { color: "#4A148C", gradient: "linear-gradient(135deg,#4A148C,#7B1FA2)" },
  F: { color: "#1565C0", gradient: "linear-gradient(135deg,#1565C0,#1E88E5)" },
  G: { color: "#F57F17", gradient: "linear-gradient(135deg,#F57F17,#FFB300)" },
  H: { color: "#BF360C", gradient: "linear-gradient(135deg,#BF360C,#E64A19)" },
};

export default function CycleItemIntakePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role ?? "compliance_officer";
  const cycleId = params.cycleId as string;
  const domainId = (params.domainId as string)?.toUpperCase();
  const itemId = (params.itemId as string)?.toUpperCase();
  const domainStyle = DOMAIN_COLORS[domainId] || DOMAIN_COLORS.A;

  /** IT SME uses domain page with ?item= and only the evidence form; redirect immediately. */
  useEffect(() => {
    if (role === "it_sme" && cycleId && domainId && itemId) {
      router.replace(`/cycles/${cycleId}/domains/${domainId}?item=${encodeURIComponent(itemId)}`);
    }
  }, [role, cycleId, domainId, itemId, router]);

  const [item, setItem] = useState<EvidenceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const [evaluated, setEvaluated] = useState(false);
  const [aiEvaluationLoading, setAiEvaluationLoading] = useState(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<AiEvalResultType | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [notesRefreshTrigger, setNotesRefreshTrigger] = useState(0);
  const [awsConnected, setAwsConnected] = useState(false);
  const [awsConnectionChecked, setAwsConnectionChecked] = useState(false);
  const [evaluationGateError, setEvaluationGateError] = useState<string | null>(null);

  const ensureSubmission = useCallback(async (): Promise<string> => {
    if (submissionId) return submissionId;
    if (!cycleId || !itemId) throw new Error("Missing cycle or item");
    const sub = await api.post<{ id: string }>(`/assessments/${cycleId}/evidence`, { evidence_item_id: itemId });
    setSubmissionId(sub.id);
    return sub.id;
  }, [cycleId, itemId, submissionId]);

  useEffect(() => {
    const cycleParam = cycleId ? `?cycle_id=${cycleId}` : "";
    Promise.all([
      api.get<ItemDetailResponse>(`/ref/evidence-items/${itemId}${cycleParam}`),
      api.get<ControlCriteria[]>(`/ref/evidence-items/${itemId}/matrix${cycleParam}`).catch(() => [] as ControlCriteria[]),
    ])
      .then(([data, matrix]) => {
        if (data.item) {
          const controls: ControlRef[] = data.controls.map((c) => ({
            id: c.control_id,
            name: c.control_id,
            ma: c.is_primary ? "M" : "A",
          }));
          setItem({
            id: data.item.id,
            order: data.item.sort_order,
            name: data.item.name,
            priority: data.item.priority as EvidenceItem["priority"],
            type: data.item.evidence_type,
            controls,
            controlCount: data.item.control_count,
            description: data.item.description,
            matrix,
            inputs: [],
            sufficiency: [],
            reductionNote: data.item.reduction_note || "",
            perSystem: data.item.per_system,
            perZone: data.item.per_zone,
            perQuarter: data.item.per_quarter,
            perAccessPoint: data.item.per_access_point,
            isAdvisory: data.item.is_advisory,
            conditional: data.item.is_conditional,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [itemId]);

  /** Load existing submission and form_data for this item (e.g. A5 from select-architecture). */
  useEffect(() => {
    if (!cycleId || !itemId) return;
    api
      .get<{ id: string; evidence_item_id: string; form_data?: Record<string, string> }[]>(
        `/assessments/${cycleId}/evidence`
      )
      .then((list) => {
        const sub = list.find((s) => s.evidence_item_id === itemId);
        if (sub) {
          setSubmissionId(sub.id);
          if (sub.form_data && Object.keys(sub.form_data).length > 0) {
            setFormData((prev) => ({ ...prev, ...sub.form_data }));
          }
        }
      })
      .catch(() => {});
  }, [cycleId, itemId]);

  /** A5: progress ring — detect existing uploads (not just current session). */
  useEffect(() => {
    if (itemId !== EVIDENCE_ITEM_A5 || !submissionId) return;
    api
      .get<{ id: string }[]>(`/evidence/${submissionId}/files`)
      .then((files) => {
        if (files.length > 0) setUploadedFiles((p) => ({ ...p, evidence: true }));
      })
      .catch(() => {});
  }, [itemId, submissionId]);

  useEffect(() => {
    if (!cycleId) {
      setAwsConnected(false);
      setAwsConnectionChecked(true);
      return;
    }
    setAwsConnectionChecked(false);
    getAwsCredentialsForCycle(cycleId)
      .then((cfg) => setAwsConnected(Boolean(cfg?.has_config)))
      .catch(() => setAwsConnected(false))
      .finally(() => setAwsConnectionChecked(true));
  }, [cycleId]);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setEvaluated(false);
    setAiEvaluationResult(null);
    setEvaluationGateError(null);
  }, []);

  const persistForm = useCallback(async () => {
    if (!cycleId || !itemId) return;
    let sid = submissionId;
    if (!sid) {
      try {
        sid = await ensureSubmission();
      } catch {
        return;
      }
    }
    if (!sid) return;
    try {
      await api.put(`/assessments/${cycleId}/evidence/${sid}`, { form_data: formData });
    } catch {
      /* ignore */
    }
  }, [cycleId, itemId, submissionId, formData, ensureSubmission]);

  const markFileUploaded = useCallback((key: string) => {
    setUploadedFiles((p) => ({ ...p, [key]: true }));
    setEvaluated(false);
    setAiEvaluationResult(null);
    setEvaluationGateError(null);
  }, []);

  const handleEvaluateEvidence = useCallback(async () => {
    if (!item || !cycleId) return;
    setEvaluationGateError(null);

    let sid = submissionId;
    if (!sid) {
      try {
        sid = await ensureSubmission();
      } catch {
        setEvaluationGateError("Could not create a submission. Try again.");
        return;
      }
    }

    try {
      const questions = await api.get<EvidenceQuestion[]>(
        `/ref/evidence-items/${item.id}/questions?cycle_id=${cycleId}`
      );
      const fdToSave = buildEffectiveFormDataForEvaluation(questions, formData);
      try {
        await api.put(`/assessments/${cycleId}/evidence/${sid}`, { form_data: fdToSave });
      } catch {
        /* ignore */
      }
      let fileCount = 0;
      try {
        const files = await api.get<{ id: string }[]>(`/evidence/${sid}/files`);
        fileCount = files.length;
      } catch {
        fileCount = 0;
      }
      const validation = validateEvidenceQuestionsForEvaluation({
        questions,
        formData,
        evidenceItemId: item.id,
        submissionFileCount: fileCount,
      });
      if (!validation.ok) {
        setEvaluationGateError(buildRequiredFieldsTopHint(validation));
        return;
      }
    } catch {
      setEvaluationGateError("Could not validate the form. Check your connection and try again.");
      return;
    }

    setAiEvaluationLoading(true);
    setEvaluated(true);
    setAiEvaluationResult(null);
    try {
      const res = await api.post<{
        evidence_item_id: string;
        overall_met: boolean;
        sufficiency_results: { id: string; label: string; met: boolean; description?: string | null }[];
        criteria: { id: string; label: string; met: boolean; description?: string | null }[];
        summary?: string | null;
      }>(`/assessments/${cycleId}/evidence/evaluate`, { evidence_item_id: item.id, submission_id: sid });
      setAiEvaluationResult({
        evidence_item_id: res.evidence_item_id,
        overall_met: res.overall_met,
        sufficiency_results: res.sufficiency_results?.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })) ?? [],
        criteria: res.criteria.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })),
        summary: res.summary ?? null,
      });
    } catch {
      setAiEvaluationResult(null);
      setEvaluationGateError("Evaluation failed. Check your connection and try again.");
    } finally {
      setAiEvaluationLoading(false);
    }
  }, [item, cycleId, submissionId, formData, ensureSubmission]);

  const [questionKeys, setQuestionKeys] = useState<string[]>([]);
  useEffect(() => {
    if (!itemId || !cycleId) return;
    api.get<{ question_key: string; question_type: string }[]>(`/ref/evidence-items/${itemId}/questions?cycle_id=${cycleId}`)
      .then((qs) => setQuestionKeys(qs.filter((q) => q.question_type !== "file").map((q) => q.question_key)))
      .catch(() => setQuestionKeys([]));
  }, [itemId, cycleId]);

  const completionPct = useMemo(() => {
    if (!item) return 0;
    if (item.id === EVIDENCE_ITEM_A5) {
      const hasArch = !!formData.architecture_type;
      const hasDiagramUpload = !!uploadedFiles.evidence;
      const hasRationale = !!formData[A5_ARCHITECTURE_KEYS.decision_rationale]?.trim();
      const hasBics = !!formData[A5_ARCHITECTURE_KEYS.bics]?.trim();
      const hasInfra = !!formData[A5_ARCHITECTURE_KEYS.infrastructure_characteristics]?.trim();
      const count = [hasArch, hasDiagramUpload, hasRationale, hasBics, hasInfra].filter(Boolean).length;
      return Math.round((count / 5) * 100);
    }
    if (questionKeys.length === 0) return 0;
    const filled = questionKeys.filter((k) => {
      const v = formData[k];
      if (v && String(v).trim()) return true;
      return false;
    }).length;
    return Math.round((filled / questionKeys.length) * 100);
  }, [item, formData, questionKeys, uploadedFiles.evidence]);

  const controlScores = useMemo(() => {
    if (!item) return {};
    const scores: Record<string, number> = {};
    item.controls.forEach((c) => {
      scores[c.id] = getControlCriteriaScore(c.id, aiEvaluationResult?.sufficiency_results, aiEvaluationResult?.criteria);
    });
    return scores;
  }, [item, aiEvaluationResult]);

  if (loading) return <LoadingState message="Loading item…" />;

  if (!item) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>Item not found or not in your architecture scope.</p>
        {cycleId && domainId && (
          <Link href={`/cycles/${cycleId}/domains/${domainId}`} className="text-sm font-medium hover:underline mt-2 inline-block" style={{ color: "var(--primary)" }}>Back to Domain {domainId}</Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        {cycleId && (
          <Link href={`/cycles/${cycleId}/dashboard`} className="hover:text-blue-600">Dashboard</Link>
        )}
        {cycleId && domainId && (
          <>
            <span>/</span>
            <Link href={`/cycles/${cycleId}/domains/${domainId}`} className="hover:text-blue-600">Domain {domainId}</Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-gray-700">{item.id} — {item.name}</span>
      </div>
      <div className="rounded-xl p-5 text-white mb-5" style={{ background: domainStyle.gradient }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative" style={{ width: 56, height: 56 }}>
            <svg width={56} height={56} className="-rotate-90">
              <circle cx={28} cy={28} r={24} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={4} />
              <circle cx={28} cy={28} r={24} fill="none" stroke="white" strokeWidth={4}
                strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - completionPct / 100)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{completionPct}%</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold">{item.id}</span>
              <span className="text-base font-semibold">{item.name}</span>
              <PriorityBadge priority={item.priority} />
            </div>
            <p className="text-xs opacity-80 mt-1">{item.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {item.id === EVIDENCE_ITEM_A5 ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[var(--primary)]/60 bg-[var(--primary-muted)]/30 px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
              <span className="font-mono">All 32</span>
              <span className="opacity-90">controls (scoping)</span>
            </span>
          ) : (
            item.controls.map((c) => <ControlBadge key={c.id} id={c.id} ma={c.ma} statusColor={getControlStatusColor(c.id, aiEvaluationResult?.sufficiency_results, aiEvaluationResult?.criteria)} />)
          )}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_280px] gap-5">
        <div className="space-y-3">
          <EvidenceCriteriaSections
            evidenceDescription={item.description}
          />
          <PerControlEvidence
            evidenceItemId={item.id}
            matrix={item.matrix ?? []}
            submissionId={submissionId}
            evaluationState={!evaluated ? "idle" : aiEvaluationLoading ? "loading" : "done"}
            sufficiencyResults={aiEvaluationResult?.sufficiency_results ?? null}
            criteriaResults={aiEvaluationResult?.criteria ?? null}
            onEnsureSubmission={() => ensureSubmission()}
          />
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">
              {item.id === EVIDENCE_ITEM_A5 ? "Architecture declaration form" : "Evidence Inputs"}
            </div>
            {item.id === EVIDENCE_ITEM_A5 && (
              <p className="text-xs text-gray-500 mb-4">
                Upload your architecture diagram and complete the declaration fields below. Evidence is evaluated against your uploaded diagram and answers.
              </p>
            )}
            <EvidenceQuestionsForm
              evidenceItemId={item.id}
              cycleId={cycleId}
              formData={formData}
              onChange={updateField}
              onBlur={persistForm}
              submissionId={submissionId}
              onUploadComplete={() => markFileUploaded("evidence")}
              onEnsureSubmission={async () => {
                try {
                  const sid = await ensureSubmission();
                  return sid;
                } catch {
                  return null;
                }
              }}
              visualVariant="swiftReview"
              awsAssistanceEnabled={awsConnectionChecked && awsConnected}
            />
          </div>
          {evaluationGateError && (
            <p className={evaluationRequiredFieldsHintClassName} role="alert">
              {evaluationGateError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleEvaluateEvidence()}
            disabled={aiEvaluationLoading}
            className="btn-primary w-full py-3 text-sm disabled:opacity-60"
            style={{ background: domainStyle.color }}
          >
            Evaluate Evidence Sufficiency
          </button>
          {evaluated && (
            <div className="swift-review-tpl swift-review-embed w-full">
              <div className="flex min-h-[min(70vh,780px)] flex-col overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
                <div className="flex min-h-[48px] shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">AI evaluation results</h2>
                  <PriorityBadge priority={item.priority} />
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--surface-2)]/40 p-4 md:p-5">
                  <AiEvaluationResult
                    result={aiEvaluationResult}
                    loading={aiEvaluationLoading}
                    placeholder={!aiEvaluationLoading && !aiEvaluationResult}
                    visualVariant="swiftReview"
                    showTitle={false}
                    submissionId={submissionId}
                    notesRefreshTrigger={notesRefreshTrigger}
                    onNoteAdded={() => setNotesRefreshTrigger((n: number) => n + 1)}
                    hideAiHint={false}
                    onReEvaluate={handleEvaluateEvidence}
                    aiEvaluationLoading={aiEvaluationLoading}
                    evaluationState={
                      aiEvaluationLoading ? "loading" : aiEvaluationResult ? "done" : "idle"
                    }
                    currentItemId={item.id}
                    configColor={domainStyle.color}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <SufficiencyPanel dimensions={item.sufficiency} color={domainStyle.color} />
          <PerControlPanel items={item.perControlSufficiency} />
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Control Impact</div>
            {item.id === EVIDENCE_ITEM_A5 ? (
              <div className="flex items-center gap-2 py-1 text-[11px]">
                <span className="font-mono font-bold">All 32</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${completionPct}%`, background: getStatusColor(completionPct) }} />
                </div>
                <span className="font-bold w-8 text-right" style={{ color: getStatusColor(completionPct) }}>{completionPct}%</span>
                <span className="w-3" style={{ color: getStatusColor(completionPct) }}>{getStatusIcon(completionPct)}</span>
              </div>
            ) : (
              item.controls.map((c) => {
                const score = controlScores[c.id] ?? 0;
                return (
                  <div key={c.id} className="flex items-center gap-2 py-1 text-[11px]">
                    <ControlBadge id={c.id} ma={c.ma} statusColor={getControlStatusColor(c.id, aiEvaluationResult?.sufficiency_results, aiEvaluationResult?.criteria)} />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                    </div>
                    <span className="font-bold w-8 text-right" style={{ color: getStatusColor(score) }}>{score}%</span>
                    <span className="w-3" style={{ color: getStatusColor(score) }}>{getStatusIcon(score)}</span>
                  </div>
                );
              })
            )}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
            <span className="font-semibold">Effort Saving:</span> {item.reductionNote}
          </div>
        </div>
      </div>
    </div>
  );
}

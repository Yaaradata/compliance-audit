"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { DOMAIN_CONFIGS } from "@/lib/data/evidence-items";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { EvidenceInputRenderer } from "@/components/domain/evidence-input-renderer";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";
import { PerControlPanel } from "@/components/domain/per-control-panel";
import { EvaluationResults } from "@/components/domain/evaluation-results";
import { getStatusColor, getStatusIcon } from "@/lib/utils";

export default function ItemIntakePage() {
  const params = useParams();
  const domainId = (params.domainId as string)?.toUpperCase();
  const itemId = (params.itemId as string)?.toUpperCase();
  const { selectedArchitectureId } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const inScope = arch?.domainIds?.includes(domainId);
  const config = inScope ? DOMAIN_CONFIGS[domainId] : undefined;
  const item = config?.evidenceItems.find((e) => e.id === itemId);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const [evaluated, setEvaluated] = useState(false);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setEvaluated(false);
  }, []);

  const markFileUploaded = useCallback((key: string) => {
    setUploadedFiles((p) => ({ ...p, [key]: true }));
    setEvaluated(false);
  }, []);

  const completionPct = useMemo(() => {
    if (!item || !item.inputs.length) return 0;
    const filled = item.inputs.filter((inp) => formData[inp.id] || uploadedFiles[inp.id]).length;
    return Math.round((filled / item.inputs.length) * 100);
  }, [item, formData, uploadedFiles]);

  const controlScores = useMemo(() => {
    if (!item) return {};
    const scores: Record<string, number> = {};
    item.controls.forEach((c) => { scores[c.id] = completionPct; });
    return scores;
  }, [item, completionPct]);

  if (!config || !item || !inScope) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Item not found or not in your architecture scope.</p>
        <Link href={`/domains/${domainId}`} className="text-blue-600 text-sm mt-2 inline-block">← Back to Domain {domainId}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <Link href={`/domains/${domainId}`} className="hover:text-blue-600">Domain {domainId}</Link>
        <span>/</span>
        <span className="font-semibold text-gray-700">{item.id} — {item.name}</span>
      </div>
      <div className="rounded-xl p-5 text-white mb-5" style={{ background: config.gradient }}>
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
          {item.controls.map((c) => <ControlBadge key={c.id} id={c.id} ma={c.ma} />)}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_280px] gap-5">
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">Evidence Inputs</div>
            <div className="space-y-4">
              {item.inputs.length > 0 ? (
                item.inputs.map((input) => (
                  <EvidenceInputRenderer key={input.id} input={input}
                    value={formData[input.id] || ""}
                    onChangeValue={(val) => updateField(input.id, val)}
                    onFileUpload={(key) => markFileUploaded(key)} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <div className="text-2xl mb-2">📋</div>
                  <p>Evidence inputs are configured at the detailed intake level.</p>
                  <p className="text-xs mt-1">Upload files and fill in evidence details to proceed.</p>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setEvaluated(true)}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors"
            style={{ background: config.color }}>
            🤖 Evaluate Evidence Sufficiency
          </button>
          {evaluated && <EvaluationResults score={completionPct} />}
        </div>
        <div className="space-y-3">
          <SufficiencyPanel dimensions={item.sufficiency} color={config.color} />
          <PerControlPanel items={item.perControlSufficiency} />
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Control Impact</div>
            {item.controls.map((c) => {
              const score = controlScores[c.id] ?? 0;
              return (
                <div key={c.id} className="flex items-center gap-2 py-1 text-[11px]">
                  <ControlBadge id={c.id} ma={c.ma} />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                  </div>
                  <span className="font-bold w-8 text-right" style={{ color: getStatusColor(score) }}>{score}%</span>
                  <span className="w-3" style={{ color: getStatusColor(score) }}>{getStatusIcon(score)}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
            <span className="font-semibold">Effort Saving:</span> {item.reductionNote}
          </div>
        </div>
      </div>
    </div>
  );
}

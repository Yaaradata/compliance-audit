"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { DOMAIN_CONFIGS } from "@/lib/data/evidence-items";
import { DomainHeader } from "@/components/layout/domain-header";
import { DomainLeftRail } from "@/components/layout/domain-left-rail";
import { DomainRightSidebar } from "@/components/layout/domain-right-sidebar";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { EvaluationResults } from "@/components/domain/evaluation-results";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";

export default function DomainPage() {
  const params = useParams();
  const domainId = (params.domainId as string)?.toUpperCase();
  const { selectedArchitectureId } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const inScope = arch?.domainIds?.includes(domainId);
  const config = inScope ? DOMAIN_CONFIGS[domainId] : undefined;

  const [activeItem, setActiveItem] = useState(config?.evidenceItems[0]?.id || "");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [evaluated, setEvaluated] = useState(false);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setEvaluated(false);
  }, []);

  const currentItem = useMemo(() => config?.evidenceItems.find((e) => e.id === activeItem), [config, activeItem]);

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

  const controlScores = useMemo(() => {
    if (!config) return {};
    const scores: Record<string, number> = {};
    config.allControls.forEach((c) => {
      const relevantItems = config.evidenceItems.filter((e) => e.controls.some((ctrl) => ctrl.id === c));
      if (relevantItems.length === 0) { scores[c] = 0; return; }
      const avg = relevantItems.reduce((a, i) => a + getItemCompletion(i.id), 0) / relevantItems.length;
      scores[c] = Math.round(avg);
    });
    return scores;
  }, [config, getItemCompletion]);

  if (!config || !inScope) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Domain not found or not in your selected architecture scope.</p>
        <Link href="/dashboard" className="text-blue-600 text-sm mt-2 inline-block">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <DomainHeader config={config} completionPct={overallCompletion} />
      <div className="flex gap-4">
        <DomainLeftRail config={config} activeItem={activeItem} onSelectItem={setActiveItem} />
        <div className="flex-1 min-w-0 space-y-3">
          {currentItem && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold" style={{ color: config.color }}>{currentItem.id}</span>
                    <span className="text-sm font-semibold">{currentItem.name}</span>
                    <PriorityBadge priority={currentItem.priority} />
                  </div>
                  <Link href={`/domains/${domainId}/items/${currentItem.id}`}
                    className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200 hover:bg-blue-100 transition-colors">
                    Open Full Intake →
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mb-3">{currentItem.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {currentItem.controls.map((c) => <ControlBadge key={c.id} id={c.id} ma={c.ma} />)}
                </div>
                <div className="text-[11px] text-green-700 font-medium bg-green-50 rounded px-2 py-1">
                  {currentItem.reductionNote}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-700 mb-3">Quick Evidence Upload</div>
                <FileUploadZone label={`Upload evidence for ${currentItem.id} — ${currentItem.name}`} />
              </div>
              {currentItem.sufficiency.length > 0 && (
                <SufficiencyPanel dimensions={currentItem.sufficiency} color={config.color} />
              )}
              {evaluated && <EvaluationResults score={getItemCompletion(currentItem.id)} />}
              <button onClick={() => setEvaluated(true)}
                className="w-full py-2.5 rounded-lg text-white text-xs font-semibold transition-colors"
                style={{ background: config.color }}>
                🤖 Evaluate Evidence for {currentItem.id}
              </button>
            </>
          )}
        </div>
        <DomainRightSidebar controls={config.allControls} controlScores={controlScores} />
      </div>
    </div>
  );
}

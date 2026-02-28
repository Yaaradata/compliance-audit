"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { api } from "@/lib/api";

interface EvidenceItemBreakdown {
  item_id: string;
  item_name: string;
  weight_pct: number;
  sufficiency_pass: number;
  sufficiency_fail: number;
  evaluation_pass: number;
  evaluation_fail: number;
  pass_total: number;
  fail_total: number;
  total_criteria: number;
  met_criteria: number;
  item_score: number;
  weighted_contribution: number;
  has_evidence: boolean;
  is_evaluated: boolean;
}

interface ControlDetail {
  control_id: string;
  control_name: string;
  total_items: number;
  weight_per_item: number;
  overall_score: number;
  evidence_items: EvidenceItemBreakdown[];
}

function PassFailIcon({ pct }: { pct: number }) {
  if (pct >= 90) return <span className="text-sm font-bold text-(--success)" aria-hidden>✓</span>;
  if (pct >= 60) return <span className="text-sm font-bold text-(--warning)" aria-hidden>⚠</span>;
  if (pct > 0) return <span className="text-sm font-bold text-(--danger)" aria-hidden>✗</span>;
  return <span className="text-sm text-(--foreground-subtle)" aria-hidden>○</span>;
}

function StatusBadge({ hasEvidence, isEvaluated }: { hasEvidence: boolean; isEvaluated: boolean }) {
  if (isEvaluated)
    return <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Evaluated</span>;
  if (hasEvidence)
    return <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending AI</span>;
  return <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">No evidence</span>;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function ControlTooltip({ detail }: { detail: ControlDetail }) {
  if (!detail.evidence_items.length) {
    return <div className="text-[10px] text-gray-400">No mapped evidence items</div>;
  }

  const totalPass = detail.evidence_items.reduce((s, e) => s + e.pass_total, 0);
  const totalFail = detail.evidence_items.reduce((s, e) => s + e.fail_total, 0);

  return (
    <div className="min-w-[260px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[11px] font-bold text-gray-800">
          {detail.control_id} — {detail.overall_score}%
        </div>
        <span className="text-[9px] font-medium text-gray-500">
          {getStatusLabel(detail.overall_score)}
        </span>
      </div>

      {/* Summary — only PASS counted as correct, FAIL as wrong (ONLY APPLICABLE excluded) */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2 pb-1.5 border-b border-gray-100 flex-wrap">
        <span>{detail.total_items} evidence item{detail.total_items !== 1 ? "s" : ""}</span>
        <span>•</span>
        <span>{detail.weight_per_item}% weight each</span>
        <span>•</span>
        <span className="text-green-600 font-medium">{totalPass} correct (PASS)</span>
        <span>•</span>
        <span className="text-red-600 font-medium">{totalFail} wrong (FAIL)</span>
      </div>

      {/* Per-item breakdown */}
      <div className="space-y-2">
        {detail.evidence_items.map((ei) => {
          const color = getStatusColor(ei.item_score);
          const suffTotal = ei.sufficiency_pass + ei.sufficiency_fail;
          const evalTotal = ei.evaluation_pass + ei.evaluation_fail;
          return (
            <div key={ei.item_id} className="rounded-md bg-gray-50 p-1.5">
              {/* Item header */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-mono text-[10px] font-bold text-gray-700">{ei.item_id}</span>
                <span className="text-[9px] text-gray-500 truncate flex-1" title={ei.item_name}>{ei.item_name}</span>
                <StatusBadge hasEvidence={ei.has_evidence} isEvaluated={ei.is_evaluated} />
              </div>

              {/* Criteria: only PASS / FAIL (ONLY APPLICABLE not counted) */}
              <div className="space-y-0.5">
                {suffTotal > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] text-gray-400 w-[52px] shrink-0">Sufficiency</span>
                    <MiniBar value={ei.sufficiency_pass} max={suffTotal} color={color} />
                    <span className="text-[9px] tabular-nums text-right shrink-0">
                      <span className="text-green-600 font-medium">{ei.sufficiency_pass} PASS</span>
                      {ei.sufficiency_fail > 0 && (
                        <span className="text-red-600 font-medium">, {ei.sufficiency_fail} FAIL</span>
                      )}
                    </span>
                  </div>
                )}
                {evalTotal > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] text-gray-400 w-[52px] shrink-0">Evaluation</span>
                    <MiniBar value={ei.evaluation_pass} max={evalTotal} color={color} />
                    <span className="text-[9px] tabular-nums text-right shrink-0">
                      <span className="text-green-600 font-medium">{ei.evaluation_pass} PASS</span>
                      {ei.evaluation_fail > 0 && (
                        <span className="text-red-600 font-medium">, {ei.evaluation_fail} FAIL</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Weighted contribution */}
              <div className="flex items-center justify-between mt-1 pt-0.5 border-t border-gray-100">
                <span className="text-[8px] text-gray-400">
                  Score: {ei.item_score}% × {ei.weight_pct}% weight
                </span>
                <span className="text-[9px] font-bold tabular-nums" style={{ color }}>
                  +{ei.weighted_contribution}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ControlSufficiencyPanel({
  controls,
  controlScores,
  cycleId,
  accentColor,
  className,
}: {
  controls: string[];
  controlScores: Record<string, number>;
  cycleId?: string;
  accentColor?: string;
  className?: string;
}) {
  const [sortWorstFirst, setSortWorstFirst] = useState(true);
  const [detailMap, setDetailMap] = useState<Record<string, ControlDetail>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cycleId) return;
    api
      .get<ControlDetail[]>(`/assessments/${cycleId}/controls/sufficiency-detail`)
      .then((data) => {
        const map: Record<string, ControlDetail> = {};
        data.forEach((d) => { map[d.control_id] = d; });
        setDetailMap(map);
      })
      .catch(() => {});
  }, [cycleId, controlScores]);

  const sortedControls = useMemo(() => {
    const list = controls.map((id) => {
      const detail = detailMap[id];
      const score = detail ? detail.overall_score : (controlScores[id] ?? 0);
      return { id, score: Math.round(score) };
    });
    return [...list].sort((a, b) => (sortWorstFirst ? a.score - b.score : b.score - a.score));
  }, [controls, controlScores, detailMap, sortWorstFirst]);

  const handleMouseEnter = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredId(id);
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setTooltipPos({
        top: rect.top - containerRect.top + rect.height + 4,
        left: 8,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col h-full min-h-0 bg-(--surface) border border-(--border) rounded-xl overflow-hidden relative",
        className
      )}
    >
      <div className="shrink-0 p-3 border-b border-(--border)">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-(--foreground-muted) mb-1">Control Sufficiency</h2>
        <p className="text-[10px] text-(--foreground-muted) mb-2">Progress by control for this domain</p>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setSortWorstFirst((s) => !s)}
            className="text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 text-white"
            style={{ backgroundColor: accentColor ?? "var(--primary)" }}
          >
            {sortWorstFirst ? "Worst first" : "Best first"}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
        {sortedControls.map(({ id, score }) => {
          const color = getStatusColor(score);
          return (
            <div
              key={id}
              className="flex items-center gap-2 cursor-default"
              onMouseEnter={(e) => handleMouseEnter(id, e)}
              onMouseLeave={() => setHoveredId(null)}
              title={detailMap[id] ? undefined : `${id}: ${score}% — ${getStatusLabel(score)}`}
            >
              <span className="font-mono text-[10px] font-semibold w-7 shrink-0 text-(--foreground-muted)">
                {id}
              </span>
              <div className="flex-1 min-w-0 h-1.5 rounded-full overflow-hidden bg-(--border)">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${score}%`, backgroundColor: color }}
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${id} ${score}%`}
                />
              </div>
              <span className="text-[10px] font-bold w-8 text-right shrink-0 tabular-nums" style={{ color }}>
                {score}%
              </span>
              <PassFailIcon pct={score} />
            </div>
          );
        })}
      </div>

      {hoveredId && detailMap[hoveredId] && (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 pointer-events-none"
          style={{ top: tooltipPos.top, left: tooltipPos.left, right: 8 }}
        >
          <ControlTooltip detail={detailMap[hoveredId]} />
        </div>
      )}
    </div>
  );
}

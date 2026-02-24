"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { getDomainsForArchitecture } from "@/lib/data/domains";
import { ALL_EVIDENCE_ITEMS } from "@/lib/data/evidence-items";
import { CONTROL_MATRIX } from "@/lib/data/controls";
import { PriorityBadge } from "@/components/ui/badge";

export default function EvidenceModelPage() {
  const { selectedArchitectureId } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const domains = getDomainsForArchitecture(arch?.domainIds);
  const domainIdSet = useMemo(() => new Set(arch?.domainIds ?? []), [arch?.domainIds]);
  const scopeItems = useMemo(() => ALL_EVIDENCE_ITEMS.filter((i) => domainIdSet.has(i.id.charAt(0))), [domainIdSet]);

  const [activeView, setActiveView] = useState("overview");
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    let items = scopeItems;
    if (activeDomain) items = items.filter((i) => i.id.startsWith(activeDomain));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items;
  }, [scopeItems, activeDomain, searchQuery]);

  const multiControlItems = scopeItems.filter((i) => i.controlCount > 1 && i.controlCount < 32);
  const totalControls = 32;
  const reduction = "~45%";
  const timeSaved = "55–70h";

  return (
    <div>
      <div className="rounded-xl p-5 mb-5 text-white" style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 50%, #2E5984 100%)" }}>
        <div className="text-[11px] font-bold tracking-wider opacity-60 mb-1">SWIFT CSCF v2025 · {arch?.name ?? "All"}</div>
        <h1 className="text-xl font-bold">Canonical Evidence Model</h1>
        <p className="text-xs opacity-60 mt-1">{scopeItems.length} evidence items × {domains.length} domains × {totalControls} controls</p>
        <div className="flex gap-1 mt-4">
          {[{ id: "overview", label: "Overview" }, { id: "catalog", label: "Evidence Catalog" }, { id: "reuse", label: "Reuse Analysis" }, { id: "controls", label: "Control Matrix" }].map((v) => (
            <button key={v.id} onClick={() => { setActiveView(v.id); setActiveDomain(null); setExpandedItem(null); }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${activeView === v.id ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white/70"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "overview" && (
        <div>
          <div className="grid grid-cols-5 gap-3 mb-5">
            {[
              { label: "Evidence Items", value: String(scopeItems.length), sub: `across ${domains.length} domains` },
              { label: "Controls Covered", value: String(totalControls), sub: "25M + 7A" },
              { label: "Multi-Control Items", value: String(multiControlItems.length), sub: "serve 2+ controls" },
              { label: "Effort Reduction", value: reduction },
              { label: "Time Saved", value: timeSaved },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-3 text-center border-t-3 border-t-[#1B3A5C]">
                <div className="text-2xl font-extrabold text-[#1B3A5C]">{s.value}</div>
                <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{s.label}</div>
                {s.sub && <div className="text-[10px] text-gray-400">{s.sub}</div>}
              </div>
            ))}
          </div>
          <h3 className="text-sm font-bold text-[#1B3A5C] mb-2">Evidence Domains</h3>
          <div className="grid grid-cols-4 gap-2.5 mb-5">
            {domains.map((d) => {
              const count = scopeItems.filter((i) => i.id.startsWith(d.id)).length;
              return (
                <button key={d.id} onClick={() => { setActiveDomain(d.id); setActiveView("catalog"); }}
                  className="bg-white border-2 rounded-lg p-3 text-left hover:shadow-md transition-shadow" style={{ borderColor: d.color }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: d.accent, color: d.color }}>{d.id}</div>
                    <div><div className="text-xs font-bold">{d.name}</div><div className="text-[10px] text-gray-500">{count} items · {d.controls.length} ctrls</div></div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-5">
            <div className="text-sm font-bold text-amber-700 mb-1">💡 Core Value: Collect Once, Map to Many</div>
            <div className="text-xs text-amber-900 leading-relaxed">
              Multi-control evidence items let you collect once and map to many controls. Scope is based on your selected architecture.
            </div>
          </div>
        </div>
      )}

      {activeView === "catalog" && (
        <div>
          <div className="flex gap-2 mb-3">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items, controls..."
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-xs" />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button onClick={() => setActiveDomain(null)} className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${!activeDomain ? "bg-[#1B3A5C] text-white border-[#1B3A5C]" : "bg-white text-gray-600 border-gray-300"}`}>
              All ({scopeItems.length})
            </button>
            {domains.map((d) => (
              <button key={d.id} onClick={() => setActiveDomain(activeDomain === d.id ? null : d.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border ${activeDomain === d.id ? "font-bold" : "bg-white text-gray-600 border-gray-300"}`}
                style={activeDomain === d.id ? { background: d.accent, borderColor: d.color, color: d.color } : {}}>
                {d.id} ({scopeItems.filter((i) => i.id.startsWith(d.id)).length})
              </button>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 mb-2">{filteredItems.length} items shown</div>
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const domain = domains.find((d) => item.id.startsWith(d.id));
              const isExpanded = expandedItem === item.id;
              return (
                <div key={item.id} onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  className="bg-white rounded-lg px-4 py-3 cursor-pointer transition-all border border-gray-200"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftStyle: "solid",
                    borderLeftColor: domain?.color ?? "#e0e0e0",
                    ...(isExpanded && domain ? { borderTopColor: domain.color, borderRightColor: domain.color, borderBottomColor: domain.color } : {}),
                  }}>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm" style={{ color: domain?.color }}>{item.id}</span>
                    <span className="text-sm font-semibold flex-1">{item.name}</span>
                    <PriorityBadge priority={item.priority} />
                    <span className="text-[11px] text-gray-500 font-mono">{item.controlCount} ctrl{item.controlCount > 1 ? "s" : ""}</span>
                    <span className="text-gray-400 text-sm" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-2">
                      <p>{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.controls.map((c) => (
                          <span key={c.id} className="px-1.5 py-0.5 rounded text-[10px] font-semibold border" style={{ background: domain?.accent, color: domain?.color, borderColor: `${domain?.color}30` }}>{c.id}</span>
                        ))}
                      </div>
                      <p className="text-green-700 font-medium">{item.reductionNote}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeView === "reuse" && (
        <div>
          <h3 className="text-sm font-bold text-[#1B3A5C] mb-1">Evidence Reuse Tiers</h3>
          <p className="text-xs text-gray-500 mb-4">Items sorted by how many controls they satisfy.</p>
          <div className="rounded-lg p-4 mb-4 text-white" style={{ background: "linear-gradient(135deg, #DC2626, #B71C1C)" }}>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-mono text-base font-bold">A5</span>
              <span className="text-sm font-bold">Architecture Type Declaration</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">FOUNDATIONAL — 32 CONTROLS</span>
            </div>
            <div className="text-xs opacity-85">Must be collected first. Determines which of all 32 controls are applicable.</div>
          </div>
          {[
            { label: "Ultra-High Reuse (5–6 controls)", items: multiControlItems.filter((i) => i.controlCount >= 5), color: "#D97706" },
            { label: "High Reuse (3–4 controls)", items: multiControlItems.filter((i) => i.controlCount >= 3 && i.controlCount <= 4), color: "#1565C0" },
            { label: "Moderate Reuse (2 controls)", items: multiControlItems.filter((i) => i.controlCount === 2), color: "#059669" },
          ].map((tier) => (
            <div key={tier.label} className="mb-4">
              <div className="text-xs font-bold flex items-center gap-2 mb-2" style={{ color: tier.color }}>
                <div className="w-3 h-3 rounded" style={{ background: tier.color }} /> {tier.label} — {tier.items.length} items
              </div>
              {tier.items.map((item) => {
                const domain = domains.find((d) => item.id.startsWith(d.id));
                return (
                  <div key={item.id} className="bg-white border rounded-md px-3 py-2 mb-1.5" style={{ borderLeftWidth: 4, borderLeftColor: tier.color }}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color: domain?.color }}>{item.id}</span>
                      <span className="text-xs font-semibold flex-1">{item.name}</span>
                      <PriorityBadge priority={item.priority} />
                      <div className="flex gap-1">{item.controls.map((c) => <span key={c.id} className="px-1 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">{c.id}</span>)}</div>
                    </div>
                    <div className="text-[11px] text-green-700 font-medium mt-1">{item.reductionNote}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {activeView === "controls" && (
        <div>
          <h3 className="text-sm font-bold text-[#1B3A5C] mb-1">Control → Evidence Matrix</h3>
          <p className="text-xs text-gray-500 mb-4">Controls with their mapped evidence items (scoped to your architecture).</p>
          <div className="space-y-1">
            {CONTROL_MATRIX.filter((ctrl) => scopeItems.some((i) => i.controls.some((c) => c.id === ctrl.id))).map((ctrl) => (
              <div key={ctrl.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-xs ${ctrl.t === "A" ? "bg-gray-50" : "bg-white"}`}>
                <span className={`font-mono font-bold w-9 ${ctrl.t === "M" ? "text-red-700" : "text-gray-500"}`}>{ctrl.id}</span>
                <span className="flex-1 min-w-[200px]">{ctrl.name} {ctrl.t === "A" && <span className="text-[9px] text-gray-400">(Advisory)</span>}</span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {ctrl.items.filter((code) => domainIdSet.has(code.charAt(0))).map((code) => {
                    const domain = domains.find((d) => code.startsWith(d.id));
                    return <span key={code} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: domain?.accent, color: domain?.color }}>{code}</span>;
                  })}
                </div>
                <span className="font-mono text-gray-400 w-5 text-right">{ctrl.items.filter((code) => domainIdSet.has(code.charAt(0))).length}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

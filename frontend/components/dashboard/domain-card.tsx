"use client";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor, scoreBg } from "@/lib/utils";
import type { Domain } from "@/lib/types";

export function DomainCard({ domain, cycleId }: { domain: Domain; cycleId?: string | null }) {
  const pct = Math.round((domain.completed / domain.items) * 100);
  const href = cycleId ? `/cycles/${cycleId}/domains/${domain.id}` : `/domains/${domain.id}`;
  return (
    <Link href={href}
      className="block bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: scoreBg(pct), color: scoreColor(pct) }}>{domain.id}</div>
          <div className="text-sm font-semibold text-gray-800">{domain.name}</div>
        </div>
        <div className="text-lg font-bold" style={{ color: scoreColor(pct) }}>{pct}%</div>
      </div>
      <ProgressBar pct={pct} h={6} />
      <div className="flex justify-between mt-2 text-[11px] text-gray-500">
        <span>{domain.completed}/{domain.items} items</span>
        <span>{domain.controls.length} controls</span>
      </div>
      {domain.gap && (
        <div className="mt-2 px-2 py-1 bg-amber-50 rounded text-[11px] text-amber-800">⚠ {domain.gap}</div>
      )}
    </Link>
  );
}

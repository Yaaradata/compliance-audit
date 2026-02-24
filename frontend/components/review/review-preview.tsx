"use client";
import type { ReviewItem } from "@/lib/types";

export function ReviewPreview({ item }: { item: ReviewItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-semibold text-gray-800">{item.title}</div>
          <div className="text-[11px] text-gray-500 mt-1">Submitted by {item.submitter} on {item.date}</div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-green-600 bg-green-50 text-green-700 text-[11px] font-semibold">✓ Approve</button>
          <button className="px-3 py-1.5 rounded-lg border border-amber-500 bg-amber-50 text-amber-600 text-[11px] font-semibold">↩ Return</button>
        </div>
      </div>
      <div className="mt-3 p-2.5 bg-sky-50 rounded-lg border border-sky-200">
        <div className="text-[11px] font-semibold text-sky-700 mb-1">🤖 AI Summary <span className="font-normal text-gray-500">· 87% confidence</span></div>
        <div className="text-xs text-sky-900 leading-relaxed">
          This document provides evidence relevant to controls {item.controls.join(", ")}. It demonstrates compliance through documented procedures and configuration evidence for the {item.domain} domain.
        </div>
      </div>
    </div>
  );
}

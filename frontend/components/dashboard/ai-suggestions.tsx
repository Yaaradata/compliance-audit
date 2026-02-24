"use client";

const SUGGESTIONS = [
  "Upload vendor risk assessments to improve Control 2.8 from 55% → ~90%",
  "SIEM config screenshot needed for Control 6.4",
  "Quarterly access review records will close gap on Control 5.1",
];

export function AiSuggestions() {
  return (
    <div className="bg-sky-50 rounded-xl p-3 border border-sky-200">
      <div className="text-xs font-semibold text-sky-700 mb-2">🤖 AI Suggestions</div>
      <div className="space-y-0 divide-y divide-sky-200">
        {SUGGESTIONS.map((s, i) => (
          <div key={i} className="py-1 text-[11px] text-sky-900 leading-relaxed">{s}</div>
        ))}
      </div>
    </div>
  );
}

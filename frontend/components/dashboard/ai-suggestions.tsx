"use client";

interface AiSuggestionsProps {
  suggestions?: string[];
}

export function AiSuggestions({ suggestions = [] }: AiSuggestionsProps) {
  
  return (
    <div className="bg-sky-50 rounded-xl p-3 border border-sky-200">
      <div className="space-y-0 divide-y divide-sky-200">
        {suggestions.map((s, i) => (
          <div key={i} className="py-1 text-[11px] text-sky-900 leading-relaxed">{typeof s === "string" ? s : (s as { text?: string }).text ?? ""}</div>
        ))}
      </div>
    </div>
  );
}

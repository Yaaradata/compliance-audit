type NarrativeLineage = {
  model: string;
  modelVersion: string;
  inputsNotSeen: string[];
  perParagraphCitationCount: number;
};

type PackNarrative = {
  generatedNarrative: string;
  narrativeLineage: NarrativeLineage;
};

type Props = {
  pack: PackNarrative;
  subtitle: string;
  /** When true, collapses line breaks into one paragraph (v3 packs). */
  singleParagraph?: boolean;
};

export function GeneratedNarrative({ pack, subtitle, singleParagraph = true }: Props) {
  const narrative = singleParagraph
    ? pack.generatedNarrative.trim()
    : pack.generatedNarrative;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold">Generated Narrative</h3>
          <p className="text-[10px] text-slate-500">
            {subtitle} · model {pack.narrativeLineage.model} v{pack.narrativeLineage.modelVersion}
          </p>
        </div>
        <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-800">
          AI · {pack.narrativeLineage.perParagraphCitationCount} CITATIONS
        </span>
      </header>
      <p className="whitespace-pre-line p-5 text-xs leading-[1.65] text-slate-700">{narrative}</p>
      {pack.narrativeLineage.inputsNotSeen.length > 0 && (
        <aside className="mx-5 mb-5 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            Inputs Not Seen by AI
          </p>
          <ul className="space-y-0.5 text-xs text-amber-900">
            {pack.narrativeLineage.inputsNotSeen.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </aside>
      )}
    </section>
  );
}

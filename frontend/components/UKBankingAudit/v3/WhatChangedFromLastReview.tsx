type WhatChangedItem = {
  id: string;
  narrativeText: string;
  aiConfidence?: number;
};

type Props = {
  title: string;
  items?: WhatChangedItem[];
};

function EmptyState({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-slate-500">{message}</p>;
}

export function WhatChangedFromLastReview({ title, items = [] }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          AI-summarised · written, not charted
        </span>
      </header>
      {items.length === 0 ? (
        <EmptyState message="No material changes since the last review." />
      ) : (
        <ul className="space-y-3.5">
          {items.map((item) => (
            <li key={item.id} className="border-l-2 border-slate-200 pl-4">
              <p className="text-sm leading-relaxed text-slate-800">{item.narrativeText}</p>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                AI confidence {Math.round((item.aiConfidence ?? 0) * 100)}%
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

'use client';

const TABS = ['overview', 'population', 'evidence', 'issues', 'aiInsights'] as const;
export type ControlDetailTab = (typeof TABS)[number];

export function ControlDetailTabs({
  tab,
  onTabChange,
  populationCount,
  issuesCount,
  insightsCount,
}: {
  tab: ControlDetailTab;
  onTabChange: (t: ControlDetailTab) => void;
  populationCount: number;
  issuesCount: number;
  insightsCount: number;
}) {
  const labels: Record<ControlDetailTab, string> = {
    overview: 'Overview',
    population: `Population (${populationCount})`,
    evidence: 'Evidence',
    issues: `Issues (${issuesCount})`,
    aiInsights: `AI / predictive signals (${insightsCount})`,
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200">
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTabChange(t)}
          className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-xs font-medium transition ${
            tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {labels[t]}
        </button>
      ))}
    </div>
  );
}

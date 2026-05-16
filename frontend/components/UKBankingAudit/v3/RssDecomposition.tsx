import {
  resolveRssComponentScore,
  type RssComponentDef,
} from "@/components/UKBankingAudit/v3/config";

type Props = {
  components: Record<string, number>;
  defs: RssComponentDef[];
  bandText: (band: string) => string;
  bandBar: (band: string) => string;
};

function scoreTone(value: number): "green" | "amber" | "red" {
  if (value >= 80) return "green";
  if (value >= 60) return "amber";
  return "red";
}

export function RssDecomposition({ components, defs, bandText, bandBar }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">RSS Decomposition</h3>
      <ul className="space-y-2">
        {defs.map((def) => {
          const value = resolveRssComponentScore(components, def);
          const tone = scoreTone(value);
          return (
            <li key={def.key}>
              <p className="mb-0.5 flex justify-between text-xs">
                <span className="text-slate-700">{def.label}</span>
                <span className={`font-bold ${bandText(tone)}`}>{value}</span>
              </p>
              <p className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className={`block h-full ${bandBar(tone)}`}
                  style={{ width: `${value}%` }}
                />
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

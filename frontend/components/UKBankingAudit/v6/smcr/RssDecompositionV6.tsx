"use client";

import {
  resolveRssComponentScore,
  type RssComponentDef,
} from "@/components/UKBankingAudit/v3/config";
import {
  rssEvidenceForComponent,
  rssEvidenceStateForDef,
} from "@/lib/ukbankingaudit/v6/smcrEvidence";
import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import { RssEvidenceRail } from "./RssEvidenceRail";

type Props = {
  components: Record<string, number>;
  defs: RssComponentDef[];
  bandText: (band: string) => string;
  bandBar: (band: string) => string;
  onOpenEvidence?: (ref: string) => void;
};

function scoreTone(value: number): "green" | "amber" | "red" {
  if (value >= 80) return "green";
  if (value >= 60) return "amber";
  return "red";
}

export function RssDecompositionV6({
  components,
  defs,
  bandText,
  bandBar,
  onOpenEvidence,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">My SM&CR List</h3>
      <ul className="space-y-3">
        {defs.map((def) => {
          const value = resolveRssComponentScore(components, def);
          const tone = scoreTone(value);
          const railState = rssEvidenceStateForDef(def);
          const keys = def.mergeKeys?.length ? def.mergeKeys : [def.key];
          const hollowKeys = keys.filter((k) => rssEvidenceStateForDef({ key: k, label: "" }) === "hollow");

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
              <RssEvidenceRail state={railState} />
              {hollowKeys.map((k) => {
                const ev = rssEvidenceForComponent(k);
                if (!ev) return null;
                return (
                  <ClaimLine
                    key={k}
                    derivation="RULE"
                    evidenceRef={ev.evidenceRef}
                    onOpenEvidence={onOpenEvidence}
                  >
                    {def.label} score {components[k] ?? value} — assertion with no artefact within{" "}
                    {ev.expectedCadenceDays}-day cadence.
                  </ClaimLine>
                );
              })}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

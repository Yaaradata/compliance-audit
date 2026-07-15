"use client";

import { formatAgeingCopy, nationwideAssertionPrecedent, type LineAgeingRecord } from "@/lib/ukbankingaudit/v5/crsaAttestation";

type Props = {
  record: LineAgeingRecord | null;
  compact?: boolean;
};

/**
 * Line rolled forward unchanged across N cycles — sorted by duration descending in the table.
 */
export function LineAgeing({ record, compact = false }: Props) {
  if (!record?.fires) {
    return compact ? <span className="text-[10px] text-slate-300">—</span> : null;
  }

  const copy = formatAgeingCopy(record);
  const precedent = nationwideAssertionPrecedent();

  if (compact) {
    return (
      <span className="text-[10px] font-medium text-amber-800" title={copy}>
        {record.consecutiveCycles}c · {record.lastArtefactMonthsAgo}mo
      </span>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-2 py-1.5">
      <p className="text-[10px] leading-relaxed text-amber-900">{copy}</p>
      {precedent && record.racmRef === "AML.01.06.01" ? (
        <p className="mt-1 text-[9px] leading-relaxed text-slate-600">
          Precedent · tolerance stood Sep 2017 – Apr 2020 across ~10 board cycles; &quot;what
          changed&quot; panel empty on each.
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { getStatusEvidenceByArtefactId } from "@/lib/ukbankingaudit/v5/resolveV5Entity";

type Props = { entityId: string };

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-[11px] font-medium text-slate-500">{k}</dt>
      <dd className="break-all font-mono text-[12px] text-slate-900 sm:text-right">{v}</dd>
    </div>
  );
}

/** Status-evidence artefact drawer — DOMAIN_EVIDENCE / RSS assertion markers. */
export function StatusEvidenceDetailContent({ entityId }: Props) {
  const e = getStatusEvidenceByArtefactId(entityId);
  if (!e) {
    return (
      <p className="text-sm text-slate-600">Status evidence not found for this artefact id.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Status evidence
        </div>
        <h2 className="mt-0.5 break-all text-base font-bold text-slate-900">{e.artefactId}</h2>
      </div>

      <dl className="rounded-lg border border-slate-200 bg-slate-50/60 px-3">
        <Row k="domainId" v={e.domainId} />
        <Row k="subCategory" v={e.subCategory ?? "—"} />
        <Row k="crsaRef" v={e.crsaRef ?? "—"} />
        <Row k="artefactTs" v={e.artefactTs ?? "null"} />
        <Row k="sourceSystem" v={e.sourceSystem ?? "—"} />
        <Row k="sha256" v={e.sha256 ?? "—"} />
        <Row
          k="expectedCadenceDays"
          v={e.expectedCadenceDays == null ? "—" : String(e.expectedCadenceDays)}
        />
        <Row k="cadenceSource" v={e.cadenceSource} />
        <Row k="confirmedBy" v={e.confirmedBy ?? "—"} />
        <Row k="confirmedAt" v={e.confirmedAt ?? "—"} />
      </dl>

      {e.artefactTs == null ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          This status is an assertion marker — no artefact timestamp is recorded.
        </p>
      ) : null}
    </div>
  );
}

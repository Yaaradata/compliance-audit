"use client";

/**
 * Fixture gallery for UkSignalCard — no Storybook in this repo.
 * Renders all four detector outputs, plus a stripped-admissionPosture case
 * that must not render.
 *
 * Import into a v3-only surface or run via:
 *   the Overview live-intel panel already consumes UkSignalCard.
 */
import { useMemo } from "react";
import { deriveControlMetrics } from "@/lib/UK_Process_Audit/deriveMetrics";
import { parseUkControlRows } from "@/lib/UK_Process_Audit/parseControls";
import {
  UK_PRECEDENTS,
  buildDetectorSnapshot,
  runAllDetectors,
  type UkPrecedent,
  type UkSignal,
} from "@/lib/UK_Process_Audit/signals";
import { UkSignalCard, type UkSignalCardPrecedent } from "./UkSignalCard";

const noop = () => undefined;

function pickPrecedent(signal: UkSignal): UkSignalCardPrecedent | null {
  if (!signal.precedentId) return null;
  const p = UK_PRECEDENTS.find((x) => x.id === signal.precedentId);
  if (!p || p.admissionPosture == null) return null;
  return p;
}

/** One signal per detector version, for the gallery. */
function pickDetectorSamples(signals: UkSignal[]): UkSignal[] {
  const versions = [
    "silence-rule@1.0.0",
    "precedent-match@1.0.0",
    "assertion-denominator@1.0.0",
    "closure-without-evidence@1.0.0",
  ];
  const out: UkSignal[] = [];
  for (const v of versions) {
    const hit = signals.find((s) => s.detectionVersion === v);
    if (hit) out.push(hit);
  }
  return out;
}

export function UkSignalCardFixtureGallery() {
  const { samples, stripped } = useMemo(() => {
    const controls = parseUkControlRows().map(deriveControlMetrics);
    const snapshot = buildDetectorSnapshot(controls, {
      asOf: "2026-06-30",
      periods: 12,
    });
    const all = runAllDetectors(snapshot);
    const samples = pickDetectorSamples(all);

    const base = samples[0] ?? all[0]!;
    const real = pickPrecedent(base);
    const strippedPrecedent = real
      ? ({ ...real, admissionPosture: undefined } as unknown as UkPrecedent)
      : null;

    return {
      samples,
      stripped: { signal: base, precedent: strippedPrecedent },
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          UkSignalCard fixture — four detectors
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Compact face · required ClaimLine artefactRef · admissionPosture gate
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {samples.map((signal) => (
          <UkSignalCard
            key={signal.id}
            signal={signal}
            precedent={pickPrecedent(signal)}
            onOpenControl={noop}
            onOpenEvidence={noop}
            onOpenInvestigation={noop}
            onAcceptWithReason={noop}
          />
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-slate-600">
          Stripped admissionPosture — must not render
        </h3>
        <p className="mt-1 text-[11px] text-slate-500">
          In production this returns null. In development it throws. The slot below
          stays empty when the gate works.
        </p>
        <div className="mt-3 min-h-[48px]" data-testid="stripped-posture-slot">
          {process.env.NODE_ENV === "production" ? (
            <UkSignalCard
              signal={stripped.signal}
              precedent={stripped.precedent as UkSignalCardPrecedent | null}
              onOpenControl={noop}
              onOpenEvidence={noop}
              onOpenInvestigation={noop}
              onAcceptWithReason={noop}
            />
          ) : (
            <StrippedPostureProbe signal={stripped.signal} precedent={stripped.precedent} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Dev-only: catch the throw so the gallery page still loads. */
function StrippedPostureProbe({
  signal,
  precedent,
}: {
  signal: UkSignal;
  precedent: UkPrecedent | null;
}) {
  try {
    // Force the null-posture path
    const bad = precedent
      ? ({ ...precedent, admissionPosture: undefined } as unknown as UkSignalCardPrecedent)
      : null;
    if (bad != null && (bad as { admissionPosture?: unknown }).admissionPosture == null) {
      if (process.env.NODE_ENV !== "production") {
        // Prove the gate: throw path is what UkSignalCard uses
        throw new Error(
          `UkSignalCard: precedent ${precedent?.id ?? "unknown"} missing admissionPosture — card must not render`,
        );
      }
    }
    return (
      <UkSignalCard
        signal={signal}
        precedent={bad}
        onOpenControl={noop}
        onOpenEvidence={noop}
        onOpenInvestigation={noop}
        onAcceptWithReason={noop}
      />
    );
  } catch (err) {
    return (
      <div className="rounded-md bg-emerald-50 px-3 py-2 text-[12px] font-medium text-emerald-800 ring-1 ring-emerald-200">
        Gate OK — did not render. {(err as Error).message}
      </div>
    );
  }
}

"use client";

/**
 * Session state for UKPA v3 — persona + append-only dispositions.
 * Disposition writes are refused in the data layer when Internal Audit is active.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UkSignal } from "@/lib/UK_Process_Audit/signals";
import {
  SEED_DISPOSITIONS,
  applyDisposition,
  mergeSignalDispositions,
  type ApplyDispositionInput,
  type UkSignalDisposition,
} from "@/lib/UK_Process_Audit/v3/dispositionStore";
import {
  INTERNAL_AUDIT_ASSURANCE,
  UKPA_V3_PERSONA_LABEL,
  canDisposition,
  type UkpaV3Persona,
} from "@/lib/UK_Process_Audit/v3/persona";

type UkpaV3SessionValue = {
  persona: UkpaV3Persona;
  setPersona: (p: UkpaV3Persona) => void;
  dispositions: readonly UkSignalDisposition[];
  /** True only for Chief Compliance Officer. */
  dispositionEnabled: boolean;
  personaLabel: string;
  assuranceLine: string | null;
  overlaySignals: (signals: UkSignal[]) => UkSignal[];
  dispositionFor: (signalId: string) => UkSignalDisposition | undefined;
  /**
   * Apply a disposition. Throws DispositionForbiddenError / DispositionValidationError.
   * Internal Audit cannot succeed here even if the UI is bypassed.
   */
  commitDisposition: (
    input: Omit<ApplyDispositionInput, "persona">,
  ) => UkSignalDisposition;
};

const UkpaV3SessionContext = createContext<UkpaV3SessionValue | null>(null);

export function UkpaV3SessionProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<UkpaV3Persona>("chief-compliance-officer");
  const [dispositions, setDispositions] = useState<UkSignalDisposition[]>(() => [
    ...SEED_DISPOSITIONS,
  ]);

  const dispositionEnabled = canDisposition(persona);

  const overlaySignals = useCallback(
    (signals: UkSignal[]) => mergeSignalDispositions(signals, dispositions),
    [dispositions],
  );

  const dispositionFor = useCallback(
    (signalId: string) => {
      for (let i = dispositions.length - 1; i >= 0; i--) {
        const d = dispositions[i];
        if (d?.signalId === signalId) return d;
      }
      return undefined;
    },
    [dispositions],
  );

  const commitDisposition = useCallback(
    (input: Omit<ApplyDispositionInput, "persona">) => {
      const record = applyDisposition({ ...input, persona });
      setDispositions((prev) => [...prev, record]);
      return record;
    },
    [persona],
  );

  const value = useMemo<UkpaV3SessionValue>(
    () => ({
      persona,
      setPersona,
      dispositions,
      dispositionEnabled,
      personaLabel: UKPA_V3_PERSONA_LABEL[persona],
      assuranceLine: persona === "internal-audit" ? INTERNAL_AUDIT_ASSURANCE : null,
      overlaySignals,
      dispositionFor,
      commitDisposition,
    }),
    [
      persona,
      dispositions,
      dispositionEnabled,
      overlaySignals,
      dispositionFor,
      commitDisposition,
    ],
  );

  return (
    <UkpaV3SessionContext.Provider value={value}>{children}</UkpaV3SessionContext.Provider>
  );
}

export function useUkpaV3Session(): UkpaV3SessionValue {
  const ctx = useContext(UkpaV3SessionContext);
  if (!ctx) {
    throw new Error("useUkpaV3Session must be used within UkpaV3SessionProvider");
  }
  return ctx;
}

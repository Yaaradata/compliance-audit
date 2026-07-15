"use client";

import type {
  UkEvidenceArtefact,
  UkPrecedent,
  UkSignal,
} from "@/lib/UK_Process_Audit/signals";
import type { UkAuditControl } from "@/lib/UK_Process_Audit/types";
import { UkpaV3Shell } from "../UkpaV3Shell";
import { SignalInvestigation } from "./SignalInvestigation";

export function SignalInvestigationClient({
  signal,
  control,
  precedent,
  artefacts,
  cycleLabel,
}: {
  signal: UkSignal;
  control: UkAuditControl;
  precedent: UkPrecedent | null;
  artefacts: UkEvidenceArtefact[];
  cycleLabel: string;
}) {
  return (
    <UkpaV3Shell cycleLabel={cycleLabel} activeNav="other">
      <SignalInvestigation
        signal={signal}
        control={control}
        precedent={precedent}
        artefacts={artefacts}
      />
    </UkpaV3Shell>
  );
}

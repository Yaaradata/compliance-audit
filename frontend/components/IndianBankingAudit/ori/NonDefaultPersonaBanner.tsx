'use client';

import type { PersonaCode } from '../AppShell';
import { PERSONA_META } from '../AppShell';

export function NonDefaultPersonaBanner({
  activePersona,
  defaultPersona,
  onSwitchRole,
}: {
  activePersona: PersonaCode;
  defaultPersona: PersonaCode;
  onSwitchRole: () => void;
}) {
  if (activePersona === defaultPersona) return null;

  const meta = PERSONA_META[activePersona];

  return (
    <div
      role="status"
      className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950"
    >
      <span>
        Viewing as: <span className="font-semibold">{meta.label}</span>
      </span>
      <button type="button" className="shrink-0 font-semibold text-indigo-700 underline hover:text-indigo-900" onClick={onSwitchRole}>
        switch role →
      </button>
    </div>
  );
}

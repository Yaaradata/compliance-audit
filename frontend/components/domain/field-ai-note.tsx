"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

export interface FieldAINoteProps {
  /** AI feedback message for this field (null/empty = don't show). */
  text: string | null | undefined;
  /** Optional field label so the note is clearly tied to the question (e.g. "Customer connector zone statement"). */
  fieldLabel?: string;
}

export function FieldAINote({ text, fieldLabel }: FieldAINoteProps) {
  const [dismissed, setDismissed] = useState(false);
  const msg = text != null && String(text).trim() && String(text).toLowerCase() !== "null" ? String(text).trim() : "";
  if (!msg || dismissed) return null;

  return (
    <div
      className="relative mt-2.5 rounded-xl border border-sky-200/80 bg-linear-to-br from-sky-50 to-sky-50/70 p-3.5 pl-4 shadow-sm ring-1 ring-sky-100/50"
      role="status"
      aria-live="polite"
    >
      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-sky-400/60" aria-hidden />
      <div className="flex gap-3">
        <div className="flex flex-1 min-w-0 items-start gap-2.5">
          <span
            className="shrink-0 rounded-lg bg-sky-100/90 p-1.5 text-sky-600"
            aria-hidden
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-xs font-semibold tracking-wide text-sky-800">
              AI — needs more info
              {fieldLabel ? (
                <span className="font-normal text-sky-600/90"> · {fieldLabel}</span>
              ) : null}
            </p>
            <p className="mt-1.5 text-sm text-sky-900/95 leading-relaxed">{msg}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-1.5 text-sky-600 hover:bg-sky-100/80 hover:text-sky-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

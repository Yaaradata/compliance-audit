"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface NoteInputProps {
  resourceType: string;
  resourceId: string;
  parentId?: string | null;
  criterionId?: string | null;
  placeholder?: string;
  onAdded?: () => void;
  disabled?: boolean;
  /** Override button label (e.g. "Mark as Manually Met") */
  buttonLabel?: string;
}

export function NoteInput({ resourceType, resourceId, parentId, criterionId, placeholder = "Add a note…", onAdded, disabled, buttonLabel }: NoteInputProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/notes", {
        resource_type: resourceType,
        resource_id: resourceId,
        body: trimmed,
        ...(parentId ? { parent_id: parentId } : {}),
        ...(criterionId ? { criterion_id: criterionId } : {}),
      });
      setBody("");
      onAdded?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add note";
      setError(msg.includes("Not Found") ? "Notes unavailable. Try again later." : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || submitting}
        rows={2}
        className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] resize-y min-h-[60px] disabled:opacity-60"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || submitting || !body.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : buttonLabel ?? (parentId ? "Reply" : "Add note")}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}

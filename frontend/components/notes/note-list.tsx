"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export interface NoteItem {
  id: string;
  tenant_id: string;
  resource_type: string;
  resource_id: string;
  criterion_id?: string | null;
  parent_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  author_name: string | null;
  author_role?: string | null;
}

interface NoteListProps {
  resourceType: string;
  resourceId: string;
  criterionId?: string | null;
  refreshTrigger?: number;
  emptyMessage?: string;
  /** When provided, no API call is made; these notes are shown (e.g. from a single parent fetch). */
  preFetchedNotes?: NoteItem[] | null;
  /** Called after a note is deleted (so parent can e.g. clear criterion edit and move row to Not met). */
  onNoteDeleted?: () => void;
}

export function NoteList({ resourceType, resourceId, criterionId, refreshTrigger = 0, emptyMessage = "No notes yet.", preFetchedNotes, onNoteDeleted }: NoteListProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ resource_type: resourceType, resource_id: resourceId });
    if (criterionId) params.set("criterion_id", criterionId);
    api
      .get<NoteItem[]>(`/notes?${params.toString()}`)
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .catch((e: Error) => setError(e.message || "Notes unavailable."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (preFetchedNotes !== undefined && preFetchedNotes !== null) {
      setNotes(Array.isArray(preFetchedNotes) ? preFetchedNotes : []);
      setLoading(false);
      setError("");
      return;
    }
    fetchNotes();
  }, [resourceType, resourceId, criterionId ?? "", refreshTrigger, preFetchedNotes]);

  if (loading) return <p className="text-xs text-[var(--foreground-muted)] py-2">Loading notes…</p>;
  if (error) return <p className="text-xs text-red-600 py-2">{error.includes("Not Found") ? "Notes unavailable." : error}</p>;
  if (notes.length === 0) return <p className="text-xs text-[var(--foreground-muted)] py-2">{emptyMessage}</p>;

  const handleDelete = async (note: NoteItem) => {
    if (deletingId) return;
    if (!confirm("Delete this note? The criterion will move back to “Not met” if it was only in Edited because of this note.")) return;
    setDeletingId(note.id);
    try {
      // Delete the note on the server (DB row is permanently removed); only then refresh UI.
      const params = new URLSearchParams({ resource_type: resourceType, resource_id: resourceId });
      await api.del(`/notes/${note.id}?${params.toString()}`);
      await fetchNotes();
      onNoteDeleted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li
          key={n.id}
          className={`text-sm ${n.parent_id ? "pl-4 border-l-2 border-[var(--border)] ml-1" : ""}`}
        >
          <div className="flex items-start gap-2">
            <div
              className="shrink-0 w-8 h-8 rounded-full bg-[var(--primary-muted)] flex items-center justify-center text-xs font-semibold text-[var(--primary)]"
              title={n.author_name ?? "Unknown"}
            >
              {(n.author_name ?? "?")
                .split(/\s+/)
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="font-medium text-[var(--foreground)]">{n.author_name ?? "Unknown"}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)]">
                  {roleToLabel(n.author_role)}
                </span>
              </div>
              <p className="text-[var(--foreground)] whitespace-pre-wrap break-words">{n.body}</p>
              <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(n)}
              disabled={deletingId !== null}
              className="shrink-0 p-1.5 rounded text-[var(--foreground-muted)] hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
              title="Delete note (criterion will move to Not met)"
              aria-label="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function roleToLabel(role: string | null | undefined): string {
  if (!role) return "User";
  const r = role.toLowerCase();
  if (r === "internal_reviewer_l1") return "L1";
  if (r === "internal_reviewer_l2") return "L2";
  if (r === "external_assessor") return "L3";
  if (r === "it_sme") return "Evidence uploader";
  if (r === "compliance_officer") return "Compliance";
  return role.replace(/_/g, " ");
}

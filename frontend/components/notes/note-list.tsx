"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NoteInput } from "./note-input";

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
  /** Called when notes are loaded (so parent can e.g. enable X→✓ toggle only when notes exist). */
  onNotesLoaded?: (notes: NoteItem[]) => void;
  /** When true, show chat-like thread with Reply button on each note for conversation flow. */
  chatMode?: boolean;
}

export function NoteList({ resourceType, resourceId, criterionId, refreshTrigger = 0, emptyMessage = "No notes yet.", preFetchedNotes, onNoteDeleted, onNotesLoaded, chatMode }: NoteListProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const fetchNotes = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ resource_type: resourceType, resource_id: resourceId });
    if (criterionId) params.set("criterion_id", criterionId);
    api
      .get<NoteItem[]>(`/notes?${params.toString()}`)
      .then((data) => {
        const notes = Array.isArray(data) ? data : [];
        setNotes(notes);
        onNotesLoaded?.(notes);
      })
      .catch((e: Error) => setError(e.message || "Notes unavailable."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (preFetchedNotes !== undefined && preFetchedNotes !== null) {
      const notes = Array.isArray(preFetchedNotes) ? preFetchedNotes : [];
      setNotes(notes);
      setLoading(false);
      setError("");
      onNotesLoaded?.(notes);
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

  const buildThread = (items: NoteItem[]): { note: NoteItem; replies: NoteItem[] }[] => {
    const topLevel = items.filter((n) => !n.parent_id);
    const byParent = new Map<string, NoteItem[]>();
    items.filter((n) => n.parent_id).forEach((n) => {
      const list = byParent.get(n.parent_id!) ?? [];
      list.push(n);
      byParent.set(n.parent_id!, list);
    });
    return topLevel
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((note) => ({
        note,
        replies: (byParent.get(note.id) ?? []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      }));
  };

  const threads = chatMode ? buildThread(notes) : null;

  const NoteBubble = ({ n, isReply }: { n: NoteItem; isReply?: boolean }) => (
    <div
      className={`flex items-start gap-2 ${isReply ? "ml-10 mt-2 pl-3 border-l-2 border-(--primary)/20" : ""}`}
    >
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
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] text-[var(--foreground-muted)]">
            {new Date(n.created_at).toLocaleString()}
          </p>
          {chatMode && !isReply && (
            <button
              type="button"
              onClick={() => setReplyingToId((id) => (id === n.id ? null : n.id))}
              className="text-[10px] text-(--primary) hover:underline font-medium"
            >
              Reply
            </button>
          )}
        </div>
        {chatMode && replyingToId === n.id && (
          <div className="mt-2">
            <NoteInput
              resourceType={resourceType}
              resourceId={resourceId}
              parentId={n.id}
              criterionId={criterionId}
              placeholder="Add a reply…"
              onAdded={() => {
                setReplyingToId(null);
                fetchNotes();
              }}
              buttonLabel="Reply"
            />
          </div>
        )}
      </div>
    </div>
  );

  if (chatMode && threads && threads.length > 0) {
    return (
      <div className="space-y-4">
        {threads.map(({ note, replies }) => (
          <div key={note.id} className="rounded-lg border border-(--border) bg-(--surface)/50 p-3">
            <NoteBubble n={note} />
            {replies.map((r) => (
              <NoteBubble key={r.id} n={r} isReply />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li
          key={n.id}
          className={`text-sm ${n.parent_id ? "pl-4 border-l-2 border-[var(--border)] ml-1" : ""}`}
        >
          <NoteBubble n={n} />
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
  if (r === "external_assessor") return "Approver";
  if (r === "it_sme") return "Evidence uploader";
  if (r === "compliance_officer") return "Compliance";
  return role.replace(/_/g, " ");
}

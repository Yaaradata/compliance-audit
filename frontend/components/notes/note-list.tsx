"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface NoteItem {
  id: string;
  tenant_id: string;
  resource_type: string;
  resource_id: string;
  parent_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  author_name: string | null;
}

interface NoteListProps {
  resourceType: string;
  resourceId: string;
  refreshTrigger?: number;
  emptyMessage?: string;
}

export function NoteList({ resourceType, resourceId, refreshTrigger = 0, emptyMessage = "No notes yet." }: NoteListProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotes = () => {
    setLoading(true);
    setError("");
    api
      .get<NoteItem[]>(`/notes?resource_type=${encodeURIComponent(resourceType)}&resource_id=${encodeURIComponent(resourceId)}`)
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .catch((e: Error) => setError(e.message || "Notes unavailable."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotes();
  }, [resourceType, resourceId, refreshTrigger]);

  if (loading) return <p className="text-xs text-[var(--foreground-muted)] py-2">Loading notes…</p>;
  if (error) return <p className="text-xs text-red-600 py-2">{error.includes("Not Found") ? "Notes unavailable." : error}</p>;
  if (notes.length === 0) return <p className="text-xs text-[var(--foreground-muted)] py-2">{emptyMessage}</p>;

  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <li
          key={n.id}
          className={`text-sm ${n.parent_id ? "pl-4 border-l-2 border-[var(--border)] ml-2" : ""}`}
        >
          <p className="text-[var(--foreground)] whitespace-pre-wrap break-words">{n.body}</p>
          <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
            {n.author_name ?? "Unknown"} · {new Date(n.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

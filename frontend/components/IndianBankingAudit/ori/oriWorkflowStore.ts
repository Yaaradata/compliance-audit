'use client';

/**
 * ORI workflow overlay store — persistent mutations over the mock data.
 *
 * Mock data in `dataModel` is read-only seed. Anything that should survive
 * across user actions (PAC approvals/returns/comments, control test runs,
 * evidence uploads & access trail) goes through this store, which is backed
 * by `localStorage` and exposed via `useSyncExternalStore`.
 *
 * Design notes:
 *  - PAC notes have a full "effective state" record per id (status, version,
 *    comments, revision rounds). Initialised from seed on first read.
 *  - Test runs are append-only.
 *  - Evidence records have a versions[] and access_trail[] per id, initialised
 *    from the seed payload_hash / freshness_days.
 */

import { useSyncExternalStore } from 'react';
import {
  evidenceRecords as seedEvidence,
  pacNotes as seedPacNotes,
  type EvidenceRecord,
  type PacNote,
  type PacNoteComment,
} from '../dataModel';

/** v2-only — v1 uses static mock data without client-side mutations. */
const STORAGE_KEY = 'ori_workflow_v2';

export type PacRevisionRound = {
  round: number;
  opened_at: string;
  returned_by_role: string;
  notes: string;
  resubmitted_at?: string;
  resubmitted_by_role?: string;
};

export type PacNoteOverlay = {
  pac_note_id: string;
  status: string;
  document_version: string;
  approved_at: string | null;
  rejected_at: string | null;
  approval_conditions: string | null;
  comments: PacNoteComment[];
  revision_rounds: PacRevisionRound[];
};

export type ControlTestRunRecord = {
  run_id: string;
  control_id: string;
  ran_at: string;
  ran_by_role: string;
  population_size: number;
  sampled: number;
  passed: number;
  failed: number;
  exceptions: number;
  result: 'pass' | 'pass_with_exception' | 'fail';
  notes: string;
};

export type EvidenceVersion = {
  version: number;
  uploaded_at: string;
  uploaded_by_role: string;
  hash: string;
  size_kb: number;
  source: string;
  note?: string;
};

export type EvidenceAccessRecord = {
  at: string;
  by_role: string;
  action: 'view' | 'download' | 'upload' | 'verify';
};

export type EvidenceOverlay = {
  evidence_id: string;
  versions: EvidenceVersion[];
  access_trail: EvidenceAccessRecord[];
  retention_until: string;
};

export type OriWorkflowState = {
  pacNotes: Record<string, PacNoteOverlay>;
  testRuns: ControlTestRunRecord[];
  evidence: Record<string, EvidenceOverlay>;
};

const PENDING_STATUS = 'pending_orm_review';

function nowIso(): string {
  return new Date().toISOString();
}

function bumpVersion(v: string): string {
  const parts = v.split('.').map((n) => parseInt(n, 10));
  if (parts.length < 2 || parts.some(Number.isNaN)) return `${v}.1`;
  parts[parts.length - 1] += 1;
  return parts.join('.');
}

function mockHash(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return `0x${Math.abs(h).toString(16).padStart(8, '0')}`;
}

function defaultRetention(seed: string): string {
  // 10 years from a deterministic seed so we don't flicker across renders.
  const t = mockHash(seed)
    .replace('0x', '')
    .slice(0, 6);
  const offsetDays = parseInt(t, 16) % 365;
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() + 10);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function buildPacOverlay(base: PacNote): PacNoteOverlay {
  return {
    pac_note_id: base.pac_note_id,
    status: base.status || PENDING_STATUS,
    document_version: base.document_version || '1.0',
    approved_at: base.approved_at ?? null,
    rejected_at: null,
    approval_conditions: null,
    comments: [...(base.comments || [])],
    revision_rounds: [],
  };
}

function deterministicIngestDate(seed: string): string {
  // Seeded "uploaded_at" so SSR/CSR match and rows don't jump on rerender.
  const h = mockHash(seed).replace('0x', '').slice(0, 6);
  const offsetDays = (parseInt(h, 16) % 540) + 7; // 7–547 days back
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString();
}

function buildEvidenceOverlay(base: EvidenceRecord): EvidenceOverlay {
  const ingestAt = deterministicIngestDate(base.evidence_id);
  const initialVersion: EvidenceVersion = {
    version: 1,
    uploaded_at: ingestAt,
    uploaded_by_role: 'System ingest',
    hash: base.payload_hash || mockHash(base.evidence_id),
    size_kb: ((mockHash(base.evidence_id).charCodeAt(2) || 4) * 17) % 4096 || 256,
    source: base.source_system_id || 'unknown',
    note: 'Initial ingestion from source system.',
  };
  return {
    evidence_id: base.evidence_id,
    versions: [initialVersion],
    access_trail: [
      {
        at: initialVersion.uploaded_at,
        by_role: initialVersion.uploaded_by_role,
        action: 'upload',
      },
    ],
    retention_until: defaultRetention(base.evidence_id),
  };
}

function buildInitial(): OriWorkflowState {
  const pacs: Record<string, PacNoteOverlay> = {};
  for (const p of seedPacNotes) pacs[p.pac_note_id] = buildPacOverlay(p);
  const evidence: Record<string, EvidenceOverlay> = {};
  for (const e of seedEvidence) evidence[e.evidence_id] = buildEvidenceOverlay(e);
  return { pacNotes: pacs, testRuns: [], evidence };
}

function safeParse(raw: string | null): OriWorkflowState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OriWorkflowState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.pacNotes || !parsed.evidence || !Array.isArray(parsed.testRuns)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function load(): OriWorkflowState {
  if (typeof window === 'undefined') return buildInitial();
  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!stored) return buildInitial();
  // Merge any newly-seeded ids that aren't in the persisted state yet.
  const base = buildInitial();
  return {
    pacNotes: { ...base.pacNotes, ...stored.pacNotes },
    testRuns: stored.testRuns ?? [],
    evidence: { ...base.evidence, ...stored.evidence },
  };
}

let state: OriWorkflowState = typeof window === 'undefined' ? buildInitial() : load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — silently ignore. */
  }
}

function notify() {
  persist();
  listeners.forEach((fn) => fn());
}

function ensurePac(id: string): PacNoteOverlay {
  if (!state.pacNotes[id]) {
    const base = seedPacNotes.find((p) => p.pac_note_id === id);
    state.pacNotes[id] = base ? buildPacOverlay(base) : buildPacOverlay({ pac_note_id: id, blocking_preventive_action_ids: [], referenced_rca_ids: [] } as PacNote);
  }
  return state.pacNotes[id];
}

function ensureEvidence(id: string): EvidenceOverlay {
  if (!state.evidence[id]) {
    const base = seedEvidence.find((e) => e.evidence_id === id);
    state.evidence[id] = base
      ? buildEvidenceOverlay(base)
      : {
          evidence_id: id,
          versions: [],
          access_trail: [],
          retention_until: defaultRetention(id),
        };
  }
  return state.evidence[id];
}

export const oriWorkflowStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  getSnapshot(): OriWorkflowState {
    return state;
  },
  reset(): void {
    state = buildInitial();
    notify();
  },

  /* ------- PAC / SOP approval workflow ------- */

  approvePacNote(id: string, byRole: string, note?: string): void {
    const cur = ensurePac(id);
    const ts = nowIso();
    state.pacNotes[id] = {
      ...cur,
      status: 'approved',
      approved_at: ts,
      rejected_at: null,
      comments: [
        ...cur.comments,
        {
          at: ts,
          author_role: byRole,
          text: note?.trim() || 'Approved — proceed to dispatch SOP to repository.',
        },
      ],
    };
    notify();
  },

  rejectPacNote(id: string, byRole: string, note: string): void {
    const cur = ensurePac(id);
    const ts = nowIso();
    state.pacNotes[id] = {
      ...cur,
      status: 'rejected',
      rejected_at: ts,
      comments: [
        ...cur.comments,
        {
          at: ts,
          author_role: byRole,
          text: note?.trim() || 'Rejected — resubmit with clarifications.',
        },
      ],
    };
    notify();
  },

  conditionalApprove(id: string, byRole: string, conditions: string): void {
    const cur = ensurePac(id);
    const ts = nowIso();
    state.pacNotes[id] = {
      ...cur,
      status: 'conditional_approval',
      approval_conditions: conditions.trim(),
      comments: [
        ...cur.comments,
        {
          at: ts,
          author_role: byRole,
          text: `Conditional approval — ${conditions.trim()}`,
        },
      ],
    };
    notify();
  },

  returnForRevision(id: string, byRole: string, notes: string): void {
    const cur = ensurePac(id);
    const ts = nowIso();
    const round = (cur.revision_rounds.length || 0) + 1;
    state.pacNotes[id] = {
      ...cur,
      status: 'returned_for_revision',
      document_version: bumpVersion(cur.document_version),
      comments: [
        ...cur.comments,
        {
          at: ts,
          author_role: byRole,
          text: `Returned for revision (round ${round}): ${notes.trim()}`,
        },
      ],
      revision_rounds: [
        ...cur.revision_rounds,
        { round, opened_at: ts, returned_by_role: byRole, notes: notes.trim() },
      ],
    };
    notify();
  },

  resubmitPacNote(id: string, byRole: string, note?: string): void {
    const cur = ensurePac(id);
    const ts = nowIso();
    const rounds = [...cur.revision_rounds];
    const openIdx = rounds.findIndex((r) => !r.resubmitted_at);
    if (openIdx >= 0) {
      rounds[openIdx] = { ...rounds[openIdx], resubmitted_at: ts, resubmitted_by_role: byRole };
    }
    state.pacNotes[id] = {
      ...cur,
      status: PENDING_STATUS,
      comments: [
        ...cur.comments,
        {
          at: ts,
          author_role: byRole,
          text: note?.trim() || `Resubmitted v${cur.document_version} for ORM review.`,
        },
      ],
      revision_rounds: rounds,
    };
    notify();
  },

  addPacComment(id: string, byRole: string, text: string): void {
    if (!text.trim()) return;
    const cur = ensurePac(id);
    const ts = nowIso();
    state.pacNotes[id] = {
      ...cur,
      comments: [...cur.comments, { at: ts, author_role: byRole, text: text.trim() }],
    };
    notify();
  },

  /* ------- Control test runs ------- */

  addTestRun(run: ControlTestRunRecord): void {
    state.testRuns = [run, ...state.testRuns];
    notify();
  },

  /* ------- Evidence (storage / access) ------- */

  uploadEvidenceVersion(
    id: string,
    options: { uploadedByRole: string; sizeKb: number; source: string; note?: string },
  ): EvidenceVersion {
    const cur = ensureEvidence(id);
    const ts = nowIso();
    const nextVersion: EvidenceVersion = {
      version: (cur.versions[cur.versions.length - 1]?.version || 0) + 1,
      uploaded_at: ts,
      uploaded_by_role: options.uploadedByRole,
      hash: mockHash(`${id}-${ts}`),
      size_kb: options.sizeKb,
      source: options.source,
      note: options.note,
    };
    state.evidence[id] = {
      ...cur,
      versions: [...cur.versions, nextVersion],
      access_trail: [
        ...cur.access_trail,
        { at: ts, by_role: options.uploadedByRole, action: 'upload' },
      ],
    };
    notify();
    return nextVersion;
  },

  recordEvidenceAccess(id: string, action: EvidenceAccessRecord['action'], byRole: string): void {
    const cur = ensureEvidence(id);
    state.evidence[id] = {
      ...cur,
      access_trail: [...cur.access_trail, { at: nowIso(), by_role: byRole, action }],
    };
    notify();
  },
};

export function useOriWorkflow(): OriWorkflowState {
  return useSyncExternalStore(
    oriWorkflowStore.subscribe,
    oriWorkflowStore.getSnapshot,
    oriWorkflowStore.getSnapshot,
  );
}

/** Merge seed PAC note with the overlay state (status, version, comments). */
export function effectivePacNote(base: PacNote, overlay: PacNoteOverlay | undefined): PacNote {
  if (!overlay) return base;
  return {
    ...base,
    status: overlay.status,
    document_version: overlay.document_version,
    approved_at: overlay.approved_at,
    comments: overlay.comments,
  };
}

/** Convenience hook: returns effective PAC plus overlay (for revision rounds, conditions). */
export function useEffectivePacNote(id: string | null): {
  base: PacNote | null;
  overlay: PacNoteOverlay | null;
  effective: PacNote | null;
} {
  const ws = useOriWorkflow();
  if (!id) return { base: null, overlay: null, effective: null };
  const base = seedPacNotes.find((p) => p.pac_note_id === id) || null;
  if (!base) return { base: null, overlay: null, effective: null };
  const overlay = ws.pacNotes[id] || null;
  return { base, overlay, effective: effectivePacNote(base, overlay ?? undefined) };
}

/** All PAC notes merged with overlay — preserves seed order. */
export function useEffectivePacNotes(): PacNote[] {
  const ws = useOriWorkflow();
  return seedPacNotes.map((p) => effectivePacNote(p, ws.pacNotes[p.pac_note_id]));
}

export function useEvidenceOverlay(id: string | null): EvidenceOverlay | null {
  const ws = useOriWorkflow();
  if (!id) return null;
  return ws.evidence[id] || null;
}

export function useTestRunsForControl(controlId: string | null): ControlTestRunRecord[] {
  const ws = useOriWorkflow();
  if (!controlId) return [];
  return ws.testRuns.filter((r) => r.control_id === controlId);
}

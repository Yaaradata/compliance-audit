"use client";

import { useState, useEffect, useCallback } from "react";
import { getEvidence, getEvidenceContent } from "@/lib/aws-api";
import { AwsEvidenceTable } from "@/components/aws/aws-evidence-table";
import { AwsEvidenceContentModal } from "@/components/aws/aws-evidence-content-modal";
import type { AwsEvidenceRow } from "@/lib/aws-api";

export default function AwsEvidencePage() {
  const [data, setData] = useState<AwsEvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ content?: unknown; error?: string } | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    getEvidence(200)
      .then(setData)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load evidence");
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onViewContent = useCallback((row: AwsEvidenceRow) => {
    setContentLoading(true);
    setModal(null);
    getEvidenceContent(row.evidence_id)
      .then((content) => setModal({ content }))
      .catch((err) => setModal({ error: err instanceof Error ? err.message : "Failed to load content" }))
      .finally(() => setContentLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <div className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Evidence</div>
        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          All collected AWS evidence. View JSON content for any row.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--danger)", background: "var(--danger-bg)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card rounded-xl py-12 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>Loading…</div>
      ) : (
        <AwsEvidenceTable data={data} onViewContent={onViewContent} />
      )}

      {contentLoading && !modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <p className="rounded-lg bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)]">Loading content…</p>
        </div>
      )}

      {modal && (
        <AwsEvidenceContentModal
          content={modal.content}
          error={modal.error}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

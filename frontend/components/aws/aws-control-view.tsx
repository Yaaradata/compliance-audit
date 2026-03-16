"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getControls,
  getControl,
  getControlsCoverage,
  getEvidenceContent,
  fetchAwsEvidence,
  submitManualEvidence,
  type AwsControl,
  type AwsControlDetail,
} from "@/lib/aws-api";
import { AwsEvidenceContentModal } from "./aws-evidence-content-modal";

export function AwsControlView() {
  const params = useParams();
  const controlId = params?.controlId as string | undefined;
  const [controls, setControls] = useState<AwsControl[]>([]);
  const [selectedControl, setSelectedControl] = useState<AwsControlDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentModal, setContentModal] = useState<{ content?: unknown; error?: string } | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState<string[]>([]);
  const [manualForm, setManualForm] = useState({ item_code: "", contentJson: "{}" });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    getControls()
      .then((data) => {
        setControls(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((e: Error & { status?: number }) => {
        const msg = e?.message ?? "Failed to load controls";
        setError(msg);
        setControls([]);
      });
    getControlsCoverage()
      .then((d) => setControlIdsWithEvidence(d?.control_ids_with_evidence ?? []))
      .catch(() => setControlIdsWithEvidence([]));
  }, []);

  useEffect(() => {
    if (!controlId) {
      setSelectedControl(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getControl(controlId)
      .then(setSelectedControl)
      .catch(() => setSelectedControl(null))
      .finally(() => setLoading(false));
  }, [controlId]);

  const refreshControl = () => {
    if (controlId) {
      getControl(controlId).then(setSelectedControl);
      getControlsCoverage().then((d) => setControlIdsWithEvidence(d.control_ids_with_evidence || []));
    }
  };

  const handleFetchAwsEvidence = () => {
    setFetchError(null);
    setFetching(true);
    fetchAwsEvidence()
      .then(() => refreshControl())
      .catch((e: Error & { detail?: unknown }) => {
        const msg = typeof e.detail === "string" ? e.detail : e.message;
        setFetchError(msg);
      })
      .finally(() => setFetching(false));
  };

  const handleSubmitManual = () => {
    let content: Record<string, unknown>;
    try {
      content = JSON.parse(manualForm.contentJson || "{}");
    } catch {
      setManualError("Invalid JSON");
      return;
    }
    const itemCode = (manualForm.item_code || "").trim() || selectedControl?.required_evidence_items?.[0]?.item_code || "H9";
    if (!controlId) return;
    setManualError(null);
    setManualSubmitting(true);
    submitManualEvidence({
      control_id: controlId,
      item_code: itemCode,
      content,
      evidence_type: "manual",
      source_system: "manual",
    })
      .then(() => {
        setManualForm({ item_code: itemCode, contentJson: "{}" });
        refreshControl();
      })
      .catch((e: Error & { detail?: unknown }) => {
        setManualError(typeof e.detail === "string" ? e.detail : e.message);
      })
      .finally(() => setManualSubmitting(false));
  };

  const handleViewContent = (evidenceId: string) => {
    setContentLoading(true);
    getEvidenceContent(evidenceId)
      .then((content) => setContentModal({ content }))
      .catch((err) => setContentModal({ error: err.message }))
      .finally(() => setContentLoading(false));
  };

  if (loading && controlId) return <div className="py-8 text-center text-[var(--foreground-muted)]">Loading…</div>;

  const showControlsError = error && controls.length === 0;

  const collected = selectedControl?.collected_evidence || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <div className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Controls</div>
        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          SWIFT controls and their evidence. Fetch AWS evidence or add manual evidence.
        </p>
      </header>

      {showControlsError && (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}>
          <strong>Controls list could not be loaded.</strong> {error}. Ensure the backend is running and the AWS evidence database (evidence_sufficiency_matrix or swift_2026.controls) is set up.
        </div>
      )}

      {controlIdsWithEvidence.length > 0 && (
        <div className="inline-flex items-center gap-2 rounded-lg border px-4 py-2" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
          <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>Evidence available for:</span>
          <strong style={{ color: "var(--primary)" }}>{controlIdsWithEvidence.sort().join(", ")}</strong>
        </div>
      )}

      <div className="card rounded-xl p-5">
        <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Select control</div>
        <div className="flex flex-wrap gap-2">
          {controls.map((c) => (
            <Link
              key={c.control_id}
              href={`/aws/controls/${c.control_id}`}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                controlId === c.control_id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--muted)]/30 text-[var(--foreground)] hover:bg-[var(--border)]"
              }`}
            >
              {c.control_id} — {c.control_name || "Control"}
            </Link>
          ))}
        </div>
      </div>

      {selectedControl ? (
        <div className="card rounded-xl p-5 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Control {selectedControl.control_id}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>{selectedControl.control_name || "—"}</p>
            </div>
            <button
              type="button"
              onClick={handleFetchAwsEvidence}
              disabled={fetching}
              className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-70"
              title="Run AWS collectors to gather evidence for this and other controls."
            >
              {fetching ? "Fetching…" : "Fetch AWS evidence"}
            </button>
          </div>
          {fetchError && <p className="text-sm" style={{ color: "var(--danger)" }}>{fetchError}</p>}

          {selectedControl.aws_calls?.aws_apis?.length > 0 && (
            <>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                AWS calls for this control
              </h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                These AWS APIs are used to collect evidence for the required items above.
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedControl.aws_calls.aws_apis.map((api) => (
                  <span
                    key={api}
                    className="inline-block rounded border border-[var(--border)] bg-[var(--muted)]/30 px-2.5 py-1 font-mono text-xs text-[var(--primary)]"
                  >
                    {api}
                  </span>
                ))}
              </div>
              {selectedControl.aws_calls.by_evidence_item?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                    By evidence item
                  </summary>
                  <ul className="mt-2 list-none space-y-2 pl-0">
                    {selectedControl.aws_calls.by_evidence_item.map((item) => (
                      <li key={item.item_code} className="text-sm">
                        <span className="font-medium text-[var(--primary)]">{item.item_code}</span>{" "}
                        {item.evidence_item_name}
                        <ul className="ml-4 mt-1 list-disc space-y-0.5 text-[var(--foreground-muted)]">
                          {item.apis.map((api) => (
                            <li key={api}>
                              <code className="text-xs text-[var(--foreground)]">{api}</code>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}

          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Required evidence items
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-[var(--foreground-muted)]">
            {(selectedControl.required_evidence_items || []).map((item, i) => (
              <li key={i}>
                <span className="font-medium text-[var(--primary)]">{item.item_code}</span>{" "}
                {item.evidence_item_name}
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Collected evidence
          </h3>
          {collected.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)]/10 p-4">
              <p className="text-[var(--foreground-muted)]">No evidence for this control yet.</p>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Use <strong>Fetch AWS evidence</strong> to run collectors, or add evidence manually below.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="px-4 py-2 text-left font-medium text-[var(--foreground-muted)]">Item</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--foreground-muted)]">Source</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--foreground-muted)]">Collected</th>
                    <th className="w-20 px-4 py-2 text-right font-medium text-[var(--foreground-muted)]" />
                  </tr>
                </thead>
                <tbody>
                  {collected.map((e) => (
                    <tr key={e.evidence_id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20">
                      <td className="px-4 py-2 font-medium text-[var(--foreground)]">{e.item_code}</td>
                      <td className="px-4 py-2 text-[var(--foreground-muted)]">{e.source_system}</td>
                      <td className="px-4 py-2 text-[var(--foreground-muted)]">
                        {e.collected_at ? new Date(e.collected_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          className="rounded border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--border)] disabled:opacity-50"
                          onClick={() => handleViewContent(e.evidence_id)}
                          disabled={contentLoading}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-[var(--border)] pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Add manual evidence
            </h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Submit JSON evidence for this control (e.g. risk register, methodology).
            </p>
            <div className="mt-4 flex max-w-md flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-[var(--foreground-muted)]">Item code</span>
                <input
                  type="text"
                  value={manualForm.item_code}
                  onChange={(e) => setManualForm((f) => ({ ...f, item_code: e.target.value }))}
                  placeholder={selectedControl.required_evidence_items?.[0]?.item_code || "e.g. H9"}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-[var(--foreground-muted)]">JSON content</span>
                <textarea
                  value={manualForm.contentJson}
                  onChange={(e) => setManualForm((f) => ({ ...f, contentJson: e.target.value }))}
                  placeholder='{"description": "…", "updated": "2026-03-14"}'
                  rows={4}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
                />
              </label>
              {manualError && <p className="text-sm" style={{ color: "var(--danger)" }}>{manualError}</p>}
              <button
                type="button"
                onClick={handleSubmitManual}
                disabled={manualSubmitting}
                className="self-start rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-60"
              >
                {manualSubmitting ? "Submitting…" : "Submit evidence"}
              </button>
            </div>
          </div>

          {contentModal && (
            <AwsEvidenceContentModal
              content={contentModal.content}
              error={contentModal.error}
              onClose={() => setContentModal(null)}
            />
          )}
        </div>
      ) : (
        <div className="card rounded-xl p-8 text-center">
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Select a control above to see required evidence and collected data.</p>
        </div>
      )}
    </div>
  );
}

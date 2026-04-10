"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AssessmentCycle } from "@/lib/types";

export type AssessmentFramework = {
  id: string;
  code: string;
  name: string;
  version: string;
  schema_name?: string | null;
  is_active: boolean;
};

type NewAssessmentCycleFormProps = {
  onSuccess: (cycle: AssessmentCycle) => void;
  onCancel?: () => void;
  /** Hide footer cancel when embedded in a page that has its own dismiss UI */
  showFooterCancel?: boolean;
};

/** New cycles default to CSCF 2026; 2025 remains available in the Framework dropdown. */
function isSwiftCscf2026(f: AssessmentFramework): boolean {
  return f.version === "v2026" || f.schema_name === "swift_2026";
}

function isSwiftCscf2025(f: AssessmentFramework): boolean {
  return f.version === "v2025" || f.schema_name === "swift_2025";
}

function pickDefaultSwiftCscfFrameworkId(frameworksData: AssessmentFramework[]): string | null {
  const swift = frameworksData.filter((f) => f.code === "SWIFT_CSCF");
  if (swift.length === 0) return frameworksData[0]?.id ?? null;
  const v2026 = swift.find(isSwiftCscf2026);
  if (v2026) return v2026.id;
  const v2025 = swift.find(isSwiftCscf2025);
  return (v2025 ?? swift[0]).id;
}

export function NewAssessmentCycleForm({
  onSuccess,
  onCancel,
  showFooterCancel = true,
}: NewAssessmentCycleFormProps) {
  const { user } = useAuth();
  const [frameworks, setFrameworks] = useState<AssessmentFramework[]>([]);
  const [loadingFw, setLoadingFw] = useState(true);
  const [label, setLabel] = useState("");
  const [frameworkId, setFrameworkId] = useState<string | null>(null);
  const [complianceAssessment, setComplianceAssessment] = useState<"swift_cscf" | "pci_dss" | "iso">("swift_cscf");
  const [creating, setCreating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const canProceedWithCreate = complianceAssessment === "swift_cscf";
  const swiftFrameworks = useMemo(
    () =>
      [...frameworks.filter((f) => f.code === "SWIFT_CSCF")].sort((a, b) => {
        const rank = (f: AssessmentFramework) => (isSwiftCscf2026(f) ? 2 : isSwiftCscf2025(f) ? 1 : 0);
        return rank(b) - rank(a);
      }),
    [frameworks],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingFw(true);
    api
      .get<AssessmentFramework[]>("/ref/frameworks")
      .then((frameworksData) => {
        if (cancelled) return;
        setFrameworks(frameworksData);
        const defaultId = pickDefaultSwiftCscfFrameworkId(frameworksData);
        if (defaultId) {
          setFrameworkId((prev) => prev ?? defaultId);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingFw(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreate = async () => {
    if (!label.trim()) return;
    setCreating(true);
    try {
      const selectedFw = frameworks.find((f) => f.id === frameworkId);
      const cycleYear = selectedFw ? (selectedFw.version === "v2026" ? 2026 : 2025) : new Date().getFullYear();
      const body: {
        label: string;
        cycle_year: number;
        framework_id?: string;
        start_date?: string;
        end_date?: string;
      } = { label, cycle_year: cycleYear };
      if (frameworkId) body.framework_id = frameworkId;
      if (startDate) body.start_date = startDate;
      if (endDate) body.end_date = endDate;
      const cycle = await api.post<AssessmentCycle>("/assessments", body);
      onSuccess(cycle);
    } catch {
      // keep form open
    } finally {
      setCreating(false);
    }
  };

  if (loadingFw) {
    return (
      <p className="text-sm py-4" style={{ color: "var(--foreground-muted)" }}>
        Loading frameworks…
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground-muted)" }}>
          Label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. SWIFT CSCF 2025 Assessment"
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
          style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground-muted)" }}>
          Compliance assessment
        </label>
        <select
          value={complianceAssessment}
          onChange={(e) => setComplianceAssessment(e.target.value as "swift_cscf" | "pci_dss" | "iso")}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
          style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
          aria-describedby="compliance-assessment-hint"
        >
          <option value="swift_cscf">SWIFT CSCF</option>
          <option value="pci_dss" disabled>
            PCI DSS
          </option>
          <option value="iso" disabled>
            ISO
          </option>
        </select>
        <p id="compliance-assessment-hint" className="text-[11px] mt-1" style={{ color: "var(--foreground-muted)" }}>
          Only SWIFT CSCF is available for new cycles at this time.
        </p>
      </div>
      {complianceAssessment === "swift_cscf" && swiftFrameworks.length > 0 && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground-muted)" }}>
            Framework
          </label>
          <select
            value={frameworkId ?? ""}
            onChange={(e) => setFrameworkId(e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
          >
            {swiftFrameworks.map((f) => (
              <option key={f.id} value={f.id}>
                SWIFT CSCF {isSwiftCscf2026(f) ? "2026" : isSwiftCscf2025(f) ? "2025" : f.version.replace(/^v/, "")}
              </option>
            ))}
          </select>
          <p className="text-[11px] mt-1" style={{ color: "var(--foreground-muted)" }}>
            The cycle year is derived from the selected framework.
          </p>
        </div>
      )}
      <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
          Audit timeline
        </h3>
        <p className="text-[11px] mb-3" style={{ color: "var(--foreground-muted)" }}>
          Set audit window (used for notifications).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground-muted)" }}>
              Audit start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground-muted)" }}>
              Audit end date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !label.trim() || !canProceedWithCreate}
          className="flex-1 min-w-[8rem] py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {creating ? "Creating…" : "Create cycle"}
        </button>
        {showFooterCancel && onCancel && (
          <button
            type="button"
            onClick={() => {
              setComplianceAssessment("swift_cscf");
              onCancel();
            }}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

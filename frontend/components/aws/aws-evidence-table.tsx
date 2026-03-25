"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import type { AwsEvidenceRow, AwsRun } from "@/lib/aws-api";
import {
  awsButtonAccentOutlineClass,
  awsButtonPaginationClass,
  awsButtonPrimarySmClass,
  awsFieldClass,
} from "@/components/aws/aws-ui";

interface AwsEvidenceTableProps {
  data: AwsEvidenceRow[];
  runs?: AwsRun[];
  /** Opens Run Comparisor on the dashboard for this control (no inline modal). */
  onOpenRunComparisor: (row: AwsEvidenceRow) => void;
  /** When set, shows Fetch in the table card header (e.g. dashboard). */
  onFetchEvidence?: () => void;
  fetching?: boolean;
}

const ITEM_DESCRIPTION_MAP: Record<string, string> = {
  A1: "Network architecture evidence",
  A2: "IAM roles and policy evidence",
  A3: "Data flow and transmission evidence",
  A4: "Asset and inventory evidence",
  A6: "Internet access control evidence",
  A7: "Back-office data flow evidence",
  B1: "System hardening evidence",
  B2: "Network security evidence",
  B3: "Encryption configuration evidence",
  B4: "MFA and auth evidence",
  B7: "Admin activity monitoring evidence",
  B8: "Backup and recovery evidence",
  C1: "Logging and monitoring evidence",
  C2: "Privileged account evidence",
  C3: "User access evidence",
  C7: "Token and certificate evidence",
  C8: "Credential storage evidence",
  D2: "Patch level evidence",
  D4: "Vulnerability scan evidence",
  E1: "Malware protection evidence",
  E2: "Logging retention evidence",
};

function formatCollectedAt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatRunLabel(run: AwsRun | undefined, index: number): string {
  if (!run) return "—";
  return `Run ${index + 1}`;
}

function shortItemDescription(itemCode: string): string {
  return ITEM_DESCRIPTION_MAP[itemCode] ?? "Security evidence item";
}

/** Single letter A–H from item code, or "" if unknown / out of range. */
function domainLetterFromItemCode(itemCode: string): string {
  const letter = (itemCode || "").trim().charAt(0).toUpperCase();
  return /[A-H]/.test(letter) ? letter : "";
}

function domainFromItemCode(itemCode: string): string {
  const letter = domainLetterFromItemCode(itemCode);
  return letter ? `Domain ${letter}` : "Domain —";
}

const EVIDENCE_TABLE_COLUMNS = [
  { key: "domain", label: "Domain" },
  { key: "item_code", label: "Item", className: "font-medium" },
  { key: "control_id", label: "Control" },
  { key: "item_desc", label: "Item description" },
  { key: "source_system", label: "Source" },
  { key: "evidence_type", label: "Evidence type" },
  { key: "runLabel", label: "Run" },
  { key: "status", label: "Status" },
  { key: "collected_at", label: "Collected At" },
  { key: "actions", label: "", className: "text-right w-[7.5rem]" },
] as const;

type EvidenceColumnKey = (typeof EVIDENCE_TABLE_COLUMNS)[number]["key"];
type EvidenceColumnDef = (typeof EVIDENCE_TABLE_COLUMNS)[number];
const DEFAULT_EVIDENCE_COLUMN_ORDER: EvidenceColumnKey[] = EVIDENCE_TABLE_COLUMNS.map((c) => c.key);

export function AwsEvidenceTable({
  data,
  runs = [],
  onOpenRunComparisor,
  onFetchEvidence,
  fetching = false,
}: AwsEvidenceTableProps) {
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [runFilter, setRunFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"item_code" | "control_id" | "source_system" | "evidence_type" | "collected_at">("collected_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const rows = useMemo(() => {
    const runById = new Map(runs.map((r, i) => [r.run_id, { run: r, index: i }]));
    return data.map((e) => {
      const runInfo = e.run_id ? runById.get(e.run_id) : undefined;
      return {
        ...e,
        runLabel: runInfo ? formatRunLabel(runInfo.run, runInfo.index) : "—",
        runStatus: runInfo?.run?.status ?? "unknown",
      };
    });
  }, [data, runs]);

  const domainLetters = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const d = domainLetterFromItemCode(r.item_code);
      if (d) set.add(d);
    }
    return Array.from(set).sort();
  }, [rows]);

  const hasUnmappedDomainRows = useMemo(
    () => rows.some((r) => !domainLetterFromItemCode(r.item_code)),
    [rows]
  );

  const domainFilterEffective =
    domainFilter === "other" && !hasUnmappedDomainRows ? "all" : domainFilter;

  const sources = useMemo(() => Array.from(new Set(rows.map((r) => r.source_system))).sort(), [rows]);
  const types = useMemo(() => Array.from(new Set(rows.map((r) => r.evidence_type))).sort(), [rows]);
  const runLabels = useMemo(() => Array.from(new Set(rows.map((r) => r.runLabel))).filter((r) => r !== "—"), [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => {
      const queryOk =
        !q ||
        r.item_code.toLowerCase().includes(q) ||
        r.control_id.toLowerCase().includes(q) ||
        r.source_system.toLowerCase().includes(q) ||
        (r.evidence_type || "").toLowerCase().includes(q) ||
        r.runLabel.toLowerCase().includes(q);
      const letter = domainLetterFromItemCode(r.item_code);
      const domainOk =
        domainFilterEffective === "all" ||
        (domainFilterEffective === "other" ? !letter : letter === domainFilterEffective);
      const sourceOk = sourceFilter === "all" || r.source_system === sourceFilter;
      const typeOk = typeFilter === "all" || r.evidence_type === typeFilter;
      const runOk = runFilter === "all" || r.runLabel === runFilter;
      return queryOk && domainOk && sourceOk && typeOk && runOk;
    });

    out = out.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "collected_at") {
        const ad = a.collected_at ? new Date(a.collected_at).getTime() : 0;
        const bd = b.collected_at ? new Date(b.collected_at).getTime() : 0;
        return (ad - bd) * dir;
      }
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return out;
  }, [rows, query, domainFilterEffective, sourceFilter, typeFilter, runFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const [columnOrder, setColumnOrder] = useState<EvidenceColumnKey[]>(DEFAULT_EVIDENCE_COLUMN_ORDER);
  const [draggingColumn, setDraggingColumn] = useState<EvidenceColumnKey | null>(null);

  const orderedColumns = useMemo((): EvidenceColumnDef[] => {
    const byKey = new Map<EvidenceColumnKey, EvidenceColumnDef>(
      EVIDENCE_TABLE_COLUMNS.map((c) => [c.key, c])
    );
    return columnOrder.map((key) => byKey.get(key)).filter((c): c is EvidenceColumnDef => c !== undefined);
  }, [columnOrder]);

  const moveColumn = (from: EvidenceColumnKey, to: EvidenceColumnKey) => {
    if (from === to || from === "actions" || to === "actions") return;
    setColumnOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(from);
      const toIndex = next.indexOf(to);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, from);
      return next;
    });
  };

  const renderCell = (e: (typeof pagedRows)[number], key: EvidenceColumnKey) => {
    if (key === "domain") {
      return (
        <td key={key} className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
          <span className="rounded px-1.5 py-0.5 bg-[var(--muted)]">{domainFromItemCode(e.item_code)}</span>
        </td>
      );
    }
    if (key === "item_code") {
      return (
        <td key={key} className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
          {e.item_code}
        </td>
      );
    }
    if (key === "control_id") {
      return (
        <td key={key} className="px-4 py-3" style={{ color: "var(--foreground)" }}>
          {e.control_id}
        </td>
      );
    }
    if (key === "item_desc") {
      return (
        <td key={key} className="px-4 py-3 text-xs" style={{ color: "var(--foreground-muted)" }}>
          {shortItemDescription(e.item_code)}
        </td>
      );
    }
    if (key === "source_system") {
      return (
        <td key={key} className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>
          <span className="font-mono text-xs rounded px-1.5 py-0.5 bg-[var(--info-bg)] text-[var(--info)]">{e.source_system}</span>
        </td>
      );
    }
    if (key === "evidence_type") {
      return (
        <td key={key} className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>
          <span className="text-xs rounded px-1.5 py-0.5 bg-[var(--primary-muted)] text-[var(--primary)]">{e.evidence_type || "—"}</span>
        </td>
      );
    }
    if (key === "runLabel") {
      return (
        <td key={key} className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>
          <span className="text-xs">{e.runLabel}</span>
        </td>
      );
    }
    if (key === "status") {
      return (
        <td key={key} className="px-4 py-3">
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
              e.runStatus === "success"
                ? "bg-[var(--success)]/15 text-[var(--success)]"
                : e.runStatus === "partial"
                  ? "bg-amber-500/15 text-amber-600"
                  : e.runStatus === "failed"
                    ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                    : "bg-[var(--warning)]/15 text-[var(--warning)]"
            }`}
          >
            {e.runStatus || "unknown"}
          </span>
        </td>
      );
    }
    if (key === "collected_at") {
      return (
        <td key={key} className="px-4 py-3 text-xs" style={{ color: "var(--foreground-muted)" }}>
          {formatCollectedAt(e.collected_at)}
        </td>
      );
    }
    return (
      <td key={key} className="px-4 py-3 text-right">
        <button
          type="button"
          className={awsButtonAccentOutlineClass}
          onClick={() => onOpenRunComparisor(e)}
          title="Open Run Comparisor for this control on the dashboard"
        >
          Compare
        </button>
      </td>
    );
  };

  return (
    <div className="card rounded-xl overflow-hidden border flex flex-col min-h-0" style={{ borderColor: "var(--border)" }}>
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--muted)" }}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Evidence table
          </h2>
          <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
            {filteredRows.length} row{filteredRows.length !== 1 ? "s" : ""}
          </span>
        </div>
        {onFetchEvidence && (
          <button
            type="button"
            onClick={onFetchEvidence}
            disabled={fetching}
            className={`${awsButtonPrimarySmClass} shrink-0`}
          >
            {fetching ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-4 sm:w-4" />
                Collecting…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Fetch AWS evidence
              </>
            )}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border-b" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search item/control/source/type/run"
          className={`md:col-span-2 w-full min-w-0 ${awsFieldClass}`}
        />
        <select
          value={domainFilterEffective}
          onChange={(e) => { setDomainFilter(e.target.value); setPage(1); }}
          className={`w-full min-w-0 font-medium ${awsFieldClass}`}
          aria-label="Filter by domain"
        >
          <option value="all">All domains</option>
          {domainLetters.map((d) => (
            <option key={d} value={d}>{`Domain ${d}`}</option>
          ))}
          {hasUnmappedDomainRows ? <option value="other">Other / unmapped</option> : null}
        </select>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className={`w-full min-w-0 ${awsFieldClass}`}>
          <option value="all">All sources</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className={`w-full min-w-0 ${awsFieldClass}`}>
          <option value="all">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={runFilter} onChange={(e) => { setRunFilter(e.target.value); setPage(1); }} className={`w-full min-w-0 ${awsFieldClass}`}>
          <option value="all">All runs</option>
          {runLabels.map((label) => <option key={label} value={label}>{label}</option>)}
        </select>
      </div>
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10" style={{ background: "var(--muted)" }}>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              {orderedColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${col.key === "actions" ? "text-right" : ""} ${"className" in col ? col.className : ""} ${col.key !== "actions" ? "cursor-pointer select-none" : ""}`}
                  style={{ color: "var(--foreground-muted)" }}
                  draggable={col.key !== "actions"}
                  onDragStart={() => setDraggingColumn(col.key)}
                  onDragOver={(e) => {
                    if (col.key === "actions") return;
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!draggingColumn) return;
                    moveColumn(draggingColumn, col.key);
                    setDraggingColumn(null);
                  }}
                  onDragEnd={() => setDraggingColumn(null)}
                  onClick={() => {
                    if (col.key === "actions" || col.key === "runLabel") return;
                    const nextKey = col.key as typeof sortKey;
                    if (sortKey === nextKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
                    else {
                      setSortKey(nextKey);
                      setSortDir("asc");
                    }
                  }}
                >
                  {col.label}
                  {col.key !== "actions" && col.key !== "runLabel" && sortKey === col.key && (
                    <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((e) => (
              <tr
                key={e.evidence_id}
                className="border-b last:border-0 transition-colors hover:bg-[var(--muted)]/30"
                style={{ borderColor: "var(--border)" }}
              >
                {orderedColumns.map((col) => renderCell(e, col.key))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
        <span>Page {safePage} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={awsButtonPaginationClass}
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className={awsButtonPaginationClass}
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

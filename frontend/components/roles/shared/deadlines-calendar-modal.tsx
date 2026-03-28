"use client";

import type { UserRole } from "@/lib/types";
import { dashboardOutlineStyle } from "@/lib/dashboard-button-tokens";
import type { CalendarDeadlineMark } from "@/components/roles/shared/compliance-types";
import { addMonths, toDateKey, WEEKDAY_LABELS } from "@/components/roles/shared/utils";

export type DeadlinesCalendarCycleOption = {
  id: string;
  label: string;
  display_id: string;
  cycle_year: number;
};

type DeadlinesCalendarModalProps = {
  open: boolean;
  onClose: () => void;
  calendarMonth: Date;
  onCalendarMonthChange: (next: Date) => void;
  startOffset: number;
  daysInMonth: number;
  calendarMonthLabel: string;
  deadlineMap: Map<string, CalendarDeadlineMark[]>;
  /** Toolbar / nav button outline (role-colored). */
  buttonRole?: UserRole | null;
  /** When set with options + handler, shows active cycle switcher inside the modal. */
  activeCycleId?: string | null;
  cycleSelectOptions?: DeadlinesCalendarCycleOption[];
  onSelectCycle?: (cycleId: string | null) => void;
};

export function DeadlinesCalendarModal({
  open,
  onClose,
  calendarMonth,
  onCalendarMonthChange,
  startOffset,
  daysInMonth,
  calendarMonthLabel,
  deadlineMap,
  buttonRole,
  activeCycleId,
  cycleSelectOptions,
  onSelectCycle,
}: DeadlinesCalendarModalProps) {
  const outline = dashboardOutlineStyle(buttonRole ?? null);
  const showCycleSwitcher = Boolean(cycleSelectOptions?.length && onSelectCycle);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Deadlines calendar">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close calendar" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl rounded-2xl border p-4 sm:p-5 shadow-xl"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h4 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Deadlines Calendar
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="interactive-outline-btn dashboard-btn-pill inline-flex items-center justify-center border-2 bg-white text-sm font-semibold"
            style={{ borderColor: outline.border, color: outline.text }}
          >
            Close
          </button>
        </div>

        {showCycleSwitcher && (
          <div className="mb-4 flex flex-col gap-2 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                Active cycle
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                Switching updates the header and navigation context for this workspace.
              </p>
            </div>
            <select
              className="interactive-select min-h-[2.5rem] w-full max-w-md shrink-0 rounded-lg border px-2.5 py-2 text-sm sm:w-auto"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              value={activeCycleId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                onSelectCycle?.(v === "" ? null : v);
              }}
              aria-label="Select active assessment cycle"
            >
              <option value="">No active cycle</option>
              {cycleSelectOptions!.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_id} · {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onCalendarMonthChange(addMonths(calendarMonth, -1))}
            className="interactive-outline-btn dashboard-btn-pill inline-flex min-w-[4.5rem] items-center justify-center border-2 bg-white text-sm font-semibold"
            style={{ borderColor: outline.border, color: outline.text }}
          >
            Prev
          </button>
          <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {calendarMonthLabel}
          </div>
          <button
            type="button"
            onClick={() => onCalendarMonthChange(addMonths(calendarMonth, 1))}
            className="interactive-outline-btn dashboard-btn-pill inline-flex min-w-[4.5rem] items-center justify-center border-2 bg-white text-sm font-semibold"
            style={{ borderColor: outline.border, color: outline.text }}
          >
            Next
          </button>
        </div>

        <div
          className="grid grid-cols-7 gap-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--foreground-muted)" }}
        >
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="px-1 py-1 text-center">
              {w}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="h-16 rounded-md border"
              style={{ borderColor: "var(--border)", background: "var(--background)" }}
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
            const key = toDateKey(d);
            const rawMarks = deadlineMap.get(key) ?? [];
            const marks = activeCycleId
              ? rawMarks.filter((m) => m.cycleId === activeCycleId)
              : rawMarks;
            const hasDeadline = marks.length > 0;
            const today = toDateKey(new Date()) === key;
            return (
              <div
                key={key}
                className={`h-16 rounded-md border p-1.5 ${hasDeadline ? "ring-1 ring-amber-400" : ""}`}
                style={{
                  borderColor: "var(--border)",
                  background: hasDeadline
                    ? "color-mix(in srgb, var(--warning-bg) 40%, var(--surface) 60%)"
                    : "var(--background)",
                }}
                title={hasDeadline ? marks.map((m) => `${m.displayId} · ${m.label}`).join("\n") : undefined}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${today ? "text-blue-700" : ""}`}
                    style={!today ? { color: "var(--foreground)" } : undefined}
                  >
                    {day}
                  </span>
                  {hasDeadline && (
                    <span className="text-[10px] font-semibold rounded px-1 py-0.5 bg-amber-100 text-amber-700">
                      {marks.length}
                    </span>
                  )}
                </div>
                {hasDeadline && (
                  <div className="mt-1 truncate text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>
                    {marks[0].displayId}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

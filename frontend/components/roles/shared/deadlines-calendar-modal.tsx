"use client";

import type { CalendarDeadlineMark } from "@/components/roles/shared/compliance-types";
import { addMonths, toDateKey, WEEKDAY_LABELS } from "@/components/roles/shared/utils";

type DeadlinesCalendarModalProps = {
  open: boolean;
  onClose: () => void;
  calendarMonth: Date;
  onCalendarMonthChange: (next: Date) => void;
  startOffset: number;
  daysInMonth: number;
  calendarMonthLabel: string;
  deadlineMap: Map<string, CalendarDeadlineMark[]>;
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
}: DeadlinesCalendarModalProps) {
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
            className="interactive-outline-btn rounded-md border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Close
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onCalendarMonthChange(addMonths(calendarMonth, -1))}
            className="interactive-outline-btn rounded-md border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Prev
          </button>
          <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {calendarMonthLabel}
          </div>
          <button
            type="button"
            onClick={() => onCalendarMonthChange(addMonths(calendarMonth, 1))}
            className="interactive-outline-btn rounded-md border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
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
            const marks = deadlineMap.get(key) ?? [];
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

"use client";

export function ControlBadge({ id, ma }: { id: string; ma: string }) {
  const isMandatory = ma === "M" || ma === "M+A";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{
        background: isMandatory ? "#fef3c7" : "#e0f2fe",
        borderColor: isMandatory ? "#f59e0b" : "#7dd3fc",
        color: isMandatory ? "#92400e" : "#0369a1",
      }}
    >
      <span className="font-bold">{id}</span>
      <span className="opacity-60">{ma}</span>
    </span>
  );
}

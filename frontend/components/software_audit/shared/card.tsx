import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-indigo-100/90 bg-white/95 shadow-md shadow-indigo-950/5 ring-1 ring-white/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

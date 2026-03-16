"use client";

export function AwsDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero skeleton */}
      <div
        className="rounded-xl p-5"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)", opacity: 0.6 }}
      >
        <div className="h-6 w-48 rounded bg-white/20" />
        <div className="mt-2 h-4 w-full max-w-md rounded bg-white/15" />
        <div className="mt-4 flex gap-3">
          <div className="h-10 w-36 rounded-lg bg-white/30" />
          <div className="h-10 w-28 rounded-lg bg-white/20" />
        </div>
      </div>

      {/* KPI skeletons */}
      <div>
        <div className="h-4 w-24 rounded mb-3" style={{ background: "var(--muted)" }} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card rounded-xl p-4 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg" style={{ background: "var(--muted)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-7 w-12 rounded" style={{ background: "var(--muted)" }} />
                <div className="h-3 w-20 rounded" style={{ background: "var(--muted)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="h-4 w-28 rounded mb-3" style={{ background: "var(--muted)" }} />
          <div className="card rounded-xl p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 py-3 border-b first:pt-0 last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: "var(--muted)" }} />
                  <div className="h-4 flex-1 rounded" style={{ background: "var(--muted)" }} />
                  <div className="h-4 w-16 rounded shrink-0" style={{ background: "var(--muted)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="h-4 w-24 rounded mb-3" style={{ background: "var(--muted)" }} />
          <div className="space-y-3">
            <div className="card rounded-xl p-4 h-20" style={{ background: "var(--surface)" }} />
            <div className="card rounded-xl p-4 h-20" style={{ background: "var(--surface)" }} />
          </div>
        </div>
      </div>

      {/* Run history skeleton */}
      <div>
        <div className="flex justify-between mb-3">
          <div className="h-4 w-24 rounded" style={{ background: "var(--muted)" }} />
          <div className="h-5 w-14 rounded-full" style={{ background: "var(--muted)" }} />
        </div>
        <div className="card rounded-xl overflow-hidden">
          <div className="flex border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
            <div className="h-4 w-8 rounded" style={{ background: "var(--border)" }} />
            <div className="ml-4 h-4 w-14 rounded" style={{ background: "var(--border)" }} />
            <div className="ml-4 h-4 w-12 rounded" style={{ background: "var(--border)" }} />
            <div className="ml-4 h-4 w-16 rounded" style={{ background: "var(--border)" }} />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0" style={{ borderColor: "var(--border)" }}>
              <div className="h-4 w-4 rounded" style={{ background: "var(--muted)" }} />
              <div className="h-4 w-24 rounded" style={{ background: "var(--muted)" }} />
              <div className="h-4 w-14 rounded" style={{ background: "var(--muted)" }} />
              <div className="h-4 w-10 rounded" style={{ background: "var(--muted)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

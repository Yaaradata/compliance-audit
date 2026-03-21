/**
 * Shared interactive affordances for AWS section UI (focus ring, press feedback).
 */
export const awsInteractClass =
  "transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed";

/** Primary CTA — Fetch, Save, etc. */
export const awsButtonPrimaryClass = `${awsInteractClass} inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 hover:shadow-md`;

/** Secondary — Account, Back, bordered actions */
export const awsButtonSecondaryClass = `${awsInteractClass} inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)] hover:border-[var(--primary)]/25 hover:shadow`;

/** Compact primary — table toolbar */
export const awsButtonPrimarySmClass = `${awsInteractClass} inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 sm:px-4 sm:text-sm`;

/** Table row action — Compare */
export const awsButtonAccentOutlineClass = `${awsInteractClass} inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] shadow-sm hover:border-[var(--primary)]/60 hover:bg-[var(--primary)]/12`;

/** Pagination Prev / Next */
export const awsButtonPaginationClass = `${awsInteractClass} inline-flex min-w-[4rem] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)] hover:border-[var(--primary)]/20`;

/** Compact secondary — Retry, tertiary actions */
export const awsButtonSecondarySmClass = `${awsInteractClass} inline-flex min-h-[36px] items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)] hover:border-[var(--primary)]/25`;

/** Icon-only / chevron — expand rows, modal close */
export const awsIconButtonClass = `${awsInteractClass} inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]`;

/** Destructive text action — Delete run */
export const awsButtonDangerGhostClass = `${awsInteractClass} inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/10`;

/** Full-width accordion header (domain blocks, etc.) */
export const awsAccordionTriggerClass = `${awsInteractClass} w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors hover:brightness-[0.98] hover:ring-1 hover:ring-[var(--border)]`;

/** Inline row expand (feature groups in comparisor table) */
export const awsRowExpandButtonClass = `${awsInteractClass} flex w-full items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 -ml-1 text-left font-semibold hover:bg-[var(--muted)]/60`;

/** Filters: select & search inputs (no press-scale) */
export const awsFieldClass =
  "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/35 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 focus:border-[var(--primary)]/45";

/** Segmented control track (Evidence / Run Details, Metrics / Comparisor) */
export const awsSegmentShellClass =
  "inline-flex min-h-[42px] min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 p-1 shadow-inner sm:flex-initial sm:w-auto";

/** Inner segment button (add active styles via style prop or conditional classes in parent) */
export const awsSegmentButtonClass = `${awsInteractClass} inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold sm:flex-initial sm:px-4`;

/** Top nav pills (Connect / Dashboard / Evidence) */
export const awsNavShellClass =
  "flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-sm w-full max-w-fit";

export const awsNavLinkClass = `${awsInteractClass} rounded-lg px-5 py-2.5 text-sm font-semibold min-h-[42px] flex items-center justify-center`;

/** Metrics | Comparisor pill tablist (run history) */
export const awsPillTabListClass =
  "inline-flex h-11 w-full max-w-xl items-stretch rounded-full border border-[var(--border)]/60 bg-[var(--muted)]/90 p-1 shadow-inner sm:h-12";

export const awsPillTabButtonClass = `${awsInteractClass} flex min-w-0 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold sm:px-4 sm:text-sm`;

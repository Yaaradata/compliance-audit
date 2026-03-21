"use client";

/**
 * Standard AWS section page header: title, optional subtitle, and actions (links/buttons) on the right.
 * Use on every AWS page (Dashboard, Evidence, Controls) for a consistent look.
 */
export function AwsPageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <header
      className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 mb-5 w-full"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--foreground-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </header>
  );
}

export {
  awsInteractClass,
  awsButtonPrimaryClass,
  awsButtonSecondaryClass,
  awsButtonSecondarySmClass,
  awsButtonPrimarySmClass,
  awsButtonAccentOutlineClass,
  awsButtonPaginationClass,
  awsButtonDangerGhostClass,
  awsIconButtonClass,
  awsAccordionTriggerClass,
  awsRowExpandButtonClass,
  awsFieldClass,
  awsSegmentShellClass,
  awsSegmentButtonClass,
  awsNavShellClass,
  awsNavLinkClass,
  awsPillTabListClass,
  awsPillTabButtonClass,
} from "./aws-ui";

/**
 * Standard section heading for AWS pages (e.g. "Key metrics", "Recent runs").
 */
export function AwsSectionTitle({
  children,
  id,
  className = "mb-3",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={`text-sm font-semibold ${className}`} style={{ color: "var(--foreground)" }}>
      {children}
    </h2>
  );
}

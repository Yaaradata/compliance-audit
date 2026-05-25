"use client";

import type { ReactElement } from "react";
import {
  AutoChartBox,
  autoBtnPrimary,
  autoBtnSecondary,
  autoCallout,
  autoPage,
  autoPageTight,
  autoSegmentGroup,
  autoSegmentTabButtonProps,
  autoTable,
  autoTableShell,
  autoTd,
  autoTh,
  autoTrInteractive,
} from "../automotive/automotive-ui";

/** Vertical rhythm for full-page banking views (aligned with automotive). */
export const bankPage = autoPage;
export const bankPageTight = autoPageTight;
export const bankCallout = autoCallout;
export const bankSegmentGroup = autoSegmentGroup;
export const bankBtnPrimary = autoBtnPrimary;
export const bankBtnSecondary = autoBtnSecondary;

/** Active segment tabs — gradient pill (automotive). */
export const bankSegmentTabButtonProps = autoSegmentTabButtonProps;

/** @deprecated Use `bankSegmentTabButtonProps` for className + style. */
export function bankSegmentTabClass(active: boolean): string {
  return bankSegmentTabButtonProps(active).className;
}

export const bankBackButton =
  "inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2";

export function BankChartBox({ heightClass, children }: { heightClass?: string; children: ReactElement }) {
  return <AutoChartBox heightClass={heightClass}>{children}</AutoChartBox>;
}

export const bankTableShell = autoTableShell;
export const bankTable = autoTable;
export const bankTh = autoTh;
export const bankTd = autoTd;
export const bankTrInteractive = autoTrInteractive;

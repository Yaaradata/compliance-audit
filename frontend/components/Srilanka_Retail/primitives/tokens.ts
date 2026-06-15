/**
 * Keystone visual tokens — palette discipline + tabular numerals.
 * Colours resolve via CSS variables (see keystone-theme.css).
 */
import type { PostureStatus, SourceTag } from "@/lib/Srilanka_Retail/types";

export const NUM = "font-[family-name:var(--font-keystone-mono)] tabular-nums";

export const SOURCE_DOT: Record<SourceTag, string> = {
  SOURCED: "var(--ks-green)",
  ASSUMPTION: "var(--ks-faint)",
  ILLUSTRATIVE: "var(--ks-amber)",
  OPEN: "#6b7280",
};

export const SOURCE_LABEL: Record<SourceTag, string> = {
  SOURCED: "SOURCED",
  ASSUMPTION: "ASSUMPTION",
  ILLUSTRATIVE: "ILLUSTRATIVE",
  OPEN: "OPEN",
};

export const POSTURE_STYLE: Record<
  PostureStatus,
  { icon: "ok" | "attention" | "breach"; label: string }
> = {
  OK: { icon: "ok", label: "OK" },
  ATTENTION: { icon: "attention", label: "ATTENTION" },
  BREACH: { icon: "breach", label: "BREACH" },
};

/** Format liveSource keys from seed for display (ERP_SAP → ERP / SAP). */
export function formatLiveSource(src: string): string {
  return src.replace(/_/g, " / ");
}

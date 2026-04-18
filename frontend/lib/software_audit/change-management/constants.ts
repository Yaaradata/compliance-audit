/**
 * Change Management & Release Controls — constants, style tokens and formatters.
 *
 * Mirrors the self-contained reference dashboard; all thresholds are driven from
 * collector-data.json so the demo stays in one place.
 */
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CircleDot,
  ClipboardCheck,
  Users,
  TestTube2,
  Snowflake,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import RAW from "./collector-data.json";

export const STATUS = {
  MET: "Met",
  NOT_MET: "Not Met",
  REVIEW: "Requires Review",
  NA: "N/A",
} as const;
export type StatusValue = (typeof STATUS)[keyof typeof STATUS];

export type ControlFamilyId =
  | "approval"
  | "sod"
  | "testing"
  | "freeze"
  | "rollback";

export type ControlFamily = {
  id: ControlFamilyId;
  label: string;
  short: string;
  icon: LucideIcon;
};

export const CONTROL_FAMILIES: ControlFamily[] = [
  { id: "approval", label: "Change Approval Workflow", short: "Approval", icon: ClipboardCheck },
  { id: "sod", label: "Developer-to-Production Segregation", short: "SoD", icon: Users },
  { id: "testing", label: "Pre-deployment Testing", short: "Testing", icon: TestTube2 },
  { id: "freeze", label: "Change Freeze Adherence", short: "Freeze", icon: Snowflake },
  { id: "rollback", label: "Rollback Capability", short: "Rollback", icon: Undo2 },
];

export const NOW = new Date(RAW._metadata.generated_at);
export const EMERGENCY_CAB_HOURS =
  RAW._metadata.thresholds.emergency_cab_post_hoc_window_hours;
export const REQUIRED_GATES = RAW._metadata.thresholds
  .required_testing_gates as readonly string[];

/* ---------------------------------------------------------------------------
 * Formatting helpers
 * ------------------------------------------------------------------------ */
export const hoursBetween = (a: string, b: string): number =>
  (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;

export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }) + " UTC"
  );
};

export const fmtDateShort = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const prettyUser = (u: string | null | undefined): string =>
  u
    ? u
        .split(".")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
    : "—";

/* ---------------------------------------------------------------------------
 * Style tokens — Met / Not Met / Requires Review
 * ------------------------------------------------------------------------ */
export type StatusStyle = {
  bg: string;
  text: string;
  border: string;
  dot: string;
  solid: string;
  soft: string;
  icon: LucideIcon;
  label: string;
};

export const STATUS_STYLES: Record<StatusValue, StatusStyle> = {
  [STATUS.MET]: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    solid: "bg-emerald-600",
    soft: "bg-emerald-100",
    icon: CheckCircle2,
    label: "Met",
  },
  [STATUS.NOT_MET]: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    solid: "bg-red-600",
    soft: "bg-red-100",
    icon: XCircle,
    label: "Not Met",
  },
  [STATUS.REVIEW]: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    solid: "bg-amber-600",
    soft: "bg-amber-100",
    icon: AlertTriangle,
    label: "Requires Review",
  },
  [STATUS.NA]: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
    solid: "bg-slate-500",
    soft: "bg-slate-100",
    icon: CircleDot,
    label: "N/A",
  },
};

export type SeverityValue =
  | "Critical"
  | "High"
  | "Medium"
  | "Low"
  | "Informational";

export const SEVERITY_STYLES: Record<
  SeverityValue,
  { bg: string; text: string; border: string }
> = {
  Critical: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  High: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Low: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
  Informational: {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

export const RAW_DATA = RAW;

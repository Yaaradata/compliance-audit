import type { LucideIcon } from "lucide-react";
import { FileText, FolderCheck, Gauge, LayoutGrid, Receipt, Truck } from "lucide-react";
import type { V5ScreenId } from "@/lib/Srilanka_Retail/v5/types";

export type V5NavItem = [V5ScreenId, string, LucideIcon];

export const V5_NAV: V5NavItem[] = [
  ["C1", "Four-Way Reconciliation", Receipt],
  ["C2", "Quality Gate + ABV", Gauge],
  ["C3", "Dispatch + Receivables", Truck],
  ["C4", "Evidence Packs", FolderCheck],
  ["C5", "Risk Matrix + Exceptions", LayoutGrid],
  ["C6", "Board Report", FileText],
];

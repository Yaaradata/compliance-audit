import type { JSX } from "react";
import {
  Receipt,
  Gauge,
  Truck,
  FolderCheck,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { C1Screen } from "../screens/C1Screen";
import { C2Screen } from "../screens/C2Screen";
import { C3Screen } from "../screens/C3Screen";
import { C4Screen } from "../screens/C4Screen";
import { C5Screen } from "../screens/C5Screen";

export type KeystoneScreenId = "C1" | "C2" | "C3" | "C4" | "C5";

export interface KeystoneNavItem {
  id: KeystoneScreenId;
  /** Exact label from the reference JSX NAV array */
  label: string;
  icon: LucideIcon;
}

/** Locked demo sequence — terminology matches the reference JSX exactly. */
export const KEYSTONE_NAV: KeystoneNavItem[] = [
  { id: "C1", label: "Four-Way Reconciliation", icon: Receipt },
  { id: "C2", label: "Quality Gate + ABV", icon: Gauge },
  { id: "C3", label: "Dispatch Licence", icon: Truck },
  { id: "C4", label: "Evidence Packs", icon: FolderCheck },
  { id: "C5", label: "Live Posture", icon: LayoutGrid },
];

export const KEYSTONE_SCREENS: Record<KeystoneScreenId, () => JSX.Element> = {
  C1: C1Screen,
  C2: C2Screen,
  C3: C3Screen,
  C4: C4Screen,
  C5: C5Screen,
};

export function getNavItem(id: KeystoneScreenId): KeystoneNavItem {
  const item = KEYSTONE_NAV.find((n) => n.id === id);
  if (!item) throw new Error(`Unknown screen: ${id}`);
  return item;
}

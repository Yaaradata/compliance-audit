"use client";

import type { KeystoneNavItem, KeystoneScreenId } from "./config";

interface KeystoneNavProps {
  active: KeystoneScreenId;
  rippled: boolean;
  onSelect: (id: KeystoneScreenId) => void;
  items: KeystoneNavItem[];
}

/** Horizontal screen switcher — full-width, no sidebar. */
export function KeystoneNav({ active, rippled, onSelect, items }: KeystoneNavProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b pb-px"
      style={{ borderColor: "var(--ks-border)" }}
      aria-label="Keystone demo screens"
    >
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        const showRipple = rippled && (id === "C4" || id === "C5");
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="relative flex shrink-0 items-center gap-2 rounded-t-md px-4 py-2.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
            style={{
              background: isActive ? "var(--ks-panel)" : "transparent",
              color: isActive ? "var(--ks-text)" : "var(--ks-dim)",
              borderBottom: isActive ? "2px solid var(--ks-accent)" : "2px solid transparent",
            }}
          >
            <span
              className="tabular-nums text-[10px] font-semibold"
              style={{ color: isActive ? "var(--ks-accent)" : "var(--ks-faint)" }}
            >
              {id}
            </span>
            <Icon size={14} style={{ color: isActive ? "var(--ks-accent)" : "var(--ks-faint)" }} />
            <span className="whitespace-nowrap">{label}</span>
            {showRipple ? (
              <span
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--ks-green)" }}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

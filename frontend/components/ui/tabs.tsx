"use client";

import { createContext, useContext, useState, useId } from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onChange: (v: string) => void;
  id: string;
  accentColor?: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within Tabs");
  return ctx;
}

export function Tabs({
  value,
  defaultValue,
  onChange,
  children,
  className,
  accentColor,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const id = useId().replace(/:/g, "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const handleChange = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value: current, onChange: handleChange, id, accentColor }}>
      <div className={cn("flex flex-col min-h-0", className)} role="tablist" aria-label="Workspace sections">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-1 rounded-xl border p-1 bg-[var(--surface)] border-[var(--border)]",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: current, onChange, id, accentColor } = useTabs();
  const active = current === value;
  const hasAccent = accentColor && active;
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${id}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      onClick={() => onChange(value)}
      className={cn(
        "px-4 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "hover:opacity-90 active:scale-[0.98]",
        hasAccent
          ? "text-white shadow-md"
          : active
            ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm focus-visible:ring-[var(--primary)]"
            : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50 focus-visible:ring-[var(--primary)]",
        className
      )}
      style={hasAccent ? { backgroundColor: accentColor } : undefined}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: current, id } = useTabs();
  if (current !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      aria-labelledby={`${id}-tab-${value}`}
      className={cn("flex-1 min-h-0 overflow-y-auto transition-opacity duration-150", className)}
    >
      {children}
    </div>
  );
}

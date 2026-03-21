"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";

/**
 * Layout: Left = fixed sidebar (YaaraLabs nav). Right = content area:
 *   Top row = header (full width of content area). Below = dashboard content.
 * Header and content use the same horizontal padding for grid alignment.
 * On small screens, sidebar overlays content and can be toggled from header.
 */
const CONTENT_PX = "px-2 sm:px-4";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { open, toggle } = useSidebar();
  const pathname = usePathname();
  const { user, activeCycleId, effectiveCycleRole } = useAuth();
  const effectiveRole =
    activeCycleId && effectiveCycleRole !== undefined
      ? effectiveCycleRole ?? user?.role
      : user?.role;
  const isCycleRoute = pathname?.startsWith("/cycles/");
  const showSidebar = Boolean(activeCycleId || isCycleRoute || effectiveRole === "compliance_officer");

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Mobile backdrop when sidebar open */}
      {showSidebar && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={toggle}
          onKeyDown={(e) => e.key === "Escape" && toggle()}
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />
      )}
      {showSidebar && <AppSidebar />}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden min-h-0 transition-[margin] duration-200 ease-out ${
          showSidebar ? (open ? "md:ml-[260px]" : "md:ml-[56px]") : "md:ml-0"
        }`}
      >
        <header className={`shrink-0 border-b border-(--border) bg-(--surface) ${CONTENT_PX}`}>
          <AppHeader />
        </header>
        <main className={`flex-1 overflow-y-auto overflow-x-hidden min-h-0 ${CONTENT_PX} pt-2 pb-4 sm:pt-3 sm:pb-6`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}

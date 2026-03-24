"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

/**
 * Layout: Left = fixed sidebar (YaaraLabs nav). Right = content area:
 *   Top row = header (full width of content area). Below = dashboard content.
 * Header and content use the same horizontal padding for grid alignment.
 * On small screens, sidebar overlays content and can be toggled from header.
 */
const CONTENT_PX = "px-2 sm:px-4";

function AppShellInner({
  children,
  showSidebar,
}: {
  children: React.ReactNode;
  showSidebar: boolean;
}) {
  const { open, toggle } = useSidebar();
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
          showSidebar ? (open ? "md:ml-[260px]" : "md:ml-[56px]") : ""
        }`}
      >
        <header className={`shrink-0 border-b border-(--border) bg-(--surface) ${CONTENT_PX}`}>
          <AppHeader showSidebarToggle={showSidebar} />
        </header>
        <main className={`flex-1 overflow-y-auto overflow-x-hidden min-h-0 ${CONTENT_PX} py-4 sm:py-6`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  showSidebar = true,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  return (
    <SidebarProvider>
      <AppShellInner showSidebar={showSidebar}>{children}</AppShellInner>
    </SidebarProvider>
  );
}

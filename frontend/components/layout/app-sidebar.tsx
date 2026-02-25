"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { getDomainsForArchitecture } from "@/lib/data/domains";
import { useCycleIdFromPath } from "@/lib/hooks/use-cycle-id";
import { NAV_BY_ROLE } from "@/lib/data/roles";

export function AppSidebar() {
  const pathname = usePathname();
  const cycleId = useCycleIdFromPath() ?? useAuth().activeCycleId;
  const { user, selectedArchitectureId } = useAuth();
  const role = user?.role ?? "compliance_officer";
  const navItems = NAV_BY_ROLE[role].filter((item) => item.href.startsWith("/dashboard") || item.href.startsWith("/evidence") || item.href.startsWith("/review") || item.href.startsWith("/approval") || item.href.startsWith("/report"));
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const domains = getDomainsForArchitecture(arch?.domainIds);

  const base = cycleId ? `/cycles/${cycleId}` : "";
  const navHref = (item: { href: string }) => {
    if (!base) return item.href;
    if (item.href === "/dashboard") return `${base}/dashboard`;
    if (item.href.startsWith("/evidence")) return item.href.replace("/evidence", `${base}/evidence`);
    if (item.href.startsWith("/review")) return `${base}/review`;
    if (item.href.startsWith("/approval")) return `${base}/approval`;
    if (item.href.startsWith("/report")) return `${base}/report`;
    if (item.href.startsWith("/evidence-model")) return `${base}/evidence-model`;
    return item.href;
  };

  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
      <nav className="p-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const href = navHref(item);
          const active = href === "/dashboard" ? pathname === "/dashboard" || pathname?.endsWith("/dashboard") : pathname?.startsWith(href);
          return (
            <Link key={item.href} href={href || item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? "bg-blue-50 text-blue-800 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>
      {domains.length > 0 && cycleId && (
        <>
          <div className="px-3 pt-2 pb-1">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">Domains</div>
          </div>
          <nav className="px-3 pb-3 flex flex-col gap-0.5">
            {domains.map((d) => {
              const href = `/cycles/${cycleId}/domains/${d.id}`;
              const active = pathname?.includes(`/domains/${d.id}`);
              return (
                <Link key={d.id} href={href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${active ? "font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                  style={active ? { background: `${d.color}10`, color: d.color } : {}}>
                  <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0" style={{ background: d.accent, color: d.color }}>{d.id}</span>
                  <span className="truncate">{d.name}</span>
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </aside>
  );
}

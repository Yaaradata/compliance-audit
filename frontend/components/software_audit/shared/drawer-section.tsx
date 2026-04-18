import type { ReactNode } from "react";

export default function DrawerSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-600">
          {icon}
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

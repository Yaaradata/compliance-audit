"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/layout/app-header";
import { PasswordInput } from "@/components/ui/password-input";

interface ApiTenant {
  id: string;
  name: string;
  slug: string;
  bic_code: string | null;
  architecture: string | null;
  subscription: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isPlatformAdmin, logout, addTenant, addTenantUser } = useAuth();
  const [tenants, setTenants] = useState<ApiTenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [details, setDetails] = useState("");
  const [initialUsers, setInitialUsers] = useState<{ email: string; name: string; password: string; role: string }[]>([
    { email: "", name: "", password: "", role: "compliance_officer" },
  ]);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [tenantUsers, setTenantUsers] = useState<Record<string, { email: string; name: string; password: string; role: string }[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [addUserSubmitting, setAddUserSubmitting] = useState<string | null>(null);

  const TENANT_ROLES = [
    { value: "compliance_officer", label: "Compliance Officer" },
    { value: "tenant_admin", label: "Tenant Admin" },
    { value: "it_sme", label: "IT SME" },
    { value: "internal_reviewer_l1", label: "Internal Reviewer (L1)" },
    { value: "internal_reviewer_l2", label: "Internal Reviewer (L2)" },
    { value: "external_assessor", label: "Approver" },
  ] as const;

  useEffect(() => {
    if (user && !isPlatformAdmin) router.replace("/dashboard");
    if (!user) router.replace("/login");
  }, [user, isPlatformAdmin, router]);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    setLoadingTenants(true);
    api.get<ApiTenant[]>("/tenants")
      .then(setTenants)
      .catch(() => setTenants([]))
      .finally(() => setLoadingTenants(false));
  }, [isPlatformAdmin]);

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    const usersToSend = initialUsers.filter((u) => u.email.trim() && u.password.length >= 8);
    setSubmitting(true);
    try {
      const tenant = await addTenant({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
        details: details.trim() || "",
        initialUsers: usersToSend.length ? usersToSend : undefined,
      });
      setTenants((prev) => [tenant as unknown as ApiTenant, ...prev]);
      setName("");
      setSlug("");
      setDetails("");
      setInitialUsers([{ email: "", name: "", password: "", role: "compliance_officer" }]);
    } catch (err) {
      console.error("Failed to create tenant", err);
    } finally {
      setSubmitting(false);
    }
  };

  const addInitialUserRow = () => setInitialUsers((prev) => [...prev, { email: "", name: "", password: "", role: "compliance_officer" }]);
  const updateInitialUser = (i: number, field: "email" | "name" | "password" | "role", value: string) => {
    setInitialUsers((prev) => prev.map((u, j) => (j === i ? { ...u, [field]: value } : u)));
  };
  const removeInitialUserRow = (i: number) => setInitialUsers((prev) => prev.filter((_, j) => j !== i));

  const handleAddUserToTenant = async (tenantId: string) => {
    const list = tenantUsers[tenantId] ?? [];
    const idx = list.findIndex((x) => x.email.trim() && x.password.length >= 8);
    if (idx < 0) return;
    const u = list[idx];
    setAddUserSubmitting(tenantId);
    try {
      await addTenantUser(tenantId, u);
      setTenantUsers((prev) => ({
        ...prev,
        [tenantId]: (prev[tenantId] ?? []).filter((_, i) => i !== idx),
      }));
    } catch (err) {
      console.error("Failed to add user", err);
    } finally {
      setAddUserSubmitting(null);
    }
  };
  const addTenantUserRow = (tid: string) =>
    setTenantUsers((prev) => ({
      ...prev,
      [tid]: [...(prev[tid] ?? []), { email: "", name: "", password: "", role: "compliance_officer" }],
    }));
  const updateTenantUser = (tid: string, i: number, field: "email" | "name" | "password" | "role", value: string) =>
    setTenantUsers((prev) => {
      const list = prev[tid] ?? [];
      const next = [...list];
      next[i] = { ...next[i], [field]: value };
      return { ...prev, [tid]: next };
    });
  const removeTenantUserRow = (tid: string, i: number) =>
    setTenantUsers((prev) => ({
      ...prev,
      [tid]: (prev[tid] ?? []).filter((_, j) => j !== i),
    }));

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <AppHeader />
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-52 flex flex-col shrink-0 p-3 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <nav className="flex flex-col gap-0.5">
            <Link href="/admin" className="nav-item flex items-center gap-2 px-3 py-2 text-xs font-semibold nav-item-active">Bank Onboarding</Link>
            <Link href="/dashboard" className="nav-item flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--foreground-muted)" }}>Dashboard</Link>
          </nav>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors" style={{ color: "var(--foreground-muted)" }}>Log out</button>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold mb-6" style={{ color: "var(--foreground)" }}>Bank onboarding</h1>

            <form onSubmit={handleAddTenant} className="card rounded-xl p-6 mb-8">
              <h2 className="font-semibold text-slate-900 mb-4">Onboard a new bank (tenant)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bank / tenant name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Bank" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug (identifier)</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme-bank" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                  <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Optional notes..." rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">Initial users (email, name, password, role — access given by platform admin)</label>
                    <button type="button" onClick={addInitialUserRow} className="text-xs font-medium text-blue-600 hover:underline">+ Add user</button>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Add at least one user with a password and role (e.g. Compliance Officer). They will log in with these credentials; platform admin does not log in as Compliance Officer.</p>
                  {initialUsers.map((u, i) => (
                    <div key={i} className="flex flex-wrap gap-2 mb-2 items-center">
                      <input type="text" value={u.name} onChange={(e) => updateInitialUser(i, "name", e.target.value)} placeholder="Name" className="w-28 rounded border border-slate-300 px-2 py-1.5 text-sm" />
                      <input type="email" value={u.email} onChange={(e) => updateInitialUser(i, "email", e.target.value)} placeholder="Email" className="w-40 rounded border border-slate-300 px-2 py-1.5 text-sm" />
                      <PasswordInput
                        value={u.password}
                        onChange={(e) => updateInitialUser(i, "password", e.target.value)}
                        placeholder="Password (min 8)"
                        containerClassName="w-32"
                        className="py-1.5 px-2 text-sm"
                      />
                      <select value={u.role} onChange={(e) => updateInitialUser(i, "role", e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
                        {TENANT_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeInitialUserRow(i)} className="text-slate-400 hover:text-red-600 px-2">×</button>
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 disabled:opacity-50">
                  {submitting ? "Creating…" : "Onboard bank"}
                </button>
              </div>
            </form>

            <div className="card rounded-xl overflow-hidden">
              <h2 className="font-semibold p-4 border-b" style={{ color: "var(--foreground)", borderColor: "var(--border)" }}>Tenants</h2>
              {loadingTenants ? (
                <p className="p-4 text-sm text-slate-400">Loading tenants…</p>
              ) : tenants.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No tenants yet. Onboard a bank above.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {tenants.map((t) => (
                    <li key={t.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-slate-900">{t.name}</span>
                          <span className="text-slate-500 text-sm ml-2">({t.slug})</span>
                          {!t.is_active && <span className="ml-2 text-xs text-red-500 font-medium">Inactive</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedTenant(expandedTenant === t.id ? null : t.id)}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {expandedTenant === t.id ? "Collapse" : "Add user"}
                        </button>
                      </div>
                      {t.bic_code && <p className="text-xs text-slate-500 mt-0.5">BIC: {t.bic_code}</p>}
                      <p className="text-xs text-slate-500 mt-0.5">Subscription: {t.subscription} · Created: {new Date(t.created_at).toLocaleDateString()}</p>
                      {expandedTenant === t.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">Add user to this tenant (email, name, password, role)</span>
                            <button
                              type="button"
                              onClick={() => addTenantUserRow(t.id)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              + Add row
                            </button>
                          </div>
                          {(tenantUsers[t.id] ?? []).length === 0 ? (
                            <p className="text-xs text-slate-400 mb-2">Click + Add row, then fill email, name, password (min 8), and role. Then click Add user.</p>
                          ) : null}
                          {(tenantUsers[t.id] ?? []).map((u, i) => (
                            <div key={i} className="flex flex-wrap gap-2 mb-2 items-center">
                              <input type="text" value={u.name} onChange={(e) => updateTenantUser(t.id, i, "name", e.target.value)} placeholder="Name" className="w-28 rounded border border-slate-300 px-2 py-1.5 text-sm" />
                              <input type="email" value={u.email} onChange={(e) => updateTenantUser(t.id, i, "email", e.target.value)} placeholder="Email" className="w-40 rounded border border-slate-300 px-2 py-1.5 text-sm" />
                              <PasswordInput
                                value={u.password}
                                onChange={(e) => updateTenantUser(t.id, i, "password", e.target.value)}
                                placeholder="Password (min 8)"
                                containerClassName="w-32"
                                className="py-1.5 px-2 text-sm"
                              />
                              <select value={u.role} onChange={(e) => updateTenantUser(t.id, i, "role", e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
                                {TENANT_ROLES.map((r) => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                              <button type="button" onClick={() => removeTenantUserRow(t.id, i)} className="text-slate-400 hover:text-red-600 px-2">×</button>
                            </div>
                          ))}
                          {(tenantUsers[t.id] ?? []).some((u) => u.email.trim() && u.password.length >= 8) && (
                            <button
                              type="button"
                              onClick={() => handleAddUserToTenant(t.id)}
                              disabled={addUserSubmitting === t.id}
                              className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-[#0c2340] rounded-lg hover:bg-[#0f2d52] disabled:opacity-50"
                            >
                              {addUserSubmitting === t.id ? "Adding…" : "Add user"}
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
      <footer className="px-5 py-2.5 text-center text-[10px] text-gray-400 border-t border-gray-200 bg-white">
        YaaraLabs SWIFT Compliance Platform · Admin
      </footer>
    </div>
  );
}

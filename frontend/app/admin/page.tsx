"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AppHeader } from "@/components/layout/app-header";

export default function AdminPage() {
  const router = useRouter();
  const { user, isPlatformAdmin, logout, tenants, addTenant, updateTenantAdmins } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [details, setDetails] = useState("");
  const [bankAdmins, setBankAdmins] = useState<{ email: string; name: string }[]>([{ email: "", name: "" }]);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [tenantAdmins, setTenantAdmins] = useState<Record<string, { email: string; name: string }[]>>({});

  useEffect(() => {
    if (user && !isPlatformAdmin) router.replace("/dashboard");
    if (!user) router.replace("/login");
  }, [user, isPlatformAdmin, router]);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTenant({
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
      details: details.trim(),
      bankAdmins: bankAdmins.filter((a) => a.email.trim()),
    });
    setName("");
    setSlug("");
    setDetails("");
    setBankAdmins([{ email: "", name: "" }]);
  };

  const addBankAdminRow = () => setBankAdmins((prev) => [...prev, { email: "", name: "" }]);
  const updateBankAdmin = (i: number, field: "email" | "name", value: string) => {
    setBankAdmins((prev) => prev.map((a, j) => (j === i ? { ...a, [field]: value } : a)));
  };
  const removeBankAdminRow = (i: number) => setBankAdmins((prev) => prev.filter((_, j) => j !== i));

  const saveTenantAdmins = (tenantId: string) => {
    const admins = tenantAdmins[tenantId];
    if (admins) updateTenantAdmins(tenantId, admins.filter((a) => a.email.trim()));
    setExpandedTenant(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AppHeader />
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 p-3">
          <nav className="flex flex-col gap-0.5">
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800">🏦 Bank Onboarding</Link>
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50">📊 Dashboard</Link>
          </nav>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg">Log out</button>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold text-slate-900 mb-6">Bank onboarding</h1>

            <form onSubmit={handleAddTenant} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
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
                    <label className="block text-sm font-medium text-slate-700">Bank admins (access for this tenant)</label>
                    <button type="button" onClick={addBankAdminRow} className="text-xs font-medium text-blue-600 hover:underline">+ Add</button>
                  </div>
                  {bankAdmins.map((a, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={a.name} onChange={(e) => updateBankAdmin(i, "name", e.target.value)} placeholder="Name" className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm" />
                      <input type="email" value={a.email} onChange={(e) => updateBankAdmin(i, "email", e.target.value)} placeholder="Email" className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm" />
                      <button type="button" onClick={() => removeBankAdminRow(i)} className="text-slate-400 hover:text-red-600 px-2">×</button>
                    </div>
                  ))}
                </div>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-[#0c2340] rounded-lg hover:bg-[#0f2d52]">Onboard bank</button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <h2 className="font-semibold text-slate-900 p-4 border-b border-slate-200">Tenants</h2>
              {tenants.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No tenants yet. Onboard a bank above.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {tenants.map((t) => (
                    <li key={t.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-slate-900">{t.name}</span>
                          <span className="text-slate-500 text-sm ml-2">({t.slug})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedTenant(expandedTenant === t.id ? null : t.id)}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {expandedTenant === t.id ? "Collapse" : "Manage admins"}
                        </button>
                      </div>
                      {t.details && <p className="text-sm text-slate-600 mt-1">{t.details}</p>}
                      <p className="text-xs text-slate-500 mt-1">Bank admins: {t.bankAdmins.length}</p>
                      {expandedTenant === t.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">Bank admins</span>
                            <button
                              type="button"
                              onClick={() => setTenantAdmins((prev) => ({
                                ...prev,
                                [t.id]: [...(prev[t.id] ?? t.bankAdmins.map((a) => ({ email: a.email, name: a.name }))), { email: "", name: "" }],
                              }))}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              + Add
                            </button>
                          </div>
                          {(tenantAdmins[t.id] ?? t.bankAdmins.map((a) => ({ email: a.email, name: a.name }))).map((a, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={a.name}
                                onChange={(e) => setTenantAdmins((prev) => {
                                  const list = prev[t.id] ?? t.bankAdmins.map((x) => ({ email: x.email, name: x.name }));
                                  const next = [...list];
                                  next[i] = { ...next[i], name: e.target.value };
                                  return { ...prev, [t.id]: next };
                                })}
                                placeholder="Name"
                                className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
                              />
                              <input
                                type="email"
                                value={a.email}
                                onChange={(e) => setTenantAdmins((prev) => {
                                  const list = prev[t.id] ?? t.bankAdmins.map((x) => ({ email: x.email, name: x.name }));
                                  const next = [...list];
                                  next[i] = { ...next[i], email: e.target.value };
                                  return { ...prev, [t.id]: next };
                                })}
                                placeholder="Email"
                                className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
                              />
                            </div>
                          ))}
                          <button type="button" onClick={() => saveTenantAdmins(t.id)} className="mt-2 text-sm font-medium text-blue-600 hover:underline">Save admins</button>
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

"use client";

import Link from "next/link";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">YaaraLabs</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">SWIFT Compliance Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/login?signup=1" className="text-sm font-semibold text-white bg-[#0c2340] hover:bg-[#0f2d52] px-4 py-2 rounded-lg transition-colors">Sign up</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-16">
        <section className="text-center mb-20">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            SWIFT CSCF Compliance & Evidence Management
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Assess and evidence your SWIFT Customer Security Control Framework (CSCF) posture. Choose your architecture, collect evidence by domain, and drive approvals—all in one platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login?signup=1" className="inline-flex items-center gap-2 font-semibold text-white bg-[#0c2340] hover:bg-[#0f2d52] px-6 py-3 rounded-lg transition-colors">Get started</Link>
            <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-lg transition-colors">Log in</Link>
            <Link href="/demo" className="inline-flex items-center gap-2 font-semibold text-slate-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-6 py-3 rounded-lg transition-colors">View demo</Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-2xl mb-3">🏗️</div>
            <h2 className="font-semibold text-slate-900 mb-2">Architecture-based</h2>
            <p className="text-sm text-slate-600">Select your SWIFT architecture (Full CSP, Essential, or Lite). Evidence collection and domains adapt to your scope.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-2xl mb-3">👥</div>
            <h2 className="font-semibold text-slate-900 mb-2">Role-based access</h2>
            <p className="text-sm text-slate-600">Platform admin, compliance officer, evidence collection, reviewers, assessors, and approvers—each sees the right workflows.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-2xl mb-3">🏦</div>
            <h2 className="font-semibold text-slate-900 mb-2">Multi-tenant</h2>
            <p className="text-sm text-slate-600">Admins onboard banks (tenants) and assign bank admins. Each bank runs its own assessment with chosen architecture.</p>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Product overview</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• <strong>SWIFT CSCF v2025</strong> — Control framework aligned to SWIFT Customer Security Programme.</li>
            <li>• <strong>Evidence model</strong> — Domain-based evidence items with control mapping and sufficiency.</li>
            <li>• <strong>Review & approval</strong> — Internal/external review and senior sign-off (CISO, Head of Compliance).</li>
            <li>• <strong>Reporting</strong> — Status and readiness for assessment cycles.</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-5xl mx-auto px-5 text-center text-xs text-slate-500">
          YaaraLabs SWIFT Compliance Platform · Phase 1 Pilot · February 2026
        </div>
      </footer>
    </div>
  );
}

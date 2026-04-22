// @ts-nocheck
"use client";

import React, { useState, useMemo, Fragment } from "react";
import { Shield, Users, AlertTriangle, CheckCircle2, XCircle, Clock,
  Key, Search, ChevronRight, X, AlertCircle, UserCheck,
  Database, ShieldAlert, Scale, Lock, Printer, GitBranch } from "lucide-react";
import RAW from "@/lib/software_audit/access-management/raw-data.json";
import {
  ACCESS_TABS,
  PLATFORM_DETAIL_ROLES,
  PROFILE_ROLE_LABELS,
  SEVERITY_RANK,
  SOD_DEV_PROD_USERNAMES,
  TRIAGE_ROWS,
  ZONE3_COMPLIANCE_BARS,
} from "@/lib/software_audit/access-management/dashboard-config";

const LVL  = {none:0,read:1,standard:2,privileged:3,admin:4};
const PRIV = new Set(["AdministratorAccess","PowerUserAccess","IAMFullAccess"]);
const SYSTEMS = [...RAW.cross_system_entitlement_collector.systems,"LoanSystem"];
const PROFILES = RAW.cross_system_entitlement_collector.role_profiles;

/* colours */
const VC = {"Met":"bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
            "Not Met":"bg-red-50 text-red-700 ring-1 ring-red-200",
            "Review":"bg-amber-50 text-amber-700 ring-1 ring-amber-200"};
const SC = {Critical:"bg-red-100 text-red-800",High:"bg-orange-50 text-orange-700",
            Medium:"bg-amber-50 text-amber-700",Low:"bg-slate-100 text-slate-600"};
const LC = {read:"bg-sky-50 text-sky-700 ring-1 ring-sky-200",
            standard:"bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
            privileged:"bg-amber-50 text-amber-700 ring-1 ring-amber-200",
            admin:"bg-red-50 text-red-700 ring-1 ring-red-200"};

const ago  = iso => iso?Math.round((new Date(RAW._metadata.generated_at)-new Date(iso))/864e5):999;
const lvlP = lv  => lv==="none"?<span className="text-slate-300 text-xs">—</span>
  :<span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ring-1 ${LC[lv]||"bg-slate-100 text-slate-600"}`}>{lv}</span>;

function deriveRoleLabels(currentRole, profileKey, entitlements, isExternal){
  const dept = (currentRole?.department || "").toLowerCase();
  const team = (currentRole?.team || "").toLowerCase();
  if(PROFILE_ROLE_LABELS[profileKey]) return PROFILE_ROLE_LABELS[profileKey];

  if((entitlements?.LoanSystem?.level || "none") !== "none"){
    return { businessRole: "Loan Processing", itRole: "LOS-User" };
  }
  if((entitlements?.CardSystem?.level || "none") !== "none"){
    return { businessRole: "Card Processing Operations", itRole: "Card-System-User" };
  }
  if((entitlements?.AutoFinanceSystem?.level || "none") !== "none"){
    return { businessRole: "Credit Underwriting", itRole: "Credit-Risk-User" };
  }
  if(dept.includes("security") || team.includes("authentication")){
    return { businessRole: "Security Operations", itRole: isExternal ? "IAM-Admin" : "Security-Admin" };
  }
  if(dept.includes("platform")){
    return { businessRole: "Payments Platform Support", itRole: "PlatformSRE" };
  }
  return {
    businessRole: currentRole?.title || "Operations",
    itRole: profileKey || "Standard-User",
  };
}

/* ── build users ── */
function buildUsers(){
  const credMap = Object.fromEntries(RAW.credential_report_collector.Content_Parsed.map(r=>[r.user,r]));
  const mfaMap  = RAW.mfa_device_collector.MFADevicesByUser;
  const hrMap   = Object.fromEntries(RAW.hr_role_mapping_collector.workers.map(w=>[w.username,w]));
  const entMap  = Object.fromEntries(RAW.cross_system_entitlement_collector.users.map(u=>[u.username,u]));
  const revMap  = Object.fromEntries(RAW.manager_access_review_collector.reviews.map(r=>[r.employee_username,r]));
  const trail   = RAW.cloudtrail_activity_collector.Events;
  const az      = RAW.access_analyzer_collector.findings;

  return RAW.iam_inventory_collector.UserDetailList.map(u=>{
    const c=credMap[u.UserName]||{}, h=hrMap[u.UserName]||{}, e=entMap[u.UserName]||{entitlements:{},current_role_profile:"Unknown"};
    const rev=revMap[u.UserName]||null, cr=h.current_role||{}, profile=PROFILES[e.current_role_profile]||{};
    const policies=(u.AttachedManagedPolicies||[]).map(p=>p.PolicyName);
    const hasMfa=((mfaMap[u.UserName]||{}).MFADevices||[]).length>0;
    const privAws=policies.some(p=>PRIV.has(p));
    const ents=e.entitlements||{};

    const excess=[],stale=[],missing=[];
    SYSTEMS.forEach(sys=>{
      const a=ents[sys], lv=a?.level||"none", ex=profile[sys]||"none";
      if(a?.is_stale) stale.push({sys,lv,ex,note:a.notes,role:a.source_role});
      else if(LVL[lv]>LVL[ex]) excess.push({sys,lv,ex,note:a?.notes});
      else if(LVL[ex]>LVL[lv]&&ex!=="none") missing.push({sys,lv,ex});
    });

    const findings=[];
    if(privAws&&!hasMfa) findings.push({id:"R1",sev:"Critical",title:"MFA missing on privileged AWS account"});
    if(c.access_key_1_active&&ago(c.access_key_1_last_rotated)>180) findings.push({id:"R2",sev:"High",title:"Access key not rotated in 180+ days"});
    if(privAws&&ago(c.password_last_used)>30) findings.push({id:"R3",sev:"High",title:"Privileged account dormant 30+ days"});
    if(az.some(f=>f._linked_principal_username===u.UserName&&f.status==="ACTIVE")) findings.push({id:"R4",sev:"High",title:"IAM Access Analyzer exposure active"});
    if(h.is_external&&!hasMfa) findings.push({id:"R5",sev:"Critical",title:"External contractor — no MFA"});
    if(stale.length) findings.push({id:"R6",sev:"High",title:`Stale access: ${stale.map(s=>s.sys).join(", ")}`});
    if(excess.some(x=>LVL[x.lv]>=LVL.standard&&["BankSystem","CardSystem","ContractSystem","HRSystem","AutoFinanceSystem","LoanSystem"].includes(x.sys)))
      findings.push({id:"R7",sev:"High",title:`Excess business-system access: ${excess.map(x=>x.sys).join(", ")}`});
    if(!rev||["Pending","Not Started"].includes(rev.outcome)) findings.push({id:"R8",sev:"Medium",title:"Quarterly manager review not completed"});
    if(rev?.exceptions_noted?.some(ex=>ex.status==="OVERDUE")) findings.push({id:"R9",sev:"High",title:"Review exception overdue"});
    if(rev?.outcome==="Certified"&&(stale.length||excess.length)) findings.push({id:"R10",sev:"Medium",title:"Manager certified despite access drift"});
    if(h.is_new_joiner&&!rev) findings.push({id:"R11",sev:"Medium",title:"New joiner — no review yet"});
    const sensEvts=trail.filter(ev=>ev.Username===u.UserName&&["AttachUserPolicy","CreateAccessKey","PutBucketPolicy"].includes(ev.EventName));
    if(sensEvts.length) findings.push({id:"R12",sev:"Medium",title:`Sensitive IAM event: ${sensEvts[0].EventName}`});

    const roleLabels = deriveRoleLabels(cr, e.current_role_profile, ents, h.is_external||false);
    const verdict=findings.some(f=>["Critical","High"].includes(f.sev))?"Not Met":findings.length?"Review":"Met";
    return {
      username:u.UserName, displayName:h.display_name||u.UserName, employeeId:h.employee_id,
      email:h.email, businessUnit:cr.department||"—", businessRole:roleLabels.businessRole, team:cr.team||"—",
      itRole:roleLabels.itRole, itRoleKey:e.current_role_profile||"—", title:cr.title||"—", manager:h.manager||"—",
      hireDate:h.hire_date, isExternal:h.is_external||false, isNewJoiner:h.is_new_joiner||false,
      prevRoles:h.previous_roles||[], policies, groups:u.GroupList||[], privAws, hasMfa,
      cred:c, keyAge:ago(c.access_key_1_last_rotated), loginAge:ago(c.password_last_used),
      ents, profile, excess, stale, missing, review:rev, findings, verdict, sensEvts,
    };
  });
}

/* ══════════════════════ MAIN ══════════════════════ */
export default function AccessManagement(){
  const users=useMemo(buildUsers,[]);
  const [tab,setTab]=useState("overview");
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState("");
  const [filt,setFilt]=useState("all");
  const [findingsFilter,setFindingsFilter]=useState("all");
  const [overviewRefreshKey,setOverviewRefreshKey]=useState(0);

  const meta=RAW._metadata;
  const allF=users.flatMap(u=>u.findings.map(f=>({...f,user:u})));
  const FILTER_PREDICATES = {
    notmet: (u) => u.verdict==="Not Met",
    review: (u) => u.verdict==="Review",
    drift: (u) => u.stale.length>0||u.excess.length>0,
    excess: (u) => u.excess.length>0,
    "orphan-admin": (u) => isOrphanAdminUser(u),
    "dormant-priv-active": (u) => isDormantPrivilegedActiveUser(u),
    "sod-dev-prod": (u) => isSodDevProdUser(u),
    "mfa-priv-missing": (u) => isPrivilegedMissingMfaUser(u),
    "provisioning-breach": (u) => isProvisioningBreachUser(u),
    priv: (u) => u.privAws,
    nomfa: (u) => !u.hasMfa,
  };

  const filtered=users.filter(u=>{
    const s=q.toLowerCase();
    if(s&&![u.username,u.displayName.toLowerCase(),u.businessRole.toLowerCase(),u.businessUnit.toLowerCase(),u.itRole.toLowerCase()].some(x=>x.includes(s))) return false;
    const predicate = FILTER_PREDICATES[filt];
    if(predicate) return predicate(u);
    return true;
  });

  const handleTabChange=(nextTab)=>{
    if(nextTab==="entitlements"){
      // Direct tab entry should always show the full entitlement view.
      setQ("");
      setFilt("all");
    }
    if(nextTab==="overview" && tab!=="overview"){
      // Force remount to refresh overview-local state.
      setOverviewRefreshKey(v=>v+1);
    }
    setTab(nextTab);
  };

  const openEntitlementsFromOverview=({filter="all",search=""}={})=>{
    setFilt(filter);
    setQ(search);
    setTab("entitlements");
  };

  return(
    <div className="min-h-screen bg-slate-50">
      {/* header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center"><Shield className="w-5 h-5 text-white"/></div>
          <div>
            <h1 className="text-base font-semibold text-slate-900">Access Management & Identity Governance</h1>
            <p className="text-xs text-slate-500">{meta.organization} · {meta.audit_period.start} → {meta.audit_period.end}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={()=>window.print()} className="print:hidden inline-flex items-center gap-1 px-3 py-1 text-sm rounded border border-slate-200 text-slate-600 hover:bg-slate-100">
            <Printer className="w-3.5 h-3.5"/>Print / Export PDF
          </button>
        </div>
      </header>

      {/* tabs */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8">
        <div className="flex">{ACCESS_TABS.map(t=>(
          <button key={t.id} onClick={()=>handleTabChange(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab===t.id?"border-indigo-600 text-indigo-700":"border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
          </button>
        ))}</div>
      </nav>

      <main className="px-8 py-6 max-w-screen-2xl mx-auto">
        {tab==="overview"     && <OverviewTab key={overviewRefreshKey} users={users} setTab={setTab} setFindingsFilter={setFindingsFilter} onOpenEntitlementsFromOverview={openEntitlementsFromOverview}/>}
        {tab==="entitlements" && <EntitlementsTab users={filtered} q={q} setQ={setQ} filt={filt} setFilt={setFilt} onOpen={setSel}/>}
        {tab==="findings"     && <FindingsTab allF={allF} users={users} onOpen={setSel} sectionFilter={findingsFilter} setSectionFilter={setFindingsFilter}/>}
      </main>

      {sel&&<Drawer user={sel} onClose={()=>setSel(null)}/>}
      <style jsx global>{`
        @media print {
          nav, .print\\:hidden { display: none !important; }
          main { max-width: 100% !important; padding: 0 !important; }
          button { box-shadow: none !important; }
          .fixed { position: static !important; }
        }
      `}</style>
    </div>
  );
}

/* ── OVERVIEW (3-zone access governance dashboard) ── */

const isOrphanAdminUser = (u) => u.privAws && u.isExternal;
const isDormantPrivilegedActiveUser = (u) => u.privAws && u.findings.some((f) => f.id === "R3");
const isSodDevProdUser = (u) => SOD_DEV_PROD_USERNAMES.has(u.username);
const isPrivilegedMissingMfaUser = (u) => u.privAws && !u.hasMfa;
const isProvisioningBreachUser = (u) => u.username === "vendor.acme" || (u.isNewJoiner && !u.review);

function scrollToSection(id){
  if(typeof document==="undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function OverviewSeverityBadge({ level }){
  const pill =
    level === "Critical"
      ? "bg-[#FEE2E2] text-[#DC2626] ring-1 ring-[#FECACA]"
      : level === "High"
        ? "bg-[#FFEDD5] text-[#D97706] ring-1 ring-[#FDBA74]"
        : level === "Review"
          ? "bg-[#FEF9C3] text-[#CA8A04] ring-1 ring-[#FDE047]"
          : "bg-[#DCFCE7] text-[#166534] ring-1 ring-[#86EFAC]";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${pill}`}>{level}</span>;
}

function OverviewTab({ users, setTab, setFindingsFilter, onOpenEntitlementsFromOverview }){
  const [severitySortDesc, setSeveritySortDesc] = useState(false);
  const openCardDetails = (filter, search = "") => onOpenEntitlementsFromOverview?.({ filter, search });
  const onCardKeyDown = (event, filter, search = "") => {
    if(event.key==="Enter" || event.key===" "){
      event.preventDefault();
      openCardDetails(filter, search);
    }
  };

  const sortedTriage = useMemo(() => {
    const copy = [...TRIAGE_ROWS];
    copy.sort((a, b) => {
      const da = SEVERITY_RANK[a.severity] ?? 9;
      const db = SEVERITY_RANK[b.severity] ?? 9;
      return severitySortDesc ? db - da : da - db;
    });
    return copy;
  }, [severitySortDesc]);

  const chipBase =
    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1";

  const totalUsers = users.length;
  const privilegedUsers = users.filter((u) => u.privAws);
  const driftUsers = users.filter((u) => u.stale.length > 0 || u.excess.length > 0);
  const overPrivilegedUsers = users.filter((u) => u.excess.length > 0);
  const staleAccessUsers = users.filter((u) => u.stale.length > 0);
  const orphanAdminUsers = users.filter((u) => isOrphanAdminUser(u));
  const dormantPrivActiveUsers = users.filter((u) => isDormantPrivilegedActiveUser(u));
  const dormantStandardUsers = users.filter((u) => !u.privAws && u.loginAge > 60);
  const dormantPrivilegedUsers = users.filter((u) => u.privAws && u.loginAge > 30);
  const privilegedWithOwner = privilegedUsers.filter((u) => u.manager && u.manager !== "—");
  const privilegedWithActiveHr = privilegedUsers.filter((u) => !u.isExternal);
  const privilegedWithJustification = privilegedUsers.filter((u) => u.review && !["Pending", "Not Started"].includes(u.review?.outcome));
  const privilegedWithMfa = privilegedUsers.filter((u) => u.hasMfa);
  const sodDevProdUsers = users.filter((u) => isSodDevProdUser(u));
  const sodInitiateApproveUsers = users.filter((u) => u.username === "sridhar.raman");
  const sodTotalViolations = sodInitiateApproveUsers.length + sodDevProdUsers.length;
  const mfaMissingPrivUsers = users.filter((u) => isPrivilegedMissingMfaUser(u));
  const mfaEnforcedRate = privilegedUsers.length ? Math.round((privilegedWithMfa.length / privilegedUsers.length) * 100) : 0;
  const provisioningBreachUsers = users.filter((u) => isProvisioningBreachUser(u));
  const provisioningNewJoiners = users.filter((u) => u.isNewJoiner);
  const provisioningAdhocJoiners = provisioningNewJoiners.filter((u) => !u.review || ["Pending", "Not Started"].includes(u.review?.outcome));
  const provisioningTerminationBreaches = users.filter((u) => u.username === "vendor.acme");
  const excessSystemCounts = overPrivilegedUsers.reduce((acc, user) => {
    user.excess.forEach((entry) => {
      acc[entry.sys] = (acc[entry.sys] || 0) + 1;
    });
    return acc;
  }, {});
  const excessSystemsCount = Object.keys(excessSystemCounts).length;
  const topOverPrivilegedSystems = Object.entries(excessSystemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const privilegedCardLevel = orphanAdminUsers.length > 0 ? "Critical" : "Met";
  const leastPrivilegeCardLevel = overPrivilegedUsers.length > 0 ? "Review" : "Met";
  const dormantCardLevel = dormantPrivActiveUsers.length > 0 ? "Critical" : "Met";
  const sodCardLevel = sodDevProdUsers.length > 0 ? "Critical" : "Met";
  const mfaCardLevel = mfaMissingPrivUsers.length > 0 ? "Critical" : "Met";
  const provisioningCardLevel = provisioningBreachUsers.length > 0 ? "Review" : "Met";

  return (
    <div className="space-y-6">
      {/* ZONE 1 — Audit health bar */}
      <section
        id="audit-health-bar"
        className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-none"
        aria-label="Audit health summary"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Overall compliance</p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-[#DC2626]">42%</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={`${chipBase} border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]`} onClick={() => scrollToSection("triage-panel")}>
              <span className="tabular-nums font-mono">Critical: 5</span>
            </button>
            <button type="button" className={`${chipBase} border-[#FDBA74] bg-[#FFF7ED] text-[#D97706]`} onClick={() => scrollToSection("triage-panel")}>
              <span className="tabular-nums font-mono">High: 2</span>
            </button>
            <button type="button" className={`${chipBase} border-[#FDE047] bg-[#FEFCE8] text-[#CA8A04]`} onClick={() => scrollToSection("triage-panel")}>
              <span className="tabular-nums font-mono">Review: 2</span>
            </button>
            <button
              type="button"
              className={`${chipBase} border-slate-200 bg-slate-50 text-slate-800`}
              onClick={() => {
                openCardDetails("drift");
              }}
            >
              <span className="tabular-nums font-mono">Access Drift: {driftUsers.length}</span>
            </button>
            <button type="button" className={`${chipBase} border-slate-200 bg-white text-slate-800`} onClick={() => openCardDetails("all")}>
              <span className="tabular-nums font-mono">Total Users: {totalUsers}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
        {/* ZONE 2 — Control cards (unique metrics only) */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
            <article
              id="card-privileged-access"
              role="button"
              tabIndex={0}
              onClick={() => openCardDetails("orphan-admin")}
              onKeyDown={(event) => onCardKeyDown(event, "orphan-admin")}
              className="cursor-pointer rounded-lg border border-slate-200 border-l-4 border-l-[#DC2626] bg-white p-4 shadow-none transition hover:border-indigo-200 hover:bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <h2 className="text-sm font-semibold text-slate-900">Privileged Access Review</h2>
                </div>
                <OverviewSeverityBadge level={privilegedCardLevel} />
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <table className="w-full border-collapse text-left font-mono tabular-nums">
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Named Owner</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{privilegedWithOwner.length}/{privilegedUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Active HR Record</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{privilegedWithActiveHr.length}/{privilegedUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Business Justification</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{privilegedWithJustification.length}/{privilegedUsers.length}</td>
                    </tr>
                  </tbody>
                </table>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">By type</p>
                  <p className="mt-1 font-mono tabular-nums text-slate-800">
                    OS <span className="font-semibold">3</span> · DB <span className="font-semibold">2</span> · App <span className="font-semibold">3</span> · Network{" "}
                    <span className="font-semibold">1</span>
                  </p>
                </div>
                <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Finding:</span> {orphanAdminUsers.length} admin account{orphanAdminUsers.length === 1 ? "" : "s"} lacks active HR record — potential orphan
                </p>
              </div>
            </article>

            <article
              id="card-least-privilege"
              role="button"
              tabIndex={0}
              onClick={() => openCardDetails("excess")}
              onKeyDown={(event) => onCardKeyDown(event, "excess")}
              className="cursor-pointer rounded-lg border border-slate-200 border-l-4 border-l-[#CA8A04] bg-white p-4 shadow-none transition hover:border-indigo-200 hover:bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Scale className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <h2 className="text-sm font-semibold text-slate-900">Least Privilege / Access Drift</h2>
                </div>
                <OverviewSeverityBadge level={leastPrivilegeCardLevel} />
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <table className="w-full border-collapse text-left font-mono tabular-nums">
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Over-privileged</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{overPrivilegedUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Stale access</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{staleAccessUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Systems with excess</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{excessSystemsCount}</td>
                    </tr>
                  </tbody>
                </table>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Top systems</p>
                  <p className="mt-1 font-mono tabular-nums text-slate-800">
                    {topOverPrivilegedSystems.length
                      ? topOverPrivilegedSystems.map(([system, count]) => `${system} (${count})`).join(", ")
                      : "No over-privileged systems"}
                  </p>
                </div>
                <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Finding:</span> {overPrivilegedUsers.length} users have over-privileged access across {excessSystemsCount} systems
                </p>
              </div>
            </article>

            <article
              id="card-dormant"
              role="button"
              tabIndex={0}
              onClick={() => openCardDetails("dormant-priv-active")}
              onKeyDown={(event) => onCardKeyDown(event, "dormant-priv-active")}
              className="cursor-pointer rounded-lg border border-slate-200 border-l-4 border-l-[#DC2626] bg-white p-4 shadow-none transition hover:border-indigo-200 hover:bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <h2 className="text-sm font-semibold text-slate-900">Dormant Accounts</h2>
                </div>
                <OverviewSeverityBadge level={dormantCardLevel} />
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <table className="w-full border-collapse text-left font-mono tabular-nums">
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Standard 60+ days</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{dormantStandardUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Privileged 30+ days</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{dormantPrivilegedUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Dormant privileged still active</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{dormantPrivActiveUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Total dormant users</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{dormantStandardUsers.length + dormantPrivilegedUsers.length}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Finding:</span> {dormantPrivActiveUsers.length} dormant privileged accounts still active — must be disabled not locked
                </p>
              </div>
            </article>

            <article
              id="card-sod"
              role="button"
              tabIndex={0}
              onClick={() => openCardDetails("sod-dev-prod")}
              onKeyDown={(event) => onCardKeyDown(event, "sod-dev-prod")}
              className="cursor-pointer rounded-lg border border-slate-200 border-l-4 border-l-[#DC2626] bg-white p-4 shadow-none transition hover:border-indigo-200 hover:bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <h2 className="text-sm font-semibold text-slate-900">Separation of Duties</h2>
                </div>
                <OverviewSeverityBadge level={sodCardLevel} />
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <table className="w-full border-collapse text-left font-mono tabular-nums">
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Initiate + Approve</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{sodInitiateApproveUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Developer + Prod Deploy</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{sodDevProdUsers.length}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Total violations</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{sodTotalViolations}</td>
                    </tr>
                  </tbody>
                </table>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Affected users</p>
                  <p className="mt-1 text-slate-800">
                    {sodDevProdUsers.length ? sodDevProdUsers.map((u) => u.displayName).join(", ") : "None"}
                  </p>
                </div>
                <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Finding:</span> {sodDevProdUsers.length} users hold conflicting Dev + Prod rights
                </p>
              </div>
            </article>

            <article
              id="card-mfa"
              role="button"
              tabIndex={0}
              onClick={() => openCardDetails("mfa-priv-missing")}
              onKeyDown={(event) => onCardKeyDown(event, "mfa-priv-missing")}
              className="cursor-pointer rounded-lg border border-slate-200 border-l-4 border-l-[#DC2626] bg-white p-4 shadow-none transition hover:border-indigo-200 hover:bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <h2 className="text-sm font-semibold text-slate-900">MFA Enforcement</h2>
                </div>
                <OverviewSeverityBadge level={mfaCardLevel} />
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <table className="w-full border-collapse text-left font-mono tabular-nums">
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Missing MFA (privileged)</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{mfaMissingPrivUsers.length} users</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">MFA enforced rate</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{mfaEnforcedRate}%</td>
                    </tr>
                  </tbody>
                </table>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Affected users</p>
                  <p className="mt-1 text-slate-800">
                    {mfaMissingPrivUsers.length ? mfaMissingPrivUsers.map((u) => u.displayName).join(", ") : "None"}
                  </p>
                </div>
                <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Finding:</span> {mfaMissingPrivUsers.length} privileged accounts accessible without MFA
                </p>
              </div>
            </article>

            <article
              id="card-provisioning"
              role="button"
              tabIndex={0}
              onClick={() => openCardDetails("provisioning-breach")}
              onKeyDown={(event) => onCardKeyDown(event, "provisioning-breach")}
              className="cursor-pointer rounded-lg border border-slate-200 border-l-4 border-l-[#CA8A04] bg-white p-4 shadow-none transition hover:border-indigo-200 hover:bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <h2 className="text-sm font-semibold text-slate-900">Provisioning &amp; Off-boarding</h2>
                </div>
                <OverviewSeverityBadge level={provisioningCardLevel} />
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <table className="w-full border-collapse text-left font-mono tabular-nums">
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">New joiners</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">
                        {provisioningNewJoiners.length} total ({provisioningAdhocJoiners.length} pending review)
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Termination SLA breach</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">
                        {provisioningTerminationBreaches.length}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-500">Users needing remediation</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">{provisioningBreachUsers.length}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Finding:</span> {provisioningBreachUsers.length} provisioning/off-boarding records require remediation
                </p>
              </div>
            </article>
          </div>
        </div>

        {/* ZONE 3 — Findings triage + control compliance (single placement) */}
        <aside id="triage-panel" className="w-full shrink-0 space-y-4 xl:w-[380px]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-none">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Findings triage</h2>
              <button
                type="button"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                onClick={() => {
                  setTab("findings");
                  setFindingsFilter("all");
                }}
              >
                Open Findings tab
              </button>
            </div>
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full min-w-[320px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-2 py-2 font-semibold text-slate-600 tabular-nums">#</th>
                    <th className="px-2 py-2 font-semibold text-slate-600">Control area</th>
                    <th className="px-2 py-2 font-semibold text-slate-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded hover:bg-slate-100 px-1 py-0.5 font-semibold text-slate-700"
                        onClick={() => setSeveritySortDesc((v) => !v)}
                        title="Toggle severity sort order"
                      >
                        Severity
                        <span className="font-mono text-[10px] text-slate-500">{severitySortDesc ? "↑" : "↓"}</span>
                      </button>
                    </th>
                    <th className="px-2 py-2 font-semibold text-slate-600">Affected entity</th>
                    <th className="px-2 py-2 font-semibold text-slate-600">Action required</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {sortedTriage.map((row, i) => (
                    <tr key={row.key} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-2 font-mono tabular-nums text-slate-500">{i + 1}</td>
                      <td className="px-2 py-2">{row.controlArea}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden>{row.icon}</span>
                          <OverviewSeverityBadge level={row.severity} />
                        </span>
                      </td>
                      <td className="px-2 py-2 text-slate-900">{row.entity}</td>
                      <td className="px-2 py-2 text-slate-600">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-none">
            <h3 className="text-sm font-semibold text-slate-900">Control compliance</h3>
            <div className="mt-4 space-y-3">
              {ZONE3_COMPLIANCE_BARS.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-xs text-slate-600">{row.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className={`w-11 shrink-0 text-right text-xs font-semibold tabular-nums font-mono ${row.textClass}`}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── ENTITLEMENTS ── */
function EntitlementsTab({users,q,setQ,filt,setFilt,onOpen}){
  const drift=users.filter(u=>u.stale.length||u.excess.length);
  return(
    <div className="space-y-4">
      {/* top insight row */}
      <div className="grid grid-cols-3 gap-4">
        <IC color="red"   label="Users with excess access"  value={users.filter(u=>u.excess.length).length} sub="Above role profile"/>
        <IC color="amber" label="Users with stale access"   value={users.filter(u=>u.stale.length).length}  sub="From previous role"/>
        <IC color="indigo" label="Total users in scope"     value={users.length} sub="All business roles"/>
      </div>

      {/* filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, business role, IT role..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        </div>
        <select
          value={filt}
          onChange={e=>setFilt(e.target.value)}
          className="text-sm text-slate-800 border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 [color-scheme:light]"
        >
          <option className="bg-white text-slate-900" value="all">All users</option>
          <option className="bg-white text-slate-900" value="orphan-admin">Privileged orphan account</option>
          <option className="bg-white text-slate-900" value="dormant-priv-active">Dormant privileged still active</option>
          <option className="bg-white text-slate-900" value="sod-dev-prod">SoD Dev + Prod conflict</option>
          <option className="bg-white text-slate-900" value="mfa-priv-missing">Privileged without MFA</option>
          <option className="bg-white text-slate-900" value="provisioning-breach">Provisioning SLA/form breach</option>
          <option className="bg-white text-slate-900" value="notmet">Not Met</option>
          <option className="bg-white text-slate-900" value="review">Requires Review</option>
          <option className="bg-white text-slate-900" value="drift">Has drift or excess</option>
          <option className="bg-white text-slate-900" value="excess">Has over-privileged access</option>
          <option className="bg-white text-slate-900" value="priv">Privileged AWS</option>
          <option className="bg-white text-slate-900" value="nomfa">No MFA</option>
        </select>
      </div>

      {/* legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
        <span className="font-medium text-slate-600">Legend:</span>
        {[["read","sky"],["standard","indigo"],["privileged","amber"],["admin","red"]].map(([l])=>(
          <span key={l} className="flex items-center gap-1"><span className={`inline-flex px-1.5 py-0.5 rounded ring-1 ${LC[l]}`}>{l}</span></span>
        ))}
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-amber-50 rounded ring-1 ring-amber-200 inline-block"/><span>excess ▲</span></span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-50 rounded ring-1 ring-red-200 inline-block"/><span>stale !</span></span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-blue-50 rounded ring-1 ring-blue-200 inline-block"/><span>missing ▼</span></span>
      </div>

      {/* main table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 sticky left-0 bg-slate-50 min-w-52">User</th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600 min-w-36">Business Role</th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600 min-w-44">IT Role Profile</th>
                <th className="px-3 py-3 text-center font-semibold text-slate-600 w-10">Drift</th>
                {SYSTEMS.map(s=><th key={s} className="px-2 py-3 text-center font-semibold text-slate-500 min-w-20 whitespace-nowrap">{s.replace("System","")}</th>)}
                <th className="px-4 py-3 text-left font-semibold text-slate-600 min-w-28">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u=>{
                const hasDrift=u.stale.length||u.excess.length;
                return(
                  <tr key={u.username} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={()=>onOpen(u)}>
                    {/* user col */}
                    <td className="px-4 py-3 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {u.displayName.split(" ").map(p=>p[0]).slice(0,2).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 flex items-center gap-1">{u.displayName}
                            {u.isExternal&&<span className="text-xs px-1 bg-amber-100 text-amber-700 rounded">Ext</span>}
                            {u.isNewJoiner&&<span className="text-xs px-1 bg-sky-100 text-sky-700 rounded">New</span>}
                          </div>
                          <div className="text-slate-400 font-mono">{u.username}</div>
                        </div>
                      </div>
                    </td>
                    {/* business role */}
                    <td className="px-3 py-3"><div className="text-slate-700 font-medium">{u.businessRole}</div><div className="text-slate-400">{u.businessUnit}</div></td>
                    {/* IT role */}
                    <td className="px-3 py-3 text-slate-600">
                      <div className="font-medium text-slate-700">{u.itRole}</div>
                      <div className="text-slate-400 text-[11px]">{u.itRoleKey}</div>
                    </td>
                    {/* drift icon */}
                    <td className="px-3 py-3 text-center">
                      {hasDrift?<AlertTriangle className="w-4 h-4 text-amber-500 mx-auto"/>:<CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto"/>}
                    </td>
                    {/* entitlement cells */}
                    {SYSTEMS.map(sys=>{
                      const e=u.ents[sys], lv=e?.level||"none", ex=u.profile[sys]||"none";
                      const isStale=e?.is_stale, isExcess=!isStale&&LVL[lv]>LVL[ex], isMissing=LVL[ex]>LVL[lv]&&ex!=="none";
                      return(
                        <td key={sys} className={`px-2 py-3 text-center ${isStale?"bg-red-50":isExcess?"bg-amber-50":isMissing?"bg-blue-50":""}`}>
                          {lv==="none"?<span className="text-slate-200">—</span>
                          :<span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ring-1 ${LC[lv]}`}>
                            {lv}{isStale&&<span className="ml-0.5 text-red-600">!</span>}{isExcess&&<span className="ml-0.5 text-amber-600">▲</span>}
                          </span>}
                        </td>
                      );
                    })}
                    {/* verdict */}
                    <td className="px-4 py-3"><VP v={u.verdict}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IC({color,label,value,sub}){
  const c={red:"bg-red-50 border-red-200 text-red-700",amber:"bg-amber-50 border-amber-200 text-amber-700",indigo:"bg-indigo-50 border-indigo-200 text-indigo-700"};
  return<div className={`rounded-xl border p-4 flex items-center gap-4 ${c[color]}`}>
    <div><div className="text-3xl font-bold">{value}</div><div className="text-sm font-medium">{label}</div><div className="text-xs opacity-70">{sub}</div></div>
  </div>;
}

/* ── FINDINGS ── */
function FindingsTab({allF,users,onOpen,sectionFilter,setSectionFilter}){
  const byRule={};allF.forEach(f=>{if(!byRule[f.id])byRule[f.id]={title:f.title,sev:f.sev,list:[]};byRule[f.id].list.push(f);});
  let groups=Object.values(byRule).sort((a,b)=>{const o={Critical:0,High:1,Medium:2};return o[a.sev]-o[b.sev];});
  if(sectionFilter&&sectionFilter!=="all"){
    const map={MFA:["R1","R5"],SoD:["R7"],"Orphan Accounts":["R5"],"Dormant Accounts":["R3"],Provisioning:["R8","R9","R10"]};
    const allowed=map[sectionFilter]||[];
    groups=groups.filter(g=>allowed.includes(g.list[0]?.id));
  }
  return(
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">Filter</label>
        <select
          value={sectionFilter||"all"}
          onChange={(e)=>setSectionFilter(e.target.value)}
          className="text-xs text-slate-800 border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 [color-scheme:light]"
        >
          <option className="bg-white text-slate-900" value="all">All</option>
          <option className="bg-white text-slate-900" value="MFA">MFA</option>
          <option className="bg-white text-slate-900" value="SoD">SoD</option>
          <option className="bg-white text-slate-900" value="Orphan Accounts">Orphan Accounts</option>
          <option className="bg-white text-slate-900" value="Dormant Accounts">Dormant Accounts</option>
          <option className="bg-white text-slate-900" value="Provisioning">Provisioning</option>
        </select>
      </div>
      {/* insight cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {t:`${allF.filter(f=>f.sev==="Critical").length} critical findings — ${allF.filter(f=>f.sev==="Critical").map(f=>f.user.displayName).join(", ")} need immediate action`,c:"red"},
          {t:`${users.filter(u=>u.stale.length).length} users retain access from a previous role — stale entitlements increase insider-fraud risk`,c:"red"},
          {t:`${users.filter(u=>u.excess.length).length} users have access beyond their role profile`,c:"amber"},
          {t:`${users.filter(u=>!u.review||["Pending","Not Started"].includes(u.review?.outcome)).length} quarterly manager reviews are incomplete`,c:"amber"},
        ].filter(x=>!x.t.startsWith("0")).map((x,i)=>(
          <div key={i} className={`rounded-xl border p-4 ${x.c==="red"?"bg-red-50 border-red-200":"bg-amber-50 border-amber-200"}`}>
            <p className={`text-sm font-medium ${x.c==="red"?"text-red-800":"text-amber-800"}`}>{x.t}</p>
          </div>
        ))}
      </div>
      {/* grouped by rule */}
      {groups.map(g=>(
        <div key={g.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${SC[g.sev]}`}>{g.sev}</span>
              <span className="font-semibold text-sm text-slate-900">{g.title}</span>
            </div>
            <span className="text-sm font-bold">{g.list.length} user{g.list.length>1?"s":""}</span>
          </div>
          {g.list.map((f,i)=>(
            <button key={i} onClick={()=>onOpen(f.user)} className="w-full text-left px-5 py-3 border-b last:border-0 border-slate-100 hover:bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-medium text-sm text-slate-900">{f.user.displayName}</span>
                <span className="text-xs text-slate-500 ml-2">{f.user.businessUnit} · {f.user.title}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400"/>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── SHARED COMPONENTS ── */
function VP({v}){
  const ic=v==="Met"?<CheckCircle2 className="w-3 h-3"/>:v==="Not Met"?<XCircle className="w-3 h-3"/>:<AlertTriangle className="w-3 h-3"/>;
  return<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VC[v==="Review"?"Review":v]}`}>{ic}{v}</span>;
}

function getDetailedRoles(user, system, entitlement, expectedLevel, actualLevel){
  const curated = PLATFORM_DETAIL_ROLES[user.username]?.[system] || [];
  if(curated.length>0) return curated;
  if(!entitlement || actualLevel==="none") return [];

  return [{
    role: entitlement.role_in_system || actualLevel,
    scope: `${system}-production`,
    granted: entitlement.granted_at?.slice(0,10) || "-",
    lastUsed: entitlement.last_used?.slice(0,10) || "-",
    status: entitlement.is_stale ? "stale" : "active",
    flag: entitlement.is_stale ? "Stale access from previous role" :
      (LVL[actualLevel] > LVL[expectedLevel] ? `Above expected (${expectedLevel})` : undefined),
  }];
}

/* ── DRAWER ── */
function Drawer({user:u,onClose}){
  const [expandedSys,setExpandedSys]=useState(null);

  return(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-all duration-200" onClick={onClose}/>
      <div className="relative w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-slate-900">{u.displayName}</span>
              <VP v={u.verdict}/>
              {u.isExternal&&<span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">External</span>}
              {u.isNewJoiner&&<span className="text-xs px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded">New joiner</span>}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">{u.businessRole} · {u.itRole}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-6">
          {/* findings first for auditor priority */}
          <DS title="Audit Findings & issues">
            {u.findings.length===0?<div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-700">No findings — all controls met.</div>
            :<div className="space-y-2">{u.findings.map((f,i)=>(
              <div key={i} className={`p-3 rounded-lg border ${f.sev==="Critical"?"bg-red-50 border-red-200":f.sev==="High"?"bg-orange-50 border-orange-200":"bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center gap-2 mb-1"><span className={`text-xs font-medium px-2 py-0.5 rounded ${SC[f.sev]}`}>{f.sev}</span><span className="text-xs font-mono text-slate-400">{f.id}</span></div>
                <div className="text-sm font-medium text-slate-900">{f.title}</div>
              </div>
            ))}</div>}
          </DS>

          {/* identity */}
          <DS title="Identity & role">
            <G2 rows={[["Employee ID",u.employeeId],["Email",u.email],["Manager",u.manager],["Business Role",u.businessRole],["Business Unit",u.businessUnit],["IT Role Profile",u.itRole],["IT Role Key",u.itRoleKey],["Hired",u.hireDate]]}/>
            {u.prevRoles.length>0&&<div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs">
              <div className="font-semibold text-amber-800 mb-1">Previous roles (stale-access risk context)</div>
              {u.prevRoles.map((r,i)=><div key={i} className="text-amber-700">{r.title} · {r.department} · until {r.effective_until?.slice(0,10)}</div>)}
            </div>}
          </DS>

          {/* detailed platform roles */}
          <DS title="Detailed platform role view">
            <div className="space-y-2">
              {SYSTEMS.map(sys=>{
                const e=u.ents[sys];
                if(!e) return null;
                const lv=e.level||"none", ex=u.profile[sys]||"none";
                const isStale=e.is_stale, isExcess=!isStale&&LVL[lv]>LVL[ex], isMissing=LVL[ex]>LVL[lv]&&ex!=="none";
                const detailRoles=getDetailedRoles(u, sys, e, ex, lv);
                const hasAnyAssignment = lv!=="none" || detailRoles.length>0 || isStale || isExcess || isMissing;
                if(!hasAnyAssignment) return null;
                const hasGranularRoles = detailRoles.length>0;
                const isOpen=expandedSys===sys;
                return(
                  <div key={sys} className={`rounded-lg border overflow-hidden ${isStale?"border-red-200 bg-red-50":isExcess?"border-amber-200 bg-amber-50":isMissing?"border-blue-200 bg-blue-50":"border-slate-200 bg-white"}`}>
                    <button onClick={()=>{if(hasGranularRoles) setExpandedSys(isOpen?null:sys);}} className="w-full px-4 py-3 text-left hover:bg-black/5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{sys}</span>
                          <span className="text-xs text-slate-500">Expected {ex} · Actual {lv}</span>
                          {isStale&&<span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">STALE</span>}
                          {isExcess&&!isStale&&<span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">EXCESS</span>}
                          {isMissing&&<span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">MISSING</span>}
                        </div>
                        {hasGranularRoles&&<ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen?"rotate-90":""}`}/>}
                      </div>
                    </button>
                    {isOpen&&hasGranularRoles&&<div className="border-t border-slate-200 bg-white">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                          <th className="px-4 py-2 text-left font-medium">Role / permission</th>
                          <th className="px-3 py-2 text-left font-medium">Scope</th>
                          <th className="px-3 py-2 text-left font-medium">Granted</th>
                          <th className="px-3 py-2 text-left font-medium">Last used</th>
                          <th className="px-3 py-2 text-left font-medium">Issue</th>
                        </tr></thead>
                        <tbody>
                          {detailRoles.map((r,i)=><tr key={i} className="border-b last:border-0 border-slate-100">
                              <td className="px-4 py-2 font-mono text-slate-800">{r.role}</td>
                              <td className="px-3 py-2 text-slate-600">{r.scope}</td>
                              <td className="px-3 py-2 text-slate-500">{r.granted}</td>
                              <td className="px-3 py-2 text-slate-500">{r.lastUsed}</td>
                              <td className="px-3 py-2">{r.flag?<span className="text-amber-700">{r.flag}</span>:<span className="text-emerald-600">OK</span>}</td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div>}
                  </div>
                );
              })}
            </div>
          </DS>

          {/* AWS credentials */}
          <DS title="AWS credentials">
            <G2 rows={[["MFA",u.hasMfa?"Enabled ✓":"NOT ENABLED ⚠️"],["Privileged",u.privAws?"Yes — "+u.policies.join(", "):"No"],["Key age",`${u.keyAge} days`],["Last login",`${u.loginAge} days ago`],["Password changed",u.cred.password_last_changed?.slice(0,10)]]}/>
          </DS>

          {/* manager review */}
          <DS title="Manager access review">
            {u.review?<div>
              <G2 rows={[["Campaign",u.review.campaign_id],["Manager",u.review.manager_display||u.review.manager],["Outcome",u.review.outcome],["Reviewed",u.review.reviewed_at?.slice(0,10)||"Not completed"]]}/>
              {u.review.exceptions_noted?.length>0&&<div className="mt-2 space-y-1">
                {u.review.exceptions_noted.map((ex,i)=>(
                  <div key={i} className={`text-xs p-2 rounded border ${ex.status==="OVERDUE"?"bg-red-50 border-red-200 text-red-800":"bg-amber-50 border-amber-200 text-amber-700"}`}>
                    <span className="font-medium">{ex.system}:</span> {ex.exception} · due {ex.remediation_due} · <span className="font-semibold">{ex.status}</span>
                  </div>
                ))}
              </div>}
              {u.review.notes&&<p className="text-xs text-slate-600 bg-slate-50 rounded p-2 mt-2">{u.review.notes}</p>}
            </div>:<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">No manager review on file.</div>}
          </DS>

        </div>
      </div>
    </div>
  );
}

function DS({title,children}){return<section><h3 className="text-sm font-semibold text-slate-800 mb-2 pb-1 border-b border-slate-100">{title}</h3>{children}</section>;}
function G2({rows}){return<dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">{rows.filter(([,v])=>v).map(([k,v],i)=><Fragment key={i}><dt className="text-slate-500">{k}</dt><dd className="text-slate-900 font-mono break-all">{v}</dd></Fragment>)}</dl>;}

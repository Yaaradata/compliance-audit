// @ts-nocheck
"use client";

import React, { useState, useMemo } from "react";
import {
  Shield, Users, AlertTriangle, CheckCircle2, XCircle, Clock, Key,
  Search, ChevronRight, X, Layers, Briefcase,
  AlertCircle, ShieldAlert, GitBranch, UserCheck, Database, Info
} from "lucide-react";

import RAW from "@/lib/software_audit/access-management/raw-data.json";
import controlResults from "@/lib/software_audit/controls-results.json";


/* ===================================================================
   AUDIT ENGINE
   =================================================================== */

const PRIV_POLICIES = new Set(["AdministratorAccess","PowerUserAccess","IAMFullAccess"]);
const LVL = {none:0,read:1,standard:2,privileged:3,admin:4};

function daysSince(iso){
  if(!iso) return Infinity;
  return (new Date(RAW._metadata.generated_at)-new Date(iso))/864e5;
}

function buildUsers(){
  const iam = RAW.iam_inventory_collector.UserDetailList;
  const credMap = Object.fromEntries(RAW.credential_report_collector.Content_Parsed.map(r=>[r.user,r]));
  const mfaMap = RAW.mfa_device_collector.MFADevicesByUser;
  const hrMap = Object.fromEntries(RAW.hr_role_mapping_collector.workers.map(w=>[w.username,w]));
  const entMap = Object.fromEntries(RAW.cross_system_entitlement_collector.users.map(u=>[u.username,u]));
  const reviews = RAW.manager_access_review_collector.reviews;
  const profiles = RAW.cross_system_entitlement_collector.role_profiles;
  const trail = RAW.cloudtrail_activity_collector.Events;
  const analyzer = RAW.access_analyzer_collector.findings;

  return iam.map(u=>{
    const c = credMap[u.UserName]||{};
    const h = hrMap[u.UserName]||{};
    const e = entMap[u.UserName]||{entitlements:{}};
    const rev = reviews.find(r=>r.employee_username===u.UserName);
    const profile = profiles[e.current_role_profile]||{};
    const tags = Object.fromEntries((u.Tags||[]).map(t=>[t.Key,t.Value]));
    const policies = (u.AttachedManagedPolicies||[]).map(p=>p.PolicyName);
    const privAws = policies.some(p=>PRIV_POLICIES.has(p));
    const hasMfa = ((mfaMap[u.UserName]||{}).MFADevices||[]).length>0;
    const ents = e.entitlements||{};

    const excess=[], stale=[];
    Object.entries(ents).forEach(([sys,x])=>{
      if(!x||x.level==="none") return;
      const exp = profile[sys]||"none";
      if(x.is_stale) stale.push({system:sys,...x});
      else if(LVL[x.level]>LVL[exp]) excess.push({system:sys,...x,expected:exp});
    });

    const trailEvents = trail.filter(ev=>ev.Username===u.UserName);
    const sensitiveEvents = trailEvents.filter(ev=>
      ["AttachUserPolicy","CreateAccessKey","PutBucketPolicy","CreatePolicyVersion","DeleteAccessKey"].includes(ev.EventName));
    const analyzerFindings = analyzer.filter(f=>f._linked_principal_username===u.UserName && f.status==="ACTIVE");

    return {
      username:u.UserName, arn:u.Arn, createDate:u.CreateDate,
      displayName:h.display_name||u.UserName, employeeId:h.employee_id, email:h.email,
      title:h.current_role?.title||tags.Role, department:h.current_role?.department||tags.Department,
      team:h.current_role?.team, manager:h.manager, hireDate:h.hire_date,
      isExternal:h.is_external||false, isNewJoiner:h.is_new_joiner||false,
      employmentStatus:h.employment_status,
      tags, policies, groups:u.GroupList||[], privAws, mfaEnabled:hasMfa,
      pwdAge:daysSince(c.password_last_changed), keyAge:daysSince(c.access_key_1_last_rotated),
      loginAge:daysSince(c.password_last_used), cred:c,
      previousRoles:h.previous_roles||[],
      ents, profileKey:e.current_role_profile, expectedProfile:profile,
      excess, stale, review:rev,
      trailEvents, sensitiveEvents, analyzerFindings,
    };
  });
}

const RULES=[
  {id:"R1",cat:"AWS Identity",sev:"Critical",title:"MFA missing on privileged AWS principal",
   test:u=>u.privAws&&!u.mfaEnabled,
   fix:"Enforce MFA on all privileged identities. Deny actions without aws:MultiFactorAuthPresent.",
   evidence:"credential_report.mfa_active + iam_inventory.AttachedManagedPolicies"},
  {id:"R2",cat:"AWS Identity",sev:"High",title:"Access key not rotated (180+ days)",
   test:u=>u.cred.access_key_1_active&&u.keyAge>180,
   fix:"Rotate access keys. Prefer IAM roles over long-lived keys.",
   evidence:"credential_report.access_key_1_last_rotated"},
  {id:"R3",cat:"AWS Identity",sev:"High",title:"Privileged principal dormant > 30 days",
   test:u=>u.privAws&&u.loginAge>30,
   fix:"Disable unused privileged principals or downgrade access.",
   evidence:"credential_report.password_last_used"},
  {id:"R4",cat:"AWS Identity",sev:"High",title:"IAM Access Analyzer external exposure",
   test:u=>u.analyzerFindings.length>0,
   fix:"Review finding; remove over-permissive resource policy.",
   evidence:"access_analyzer.findings[].status=ACTIVE"},
  {id:"R5",cat:"AWS Identity",sev:"Critical",title:"External contractor without MFA",
   test:u=>u.isExternal&&!u.mfaEnabled,
   fix:"Enforce MFA on all external identities. Rotate credentials immediately.",
   evidence:"credential_report.mfa_active + iam_inventory.Path=/external/"},
  {id:"R6",cat:"Access Governance",sev:"High",title:"Stale entitlement from previous role",
   test:u=>u.stale.length>0,
   fix:"Revoke stale entitlements on role transfer. Run de-provisioning workflow.",
   evidence:"cross_system_entitlement[].is_stale + hr_role_mapping.previous_roles"},
  {id:"R7",cat:"Access Governance",sev:"High",title:"Business-system access above role profile",
   test:u=>u.excess.some(x=>LVL[x.level]>=LVL.standard&&
     ["BankSystem","CardSystem","ContractSystem","HRSystem","AutoFinanceSystem","LoanSystem"].includes(x.system)),
   fix:"Remove unrelated business-app entitlements. Enforce least privilege.",
   evidence:"cross_system_entitlement[].level vs role_profiles"},
  {id:"R8",cat:"Access Governance",sev:"Medium",title:"Quarterly manager review not completed",
   test:u=>!u.review||["Pending","Not Started"].includes(u.review.outcome),
   fix:"Escalate to manager. Enforce recertification gate.",
   evidence:"manager_access_review.outcome"},
  {id:"R9",cat:"Access Governance",sev:"High",title:"Review exception past remediation deadline",
   test:u=>u.review?.exceptions_noted?.some(e=>e.status==="OVERDUE"),
   fix:"Remediate exception immediately. Overdue items indicate control failure.",
   evidence:"manager_access_review.exceptions_noted[].status=OVERDUE"},
  {id:"R10",cat:"Access Governance",sev:"Medium",title:"Manager certified despite drift/excess",
   test:u=>u.review?.outcome==="Certified"&&(u.stale.length>0||u.excess.length>0),
   fix:"Review-quality training for manager. Re-evaluate certification.",
   evidence:"manager_access_review.outcome=Certified but drift/excess present"},
  {id:"R11",cat:"Access Governance",sev:"Medium",title:"New joiner - no review yet",
   test:u=>u.isNewJoiner&&!u.review,
   fix:"Include in next review campaign. Confirm provisioned access matches role.",
   evidence:"hr_role_mapping.is_new_joiner + no review record"},
  {id:"R12",cat:"AWS Activity",sev:"Medium",title:"Sensitive IAM event in last 7 days",
   test:u=>u.sensitiveEvents.length>0,
   fix:"Verify legitimacy. Ensure change followed approval workflow.",
   evidence:"cloudtrail_activity.Events[].EventName"},
];

function evalUser(u){
  const findings=[];
  RULES.forEach(r=>{if(r.test(u)) findings.push(r);});
  let verdict="Met";
  if(findings.some(f=>["Critical","High"].includes(f.sev))) verdict="Not Met";
  else if(findings.length>0) verdict="Requires Review";
  return {findings,verdict};
}

/* ===================================================================
   UI COMPONENTS
   =================================================================== */

const PILL_CLS={
  "Met":"bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Not Met":"bg-red-50 text-red-700 ring-red-200",
  "Requires Review":"bg-amber-50 text-amber-700 ring-amber-200",
};
const SEV_CLS={
  "Critical":"bg-red-100 text-red-800 ring-red-300",
  "High":"bg-red-50 text-red-700 ring-red-200",
  "Medium":"bg-amber-50 text-amber-700 ring-amber-200",
  "Low":"bg-slate-50 text-slate-700 ring-slate-200",
};
const LVL_CLS={
  read:"bg-sky-50 text-sky-700 ring-sky-200",
  standard:"bg-indigo-50 text-indigo-700 ring-indigo-200",
  privileged:"bg-amber-50 text-amber-700 ring-amber-200",
  admin:"bg-red-50 text-red-700 ring-red-200",
};

function VerdictPill({v}){
  const ic=v==="Met"?<CheckCircle2 className="w-3 h-3"/>:v==="Not Met"?<XCircle className="w-3 h-3"/>:<AlertTriangle className="w-3 h-3"/>;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ring-1 ${PILL_CLS[v]}`}>{ic}{v}</span>;
}
function SevPill({s}){return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ring-1 ${SEV_CLS[s]||SEV_CLS.Low}`}>{s}</span>;}
function LvlPill({level,expected}){
  if(!level||level==="none") return <span className="text-xs text-slate-400">-</span>;
  const over=expected&&LVL[level]>LVL[expected];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ring-1 ${LVL_CLS[level]}`}>
    {over&&<AlertTriangle className="w-3 h-3"/>}{level}
  </span>;
}

/* ===================================================================
   MAIN
   =================================================================== */

export default function AccessManagementDashboard(){
  const users=useMemo(()=>buildUsers(),[]);
  const evals=useMemo(()=>{const o={};users.forEach(u=>{o[u.username]=evalUser(u);});return o;},[users]);
  const [tab,setTab]=useState("overview");
  const [sel,setSel]=useState(null);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");

  const meta=RAW._metadata;
  const systems=RAW.cross_system_entitlement_collector.systems;
  const campaigns=RAW.manager_access_review_collector.campaigns;

  const total=users.length;
  const met=users.filter(u=>evals[u.username].verdict==="Met").length;
  const notMet=users.filter(u=>evals[u.username].verdict==="Not Met").length;
  const rev=users.filter(u=>evals[u.username].verdict==="Requires Review").length;
  const drift=users.filter(u=>u.stale.length>0).length;
  const excessCount=users.filter(u=>u.excess.length>0).length;
  const revOverdue=users.filter(u=>!u.review||["Pending","Not Started"].includes(u.review?.outcome)).length;
  const excOpen=users.filter(u=>u.review?.exceptions_noted?.some(e=>e.status==="OVERDUE")).length;
  const privTotal=users.filter(u=>u.privAws).length;
  const mfaMissPriv=users.filter(u=>u.privAws&&!u.mfaEnabled).length;

  const allFindings=users.flatMap(u=>evals[u.username].findings.map(f=>({...f,user:u})));

  const filtered=users.filter(u=>{
    const s=search.toLowerCase();
    if(s&&!u.username.includes(s)&&!u.displayName.toLowerCase().includes(s)&&!(u.title||"").toLowerCase().includes(s)&&!(u.department||"").toLowerCase().includes(s)) return false;
    if(filter==="notmet") return evals[u.username].verdict==="Not Met";
    if(filter==="review") return evals[u.username].verdict==="Requires Review";
    if(filter==="drift") return u.stale.length>0;
    if(filter==="excess") return u.excess.length>0;
    if(filter==="privileged") return u.privAws;
    if(filter==="external") return u.isExternal;
    return true;
  });

  const TABS=[
    {id:"overview",label:"Overview",icon:Shield},
    {id:"users",label:"Users",icon:Users},
    {id:"matrix",label:"Entitlement Matrix",icon:Layers},
    {id:"reviews",label:"Role Drift & Reviews",icon:UserCheck},
    {id:"findings",label:"Findings",icon:AlertTriangle},
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-indigo-700"/></div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Access Management & Identity Governance</h1>
              <p className="text-sm text-slate-500">{meta.organization}  - {meta.audit_engagement}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Period: {meta.audit_period.start} to {meta.audit_period.end}</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex gap-1">
          {TABS.map(t=>{const I=t.icon;return(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${tab===t.id?"border-indigo-600 text-indigo-700":"border-transparent text-slate-500 hover:text-slate-800"}`}>
              <I className="w-4 h-4"/>{t.label}
            </button>
          );})}
        </div>
      </nav>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {tab==="overview"&&<Overview total={total} met={met} notMet={notMet} rev={rev} drift={drift}
          excessCount={excessCount} revOverdue={revOverdue} excOpen={excOpen}
          privTotal={privTotal} mfaMissPriv={mfaMissPriv}
          allFindings={allFindings} users={users} evals={evals} onOpen={setSel}/>}
        {tab==="users"&&<UsersTab users={filtered} evals={evals} search={search} setSearch={setSearch}
          filter={filter} setFilter={setFilter} onOpen={setSel}/>}
        {tab==="matrix"&&<MatrixTab users={users} systems={systems} evals={evals} onOpen={setSel}/>}
        {tab==="reviews"&&<ReviewsTab users={users} campaigns={campaigns} evals={evals} onOpen={setSel}/>}
        {tab==="findings"&&<FindingsTab findings={allFindings} onOpen={setSel}/>}
      </main>

      {sel&&<Drawer user={sel} ev={evals[sel.username]} systems={systems} onClose={()=>setSel(null)}/>}
    </div>
  );
}

/* - STAT CARD - */
function SC({label,sub,value,icon:I,accent}){
  const a={indigo:"bg-indigo-50 text-indigo-700",emerald:"bg-emerald-50 text-emerald-700",red:"bg-red-50 text-red-700",amber:"bg-amber-50 text-amber-700"};
  return <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-start justify-between">
    <div><div className="text-xs text-slate-500">{label}</div>{sub&&<div className="text-xs text-slate-400">{sub}</div>}
      <div className="text-3xl font-semibold text-slate-900 mt-2">{value}</div></div>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a[accent]}`}><I className="w-4 h-4"/></div>
  </div>;
}

const ACCESS_CONTROL_RESULTS = controlResults.accessManagement;

function ControlsResultsTable({ data }) {
  return <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
      <h3 className="text-sm font-semibold text-slate-900">{data.title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 text-slate-600 uppercase">
          <tr>
            <th className="px-3 py-2 text-left font-medium">#</th>
            <th className="px-3 py-2 text-left font-medium">Control</th>
            <th className="px-3 py-2 text-left font-medium">What is checked</th>
            <th className="px-3 py-2 text-right font-medium">Met</th>
            <th className="px-3 py-2 text-right font-medium">Not Met</th>
            <th className="px-3 py-2 text-right font-medium">Requires Review</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.rows.map((r) => <tr key={r.id} className="hover:bg-slate-50">
            <td className="px-3 py-2 font-mono text-slate-600">{r.id}</td>
            <td className="px-3 py-2 font-medium text-slate-900">{r.control}</td>
            <td className="px-3 py-2 text-slate-600">{r.whatIsChecked}</td>
            <td className="px-3 py-2 text-right text-emerald-700 font-medium">{r.met}</td>
            <td className="px-3 py-2 text-right text-red-700 font-medium">{r.notMet}</td>
            <td className="px-3 py-2 text-right text-amber-700 font-medium">{r.requiresReview}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>;
}

/* - OVERVIEW - */
function Overview({total,met,notMet,rev,drift,excessCount,revOverdue,excOpen,privTotal,mfaMissPriv,allFindings,users,evals,onOpen}){
  const crits=allFindings.filter(f=>f.sev==="Critical");
  return <div className="space-y-6">
    <div className="grid grid-cols-4 gap-4">
      <SC label="Users in scope" value={total} icon={Users} accent="indigo"/>
      <SC label="Met" value={met} icon={CheckCircle2} accent="emerald"/>
      <SC label="Not Met" value={notMet} icon={XCircle} accent="red"/>
      <SC label="Requires Review" value={rev} icon={AlertTriangle} accent="amber"/>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Access governance</h3>
      <div className="grid grid-cols-4 gap-4">
        <SC label="Stale access (role drift)" value={drift} icon={GitBranch} accent="red"/>
        <SC label="Excess access" sub="Beyond role profile" value={excessCount} icon={ShieldAlert} accent="red"/>
        <SC label="Reviews overdue" value={revOverdue} icon={Clock} accent="amber"/>
        <SC label="Exceptions past due" value={excOpen} icon={AlertCircle} accent="red"/>
      </div>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AWS identity</h3>
      <div className="grid grid-cols-4 gap-4">
        <SC label="Privileged AWS users" value={privTotal} icon={Key} accent="indigo"/>
        <SC label="MFA missing on privileged" value={mfaMissPriv} icon={ShieldAlert} accent="red"/>
        <SC label="Critical findings" value={crits.length} icon={XCircle} accent="red"/>
        <SC label="Total findings" value={allFindings.length} icon={AlertTriangle} accent="amber"/>
      </div>
    </div>

    <ControlsResultsTable data={ACCESS_CONTROL_RESULTS} />

    {crits.length>0&&<div className="bg-white rounded-lg border border-red-200">
      <div className="px-5 py-3 bg-red-50 border-b border-red-200 rounded-t-lg flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-700"/><span className="font-semibold text-red-900">Critical findings</span>
      </div>
      <div className="divide-y divide-slate-100">
        {crits.map((f,i)=><button key={i} onClick={()=>onOpen(f.user)}
          className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center justify-between">
          <div><div className="flex items-center gap-2"><SevPill s={f.sev}/><span className="font-medium text-slate-900">{f.title}</span></div>
            <div className="text-xs text-slate-500 mt-0.5">{f.user.displayName}  - {f.user.title}  - {f.user.department}</div></div>
          <ChevronRight className="w-4 h-4 text-slate-400"/>
        </button>)}
      </div>
    </div>}

    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Evidence collectors ({Object.keys(RAW).length-1})</h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {Object.entries(RAW).filter(([k])=>k!=="_metadata").map(([name,data])=>
          <div key={name} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
            <Database className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0"/>
            <div><div className="font-mono text-slate-800">{name}</div>
              <div className="text-slate-500 font-mono break-all">{data._api}</div></div>
          </div>
        )}
      </div>
    </div>
  </div>;
}

/* - USERS TABLE - */
function UsersTab({users,evals,search,setSearch,filter,setFilter,onOpen}){
  return <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, role, department..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
      <select value={filter} onChange={e=>setFilter(e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
        <option value="all">All users</option><option value="notmet">Not Met</option>
        <option value="review">Requires Review</option><option value="drift">Role drift</option>
        <option value="excess">Excess access</option><option value="privileged">Privileged AWS</option>
        <option value="external">External</option>
      </select>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-600 uppercase"><tr>
        <th className="px-4 py-3 text-left font-medium">User</th>
        <th className="px-4 py-3 text-left font-medium">Role / Dept</th>
        <th className="px-4 py-3 text-left font-medium">AWS</th>
        <th className="px-4 py-3 text-left font-medium">MFA</th>
        <th className="px-4 py-3 text-left font-medium">Review</th>
        <th className="px-4 py-3 text-left font-medium">Access health</th>
        <th className="px-4 py-3 text-left font-medium">Verdict</th>
        <th className="px-4 py-3"></th>
      </tr></thead><tbody className="divide-y divide-slate-100">
        {users.map(u=>{const ev=evals[u.username];return(
          <tr key={u.username} className="hover:bg-slate-50 cursor-pointer" onClick={()=>onOpen(u)}>
            <td className="px-4 py-3"><div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-700">
                {u.displayName.split(" ").map(p=>p[0]).slice(0,2).join("")}</div>
              <div><div className="font-medium text-slate-900 flex items-center gap-1.5">{u.displayName}
                {u.isExternal&&<span className="text-xs px-1 py-0.5 bg-amber-100 text-amber-700 rounded">Ext</span>}
                {u.isNewJoiner&&<span className="text-xs px-1 py-0.5 bg-sky-100 text-sky-700 rounded">New</span>}
              </div><div className="text-xs text-slate-500 font-mono">{u.username}</div></div></div></td>
            <td className="px-4 py-3"><div className="text-slate-900">{u.title}</div><div className="text-xs text-slate-500">{u.department}</div></td>
            <td className="px-4 py-3 text-xs">{u.privAws?<span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">Privileged</span>
              :<span className="text-slate-500">Standard</span>}</td>
            <td className="px-4 py-3 text-xs">{u.mfaEnabled?<span className="text-emerald-700">Enabled</span>
              :<span className="text-red-700 font-medium">Missing</span>}</td>
            <td className="px-4 py-3 text-xs">{u.review?<span className={
              u.review.outcome==="Certified"?"text-emerald-700":u.review.outcome.includes("exception")?"text-amber-700":"text-red-700"
            }>{u.review.outcome}</span>:<span className="text-red-700">None</span>}</td>
            <td className="px-4 py-3 text-xs">
              {u.stale.length>0&&<span className="text-red-700 mr-2">{u.stale.length} stale</span>}
              {u.excess.length>0&&<span className="text-amber-700">{u.excess.length} excess</span>}
              {u.stale.length===0&&u.excess.length===0&&<span className="text-emerald-700">Clean</span>}
            </td>
            <td className="px-4 py-3"><VerdictPill v={ev.verdict}/></td>
            <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-slate-400"/></td>
          </tr>);})}
      </tbody></table>
    </div>
  </div>;
}

/* - ENTITLEMENT MATRIX - */
function MatrixTab({users,systems,evals,onOpen}){
  const allSys=[...systems];
  if(users.some(u=>u.ents.LoanSystem)) allSys.push("LoanSystem");
  return <div className="space-y-4">
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-3">
      <Info className="w-5 h-5 text-indigo-700 mt-0.5"/>
      <div><h3 className="font-semibold text-slate-900">Cross-System Entitlement Matrix</h3>
        <p className="text-sm text-slate-600 mt-1">
          Actual access level per user per system. <AlertTriangle className="inline w-3 h-3 text-amber-600"/> = above expected role profile. Red background = stale from previous role.
        </p></div>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto"><table className="text-xs">
        <thead className="bg-slate-50"><tr>
          <th className="px-3 py-2 text-left font-medium text-slate-600 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">User</th>
          {allSys.map(s=><th key={s} className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{s}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {users.map(u=><tr key={u.username} className="hover:bg-slate-50 cursor-pointer" onClick={()=>onOpen(u)}>
            <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-slate-200 whitespace-nowrap">
              <div className="font-medium text-slate-900">{u.displayName}</div>
              <div className="text-slate-500">{u.title}</div></td>
            {allSys.map(s=>{const e=u.ents[s];const exp=u.expectedProfile[s]||"none";const lv=e?.level||"none";
              let cls="px-3 py-2 whitespace-nowrap";
              if(e?.is_stale) cls+=" bg-red-50";
              else if(lv!=="none"&&LVL[lv]>LVL[exp]) cls+=" bg-amber-50";
              return <td key={s} className={cls}>
                <LvlPill level={lv} expected={exp}/>
                {e?.is_stale&&<div className="text-xs text-red-700">stale</div>}
              </td>;})}
          </tr>)}
        </tbody>
      </table></div>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-2">Legend</h4>
      <div className="flex flex-wrap gap-3 text-xs">
        {["read","standard","privileged","admin"].map(l=><div key={l} className="flex items-center gap-1"><LvlPill level={l}/>{l}</div>)}
        <div className="flex items-center gap-1"><span className="w-4 h-4 bg-amber-50 rounded ring-1 ring-amber-200"></span>Above profile</div>
        <div className="flex items-center gap-1"><span className="w-4 h-4 bg-red-50 rounded ring-1 ring-red-200"></span>Stale</div>
      </div>
    </div>
  </div>;
}

/* - ROLE DRIFT & REVIEWS - */
function ReviewsTab({users,campaigns,evals,onOpen}){
  const driftUsers=users.filter(u=>u.stale.length>0||u.excess.length>0);
  return <div className="space-y-6">
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><GitBranch className="w-4 h-4 text-red-700"/>
        Role drift - stale or excess entitlements ({driftUsers.length} users)</h3>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-600 uppercase"><tr>
          <th className="px-4 py-3 text-left font-medium">User</th><th className="px-4 py-3 text-left font-medium">Current role</th>
          <th className="px-4 py-3 text-left font-medium">Previous role</th><th className="px-4 py-3 text-left font-medium">Stale</th>
          <th className="px-4 py-3 text-left font-medium">Excess</th><th className="px-4 py-3"></th>
        </tr></thead><tbody className="divide-y divide-slate-100">
          {driftUsers.map(u=><tr key={u.username} className="hover:bg-slate-50 cursor-pointer" onClick={()=>onOpen(u)}>
            <td className="px-4 py-3"><div className="font-medium text-slate-900">{u.displayName}</div><div className="text-xs text-slate-500 font-mono">{u.username}</div></td>
            <td className="px-4 py-3 text-xs"><div>{u.title}</div><div className="text-slate-500">{u.department}</div></td>
            <td className="px-4 py-3 text-xs">{u.previousRoles.length===0?<span className="text-slate-400">-</span>:
              u.previousRoles.map((r,i)=><div key={i}><span className="text-slate-700">{r.title}</span><span className="text-slate-500">  - {r.department}  - until {r.effective_until?.slice(0,10)}</span></div>)}</td>
            <td className="px-4 py-3 text-xs">{u.stale.length===0?<span className="text-slate-400">none</span>:
              u.stale.map(s=><div key={s.system}><span className="font-medium text-red-700">{s.system}</span><span className="text-slate-500">  - {s.level}</span></div>)}</td>
            <td className="px-4 py-3 text-xs">{u.excess.length===0?<span className="text-slate-400">none</span>:
              u.excess.map(s=><div key={s.system}><span className="font-medium text-amber-700">{s.system}</span><span className="text-slate-500">  - {s.level} (expected {s.expected})</span></div>)}</td>
            <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-slate-400"/></td>
          </tr>)}{driftUsers.length===0&&<tr><td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">No role drift detected.</td></tr>}
        </tbody></table>
      </div>
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><UserCheck className="w-4 h-4 text-indigo-700"/>
        Quarterly manager access reviews</h3>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-600 uppercase"><tr>
          <th className="px-4 py-3 text-left font-medium">Employee</th><th className="px-4 py-3 text-left font-medium">Manager</th>
          <th className="px-4 py-3 text-left font-medium">Q4-2025 outcome</th><th className="px-4 py-3 text-left font-medium">Exceptions</th>
          <th className="px-4 py-3 text-left font-medium">Quality flag</th><th className="px-4 py-3"></th>
        </tr></thead><tbody className="divide-y divide-slate-100">
          {users.map(u=>{const r=u.review;const gap=r?.outcome==="Certified"&&(u.stale.length>0||u.excess.length>0);
            const overdue=r?.exceptions_noted?.filter(e=>e.status==="OVERDUE")||[];
            return <tr key={u.username} className="hover:bg-slate-50 cursor-pointer" onClick={()=>onOpen(u)}>
              <td className="px-4 py-3"><div className="font-medium text-slate-900">{u.displayName}</div><div className="text-xs text-slate-500">{u.title}  - {u.department}</div></td>
              <td className="px-4 py-3 text-xs font-mono text-slate-700">{u.manager}</td>
              <td className="px-4 py-3 text-xs">{!r?<span className="text-red-700">No review{u.isNewJoiner&&" (new joiner)"}</span>
                :<><div className={r.outcome==="Certified"?"text-emerald-700 font-medium":r.outcome.includes("exception")?"text-amber-700 font-medium":"text-red-700 font-medium"}>{r.outcome}</div>
                  {r.reviewed_at&&<div className="text-slate-500">{r.reviewed_at.slice(0,10)}</div>}</>}</td>
              <td className="px-4 py-3 text-xs">{overdue.length>0?overdue.map((e,i)=><div key={i} className="text-red-700"><span className="font-medium">{e.system}</span>  - {e.exception}</div>)
                :r?.exceptions_noted?.length>0?<span className="text-amber-700">{r.exceptions_noted.length} noted</span>:<span className="text-slate-400">none</span>}</td>
              <td className="px-4 py-3 text-xs">{gap&&<span className="text-red-700">Certified but drift/excess</span>}
                {r?.notes&&!gap&&<span className="text-amber-700" title={r.notes}>Note</span>}</td>
              <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-slate-400"/></td>
            </tr>;})}
        </tbody></table>
      </div>
    </div>
  </div>;
}

/* - FINDINGS - */
function FindingsTab({findings,onOpen}){
  const byRule={};findings.forEach(f=>{if(!byRule[f.id])byRule[f.id]={rule:f,list:[]};byRule[f.id].list.push(f);});
  const groups=Object.values(byRule).sort((a,b)=>{const o={Critical:0,High:1,Medium:2,Low:3};return o[a.rule.sev]-o[b.rule.sev];});
  return <div className="space-y-4">
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5"/>
      <div><h3 className="font-semibold text-slate-900">Findings by rule</h3>
        <p className="text-sm text-slate-600">{findings.length} findings across {groups.length} rules</p></div>
    </div>
    {groups.map(g=><div key={g.rule.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
        <div><div className="flex items-center gap-2"><span className="text-xs font-mono text-slate-500">{g.rule.id}</span><SevPill s={g.rule.sev}/>
          <span className="text-xs text-slate-500">{g.rule.cat}</span></div>
          <h4 className="font-semibold text-slate-900 mt-1">{g.rule.title}</h4>
          <p className="text-sm text-slate-600 mt-1">{g.rule.fix}</p>
          <div className="text-xs text-slate-500 font-mono mt-1">Evidence: {g.rule.evidence}</div></div>
        <div className="text-right"><div className="text-2xl font-semibold">{g.list.length}</div><div className="text-xs text-slate-500">instance{g.list.length===1?"":"s"}</div></div>
      </div>
      <div className="divide-y divide-slate-100">
        {g.list.map((f,i)=><button key={i} onClick={()=>onOpen(f.user)}
          className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center justify-between">
          <div><div className="font-medium text-slate-900">{f.user.displayName}</div>
            <div className="text-xs text-slate-500">{f.user.title}  - {f.user.department}</div></div>
          <ChevronRight className="w-4 h-4 text-slate-400"/>
        </button>)}
      </div>
    </div>)}
  </div>;
}

/* ===================================================================
   DRAWER - Access-only details
   =================================================================== */

function Drawer({user:u,ev,systems,onClose}){
  const allSys=[...systems];
  if(u.ents.LoanSystem) allSys.push("LoanSystem");

  return <div className="fixed inset-0 z-50">
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}/>
    <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-medium text-slate-700">
            {u.displayName.split(" ").map(p=>p[0]).slice(0,2).join("")}</div>
          <div><div className="flex items-center gap-2"><h2 className="text-lg font-semibold text-slate-900">{u.displayName}</h2>
            <VerdictPill v={ev.verdict}/>
            {u.isExternal&&<span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">External</span>}
            {u.isNewJoiner&&<span className="text-xs px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded">New joiner</span>}
          </div><div className="text-sm text-slate-500">{u.title}  - {u.department}</div></div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
      </div>

      <div className="p-6 space-y-6">
        {/* - Section 1: Identity - */}
        <Sec title="Identity & role" icon={Briefcase}>
          <DL items={[["Employee ID",u.employeeId],["Email",u.email],["Title",u.title],["Department",u.department],
            ["Team",u.team],["Manager",u.manager],["Hired",u.hireDate],["Status",u.employmentStatus]]}/>
          {u.previousRoles.length>0&&<div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <div className="font-medium text-amber-900 text-sm mb-1">Previous role(s)</div>
            {u.previousRoles.map((r,i)=><div key={i} className="text-xs text-amber-800">
              {r.title} - {r.department} - {r.effective_from.slice(0,10)} to {r.effective_until?.slice(0,10)}</div>)}
          </div>}
        </Sec>

        {/* - Section 2: AWS Identity - */}
        <Sec title="AWS identity & credentials" icon={Key}>
          <DL items={[["ARN",u.arn],["Created",u.createDate?.slice(0,10)],
            ["MFA",u.mfaEnabled?"Enabled":"NOT ENABLED"],
            ["AWS policies",u.policies.join(", ")||"-"],["AWS groups",u.groups.join(", ")||"-"],
            ["Password last changed",u.cred.password_last_changed?.slice(0,10)],
            ["Access key rotated",u.cred.access_key_1_last_rotated?.slice(0,10)],
            ["Key last used",u.cred.access_key_1_last_used_date?.slice(0,10)],
            ["Last login",u.cred.password_last_used?.slice(0,10)],
          ]}/>
          {!u.mfaEnabled&&u.privAws&&<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <AlertTriangle className="inline w-4 h-4 mr-1"/>Privileged AWS identity without MFA - critical risk.
          </div>}
        </Sec>

        {/* - Section 3: Cross-System Entitlements - */}
        <Sec title="Cross-system entitlements" icon={Layers}>
          <div className="text-xs text-slate-500 mb-2 font-mono">Role profile: {u.profileKey}</div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs"><thead className="bg-slate-50"><tr>
              <th className="px-3 py-2 text-left font-medium text-slate-600">System</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Expected</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Actual</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Role in system</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Last used</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Flag</th>
            </tr></thead><tbody className="divide-y divide-slate-100">
              {allSys.map(sys=>{const e=u.ents[sys];if(!e) return null;const exp=u.expectedProfile[sys]||"none";
                const over=e.level!=="none"&&LVL[e.level]>LVL[exp];
                return <tr key={sys} className={e.is_stale?"bg-red-50":over?"bg-amber-50":""}>
                  <td className="px-3 py-2 font-medium text-slate-900">{sys}</td>
                  <td className="px-3 py-2 text-slate-600">{exp}</td>
                  <td className="px-3 py-2"><LvlPill level={e.level}/></td>
                  <td className="px-3 py-2 text-slate-700">{e.role_in_system||"-"}</td>
                  <td className="px-3 py-2 text-slate-500">{e.last_used?e.last_used.slice(0,10):"-"}</td>
                  <td className="px-3 py-2">{e.is_stale&&<span className="text-red-700 font-medium">STALE</span>}
                    {over&&!e.is_stale&&<span className="text-amber-700 font-medium">EXCESS</span>}</td>
                </tr>;})}
            </tbody></table>
          </div>
          {Object.entries(u.ents).filter(([,e])=>e.notes).map(([sys,e])=>
            <div key={sys} className="text-xs text-slate-600 mt-1"><span className="font-mono font-medium">{sys}:</span> {e.notes}</div>
          )}
        </Sec>

        {/* - Section 4: Manager Review - */}
        <Sec title="Manager access review" icon={UserCheck}>
          {u.review?<div>
            <DL items={[["Campaign",u.review.campaign_id],["Manager",u.review.manager_display||u.review.manager],
              ["Reviewed at",u.review.reviewed_at?u.review.reviewed_at.slice(0,10):"-"],
              ["Outcome",u.review.outcome],["Systems reviewed",u.review.systems_reviewed?.join(", ")||"-"]]}/>
            {u.review.exceptions_noted?.length>0&&<div className="mt-3">
              <div className="text-xs font-semibold text-slate-700 mb-1">Exceptions</div>
              {u.review.exceptions_noted.map((e,i)=><div key={i} className={`text-xs p-2 rounded border mt-1 ${
                e.status==="OVERDUE"?"bg-red-50 border-red-200 text-red-800":"bg-amber-50 border-amber-200 text-amber-800"}`}>
                <span className="font-medium">{e.system}:</span> {e.exception}  - due {e.remediation_due}  - <span className="font-medium">{e.status}</span></div>)}
            </div>}
            {u.review.notes&&<div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
              <span className="font-medium">Audit note:</span> {u.review.notes}</div>}
          </div>:<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            No manager review on file{u.isNewJoiner&&" - new joiner, pending first review"}.</div>}
        </Sec>

        {/* - Section 5: Recent activity - */}
        {u.sensitiveEvents.length>0&&<Sec title="Sensitive AWS activity (last 7 days)" icon={AlertCircle}>
          <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono space-y-1">
            {u.sensitiveEvents.map((e,i)=><div key={i}>
              <span className="text-slate-500">[{e.EventTime?.slice(0,19)}]</span>{" "}
              <span className="text-red-700 font-medium">{e.EventName}</span>{" "}
              <span className="text-slate-600">from {e.SourceIPAddress}</span>
            </div>)}
          </div>
        </Sec>}

        {/* - Section 6: Findings - */}
        <Sec title="Findings" icon={AlertTriangle}>
          {ev.findings.length===0?<div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800">
            No findings. All controls met.</div>
          :<div className="space-y-2">{ev.findings.map((f,i)=>
            <div key={i} className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2"><SevPill s={f.sev}/><span className="text-xs font-mono text-slate-500">{f.id}</span>
                <span className="text-xs text-slate-500">{f.cat}</span></div>
              <div className="font-medium text-slate-900 mt-1">{f.title}</div>
              <div className="text-xs text-slate-600 mt-1">{f.fix}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">Evidence: {f.evidence}</div>
            </div>)}</div>}
        </Sec>
      </div>
    </div>
  </div>;
}

function Sec({title,icon:I,children}){
  return <section><h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><I className="w-4 h-4 text-slate-500"/>{title}</h3>{children}</section>;
}
function DL({items}){
  return <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
    {items.map(([k,v],i)=><React.Fragment key={i}><dt className="text-slate-500 text-xs">{k}</dt>
      <dd className="text-slate-900 font-mono text-xs break-all">{v||"-"}</dd></React.Fragment>)}
  </dl>;
}

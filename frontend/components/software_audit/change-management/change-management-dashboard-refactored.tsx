// @ts-nocheck
"use client";

import React, { useState, useMemo } from "react";
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Clock, FileText, GitPullRequest,
  Play, Rocket, RotateCcw, Search, ChevronRight, X,
  Layers, Zap, Bell, User, ArrowRight,
  AlertCircle, Terminal, Bot, Database, Workflow, Ticket
} from "lucide-react";

import RAW from "@/lib/software_audit/change-management/raw-data.json";
import controlResults from "@/lib/software_audit/controls-results.json";


const EMG_HOURS = RAW._metadata.thresholds.emergency_cab_post_hoc_window_hours;
const REQ_GATES = RAW._metadata.thresholds.required_testing_gates;

/* ===================================================================
   DATA BUILDING
   =================================================================== */

function hoursBetween(a,b){if(!a||!b)return null;return(new Date(b)-new Date(a))/36e5;}
function inWindow(ts,s,e){const t=new Date(ts).getTime();return t>=new Date(s).getTime()&&t<=new Date(e).getTime();}

function buildChanges(){
  const issues=RAW.change_request_collector.issues;
  const prs=RAW.pull_request_collector.pull_requests;
  const runs=RAW.cicd_evidence_collector.workflow_runs;
  const deps=RAW.deployment_activity_collector.deployments;
  const rbs=RAW.rollback_evidence_collector.records;
  const incs=RAW.servicenow_incident_collector.incidents;
  const snChgs=RAW.servicenow_change_collector.change_requests;
  const alerts=RAW.pagerduty_alert_collector.alerts;
  const sessions=RAW.execution_session_collector.sessions;

  const allKeys=new Set();
  issues.forEach(i=>allKeys.add(i.key));
  deps.forEach(d=>allKeys.add(d.linked_change_key));
  sessions.forEach(s=>allKeys.add(s.linked_change_key));

  const out=[];
  allKeys.forEach(key=>{
    const issue=issues.find(i=>i.key===key);
    const f=issue?.fields;
    const pr=prs.find(p=>p.linked_change_key===key)||null;
    const run=runs.find(r=>r.linked_change_key===key)||null;
    const dep=deps.find(d=>d.linked_change_key===key)||null;
    const rb=rbs.find(r=>r.linked_change_key===key)||null;
    const inc=incs.find(i=>i.linked_change===key)||null;
    const snChg=snChgs.find(c=>c.linked_jira_story===key)||null;
    const alert=alerts.find(a=>a.linked_change_key===key)||null;
    const sess=sessions.find(s=>s.linked_change_key===key)||null;

    out.push({
      key, title:f?.summary||"Change reconstructed from execution log",
      type:f?.issuetype?.name||"UNLOGGED", priority:f?.priority?.name||"Unknown",
      service:f?.customfield_10212||dep?.service||"unknown", risk:f?.customfield_10213||"Unknown",
      environments:f?.customfield_10211||[], requester:f?.reporter?.emailAddress?.split("@")[0]||null,
      created:f?.created, resolved:f?.resolutiondate,
      emergency:f?.customfield_10200?.value==="Emergency",
      cabStatus:f?.customfield_10201||"NO_TICKET", cabApprover:f?.customfield_10202,
      cabApprovedAt:f?.customfield_10203, emergencyApprover:f?.customfield_10204,
      rollbackNarrative:f?.customfield_10210,
      pr,run,dep,rb,inc,snChg,alert,sess,
      executionMode:dep?.execution_mode||"Unknown",
      noTicket:!issue,
    });
  });
  return out;
}

/* ===================================================================
   AUDIT ENGINE - 8 families, all change-focused
   =================================================================== */

function evalChange(c){
  const fams=[];

  // 1. Approval
  const ap={family:"Approval",status:"Met",reason:"",sev:"Info"};
  if(c.noTicket){ap.status="Not Met";ap.sev="Critical";ap.reason="No Jira ticket. No approval trail.";}
  else if(!["APPROVED","POST_HOC_APPROVED","POST_HOC_APPROVED_LATE"].includes(c.cabStatus)){
    ap.status="Not Met";ap.sev="High";ap.reason=`CAB status = ${c.cabStatus}`;
  } else if(c.emergency){
    const h=hoursBetween(c.created,c.cabApprovedAt);
    if(h!==null&&h>EMG_HOURS){ap.status="Not Met";ap.sev="High";ap.reason=`Post-hoc CAB ${h.toFixed(1)}h (threshold ${EMG_HOURS}h)`;}
    else{ap.reason=`Post-hoc CAB ${h?.toFixed(1)||"?"}h (within window)`;}
  } else{ap.reason=`CAB approved ${c.cabApprovedAt?.slice(0,10)} by ${c.cabApprover}`;}

  if(c.emergency&&!c.alert&&!c.inc){
    ap.status=ap.status==="Met"?"Requires Review":ap.status;
    ap.reason="Emergency label without alert or incident evidence. "+ap.reason;ap.sev=ap.sev==="Info"?"High":ap.sev;
  }
  fams.push(ap);

  // 2. SoD
  const sd={family:"Separation of Duties",status:"Met",reason:"",sev:"Info"};
  if(c.pr&&c.dep){
    const a=c.pr.user.login,d=c.dep.deployed_by,cmd=c.dep.command_executed_by;
    if(a===d||a===cmd){sd.status="Not Met";sd.sev="High";sd.reason=`PR author (${a}) also deployed`;}
    else{sd.reason=`Author ${a} separated from deployer ${d}`;}
  } else if(!c.pr&&c.dep){sd.status="Not Met";sd.sev="Critical";sd.reason="No PR - deployed without code review.";}
  fams.push(sd);

  // 3. Testing
  const ts={family:"Testing",status:"Met",reason:"",sev:"Info"};
  if(!c.run){ts.status="Not Met";ts.sev="Critical";ts.reason="No CI/CD pipeline evidence.";}
  else{
    const gs={};c.run.stages.forEach(s=>{gs[s.name]=s.conclusion;});
    const miss=REQ_GATES.filter(g=>gs[g]!=="success");
    if(miss.length>0){ts.status="Not Met";ts.sev="High";ts.reason=miss.map(g=>`${g}=${gs[g]||"missing"}`).join("; ");}
    else{ts.reason="All required gates passed";}
  }
  fams.push(ts);

  // 4. Freeze
  const fr={family:"Freeze Adherence",status:"Met",reason:"Outside freeze windows",sev:"Info"};
  if(c.dep){
    const hit=RAW.freeze_window_collector.freeze_windows.find(w=>
      w.applicable_environments.includes(c.dep.environment)&&inWindow(c.dep.timestamp,w.start,w.end));
    if(hit){
      const exc=RAW.freeze_window_collector.exceptions.find(e=>
        e.linked_change_key===c.key&&e.freeze_window_id===hit.id&&e.status==="APPROVED");
      if(exc){fr.reason=`Inside ${hit.id} - covered by ${exc.id}`;}
      else{fr.status="Not Met";fr.sev="High";fr.reason=`Deployed inside ${hit.id}, no exception`;}
    }
  }
  fams.push(fr);

  // 5. Rollback
  const rb={family:"Rollback",status:"Met",reason:"",sev:"Info"};
  if(!c.rb){rb.status="Not Met";rb.sev="High";rb.reason="No rollback evidence.";}
  else if(!c.rb.rollback_plan_present){rb.status="Not Met";rb.sev="High";rb.reason="Plan not documented.";}
  else if(!c.rb.rollback_tested){rb.status="Requires Review";rb.sev="Medium";rb.reason="Plan documented but not validated in pre-prod.";}
  else{rb.reason=`Validated in ${c.rb.rollback_tested_in} on ${c.rb.rollback_tested_at?.slice(0,10)}`;}
  fams.push(rb);

  // 6. Incident Evidence (only for incident-driven / emergency changes)
  const ie={family:"Incident Evidence",status:"Met",reason:"Routine change (not incident-driven)",sev:"Info"};
  if(c.emergency){
    if(!c.alert&&!c.inc){ie.status="Not Met";ie.sev="High";ie.reason="Emergency claim with no alert and no incident.";}
    else if(!c.alert){ie.status="Requires Review";ie.sev="Medium";ie.reason="Incident exists but no PagerDuty alert.";}
    else if(!c.inc){ie.status="Requires Review";ie.sev="Medium";ie.reason="Alert exists but no ServiceNow incident.";}
    else{ie.reason=`Alert ${c.alert.id} to Incident ${c.inc.number} to ${c.key}`;}
  } else if(c.inc){ie.reason=`Incident-driven: ${c.inc.number}`;}
  fams.push(ie);

  // 7. Process Chain
  const pc={family:"Process Chain",status:"Met",reason:"Full chain present",sev:"Info"};
  if(c.noTicket){pc.status="Not Met";pc.sev="Critical";pc.reason="Direct change - no Jira, no SN, no PR, no pipeline. Reconstructed from logs.";}
  else if(c.executionMode==="ManualBastion"||c.executionMode==="ManualConsole"){
    pc.status="Requires Review";pc.sev="Medium";pc.reason=`Executed via ${c.executionMode} instead of pipeline.`;}
  fams.push(pc);

  // 8. Execution Session
  const es={family:"Execution Session",status:"Met",reason:"",sev:"Info"};
  if(!c.sess){es.status="Not Met";es.sev="High";es.reason="No execution session recorded.";}
  else if(c.sess.auth_identity_type==="ServiceAccount"){es.reason=`Automated: ${c.sess.authenticated_user} via ${c.sess.auth_method}`;}
  else{
    es.reason=`Actor: ${c.sess.authenticated_user} via ${c.sess.auth_method}`;
    if(c.sess.flag){es.status="Not Met";es.sev="Critical";es.reason+=` - Flag: ${c.sess.flag}`;}
  }
  fams.push(es);

  let overall="Met";
  if(fams.some(f=>f.status==="Not Met")) overall="Not Met";
  else if(fams.some(f=>f.status==="Requires Review")) overall="Requires Review";

  return {families:fams,overall};
}

/* ===================================================================
   UI COMPONENTS
   =================================================================== */

const PILL={
  "Met":"bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Not Met":"bg-red-50 text-red-700 ring-red-200",
  "Requires Review":"bg-amber-50 text-amber-700 ring-amber-200",
};
const SEV_CLS={Critical:"bg-red-100 text-red-800 ring-red-300",High:"bg-red-50 text-red-700 ring-red-200",
  Medium:"bg-amber-50 text-amber-700 ring-amber-200",Info:"bg-slate-50 text-slate-600 ring-slate-200"};

function VP({v}){
  const ic=v==="Met"?<CheckCircle2 className="w-3 h-3"/>:v==="Not Met"?<XCircle className="w-3 h-3"/>:<AlertTriangle className="w-3 h-3"/>;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ring-1 ${PILL[v]}`}>{ic}{v}</span>;
}
function SP({s}){return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ring-1 ${SEV_CLS[s]||SEV_CLS.Info}`}>{s}</span>;}

function ExecBadge({mode}){
  const m={Pipeline:{l:"Pipeline",c:"bg-emerald-50 text-emerald-700 ring-emerald-200",I:Bot},
    ManualConsole:{l:"Manual console",c:"bg-amber-50 text-amber-700 ring-amber-200",I:User},
    ManualBastion:{l:"Bastion SSH",c:"bg-red-50 text-red-700 ring-red-200",I:Terminal},
    Unknown:{l:"Unknown",c:"bg-slate-50 text-slate-700 ring-slate-200",I:AlertCircle}};
  const x=m[mode]||m.Unknown;return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ring-1 ${x.c}`}><x.I className="w-3 h-3"/>{x.l}</span>;
}

/* ===================================================================
   MAIN
   =================================================================== */

export default function ChangeManagementDashboard(){
  const changes=useMemo(()=>buildChanges(),[]);
  const evals=useMemo(()=>{const o={};changes.forEach(c=>{o[c.key]=evalChange(c);});return o;},[changes]);
  const [tab,setTab]=useState("overview");
  const [sel,setSel]=useState(null);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");

  const meta=RAW._metadata;
  const total=changes.length;
  const met=changes.filter(c=>evals[c.key].overall==="Met").length;
  const notMet=changes.filter(c=>evals[c.key].overall==="Not Met").length;
  const review=changes.filter(c=>evals[c.key].overall==="Requires Review").length;
  const emergencies=changes.filter(c=>c.emergency).length;
  const fakeEmergencies=changes.filter(c=>c.emergency&&!c.alert&&!c.inc).length;
  const noTickets=changes.filter(c=>c.noTicket).length;
  const manualExec=changes.filter(c=>["ManualBastion","ManualConsole"].includes(c.executionMode)||c.noTicket).length;
  const withIncident=changes.filter(c=>c.inc||c.alert).length;
  const withoutIncident=changes.filter(c=>!c.inc&&!c.alert).length;

  const filtered=changes.filter(c=>{
    const s=search.toLowerCase();
    if(s&&!c.key.toLowerCase().includes(s)&&!c.title.toLowerCase().includes(s)&&!c.service.toLowerCase().includes(s)) return false;
    if(filter==="notmet") return evals[c.key].overall==="Not Met";
    if(filter==="review") return evals[c.key].overall==="Requires Review";
    if(filter==="emergency") return c.emergency;
    if(filter==="noticket") return c.noTicket;
    if(filter==="manual") return c.executionMode!=="Pipeline";
    if(filter==="incident") return c.inc||c.alert;
    return true;
  });

  const TABS=[
    {id:"overview",label:"Overview",icon:Shield},
    {id:"register",label:"Change Register",icon:FileText},
    {id:"chain",label:"Process Chain",icon:Workflow},
    {id:"panels",label:"Control Panels",icon:Layers},
    {id:"findings",label:"Findings",icon:AlertTriangle},
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-indigo-700"/></div>
            <div><h1 className="text-xl font-semibold text-slate-900">Change Management & Release Controls</h1>
              <p className="text-sm text-slate-500">{meta.organization}  - {meta.audit_engagement}</p></div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Period: {meta.audit_period.start} to {meta.audit_period.end}</div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex gap-1">
          {TABS.map(t=>{const I=t.icon;return(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${tab===t.id?"border-indigo-600 text-indigo-700":"border-transparent text-slate-500 hover:text-slate-800"}`}>
              <I className="w-4 h-4"/>{t.label}
            </button>);})}
        </div>
      </nav>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {tab==="overview"&&<OverviewTab total={total} met={met} notMet={notMet} review={review}
          emergencies={emergencies} fakeEmergencies={fakeEmergencies} noTickets={noTickets}
          manualExec={manualExec} withIncident={withIncident} withoutIncident={withoutIncident}
          changes={changes} evals={evals} onOpen={setSel}/>}
        {tab==="register"&&<RegisterTab changes={filtered} evals={evals}
          search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} onOpen={setSel}/>}
        {tab==="chain"&&<ChainTab changes={changes} evals={evals} onOpen={setSel}/>}
        {tab==="panels"&&<PanelsTab changes={changes} evals={evals} onOpen={setSel}/>}
        {tab==="findings"&&<FindingsTab changes={changes} evals={evals} onOpen={setSel}/>}
      </main>

      {sel&&<ChangeDrawer change={sel} ev={evals[sel.key]} onClose={()=>setSel(null)}/>}
    </div>
  );
}

function SC({label,sub,value,icon:I,accent}){
  const a={indigo:"bg-indigo-50 text-indigo-700",emerald:"bg-emerald-50 text-emerald-700",red:"bg-red-50 text-red-700",amber:"bg-amber-50 text-amber-700"};
  return <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-start justify-between">
    <div><div className="text-xs text-slate-500">{label}</div>{sub&&<div className="text-xs text-slate-400">{sub}</div>}
      <div className="text-3xl font-semibold text-slate-900 mt-2">{value}</div></div>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a[accent]}`}><I className="w-4 h-4"/></div>
  </div>;
}

const CHANGE_CONTROL_RESULTS = controlResults.changeManagement;

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
function OverviewTab({total,met,notMet,review,emergencies,fakeEmergencies,noTickets,manualExec,withIncident,withoutIncident,changes,evals,onOpen}){
  const failing=changes.filter(c=>evals[c.key].overall==="Not Met").slice(0,5);
  return <div className="space-y-6">
    <div className="grid grid-cols-4 gap-4">
      <SC label="Changes reviewed" value={total} icon={FileText} accent="indigo"/>
      <SC label="Met" value={met} icon={CheckCircle2} accent="emerald"/>
      <SC label="Not Met" value={notMet} icon={XCircle} accent="red"/>
      <SC label="Requires Review" value={review} icon={AlertTriangle} accent="amber"/>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Change patterns</h3>
      <div className="grid grid-cols-4 gap-4">
        <SC label="Emergency changes" value={emergencies} icon={Zap} accent="amber"/>
        <SC label="Fake emergencies" sub="No alert or incident" value={fakeEmergencies} icon={AlertCircle} accent="red"/>
        <SC label="Direct engineer changes" sub="No Jira / no pipeline" value={noTickets} icon={Terminal} accent="red"/>
        <SC label="Manual execution" sub="Bypassed pipeline" value={manualExec} icon={User} accent="amber"/>
      </div>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Incident linkage</h3>
      <div className="grid grid-cols-4 gap-4">
        <SC label="Incident-driven" sub="With alert or SN incident" value={withIncident} icon={Bell} accent="indigo"/>
        <SC label="Routine (no incident)" value={withoutIncident} icon={FileText} accent="indigo"/>
      </div>
    </div>

    <ControlsResultsTable data={CHANGE_CONTROL_RESULTS} />

    {failing.length>0&&<div className="bg-white rounded-lg border border-red-200">
      <div className="px-5 py-3 bg-red-50 border-b border-red-200 rounded-t-lg flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-700"/><span className="font-semibold text-red-900">Changes failing controls</span>
      </div>
      <div className="divide-y divide-slate-100">
        {failing.map(c=>{const ev=evals[c.key];const bad=ev.families.filter(f=>f.status==="Not Met");
          return <button key={c.key} onClick={()=>onOpen(c)} className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center justify-between">
            <div><div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">{c.key}</span>
              {c.emergency&&<span className="text-xs px-1 py-0.5 bg-red-100 text-red-800 rounded font-medium">Emergency</span>}
              {c.noTicket&&<span className="text-xs px-1 py-0.5 bg-red-200 text-red-900 rounded font-medium">No ticket</span>}
            </div><div className="font-medium text-slate-900 mt-0.5">{c.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">Failing: {bad.map(f=>f.family).join("  - ")}</div></div>
            <ChevronRight className="w-4 h-4 text-slate-400"/>
          </button>;})}
      </div>
    </div>}

    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Evidence collectors</h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {Object.entries(RAW).filter(([k])=>k!=="_metadata").map(([name,data])=>
          <div key={name} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
            <Database className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0"/>
            <div><div className="font-mono text-slate-800">{name}</div>
              <div className="text-slate-500 font-mono break-all">{data?._api||"-"}</div></div>
          </div>)}
      </div>
    </div>
  </div>;
}

/* - REGISTER - */
function RegisterTab({changes,evals,search,setSearch,filter,setFilter,onOpen}){
  return <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search key, title, service..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
      <select value={filter} onChange={e=>setFilter(e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
        <option value="all">All changes</option><option value="notmet">Not Met</option>
        <option value="review">Requires Review</option><option value="emergency">Emergency</option>
        <option value="noticket">No ticket</option><option value="manual">Manual execution</option>
        <option value="incident">Incident-driven</option>
      </select>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-600 uppercase"><tr>
          <th className="px-3 py-3 text-left font-medium">Change</th>
          <th className="px-3 py-3 text-left font-medium">Title</th>
          <th className="px-3 py-3 text-left font-medium">Service</th>
          <th className="px-3 py-3 text-left font-medium">Type</th>
          <th className="px-3 py-3 text-left font-medium">Incident</th>
          <th className="px-3 py-3 text-left font-medium">Alert</th>
          <th className="px-3 py-3 text-left font-medium">Execution</th>
          <th className="px-3 py-3 text-left font-medium">Verdict</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {changes.map(c=>{const ev=evals[c.key];return(
            <tr key={c.key} className="hover:bg-slate-50 cursor-pointer" onClick={()=>onOpen(c)}>
              <td className="px-3 py-2"><div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-medium text-slate-900">{c.key}</span>
                {c.emergency&&<Zap className="w-3 h-3 text-red-600"/>}</div></td>
              <td className="px-3 py-2 max-w-xs"><div className="font-medium text-slate-900 truncate">{c.title}</div>
                {c.noTicket&&<div className="text-xs text-red-600">Reconstructed from logs</div>}</td>
              <td className="px-3 py-2 text-xs font-mono text-slate-700">{c.service}</td>
              <td className="px-3 py-2 text-xs text-slate-600">{c.type}</td>
              <td className="px-3 py-2 text-xs">{c.inc?<span className="font-mono text-slate-700">{c.inc.number}</span>:<span className="text-slate-400">-</span>}</td>
              <td className="px-3 py-2 text-xs">{c.alert?<span className="font-mono text-slate-700">{c.alert.id}</span>:<span className="text-slate-400">-</span>}</td>
              <td className="px-3 py-2 text-xs"><ExecBadge mode={c.executionMode}/></td>
              <td className="px-3 py-2"><VP v={ev.overall}/></td>
            </tr>);})}
        </tbody>
      </table></div>
    </div>
  </div>;
}

/* - PROCESS CHAIN - */
function ChainTab({changes,evals,onOpen}){
  return <div className="space-y-4">
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-3">
      <Workflow className="w-5 h-5 text-indigo-700 mt-0.5"/>
      <div><h3 className="font-semibold text-slate-900">Process Chain - end-to-end evidence trail</h3>
        <p className="text-sm text-slate-600 mt-1">Green = present  - Red dashed = missing  - Grey = not applicable.</p></div>
    </div>
    {changes.map(c=>{const ev=evals[c.key];return(
      <div key={c.key} className="bg-white rounded-lg border border-slate-200 p-4 hover:border-indigo-300 cursor-pointer" onClick={()=>onOpen(c)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-medium text-slate-900">{c.key}</span>
            {c.emergency&&<Zap className="w-3.5 h-3.5 text-red-600"/>}
            <span className="text-sm text-slate-700 truncate max-w-md">{c.title}</span></div>
          <VP v={ev.overall}/></div>
        <ChainRow c={c}/>
      </div>);})}
  </div>;
}

function ChainRow({c}){
  const nodes=[
    {l:"Alert",present:!!c.alert,detail:c.alert?c.alert.id:null,req:c.emergency},
    {l:"Incident",present:!!c.inc,detail:c.inc?c.inc.number:null,req:c.emergency},
    {l:"Jira",present:!c.noTicket,detail:c.noTicket?null:c.key,req:true},
    {l:"SN Change",present:!!c.snChg,detail:c.snChg?c.snChg.number:null,req:c.emergency||c.risk==="Critical"},
    {l:"PR",present:!!c.pr,detail:c.pr?`#${c.pr.number}`:null,req:!c.noTicket},
    {l:"Pipeline",present:!!c.run,detail:c.run?`run ${c.run.id}`:null,req:!c.noTicket},
    {l:"Deploy",present:!!c.dep,detail:c.dep?c.dep.environment:null,req:true},
  ];
  return <div className="flex items-center gap-1 overflow-x-auto">
    {nodes.map((n,i)=>{
      const show=n.req||n.present;
      return <React.Fragment key={n.l}>
        <div className="flex flex-col items-center">
          <div className={`w-20 py-2 px-2 text-center rounded border text-xs font-medium ${
            !show?"border-dashed border-slate-400 bg-slate-100 text-slate-600":
            n.present?"border-emerald-300 bg-emerald-50 text-emerald-800":"border-red-300 border-dashed bg-red-50 text-red-800"}`}>{n.l}</div>
          <div className={`text-xs mt-1 font-mono truncate w-24 text-center ${n.present ? "text-slate-600" : "text-red-700 font-semibold"}`}>
            {n.detail || (n.present ? "ok" : "missing")}
          </div>
        </div>
        {i<nodes.length-1&&<ArrowRight className="w-3 h-3 text-slate-400 mx-1 shrink-0"/>}
      </React.Fragment>;
    })}
  </div>;
}

/* - CONTROL PANELS - */
function PanelsTab({changes,evals,onOpen}){
  const fams=["Approval","Separation of Duties","Testing","Freeze Adherence","Rollback",
              "Incident Evidence","Process Chain","Execution Session"];
  return <div className="space-y-6">
    {fams.map(fam=>{
      const rows=changes.map(c=>{const fe=evals[c.key].families.find(f=>f.family===fam);return{c,fe};});
      const cnt={M:rows.filter(r=>r.fe?.status==="Met").length,N:rows.filter(r=>r.fe?.status==="Not Met").length,
        R:rows.filter(r=>r.fe?.status==="Requires Review").length};
      return <div key={fam} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div><h3 className="font-semibold text-slate-900">{fam}</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              <span className="text-emerald-700">{cnt.M} Met</span> - 
              <span className="text-red-700 ml-1">{cnt.N} Not Met</span> - 
              <span className="text-amber-700 ml-1">{cnt.R} Review</span></div></div>
        </div>
        <div className="divide-y divide-slate-100">
          {rows.map(({c,fe})=><button key={c.key} onClick={()=>onOpen(c)}
            className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center justify-between">
            <div className="flex-1"><div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">{c.key}</span>
              <span className="text-sm font-medium text-slate-900 truncate">{c.title}</span></div>
              <div className="text-xs text-slate-600 mt-0.5">{fe?.reason||"-"}</div></div>
            <div className="flex items-center gap-2"><SP s={fe?.sev||"Info"}/><VP v={fe?.status||"Met"}/>
              <ChevronRight className="w-4 h-4 text-slate-400"/></div>
          </button>)}
        </div>
      </div>;})}
  </div>;
}

/* - FINDINGS - */
function FindingsTab({changes,evals,onOpen}){
  const all=[];changes.forEach(c=>{evals[c.key].families.forEach(f=>{
    if(f.status!=="Met") all.push({c,family:f.family,status:f.status,sev:f.sev,reason:f.reason});
  });});
  const ord={Critical:0,High:1,Medium:2,Info:3};all.sort((a,b)=>ord[a.sev]-ord[b.sev]);
  return <div className="space-y-3">
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5"/>
      <div><h3 className="font-semibold text-slate-900">All findings ({all.length})</h3>
        <p className="text-sm text-slate-600">Sorted by severity. Click to see full evidence.</p></div>
    </div>
    {all.map((f,i)=><button key={i} onClick={()=>onOpen(f.c)}
      className="w-full text-left bg-white rounded-lg border border-slate-200 p-4 hover:border-indigo-300">
      <div className="flex items-start justify-between"><div className="flex-1">
        <div className="flex items-center gap-2"><SP s={f.sev}/><VP v={f.status}/>
          <span className="text-xs font-mono text-slate-500">{f.c.key}</span>
          <span className="text-xs text-slate-500"> - {f.family}</span></div>
        <div className="font-medium text-slate-900 mt-1">{f.c.title}</div>
        <div className="text-sm text-slate-600 mt-1">{f.reason}</div></div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0"/></div>
    </button>)}
  </div>;
}

/* ===================================================================
   DRAWER - Change-only details. No access governance.
   =================================================================== */

function ChangeDrawer({change:c,ev,onClose}){
  return <div className="fixed inset-0 z-50">
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}/>
    <div className="absolute right-0 top-0 bottom-0 w-full max-w-4xl bg-white shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div><div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium text-slate-900">{c.key}</span>
            <VP v={ev.overall}/>
            {c.emergency&&<span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">Emergency</span>}
            {c.noTicket&&<span className="text-xs px-2 py-0.5 bg-red-200 text-red-900 rounded font-medium">No ticket</span>}
          </div><h2 className="text-lg font-semibold text-slate-900 mt-1">{c.title}</h2>
            <div className="text-xs text-slate-500 mt-1">{c.service}  - {c.type}  - Risk: {c.risk}</div></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. Process Chain */}
        <Sec title="Process chain" icon={Workflow}><ChainRow c={c}/></Sec>

        {/* 2. Patch Timeline */}
        <TimelineSection c={c}/>

        {/* 3. Approval / CAB */}
        <Sec title="Approval / CAB" icon={CheckCircle2}>
          {c.noTicket?<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            No Jira ticket. No approval trail for this change.</div>
          :<DL items={[["CAB status",c.cabStatus],["CAB approver",c.cabApprover],
            ["CAB approved at",c.cabApprovedAt],["Emergency approver",c.emergencyApprover],
            ["Requester",c.requester],["Created",c.created],["Resolved",c.resolved]]}/>}
        </Sec>

        {/* 4. Code review / SoD */}
        <Sec title="Code review & separation of duties" icon={GitPullRequest}>
          {c.pr?<div>
            <DL items={[["PR number",`#${c.pr.number}`],["Repository",c.pr.repository?.full_name],
              ["Branch",c.pr.head?.ref],["Author",c.pr.user?.login],
              ["Reviewers",c.pr.reviews?.map(r=>r.user.login).join(", ")],
              ["Merged by",c.pr.merged_by?.login],["Merged at",c.pr.merged_at]]}/>
            {c.pr.user?.login===c.dep?.deployed_by&&<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <AlertTriangle className="inline w-4 h-4 mr-1"/>SoD violation: PR author ({c.pr.user.login}) also executed the deployment.</div>}
          </div>:<div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600">No pull request for this change.</div>}
        </Sec>

        {/* 5. Testing */}
        <Sec title="Testing / pipeline" icon={Play}>
          {c.run?<div>
            <DL items={[["Run ID",c.run.id],["Conclusion",c.run.conclusion],["Started",c.run.run_started_at],["Completed",c.run.updated_at]]}/>
            <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs"><thead className="bg-slate-50"><tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Stage</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Required</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Result</th>
              </tr></thead><tbody className="divide-y divide-slate-100">
                {c.run.stages.map((s,i)=><tr key={i} className={s.conclusion==="skipped"?"bg-red-50":""}>
                  <td className="px-3 py-2 font-mono text-slate-900">{s.name}</td>
                  <td className="px-3 py-2 text-slate-600">{REQ_GATES.includes(s.name)?"yes":"no"}</td>
                  <td className="px-3 py-2"><span className={s.conclusion==="success"?"text-emerald-700 font-medium":
                    s.conclusion==="skipped"?"text-red-700 font-medium":"text-slate-700"}>{s.conclusion}</span></td>
                </tr>)}
              </tbody></table>
            </div>
          </div>:<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            No CI/CD pipeline evidence for this change.</div>}
        </Sec>

        {/* 6. Deployment */}
        <Sec title="Deployment" icon={Rocket}>
          {c.dep?<DL items={[["Deployment ID",c.dep.id],["Environment",c.dep.environment],
            ["Release version",c.dep.release_version],["Deployed by",c.dep.deployed_by],
            ["Actor type",c.dep.actor_type],["Command actor",c.dep.command_executed_by],
            ["Timestamp",c.dep.timestamp],["Source IP",c.dep.source_ip],
            ["Execution mode",c.executionMode]]}/>
          :<div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600">No deployment record.</div>}
        </Sec>

        {/* 7. Freeze */}
        <Sec title="Freeze adherence" icon={Clock}>
          {(()=>{const fam=ev.families.find(f=>f.family==="Freeze Adherence");
            return <div className={`p-3 rounded border ${fam.status==="Met"?"bg-emerald-50 border-emerald-200 text-emerald-800":"bg-red-50 border-red-200 text-red-800"}`}>
              <VP v={fam.status}/> <span className="ml-2 text-sm">{fam.reason}</span></div>;})()}
        </Sec>

        {/* 8. Rollback */}
        <Sec title="Rollback evidence" icon={RotateCcw}>
          {c.rb?<div>
            <DL items={[["Plan present",c.rb.rollback_plan_present?"yes":"no"],
              ["Tested",c.rb.rollback_tested?"yes":"no"],
              ["Tested at",c.rb.rollback_tested_at],["Tested in",c.rb.rollback_tested_in],
              ["Validator",c.rb.rollback_validator]]}/>
            {c.rb.rollback_steps&&<div className="mt-2 text-xs text-slate-700"><span className="font-medium">Steps:</span> {c.rb.rollback_steps}</div>}
          </div>:<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">No rollback evidence on file.</div>}
        </Sec>

        {/* 9. Incident context (only if present) */}
        {c.inc&&<Sec title="Incident context (ServiceNow)" icon={AlertCircle}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div><div className="font-mono text-sm font-semibold text-red-900">{c.inc.number}</div>
                <div className="text-sm text-slate-900 mt-0.5">{c.inc.short_description}</div></div>
              <div className="text-right text-xs"><div>Priority: {c.inc.priority}</div><div>State: {c.inc.state}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">Opened:</span> <span className="font-mono">{c.inc.opened_at}</span></div>
              <div><span className="text-slate-500">Resolved:</span> <span className="font-mono">{c.inc.resolved_at}</span></div>
              <div><span className="text-slate-500">Assigned to:</span> <span className="font-mono">{c.inc.assigned_to}</span></div>
              <div><span className="text-slate-500">Service:</span> <span className="font-mono">{c.inc.business_service}</span></div>
            </div>
            {c.inc.work_notes&&<div>
              <div className="text-xs font-semibold text-slate-700 mb-1">Work notes</div>
              <div className="bg-white rounded border border-slate-200 p-2 text-xs font-mono space-y-0.5 max-h-48 overflow-y-auto">
                {c.inc.work_notes.map((n,i)=><div key={i}>
                  <span className="text-slate-500">[{n.at.slice(11,16)}]</span>{" "}
                  <span className="text-indigo-700">{n.by}:</span>{" "}
                  <span className="text-slate-700">{n.note}</span></div>)}
              </div>
            </div>}
          </div>
        </Sec>}

        {/* 10. Alert evidence (only if present or if emergency with no alert) */}
        {(c.alert||c.emergency)&&<Sec title="Alert evidence (PagerDuty)" icon={Bell}>
          {c.alert?<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <div><div className="font-mono text-sm font-semibold text-amber-900">{c.alert.id}</div>
                <div className="text-sm text-slate-900 mt-0.5">{c.alert.alert_key}</div></div>
              <SP s={c.alert.severity==="critical"?"Critical":"High"}/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-slate-500">Triggered:</span> <span className="font-mono">{c.alert.triggered_at}</span></div>
              <div><span className="text-slate-500">Acknowledged:</span> <span className="font-mono">{c.alert.acknowledged_at}</span></div>
              <div><span className="text-slate-500">Resolved:</span> <span className="font-mono">{c.alert.resolved_at}</span></div>
              <div><span className="text-slate-500">Responder:</span> <span className="font-mono">{c.alert.responder?.login}</span></div>
            </div>
            <div className="pt-2 border-t border-amber-200">
              <div className="text-slate-500">Monitoring source:</div>
              <div className="font-mono text-slate-800">{c.alert.monitoring_source}</div></div>
          </div>:<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <AlertTriangle className="inline w-4 h-4 mr-1"/>No PagerDuty alert found. Emergency label is not supported by monitoring evidence.</div>}
        </Sec>}

        {/* 11. Execution session - WHO ran it, HOW, FROM WHERE */}
        <Sec title="Execution session" icon={Terminal}>
          {c.sess?<div className={`rounded-lg p-4 space-y-3 ${c.sess.flag?"bg-red-50 border border-red-200":"bg-slate-50 border border-slate-200"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {c.sess.auth_identity_type==="User"?<User className="w-4 h-4 text-slate-600"/>:<Bot className="w-4 h-4 text-slate-600"/>}
                <span className="font-mono font-semibold text-slate-900">{c.sess.authenticated_user}</span>
                <span className="text-xs px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-600">{c.sess.auth_identity_type}</span>
              </div>
              {c.sess.flag&&<span className="text-xs px-2 py-1 bg-red-200 text-red-900 rounded font-medium">{c.sess.flag}</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">Session ID:</span> <span className="font-mono">{c.sess.session_id}</span></div>
              <div><span className="text-slate-500">Auth method:</span> <span className="font-mono">{c.sess.auth_method}</span></div>
              <div><span className="text-slate-500">Source IP:</span> <span className="font-mono">{c.sess.source_ip}</span></div>
              <div><span className="text-slate-500">Source system:</span> <span className="font-mono">{c.sess.source_system}</span></div>
              <div><span className="text-slate-500">Target system:</span> <span className="font-mono">{c.sess.target_system}</span></div>
              <div><span className="text-slate-500">Session window:</span> <span className="font-mono">{c.sess.session_start?.slice(11,19)} to {c.sess.session_end?.slice(11,19)}</span></div>
            </div>
            {c.sess.actions&&<div>
              <div className="text-xs font-semibold text-slate-700 mb-1">Actions in session</div>
              <div className="bg-white rounded border border-slate-200 p-2 text-xs font-mono space-y-0.5">
                {c.sess.actions.map((a,i)=><div key={i}>
                  <span className="text-slate-500">[{a.at?.slice(11,19)}]</span>{" "}
                  <span className="text-indigo-700">{a.action}</span>{" "}
                  <span className="text-slate-700">to {a.target}</span>{" "}
                  <span className={a.result==="success"?"text-emerald-700":"text-red-700"}>({a.result})</span></div>)}
              </div>
            </div>}
            <div className="text-xs text-slate-500"><span className="font-medium">Audit source:</span> {c.sess.audit_source}</div>
          </div>:<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">No execution session recorded.</div>}
        </Sec>

        {/* 12. Control family verdict summary */}
        <Sec title="Control family verdicts" icon={Layers}>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-600 uppercase"><tr>
              <th className="px-3 py-2 text-left font-medium">Family</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Severity</th>
              <th className="px-3 py-2 text-left font-medium">Reason</th>
            </tr></thead><tbody className="divide-y divide-slate-100">
              {ev.families.map((f,i)=><tr key={i} className={f.status!=="Met"?"bg-slate-50":""}>
                <td className="px-3 py-2 font-medium text-slate-900">{f.family}</td>
                <td className="px-3 py-2"><VP v={f.status}/></td>
                <td className="px-3 py-2"><SP s={f.sev}/></td>
                <td className="px-3 py-2 text-xs text-slate-600">{f.reason}</td>
              </tr>)}
            </tbody></table>
          </div>
        </Sec>
      </div>
    </div>
  </div>;
}

/* - Timeline - */
function TimelineSection({c}){
  const events=[];
  if(c.alert){events.push({t:c.alert.triggered_at,l:"Alert triggered",by:"PagerDuty",color:"red"});
    events.push({t:c.alert.acknowledged_at,l:"Alert acknowledged",by:c.alert.responder?.login,color:"amber"});}
  if(c.inc){events.push({t:c.inc.opened_at,l:"Incident opened",by:c.inc.opened_by,color:"red"});}
  if(c.created) events.push({t:c.created,l:"Jira raised",by:c.requester,color:"indigo"});
  if(c.cabApprovedAt) events.push({t:c.cabApprovedAt,l:"CAB approved",by:c.cabApprover,color:"emerald"});
  if(c.pr?.merged_at) events.push({t:c.pr.merged_at,l:"PR merged",by:c.pr.merged_by?.login,color:"indigo"});
  if(c.run?.updated_at) events.push({t:c.run.updated_at,l:"Pipeline complete",by:c.run.triggering_actor?.login,color:"emerald"});
  if(c.dep?.timestamp) events.push({t:c.dep.timestamp,l:`Deployed to ${c.dep.environment}`,by:c.dep.command_executed_by,color:"emerald"});
  if(c.inc?.resolved_at) events.push({t:c.inc.resolved_at,l:"Incident resolved",by:c.inc.resolved_by,color:"emerald"});
  if(c.alert?.resolved_at) events.push({t:c.alert.resolved_at,l:"Alert cleared",by:"auto",color:"emerald"});
  events.sort((a,b)=>new Date(a.t)-new Date(b.t));

  if(events.length===0) return null;

  const colors={red:"bg-red-100 text-red-700",amber:"bg-amber-100 text-amber-700",indigo:"bg-indigo-100 text-indigo-700",emerald:"bg-emerald-100 text-emerald-700"};
  return <Sec title="Patch timeline" icon={Clock}>
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <ol className="relative border-l-2 border-slate-200 ml-3 space-y-3">
        {events.map((e,i)=><li key={i} className="ml-6">
          <div className={`absolute -left-3 w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-bold ${colors[e.color]}`}>
            {i+1}</div>
          <div className="text-xs font-mono text-slate-500">{new Date(e.t).toISOString().slice(0,19).replace("T"," ")}Z</div>
          <div className="text-sm font-medium text-slate-900 mt-0.5">{e.l}</div>
          {e.by&&<div className="text-xs text-slate-500">by {e.by}</div>}
        </li>)}
      </ol>
    </div>
  </Sec>;
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

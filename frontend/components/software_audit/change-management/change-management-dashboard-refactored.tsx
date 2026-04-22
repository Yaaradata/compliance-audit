// @ts-nocheck
"use client";

import React, { useState, useMemo, Fragment } from "react";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Clock, FileText,
  GitPullRequest, Play, Rocket, RotateCcw, Search, ChevronRight, X,
  Zap, Bell, Terminal, Bot, User, ArrowRight, Database,
  Activity, Lock, AlertCircle, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import RAW from "@/lib/software_audit/change-management/raw-data.json";
import {
  CHANGE_TABS,
  CONTROL_CARDS,
  CHANGE_TYPE_META,
  CHANGE_TYPE_ORDER,
  SDLC_STAGES,
} from "@/lib/software_audit/change-management/dashboard-config";

const EMG_H = RAW._metadata.thresholds.emergency_cab_post_hoc_window_hours;
const GATES = RAW._metadata.thresholds.required_testing_gates;

const CONTROL_ICON_MAP = {
  approval: FileText,
  sod: Lock,
  testing: Activity,
  freeze: Calendar,
  rollback: RotateCcw,
};

/* colours */
const VC = {"Met":"bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
            "Not Met":"bg-red-50 text-red-700 ring-1 ring-red-200",
            "Review":"bg-amber-50 text-amber-700 ring-1 ring-amber-200"};
const SC = {Critical:"bg-red-100 text-red-800",High:"bg-orange-50 text-orange-700",
            Medium:"bg-amber-50 text-amber-700",Info:"bg-slate-100 text-slate-500"};
const EC = {
  Pipeline:     {l:"Pipeline",     c:"bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", I:Bot},
  ManualConsole:{l:"Manual",       c:"bg-amber-50 text-amber-700 ring-1 ring-amber-200",       I:User},
  ManualBastion:{l:"Bastion SSH",  c:"bg-red-50 text-red-700 ring-1 ring-red-200",             I:Terminal},
  Unknown:      {l:"Unknown",      c:"bg-slate-100 text-slate-600",                            I:AlertCircle},
};

const hrs   = (a,b)=>(a&&b)?((new Date(b)-new Date(a))/36e5):null;
const inWin = (ts,s,e)=>{const t=new Date(ts).getTime();return t>=new Date(s).getTime()&&t<=new Date(e).getTime();};
const EB    = ({mode})=>{const x=EC[mode]||EC.Unknown;return<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${x.c}`}><x.I className="w-3 h-3"/>{x.l}</span>;};
const VP    = ({v})=>{const ic=v==="Met"?<CheckCircle2 className="w-3 h-3"/>:v==="Not Met"?<XCircle className="w-3 h-3"/>:<AlertTriangle className="w-3 h-3"/>;
  return<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VC[v==="Review"?"Review":v]}`}>{ic}{v}</span>;};

/* ── BUILD DATA ── */
function buildData(){
  const issues  =RAW.change_request_collector.issues;
  const prs     =RAW.pull_request_collector.pull_requests;
  const runs    =RAW.cicd_evidence_collector.workflow_runs;
  const deps    =RAW.deployment_activity_collector.deployments;
  const rbs     =RAW.rollback_evidence_collector.records;
  const incs    =RAW.servicenow_incident_collector.incidents;
  const snChgs  =RAW.servicenow_change_collector.change_requests;
  const alerts  =RAW.pagerduty_alert_collector.alerts;
  const sessions=RAW.execution_session_collector.sessions;
  const fws     =RAW.freeze_window_collector.freeze_windows;
  const excs    =RAW.freeze_window_collector.exceptions;

  const allKeys=new Set();
  issues.forEach(i=>allKeys.add(i.key));
  deps.forEach(d=>allKeys.add(d.linked_change_key));
  sessions.forEach(s=>allKeys.add(s.linked_change_key));

  const changes=[];
  allKeys.forEach(key=>{
    const issue=issues.find(i=>i.key===key), f=issue?.fields;
    const pr=prs.find(p=>p.linked_change_key===key)||null;
    const run=runs.find(r=>r.linked_change_key===key)||null;
    const dep=deps.find(d=>d.linked_change_key===key)||null;
    const rb=rbs.find(r=>r.linked_change_key===key)||null;
    const inc=incs.find(i=>i.linked_change===key)||null;
    const snC=snChgs.find(c=>c.linked_jira_story===key)||null;
    const alrt=alerts.find(a=>a.linked_change_key===key)||null;
    const sess=sessions.find(s=>s.linked_change_key===key)||null;

    /* PROCESS: did all required stages exist? */
    const stages={incident:!!inc,alert:!!alrt,ticket:!!issue,snChange:!!snC,pr:!!pr,pipeline:!!run,deploy:!!dep};
    const reqd=["ticket","pr","pipeline","deploy"];
    if(f?.customfield_10200?.value==="Emergency") reqd.unshift("incident","alert");
    const missing=reqd.filter(s=>!stages[s]);
    const processOk=missing.length===0;

    /* CONTROLS */
    const ctrl={};
    // Approval
    const cab=f?.customfield_10201||"NO_TICKET", noTicket=!issue;
    if(noTicket) ctrl.approval={s:"Not Met",sev:"Critical",r:"No ticket — no approval trail"};
    else if(!["APPROVED","POST_HOC_APPROVED","POST_HOC_APPROVED_LATE"].includes(cab))
      ctrl.approval={s:"Not Met",sev:"High",r:`CAB: ${cab}`};
    else if(f?.customfield_10200?.value==="Emergency"){
      const h=hrs(f.created,f.customfield_10203);
      ctrl.approval=h&&h>EMG_H?{s:"Not Met",sev:"High",r:`Post-hoc CAB ${h.toFixed(1)}h (>${EMG_H}h)`}:{s:"Met",sev:"Info",r:`Post-hoc ${h?.toFixed(1)||"?"}h ✓`};
    } else ctrl.approval={s:"Met",sev:"Info",r:`CAB approved ${f.customfield_10203?.slice(0,10)}`};
    if(f?.customfield_10200?.value==="Emergency"&&!alrt&&!inc) ctrl.approval={s:"Not Met",sev:"High",r:"Emergency — no alert or incident"};

    // SoD
    if(pr&&dep){const a=pr.user.login,d=dep.deployed_by,cm=dep.command_executed_by;
      ctrl.sod=(a===d||a===cm)?{s:"Not Met",sev:"High",r:`Author (${a}) = deployer — SoD violated`}:{s:"Met",sev:"Info",r:`${a} ≠ ${d} ✓`};
    } else if(!pr&&dep) ctrl.sod={s:"Not Met",sev:"Critical",r:"No PR — no code review"};
    else ctrl.sod={s:"Met",sev:"Info",r:"n/a"};

    // Testing
    if(!run) ctrl.testing={s:"Not Met",sev:"Critical",r:"No pipeline run"};
    else{const gs={};run.stages.forEach(s=>{gs[s.name]=s.conclusion;});
      const fail=GATES.filter(g=>gs[g]!=="success");
      ctrl.testing=fail.length?{s:"Not Met",sev:"High",r:`Failed: ${fail.map(g=>`${g}=${gs[g]||"missing"}`).join("; ")}`}:{s:"Met",sev:"Info",r:"All gates passed ✓"};
    }

    // Freeze
    let fHit=null,fExc=null;
    if(dep){fHit=fws.find(w=>w.applicable_environments.includes(dep.environment)&&inWin(dep.timestamp,w.start,w.end))||null;
      if(fHit) fExc=excs.find(e=>e.linked_change_key===key&&e.freeze_window_id===fHit.id&&e.status==="APPROVED")||null;}
    ctrl.freeze=!fHit?{s:"Met",sev:"Info",r:"Outside freeze windows"}:fExc?{s:"Met",sev:"Info",r:`Inside ${fHit.id} — exception ${fExc.id}`}:{s:"Not Met",sev:"High",r:`Inside ${fHit.id} — no exception`};

    // Rollback
    if(!rb) ctrl.rollback={s:"Not Met",sev:"High",r:"No rollback record"};
    else if(!rb.rollback_plan_present) ctrl.rollback={s:"Not Met",sev:"High",r:"Plan not documented"};
    else if(!rb.rollback_tested) ctrl.rollback={s:"Review",sev:"Medium",r:"Plan present but not tested"};
    else ctrl.rollback={s:"Met",sev:"Info",r:`Validated in ${rb.rollback_tested_in}`};

    // Incident evidence
    if(f?.customfield_10200?.value==="Emergency"){
      if(!alrt&&!inc) ctrl.incident={s:"Not Met",sev:"High",r:"Emergency: no alert + no incident"};
      else if(!alrt)  ctrl.incident={s:"Review",sev:"Medium",r:"Incident but no PD alert"};
      else if(!inc)   ctrl.incident={s:"Review",sev:"Medium",r:"Alert but no SN incident"};
      else ctrl.incident={s:"Met",sev:"Info",r:`${alrt.id} → ${inc.number}`};
    }

    // Execution
    if(!sess) ctrl.execution={s:"Not Met",sev:"High",r:"No session recorded"};
    else if(sess.auth_identity_type==="ServiceAccount") ctrl.execution={s:"Met",sev:"Info",r:`SA via ${sess.auth_method}`};
    else ctrl.execution=sess.flag?{s:"Not Met",sev:"Critical",r:`Flag: ${sess.flag}`}:{s:"Met",sev:"Info",r:`${sess.authenticated_user} ✓`};

    const ctrlList=Object.values(ctrl);
    let verdict="Met";
    if(ctrlList.some(c=>c.s==="Not Met")) verdict="Not Met";
    else if(ctrlList.some(c=>c.s==="Review")) verdict="Review";

    changes.push({
      key, title:f?.summary||"Reconstructed from logs",
      type:f?.issuetype?.name||"UNLOGGED", priority:f?.priority?.name||"Unknown",
      service:f?.customfield_10212||dep?.service||"unknown", risk:f?.customfield_10213||"Unknown",
      requester:f?.reporter?.emailAddress?.split("@")[0]||null,
      created:f?.created, resolved:f?.resolutiondate,
      emergency:f?.customfield_10200?.value==="Emergency",
      cab, noTicket, cabApprover:f?.customfield_10202, cabApprovedAt:f?.customfield_10203,
      emergencyApprover:f?.customfield_10204,
      pr, run, dep, rb, inc, snC, alrt, sess,
      executionMode:dep?.execution_mode||"Unknown",
      stages, missing, processOk, ctrl, verdict,
    });
  });

  const incidentGroups=RAW.servicenow_incident_collector.incidents.map(inc=>({
    inc, changes:changes.filter(c=>c.inc?.number===inc.number),
  }));
  const standalone=changes.filter(c=>!c.inc);
  return {changes,incidentGroups,standalone};
}

/* ══════════════ MAIN ══════════════ */
export default function ChangeManagement(){
  const {changes,incidentGroups,standalone}=useMemo(buildData,[]);
  const [tab,setTab]=useState("overview");
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState("");
  const [filt,setFilt]=useState("all");

  const meta=RAW._metadata;
  const total=changes.length, met=changes.filter(c=>c.verdict==="Met").length;
  const notMet=changes.filter(c=>c.verdict==="Not Met").length;
  const pct=Math.round(met/total*100);
  const procPct=Math.round(changes.filter(c=>c.processOk).length/total*100);

  const filtered=changes.filter(c=>{
    const s=q.toLowerCase();
    if(s&&![c.key,c.title.toLowerCase(),c.service].some(x=>x.includes(s))) return false;
    if(filt==="notmet")    return c.verdict==="Not Met";
    if(filt==="review")    return c.verdict==="Review";
    if(filt==="emergency") return c.emergency;
    if(filt==="noticket")  return c.noTicket;
    if(filt==="manual")    return c.executionMode!=="Pipeline";
    if(filt==="incident")  return c.inc||c.alrt;
    return true;
  });

  return(
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center"><Shield className="w-5 h-5 text-white"/></div>
          <div>
            <h1 className="text-base font-semibold text-slate-900">Change Management & Release Controls</h1>
            <p className="text-xs text-slate-500">{meta.organization} · {meta.audit_period.start} → {meta.audit_period.end}</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8">
        <div className="flex">{CHANGE_TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab===t.id?"border-indigo-600 text-indigo-700":"border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
          </button>
        ))}</div>
      </nav>

      <main className="px-8 py-6 max-w-screen-2xl mx-auto">
        {tab==="overview" && <OverviewTab changes={changes} met={met} notMet={notMet} pct={pct} procPct={procPct} meta={meta} onOpen={setSel} onNavigate={setTab}/>}
        {tab==="process"  && <ProcessSDLCTab changes={filtered} q={q} setQ={setQ} total={total} onOpen={setSel}/>}
        {tab==="findings" && <FindingsTab changes={changes} onOpen={setSel}/>}
      </main>

      {sel&&<Drawer change={sel} onClose={()=>setSel(null)}/>}
    </div>
  );
}

/* ── OVERVIEW ── */
function OverviewTab({changes,met,notMet,pct,procPct,meta,onOpen,onNavigate}){
  const [expandedType,setExpandedType]=useState("Normal Change");
  const total=changes.length;
  const reviewCount=changes.filter(c=>c.verdict==="Review").length;
  const failCount=changes.filter(c=>c.verdict==="Not Met").length;
  const emergencyCount=changes.filter(c=>c.emergency).length;
  const fakeEmg=changes.filter(c=>c.emergency&&!c.alrt&&!c.inc);
  const noTickets=changes.filter(c=>c.noTicket);
  const freezeViolators=changes.filter(c=>c.ctrl.freeze?.s==="Not Met");
  const rollbackReview=changes.filter(c=>c.ctrl.rollback?.s==="Review");

  const controls=CONTROL_CARDS.map(card=>({
    ...card,
    icon:CONTROL_ICON_MAP[card.iconKey],
    pass:changes.filter(c=>c.ctrl[card.id]?.s==="Met").length,
    findings:changes.filter(c=>c.ctrl[card.id]?.s!=="Met"),
  }));

  const typeRows=CHANGE_TYPE_ORDER.map((label)=>{
    const rows=changes.filter(c=>c.type===label);
    const count=rows.length;
    const metCount=rows.filter(c=>c.verdict==="Met").length;
    const failCountType=rows.filter(c=>c.verdict==="Not Met").length;
    const pct=count?Math.round(metCount/count*100):0;
    const failures=rows.flatMap(c=>
      Object.entries(c.ctrl)
        .filter(([,v])=>v.s!=="Met")
        .map(([k,v])=>({key:c.key,reason:v.r,control:k,status:v.s}))
    );
    return {...CHANGE_TYPE_META[label],label,count,metCount,failCountType,pct,rows,failures};
  });

  const syncedAt=new Date(meta.generated_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  const scoreColor=pct>=80?"text-emerald-600":pct>=60?"text-amber-500":"text-red-600";

  const pctClass=(p)=>p>=80?{txt:"text-emerald-600",bar:"bg-emerald-500"}:p>=60?{txt:"text-amber-500",bar:"bg-amber-400"}:{txt:"text-red-600",bar:"bg-red-500"};

  return(
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-5 items-start">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Q1 2026 — Change Volume & Compliance Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {label:"Overall Score",count:`${pct}%`,color:scoreColor,bar:pct>=71?"bg-emerald-500":pct>=41?"bg-amber-500":"bg-red-500",bg:pct>=71?"bg-emerald-50 border-emerald-200":pct>=41?"bg-amber-50 border-amber-200":"bg-red-50 border-red-200",w:pct},
              {label:"Total Changes",count:total,color:"text-slate-700",bar:"bg-slate-500",bg:"bg-slate-50 border-slate-200"},
              {label:"Met",count:met,color:"text-emerald-600",bar:"bg-emerald-500",bg:"bg-emerald-50 border-emerald-200"},
              {label:"Not Met",count:total-met,color:"text-red-600",bar:"bg-red-500",bg:"bg-red-50 border-red-200"},
            ].map(x=>(
              <div key={x.label} className={`rounded-xl border p-4 ${x.bg}`}>
                <div className={`text-3xl font-black ${x.color}`}>{x.count}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{x.label}</div>
                <div className="mt-2 h-1 bg-slate-200 rounded-full"><div className={`h-full rounded-full ${x.bar}`} style={{width:`${x.w??Math.round(Number(x.count)/Math.max(total,1)*100)}%`}}/></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Top Findings</h3>
            <button onClick={()=>onNavigate("findings")} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Open Findings tab</button>
          </div>
          <div className="space-y-2.5 overflow-y-auto pr-1 max-h-[220px]">
            {[
              {sev:"critical",text:`${failCount} changes are non-compliant across mandatory controls`,items:changes.filter(c=>c.verdict==="Not Met")},
              {sev:"critical",text:`${noTickets.length} untracked production change${noTickets.length===1?"":"s"} (no ticket)`,items:noTickets},
              {sev:"high",text:`${freezeViolators.length} freeze-window violation${freezeViolators.length===1?"":"s"} without approved exception`,items:freezeViolators},
              {sev:"high",text:`${fakeEmg.length} emergency-labelled change${fakeEmg.length===1?"":"s"} without supporting alert/incident`,items:fakeEmg},
              {sev:"medium",text:`${rollbackReview.length} rollback plans documented but not tested`,items:rollbackReview},
            ].filter(f=>f.items.length>0).slice(0,5).map((f,i)=>{
              const tone=f.sev==="critical"?{row:"bg-red-50 border-red-200",dot:"bg-red-500",txt:"text-red-800"}:f.sev==="high"?{row:"bg-orange-50 border-orange-200",dot:"bg-orange-500",txt:"text-orange-800"}:{row:"bg-amber-50 border-amber-200",dot:"bg-amber-400",txt:"text-amber-800"};
              return(
                <div key={i} className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${tone.row}`}>
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${tone.dot}`}/>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${tone.txt}`}>{f.text}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(f.sev==="medium"?f.items:f.items.slice(0,4)).map(x=><span key={x.key} className="font-mono text-xs bg-white/70 border border-white/60 text-slate-600 px-1.5 rounded">{x.key}</span>)}
                      {f.items.length>4&&<span className="text-xs text-slate-400">+{f.items.length-4}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-3">RBI Control Areas — Detailed Assessment</h2>
        <div className="grid grid-cols-5 gap-3">
          {controls.map(c=>{
            const cpct=Math.round(c.pass/Math.max(total,1)*100);
            const pc=pctClass(cpct);
            const status=cpct>=80?"Met":cpct>=60?"Needs Review":"Non-Compliant";
            const statusColor=cpct>=80?"text-emerald-700":cpct>=60?"text-amber-700":"text-red-700";
            return(
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className={`px-4 pt-4 pb-3 ${cpct>=80?"bg-emerald-50":cpct>=60?"bg-amber-50":"bg-red-50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <c.icon className={`w-4 h-4 mt-0.5 shrink-0 ${pc.txt}`}/>
                    <span className={`text-xs font-bold ${pc.txt}`}>{cpct}%</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-2 leading-snug">{c.label}</p>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                  <div className="mt-4 h-1.5 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${pc.bar}`} style={{width:`${cpct}%`}}/></div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${statusColor}`}>{status}</span>
                    <span className="text-xs text-slate-400">{c.pass}/{total}</span>
                  </div>
                  {c.findings.length>0&&<p className="mt-2 text-xs text-slate-400">{c.findings.length} finding(s)</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500"/>Change Type Breakdown</h3>
          <p className="text-sm text-slate-500 italic">Type from Jira issue type · UNLOGGED = no Jira ticket found</p>
        </div>
        <div className="divide-y divide-slate-100">
          {typeRows.map((t)=>{
            const isOpen=expandedType===t.label;
            return(
              <div key={t.label}>
                <button onClick={()=>setExpandedType(isOpen?null:t.label)} className="w-full px-5 py-3 flex items-center gap-4 text-left hover:bg-slate-50">
                  <span className={`w-3 h-3 rounded-full ${t.dot} shrink-0`}/>
                  <span className="w-44 text-sm font-semibold text-slate-800">{t.label}</span>
                  {isOpen ? (
                    <span className="flex-1" />
                  ) : (
                    <span className="flex-1 text-sm text-slate-600 truncate">{t.short}</span>
                  )}
                  <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${t.pct>=80?"bg-emerald-500":t.pct>=60?"bg-amber-500":"bg-red-500"}`} style={{width:`${t.pct}%`}}/>
                  </div>
                  <span className="w-8 text-right text-sm text-slate-600">{t.count}</span>
                  <span className={`w-12 text-right text-sm font-semibold ${t.pct>=80?"text-emerald-700":t.pct>=60?"text-amber-700":"text-red-700"}`}>{t.pct}%</span>
                  {isOpen?<ChevronUp className="w-4 h-4 text-slate-400"/>:<ChevronDown className="w-4 h-4 text-slate-400"/>}
                </button>

                {isOpen&&(
                  <div className="px-5 pb-4 pt-1 grid grid-cols-2 gap-5 bg-slate-50/40">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Definition</p>
                      <p className="text-base leading-relaxed text-slate-800">{t.definition}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span><span className="font-bold text-slate-900">{t.count}</span> <span className="text-slate-500">changes</span></span>
                        <span><span className={`font-bold ${t.pct>=80?"text-emerald-700":t.pct>=60?"text-amber-700":"text-red-700"}`}>{t.pct}%</span> <span className="text-slate-500">compliant</span></span>
                        <span><span className="font-bold text-red-700">{t.failCountType}</span> <span className="text-slate-500">failures</span></span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.rows.map(c=><span key={c.key} className="font-mono text-sm px-2 py-1 rounded border border-slate-200 bg-white text-slate-700">{c.key}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Control Failures</p>
                      <div className="space-y-2">
                        {t.failures.length===0&&<div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">No control failures for this change type.</div>}
                        {t.failures.slice(0,5).map((f,idx)=>(
                          <div key={`${f.key}-${f.control}-${idx}`} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-sm text-slate-700">
                            <span className="font-mono font-semibold text-slate-800">{f.key}</span> {f.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Bars({bars,total}){return<div className="space-y-2">{bars.map(({l,pass})=>{const p=Math.round(pass/total*100);return<div key={l} className="flex items-center gap-3">
  <span className="w-44 text-xs text-slate-600 shrink-0">{l}</span>
  <div className="flex-1 h-1.5 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${p>=80?"bg-emerald-500":p>=60?"bg-amber-500":"bg-red-500"}`} style={{width:`${p}%`}}/></div>
  <span className={`w-10 text-right text-xs font-semibold ${p>=80?"text-emerald-700":p>=60?"text-amber-600":"text-red-600"}`}>{p}%</span>
</div>;})}</div>;}
function Box({l,v,s,red,amber}){return<div className="bg-white rounded-xl border border-slate-200 p-5">
  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{l}</p>
  <div className={`text-4xl font-bold mt-2 ${red?"text-red-600":amber?"text-amber-500":"text-slate-800"}`}>{v}</div>
  <p className="text-xs text-slate-400 mt-1">{s}</p>
</div>;}

/* ── TICKETS ── */
function TicketsTab({changes,q,setQ,filt,setFilt,incidentGroups,standalone,onOpen}){
  return(
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search key, title, service..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"/></div>
        <select value={filt} onChange={e=>setFilt(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <option value="all">All tickets</option><option value="notmet">Not Met</option>
          <option value="review">Requires Review</option><option value="emergency">Emergency</option>
          <option value="noticket">No ticket</option><option value="manual">Manual execution</option>
          <option value="incident">Incident-driven</option>
        </select>
      </div>

      {/* incident-linked */}
      {incidentGroups.map(({inc,changes:cl})=>{
        const fc=cl.filter(c=>{const s=q.toLowerCase();if(s&&![c.key,c.title.toLowerCase(),c.service].some(x=>x.includes(s))) return false;
          if(filt==="notmet") return c.verdict==="Not Met"; if(filt==="review") return c.verdict==="Review";
          if(filt==="emergency") return c.emergency; if(filt==="noticket") return c.noTicket;
          if(filt==="manual") return c.executionMode!=="Pipeline"; return true;});
        if(!fc.length) return null;
        return(
          <div key={inc.number} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>
              <span className="font-mono text-sm font-bold text-red-900">{inc.number}</span>
              <span className="text-sm text-slate-700">{inc.short_description}</span>
              <span className="text-xs text-slate-500 ml-auto">{inc.priority}</span>
            </div>
            <TicketTable rows={fc} onOpen={onOpen}/>
          </div>
        );
      })}

      {/* standalone */}
      {standalone.length>0&&(
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Routine tickets (no incident)</div>
          <TicketTable rows={standalone} onOpen={onOpen}/>
        </div>
      )}
    </div>
  );
}

function TicketTable({rows,onOpen}){return(
  <table className="w-full text-xs"><thead><tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
    <th className="px-4 py-2 text-left font-medium">Ticket</th><th className="px-3 py-2 text-left font-medium">Title</th>
    <th className="px-3 py-2 text-left font-medium">Service</th><th className="px-3 py-2 text-left font-medium">Execution</th>
    <th className="px-3 py-2 text-left font-medium">CAB</th><th className="px-3 py-2 text-left font-medium">Deployed</th>
    <th className="px-3 py-2 text-left font-medium">Verdict</th>
  </tr></thead><tbody>{rows.map(c=>(
    <tr key={c.key} className="border-b last:border-0 border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={()=>onOpen(c)}>
      <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
        {c.key}{c.emergency&&<Zap className="inline w-3 h-3 text-amber-500 ml-1"/>}
        {c.noTicket&&<span className="ml-1 text-xs px-1 bg-red-100 text-red-700 rounded">No ticket</span>}
      </td>
      <td className="px-3 py-3 text-slate-700 max-w-xs truncate">{c.title}</td>
      <td className="px-3 py-3 font-mono text-slate-500">{c.service}</td>
      <td className="px-3 py-3"><EB mode={c.executionMode}/></td>
      <td className="px-3 py-3 font-mono text-slate-500">{c.cab}</td>
      <td className="px-3 py-3 font-mono text-slate-500">{c.dep?.timestamp?.slice(0,10)||"—"}</td>
      <td className="px-3 py-3"><VP v={c.verdict}/></td>
    </tr>
  ))}</tbody></table>
);}

/* ── PROCESS & SDLC (MERGED) ── */
function ProcessSDLCTab({changes,q,setQ,total,onOpen}){
  const [expanded,setExpanded]=useState(null);

  return(
    <div className="space-y-5">
      {/* top: stage completion summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Stage completion — what % of changes had each stage</h3>
        <div className="grid grid-cols-7 gap-3">
          {SDLC_STAGES.map(({k,l,fn,req})=>{
            const applicable=changes.filter(c=>req(c));
            const pass=applicable.filter(c=>fn(c));
            const p=applicable.length?Math.round(pass.length/applicable.length*100):100;
            return(
              <div key={k} className="text-center">
                <div className={`text-2xl font-bold ${p>=80?"text-emerald-600":p>=60?"text-amber-500":"text-red-600"}`}>{p}%</div>
                <div className="text-xs text-slate-500 mt-1">{l}</div>
                <div className="text-xs text-slate-400">{pass.length}/{applicable.length}</div>
                <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${p>=80?"bg-emerald-500":p>=60?"bg-amber-500":"bg-red-500"}`} style={{width:`${p}%`}}/></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter by key or title..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
      </div>

      {/* per-change rows — chain on left, expand for SDLC detail */}
      <div className="space-y-2">
        {changes.map(c=>{
          const open=expanded===c.key;
          return(
            <div key={c.key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* summary row */}
              <div
                onClick={()=>setExpanded(open?null:c.key)}
                className="px-5 py-4 flex items-start gap-4 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">{c.key}</span>
                    {c.emergency&&<Zap className="w-3.5 h-3.5 text-amber-500"/>}
                    {c.noTicket&&<span className="text-xs px-1.5 bg-red-100 text-red-700 rounded font-medium">No ticket</span>}
                    <span className="text-sm font-medium text-slate-900 truncate">{c.title}</span>
                  </div>
                  {/* chain pills */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {SDLC_STAGES.map((sd,i)=>{
                      const show=sd.req(c)||sd.fn(c);
                      if(!show) return null;
                      const has=sd.fn(c);
                      return<Fragment key={sd.k}>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${has?"bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200":"bg-red-50 text-red-600 ring-1 ring-red-200 border-dashed"}`}>
                          {sd.l}{has&&sd.ref(c)?` (${sd.ref(c)})`:has?" ✓":" ✗"}
                        </span>
                        {i<SDLC_STAGES.length-1&&<ArrowRight className="w-3 h-3 text-slate-300"/>}
                      </Fragment>;
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <VP v={c.verdict}/>
                  <span className="text-slate-400 flex items-center gap-1 text-xs">
                    {open?<><ChevronUp className="w-4 h-4"/>less</>:<><ChevronDown className="w-4 h-4"/>SDLC detail</>}
                  </span>
                </div>
              </div>

              {/* SDLC expanded detail */}
              {open&&<div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                <div className="overflow-x-auto">
                  <div className="flex items-start gap-3 min-w-max">
                    {/* Repo */}
                    <Stage l="Repository" ok={!!c.pr} col={!!c.pr?"indigo":"red"}>
                      {c.pr&&<div className="text-xs font-mono text-slate-600">{c.pr.repository?.full_name}</div>}
                    </Stage>
                    <Sep/>
                    {/* Developer */}
                    <Stage l="Developer" ok={!!c.pr} col={!!c.pr?"indigo":"red"}>
                      {c.pr&&<><div className="text-xs font-medium text-slate-800">{c.pr.user?.login}</div><div className="text-xs text-slate-500">{c.pr.head?.ref}</div></>}
                    </Stage>
                    <Sep/>
                    {/* PR Review */}
                    <Stage l="PR Review" ok={!!c.pr} col={c.pr?.reviews?.length?"emerald":"amber"}>
                      {c.pr&&<>
                        <div className="text-xs text-slate-600">PR #{c.pr.number}</div>
                        <div className="text-xs text-slate-500">Reviewers: {c.pr.reviews?.map(r=>r.user.login).join(", ")||"none"}</div>
                        <div className="text-xs text-slate-500">Merged by: {c.pr.merged_by?.login}</div>
                        {c.ctrl.sod?.s==="Not Met"&&<div className="text-xs text-red-600 font-medium mt-0.5">⚠ SoD violated</div>}
                      </>}
                    </Stage>
                    <Sep/>
                    {/* Testing */}
                    <Stage l="Testing" ok={c.ctrl.testing?.s==="Met"} col={c.ctrl.testing?.s==="Met"?"emerald":"red"}>
                      {c.run?c.run.stages.map(s=>(
                        <div key={s.name} className="flex items-center gap-1 text-xs">
                          {s.conclusion==="success"?<CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0"/>:<XCircle className="w-3 h-3 text-red-500 shrink-0"/>}
                          <span className={s.conclusion!=="success"?"text-red-700 font-medium":"text-slate-600"}>{s.name.replace(/_/g," ")}</span>
                        </div>
                      )):<span className="text-xs text-red-500">No pipeline</span>}
                    </Stage>
                    <Sep/>
                    {/* Build */}
                    <Stage l="Build" ok={!!c.run} col={!!c.run?"emerald":"red"}>
                      {c.dep&&<div className="text-xs font-mono text-slate-600 break-all">{c.dep.release_version}</div>}
                    </Stage>
                    <Sep/>
                    {/* Deploy */}
                    <Stage l="Deployment" ok={!!c.dep} col={!!c.dep?"emerald":"red"}>
                      {c.dep&&<>
                        <div className="text-xs text-slate-600">{c.dep.environment}</div>
                        <div className="text-xs font-mono text-slate-500">{c.dep.timestamp?.slice(0,16)}</div>
                        <EB mode={c.executionMode}/>
                        <div className="text-xs text-slate-500 mt-0.5">by: {c.dep.command_executed_by}</div>
                      </>}
                    </Stage>
                  </div>
                </div>

                {/* control summary inline */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Object.entries(c.ctrl).map(([k,v])=>(
                    <div key={k} className={`text-xs p-2 rounded border ${v.s==="Met"?"bg-emerald-50 border-emerald-200":v.s==="Review"?"bg-amber-50 border-amber-200":"bg-red-50 border-red-200"}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        {v.s==="Met"?<CheckCircle2 className="w-3 h-3 text-emerald-600"/>:<XCircle className="w-3 h-3 text-red-500"/>}
                        <span className={`font-medium capitalize ${v.s==="Met"?"text-emerald-700":"text-red-700"}`}>{k}</span>
                      </div>
                      <div className={`text-xs ${v.s==="Met"?"text-emerald-600":"text-red-600"}`}>{v.r}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={()=>onOpen(c)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 rounded-md px-3 py-1.5"
                  >
                    Details
                    <ChevronRight className="w-3 h-3"/>
                  </button>
                </div>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stage({l,ok,col,children}){
  const b={indigo:"border-indigo-200 bg-indigo-50",emerald:"border-emerald-200 bg-emerald-50",amber:"border-amber-200 bg-amber-50",red:"border-red-200 bg-red-50 border-dashed"};
  return<div className={`w-40 rounded-lg border p-3 ${b[col]}`}>
    <div className="flex items-center gap-1 mb-1.5">
      {ok?<CheckCircle2 className="w-3 h-3 text-emerald-500"/>:<XCircle className="w-3 h-3 text-red-500"/>}
      <span className="text-xs font-semibold text-slate-700">{l}</span>
    </div>
    {children||<span className="text-xs text-slate-400">missing</span>}
  </div>;
}
function Sep(){return<div className="flex items-center self-start pt-5"><ArrowRight className="w-4 h-4 text-slate-300"/></div>;}

/* ── FINDINGS ── */
function FindingsTab({changes,onOpen}){
  const all=[];
  changes.forEach(c=>{Object.entries(c.ctrl).forEach(([k,v])=>{if(v.s!=="Met") all.push({c,ctrl:k,v});});});
  all.sort((a,b)=>{const o={Critical:0,High:1,Medium:2,Info:3};return o[a.v.sev]-o[b.v.sev];});

  const byCtrl={};all.forEach(x=>{if(!byCtrl[x.ctrl])byCtrl[x.ctrl]={sev:x.v.sev,list:[]};byCtrl[x.ctrl].list.push(x);});
  const groups=Object.entries(byCtrl).sort((a,b)=>{const o={Critical:0,High:1,Medium:2};return o[a[1].sev]-o[b[1].sev];});

  return(
    <div className="space-y-5">
      {/* insight cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {t:`${changes.filter(c=>c.ctrl.testing?.s==="Not Met").length} changes had testing failures — UAT or security scan missing`,c:"red"},
          {t:`${changes.filter(c=>c.ctrl.sod?.s==="Not Met").length} changes have SoD violations — author also deployed`,c:"red"},
          {t:`${changes.filter(c=>c.noTicket).length} change${changes.filter(c=>c.noTicket).length===1?"":"s"} had no ticket — reconstructed from audit logs`,c:"red"},
          {t:`${changes.filter(c=>c.emergency&&!c.alrt&&!c.inc).length} emergency-labeled changes without a supporting alert`,c:"amber"},
        ].filter(x=>!x.t.startsWith("0")).map((x,i)=>(
          <div key={i} className={`rounded-xl border p-4 ${x.c==="red"?"bg-red-50 border-red-200":"bg-amber-50 border-amber-200"}`}>
            <p className={`text-sm font-medium ${x.c==="red"?"text-red-800":"text-amber-800"}`}>{x.t}</p>
          </div>
        ))}
      </div>
      {/* by control */}
      {groups.map(([ctrl,{sev,list}])=>(
        <div key={ctrl} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${SC[sev]}`}>{sev}</span>
              <span className="font-semibold text-sm text-slate-900 capitalize">{ctrl.replace(/([A-Z])/g," $1")}</span>
            </div>
            <span className="text-sm font-bold">{list.length} ticket{list.length>1?"s":""}</span>
          </div>
          {list.map(({c,v},i)=>(
            <button key={i} onClick={()=>onOpen(c)} className="w-full text-left px-5 py-3 border-b last:border-0 border-slate-100 hover:bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-600">{c.key}</span>
                  <span className="text-sm text-slate-900">{c.title}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{v.r}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0"/>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── DRAWER ── */
function Drawer({change:c,onClose}){
  const events=[];
  if(c.alrt){events.push({t:c.alrt.triggered_at,l:"Alert triggered",by:"PagerDuty",col:"red"});
    events.push({t:c.alrt.acknowledged_at,l:"Alert acknowledged",by:c.alrt.responder?.login,col:"amber"});}
  if(c.inc) events.push({t:c.inc.opened_at,l:"Incident opened",by:c.inc.opened_by,col:"red"});
  if(c.created) events.push({t:c.created,l:"Ticket raised",by:c.requester,col:"indigo"});
  if(c.cabApprovedAt) events.push({t:c.cabApprovedAt,l:"CAB approved",by:c.cabApprover,col:"emerald"});
  if(c.pr?.merged_at) events.push({t:c.pr.merged_at,l:"PR merged",by:c.pr.merged_by?.login,col:"indigo"});
  if(c.run?.updated_at) events.push({t:c.run.updated_at,l:"Pipeline complete",col:"emerald"});
  if(c.dep?.timestamp) events.push({t:c.dep.timestamp,l:`Deployed → ${c.dep.environment}`,by:c.dep.command_executed_by,col:"emerald"});
  if(c.inc?.resolved_at) events.push({t:c.inc.resolved_at,l:"Incident resolved",by:c.inc.resolved_by,col:"emerald"});
  events.sort((a,b)=>new Date(a.t)-new Date(b.t));
  const dot={red:"bg-red-200 text-red-700",amber:"bg-amber-100 text-amber-700",indigo:"bg-indigo-100 text-indigo-700",emerald:"bg-emerald-100 text-emerald-700"};

  return(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-all duration-200" onClick={onClose}/>
      <div className="relative w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{c.key}</span>
              <VP v={c.verdict}/>
              {c.emergency&&<span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium flex items-center gap-1"><Zap className="w-3 h-3"/>Emergency</span>}
              {c.noTicket&&<span className="text-xs px-2 py-0.5 bg-red-200 text-red-900 rounded font-medium">No ticket</span>}
            </div>
            <h2 className="text-base font-semibold text-slate-900 mt-1">{c.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{c.service} · {c.type} · Risk: {c.risk}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-6">
          {/* timeline */}
          {events.length>0&&<DS title="Timeline">
            <ol className="relative border-l-2 border-slate-200 ml-3 space-y-3">
              {events.map((e,i)=>(
                <li key={i} className="ml-7">
                  <div className={`absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white ${dot[e.col]}`}>{i+1}</div>
                  <div className="text-xs font-mono text-slate-400">{new Date(e.t).toISOString().slice(0,19).replace("T"," ")}Z</div>
                  <div className="text-sm font-medium text-slate-900">{e.l}</div>
                  {e.by&&<div className="text-xs text-slate-500">by {e.by}</div>}
                </li>
              ))}
            </ol>
          </DS>}

          {/* incident */}
          {c.inc&&<DS title="Incident (ServiceNow)">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs space-y-2">
              <div className="font-mono text-sm font-bold text-red-900">{c.inc.number}</div>
              <div className="text-sm text-slate-800">{c.inc.short_description}</div>
              <G2 rows={[["Priority",c.inc.priority],["Opened",c.inc.opened_at],["Resolved",c.inc.resolved_at],["Assigned",c.inc.assigned_to]]}/>
              {c.inc.work_notes&&<div>
                <div className="font-semibold text-slate-700 mb-1">Work notes</div>
                <div className="bg-white rounded border border-slate-200 p-2 font-mono space-y-0.5 max-h-40 overflow-y-auto">
                  {c.inc.work_notes.map((n,i)=><div key={i}><span className="text-slate-400">[{n.at.slice(11,16)}]</span>{" "}<span className="text-indigo-700">{n.by}:</span>{" "}<span className="text-slate-700">{n.note}</span></div>)}
                </div>
              </div>}
            </div>
          </DS>}

          {/* alert */}
          {(c.alrt||c.emergency)&&<DS title="Alert (PagerDuty)">
            {c.alrt?<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs space-y-2">
              <div className="font-mono font-bold text-amber-900">{c.alrt.id} · {c.alrt.alert_key}</div>
              <G2 rows={[["Triggered",c.alrt.triggered_at],["Acknowledged",c.alrt.acknowledged_at],["Resolved",c.alrt.resolved_at],["Responder",c.alrt.responder?.login],["Monitor",c.alrt.monitoring_source]]}/>
            </div>:<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">No PagerDuty alert — emergency claim unsupported.</div>}
          </DS>}

          {/* approval */}
          <DS title="Approval / CAB">
            <div className="mb-2"><VP v={c.ctrl.approval?.s==="Met"?"Met":"Not Met"}/> <span className="text-xs text-slate-600 ml-1">{c.ctrl.approval?.r}</span></div>
            {!c.noTicket&&<G2 rows={[["CAB status",c.cab],["CAB approver",c.cabApprover],["CAB approved",c.cabApprovedAt],["Emergency approver",c.emergencyApprover]]}/>}
          </DS>

          {/* SDLC */}
          <DS title="Code to production (SDLC)">
            <div className="space-y-3">
              <SBlock title="Pull Request" icon={GitPullRequest} ok={c.ctrl.sod?.s==="Met"}>
                {c.pr?<G2 rows={[["PR",`#${c.pr.number}`],["Repo",c.pr.repository?.full_name],["Author",c.pr.user?.login],["Reviewers",c.pr.reviews?.map(r=>r.user.login).join(", ")],["Merged by",c.pr.merged_by?.login],["Merged",c.pr.merged_at]]}/>
                :<p className="text-xs text-red-600">No pull request</p>}
              </SBlock>
              <SBlock title="Pipeline / Testing" icon={Play} ok={c.ctrl.testing?.s==="Met"}>
                {c.run?<><G2 rows={[["Run ID",c.run.id],["Conclusion",c.run.conclusion]]}/><div className="mt-2 rounded border border-slate-200 overflow-hidden"><table className="w-full text-xs"><thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-500"><th className="px-3 py-1.5 text-left font-medium">Stage</th><th className="px-3 py-1.5 text-left font-medium">Required</th><th className="px-3 py-1.5 text-left font-medium">Result</th></tr></thead><tbody>{c.run.stages.map((s,i)=><tr key={i} className={`border-t border-slate-100 ${s.conclusion!=="success"&&GATES.includes(s.name)?"bg-red-50":""}`}><td className="px-3 py-2 font-mono">{s.name}</td><td className="px-3 py-2 text-slate-500">{GATES.includes(s.name)?"yes":"no"}</td><td className={`px-3 py-2 font-medium ${s.conclusion==="success"?"text-emerald-700":"text-red-700"}`}>{s.conclusion}</td></tr>)}</tbody></table></div></>
                :<p className="text-xs text-red-600">No pipeline run</p>}
              </SBlock>
              <SBlock title="Deployment" icon={Rocket} ok={!!c.dep}>
                {c.dep?<G2 rows={[["Environment",c.dep.environment],["Release",c.dep.release_version],["Command actor",c.dep.command_executed_by],["Timestamp",c.dep.timestamp],["Source IP",c.dep.source_ip],["Execution mode",c.executionMode]]}/>
                :<p className="text-xs text-red-600">No deployment record</p>}
              </SBlock>
              <SBlock title="Rollback" icon={RotateCcw} ok={c.ctrl.rollback?.s==="Met"}>
                {c.rb?<G2 rows={[["Plan present",c.rb.rollback_plan_present?"yes":"no"],["Tested",c.rb.rollback_tested?"yes":"no"],["Tested in",c.rb.rollback_tested_in],["Validator",c.rb.rollback_validator]]}/>
                :<p className="text-xs text-red-600">No rollback evidence</p>}
              </SBlock>
            </div>
          </DS>

          {/* execution session */}
          {c.sess&&<DS title="Execution session">
            <div className={`rounded-lg p-4 border ${c.sess.flag?"bg-red-50 border-red-200":"bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {c.sess.auth_identity_type==="User"?<User className="w-4 h-4"/>:<Bot className="w-4 h-4"/>}
                  <span className="font-mono font-semibold text-slate-900">{c.sess.authenticated_user}</span>
                  <span className="text-xs px-1.5 bg-white border border-slate-200 rounded text-slate-500">{c.sess.auth_identity_type}</span>
                </div>
                {c.sess.flag&&<span className="text-xs px-2 py-0.5 bg-red-200 text-red-900 rounded font-medium">{c.sess.flag}</span>}
              </div>
              <G2 rows={[["Auth",c.sess.auth_method],["Source IP",c.sess.source_ip],["From",c.sess.source_system],["Target",c.sess.target_system],["Session",`${c.sess.session_start?.slice(11,19)} → ${c.sess.session_end?.slice(11,19)}`]]}/>
              {c.sess.actions&&<div className="mt-3 bg-white rounded border border-slate-200 p-2 text-xs font-mono space-y-0.5">
                {c.sess.actions.map((a,i)=><div key={i}><span className="text-slate-400">[{a.at?.slice(11,19)}]</span>{" "}<span className="text-indigo-700">{a.action}</span>{" "}<span className="text-slate-600">→ {a.target}</span>{" "}<span className={a.result==="success"?"text-emerald-600":"text-red-600"}>({a.result})</span></div>)}
              </div>}
            </div>
          </DS>}

          {/* control table */}
          <DS title="All controls">
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-xs"><thead><tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="px-3 py-2 text-left font-medium">Control</th><th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Severity</th><th className="px-3 py-2 text-left font-medium">Result</th>
              </tr></thead><tbody>{Object.entries(c.ctrl).map(([k,v],i)=>(
                <tr key={k} className={`border-t border-slate-100 ${v.s!=="Met"?"bg-slate-50":""}`}>
                  <td className="px-3 py-2 font-medium text-slate-800 capitalize">{k.replace(/([A-Z])/g," $1")}</td>
                  <td className="px-3 py-2"><VP v={v.s==="Met"?"Met":v.s==="Review"?"Review":"Not Met"}/></td>
                  <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SC[v.sev]}`}>{v.sev}</span></td>
                  <td className="px-3 py-2 text-slate-600">{v.r}</td>
                </tr>
              ))}</tbody></table>
            </div>
          </DS>
        </div>
      </div>
    </div>
  );
}

function SBlock({title,icon:I,ok,children}){
  return<div className={`p-3 rounded-lg border ${ok===false?"border-red-200 bg-red-50":"border-slate-200 bg-white"}`}>
    <div className="flex items-center gap-2 mb-2"><I className="w-4 h-4 text-slate-400"/><span className="text-xs font-semibold text-slate-700">{title}</span>
      {ok===true?<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/>:ok===false?<XCircle className="w-3.5 h-3.5 text-red-500"/>:null}
    </div>{children}
  </div>;
}
function DS({title,children}){return<section><h3 className="text-sm font-semibold text-slate-800 mb-2 pb-1 border-b border-slate-100">{title}</h3>{children}</section>;}
function G2({rows}){return<dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">{rows.filter(([,v])=>v).map(([k,v],i)=><Fragment key={i}><dt className="text-slate-500">{k}</dt><dd className="text-slate-900 font-mono break-all">{v}</dd></Fragment>)}</dl>;}

/**
 * Shared hero header layout for FASTag drill-down pages (gd / dd).
 * Mirrors the performance drill grid: title + score/chart left, KPIs + AI right.
 */
import { DRILL_C as C } from './fastTagDrilldownTheme';

export function drillHeroStyles(prefix, { iconBg, iconColor, aiFrom, aiTo }) {
  const p = prefix;
  const up = `${p}-up`;
  const down = `${p}-down`;
  return `
  .${p}-hero-panel{ padding:12px 14px; position:relative; }
  .${p}-hero-layout{
    display:grid;
    grid-template-columns:minmax(300px,40%) 1fr;
    grid-template-areas:
      "title kpis"
      "score ai";
    column-gap:14px; row-gap:12px; align-items:start; margin-bottom:0;
  }
  .${p}-hero-title{
    grid-area:title;
    display:flex; align-items:flex-start; gap:10px; margin-bottom:0; min-width:0;
  }
  .${p}-hero-kpis{
    grid-area:kpis;
    display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:10px;
    width:100%; min-width:0; margin:0; align-self:stretch; justify-self:stretch;
  }
  .${p}-hero-icon{
    width:28px; height:28px; border-radius:8px; display:grid; place-items:center; flex-shrink:0;
    background:${iconBg}; color:${iconColor}; font-size:14px;
  }
  .${p}-hero-title-text{ font-size:14px; font-weight:600; line-height:1.3; color:${C.text}; }
  .${p}-hero-score-zone{
    grid-area:score;
    display:grid;
    grid-template-columns:auto minmax(0,1fr);
    grid-template-rows:auto auto auto;
    column-gap:10px; row-gap:10px;
    min-width:0; width:100%; align-self:start;
  }
  .${p}-hero-score-stack{
    grid-column:1; grid-row:1;
    display:flex; flex-direction:column; gap:4px; min-width:0;
  }
  .${p}-hero-score-main{ display:flex; align-items:flex-start; min-width:0; }
  .${p}-hero-score-stack > .${p}-hero-score-delta{ font-weight:600; font-size:10px; }
  .${p}-hero-score-stack > .${p}-hero-score-delta.${up}{ color:${C.green}; }
  .${p}-hero-score-stack > .${p}-hero-score-delta.${down}{ color:${C.red}; }
  .${p}-hero-score-val{ font-size:36px; font-weight:700; line-height:1; flex-shrink:0; color:${C.text}; }
  .${p}-hero-chart-col{
    grid-column:2; grid-row:1 / 3;
    display:flex; flex-direction:column; align-items:stretch; gap:4px;
    min-width:0; width:100%; text-align:left; align-self:stretch; justify-self:stretch;
  }
  .${p}-hero-chart-block{
    width:100%; min-width:0; max-width:none;
    display:flex; flex-direction:column; align-items:stretch; gap:4px; text-align:left;
  }
  .${p}-hero-chart-hint-wrap{
    min-width:0; width:100%; text-align:left; padding-top:0; align-self:stretch;
  }
  .${p}-hero-chart-hint-wrap .${p}-hero-hint{ text-align:left; }
  .${p}-hero-chart-block .drill-hero-trend-chart{ width:100%; }
  .${p}-hero-chart-block > .${p}-label{
    margin:0; width:100%; text-align:center;
  }
  .${p}-hero-topic-wrap{
    grid-column:1 / -1; grid-row:3; min-width:0; margin-top:2px; padding-top:0;
  }
  .${p}-hero-score-zone .${p}-hero-topic-btns{
    display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center;
    justify-content:flex-start; gap:6px; min-width:0;
  }
  .${p}-hero-score-zone .${p}-hero-topic-btn-positive{ order:1; }
  .${p}-hero-score-zone .${p}-hero-topic-btn-negative{ order:2; }
  .${p}-hero-score-zone .${p}-hero-topic-btn-critical{ order:3; }
  .${p}-hero-score-zone .${p}-hero-topic-btn{
    flex:0 1 auto; min-width:0; padding:5px 10px; font-size:10px; text-align:center; white-space:nowrap;
  }
  .${p}-hero-score-label{ font-size:10px; margin-top:0; }
  .${p}-hero-kpis .${p}-kpi{
    padding:8px 10px; border-radius:8px; min-height:46px;
    border:1px solid ${C.borderSoft}; background:${C.panel};
    display:flex; flex-direction:column; justify-content:space-between; gap:4px;
    box-shadow:0 1px 2px rgba(15,23,42,0.04);
  }
  .${p}-hero-kpis .${p}-kpi-label{
    font-size:7px; letter-spacing:.8px; line-height:1.2; color:${C.textFaint};
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
  }
  .${p}-hero-kpis .${p}-kpi--blue{
    background:linear-gradient(145deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04));
    border-color:rgba(37,99,235,0.22);
  }
  .${p}-hero-kpis .${p}-kpi--blue .${p}-kpi-label{ color:rgba(37,99,235,0.85); }
  .${p}-hero-kpis .${p}-kpi--green{
    background:linear-gradient(145deg, rgba(5,150,105,0.14), rgba(5,150,105,0.04));
    border-color:rgba(5,150,105,0.24);
  }
  .${p}-hero-kpis .${p}-kpi--green .${p}-kpi-label{ color:rgba(5,150,105,0.9); }
  .${p}-hero-kpis .${p}-kpi--teal{
    background:linear-gradient(145deg, rgba(8,145,178,0.14), rgba(8,145,178,0.04));
    border-color:rgba(8,145,178,0.24);
  }
  .${p}-hero-kpis .${p}-kpi--teal .${p}-kpi-label{ color:rgba(8,145,178,0.9); }
  .${p}-hero-kpis .${p}-kpi--violet{
    background:linear-gradient(145deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04));
    border-color:rgba(124,58,237,0.22);
  }
  .${p}-hero-kpis .${p}-kpi--violet .${p}-kpi-label{ color:rgba(124,58,237,0.85); }
  .${p}-hero-kpis .${p}-kpi--indigo{
    background:linear-gradient(145deg, rgba(79,70,229,0.12), rgba(79,70,229,0.04));
    border-color:rgba(79,70,229,0.2);
  }
  .${p}-hero-kpis .${p}-kpi--indigo .${p}-kpi-label{ color:rgba(79,70,229,0.85); }
  .${p}-hero-kpis .${p}-kpi--emerald{
    background:linear-gradient(145deg, rgba(16,185,129,0.14), rgba(16,185,129,0.04));
    border-color:rgba(16,185,129,0.24);
  }
  .${p}-hero-kpis .${p}-kpi--emerald .${p}-kpi-label{ color:rgba(5,150,105,0.9); }
  .${p}-hero-kpis .${p}-kpi--amber{
    background:linear-gradient(145deg, rgba(217,119,6,0.14), rgba(217,119,6,0.04));
    border-color:rgba(217,119,6,0.24);
  }
  .${p}-hero-kpis .${p}-kpi--amber .${p}-kpi-label{ color:rgba(217,119,6,0.9); }
  .${p}-hero-kpis .${p}-kpi--red{
    background:linear-gradient(145deg, rgba(220,38,38,0.12), rgba(220,38,38,0.04));
    border-color:rgba(220,38,38,0.22);
  }
  .${p}-hero-kpis .${p}-kpi--red .${p}-kpi-label{ color:rgba(220,38,38,0.85); }
  .${p}-hero-kpis .${p}-kpi-value-row{
    display:flex; align-items:baseline; flex-wrap:wrap; gap:4px; min-width:0;
  }
  .${p}-hero-kpis .${p}-kpi-value-row .v{ font-size:12px; line-height:1.15; white-space:nowrap; font-weight:700; }
  .${p}-hero-kpis .${p}-kpi-value-row .${up},
  .${p}-hero-kpis .${p}-kpi-value-row .${down}{ font-size:8px; white-space:nowrap; line-height:1.15; font-weight:600; }
  .${p}-hero-kpis .${p}-kpi-value-row .${up}{ color:${C.green}; }
  .${p}-hero-kpis .${p}-kpi-value-row .${down}{ color:${C.red}; }
  .${p}-hero-hint{ margin:0; font-size:9px; line-height:1.35; }
  .${p}-hero-ai{
    grid-area:ai;
    align-self:stretch;
    margin-top:0; padding:10px 12px 10px 14px; border-radius:10px;
    border:1px solid ${C.borderSoft};
    background:linear-gradient(135deg, rgba(124,58,237,0.06), ${C.panel});
    position:relative; width:100%; box-sizing:border-box; min-width:0;
  }
  .${p}-hero-ai:before{
    content:""; position:absolute; left:0; top:8px; bottom:8px; width:3px; border-radius:2px;
    background:linear-gradient(180deg, ${aiFrom}, ${aiTo});
  }
  .${p}-hero-ai-title{ color:${C.violet}; letter-spacing:1.1px; margin:0; }
  .${p}-hero-ai-head{
    display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px;
  }
  .${p}-hero-ai-head .${p}-faint{ font-size:9px; }
  .${p}-hero-ai-grid{ display:grid; grid-template-columns:minmax(0,1.55fr) minmax(0,1fr) minmax(0,1fr); gap:12px; }
  .${p}-hero-ai-card:first-child{ min-width:0; }
  .${p}-hero-ai-card{
    padding:8px 10px; border-radius:8px; border:1px solid ${C.borderSoft}; background:${C.panel};
    font-size:10px; line-height:1.4; color:${C.textDim};
  }
  .${p}-hero-ai-card b{ display:block; font-size:8px; letter-spacing:.8px; text-transform:uppercase; margin-bottom:4px; font-weight:700; }
  .${p}-hero-ai-copy{ margin:0; font-size:10px; line-height:1.45; color:${C.textDim}; }
  .${p}-hero-ai-card.warn b{ color:${C.amber}; }
  .${p}-hero-ai-card.ok b{ color:${C.green}; }
  .${p}-hero-ai-card.info b{ color:${C.blue}; }
  .${p}-hero-topic-btns{ display:flex; flex-direction:row; flex-wrap:nowrap; gap:8px; }
  .${p}-hero-topic-btn-positive{ order:1; }
  .${p}-hero-topic-btn-negative{ order:2; }
  .${p}-hero-topic-btn-critical{ order:3; }
  .${p}-hero-topic-btn{
    padding:6px 14px; border-radius:8px; font-size:11px; font-weight:600;
    cursor:pointer; transition:background .15s, border-color .15s, color .15s, box-shadow .15s;
    font-family:inherit; border:1px solid ${C.borderSoft}; background:${C.panel}; color:${C.textDim};
  }
  .${p}-hero-topic-btn-positive{ color:${C.green}; border-color:rgba(5,150,105,0.35); }
  .${p}-hero-topic-btn-negative{ color:${C.amber}; border-color:rgba(217,119,6,0.35); }
  .${p}-hero-topic-btn-critical{ color:${C.red}; border-color:rgba(220,38,38,0.35); }
  .${p}-hero-topic-btn.active{ color:${C.text}; box-shadow:0 2px 8px rgba(15,23,42,0.08); }
  .${p}-hero-topic-btn-positive.active{ background:rgba(5,150,105,0.12); border-color:rgba(5,150,105,0.5); }
  .${p}-hero-topic-btn-negative.active{ background:rgba(217,119,6,0.12); border-color:rgba(217,119,6,0.5); }
  .${p}-hero-topic-btn-critical.active{ background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.5); }
  .${p}-hero-topic-backdrop{
    position:fixed; inset:0; z-index:40; border:none; background:transparent; cursor:default;
  }
  .${p}-hero-topic-popover{
    position:absolute; right:0; bottom:0; z-index:50; width:min(320px,calc(100vw - 48px));
    padding:12px 14px; border-radius:10px; border:1px solid ${C.border};
    background:${C.panel}; box-shadow:0 12px 32px rgba(15,23,42,0.14);
  }
  .${p}-hero-topic-popover-positive{ border-color:rgba(5,150,105,0.35); }
  .${p}-hero-topic-popover-negative{ border-color:rgba(217,119,6,0.35); }
  .${p}-hero-topic-popover-critical{ border-color:rgba(220,38,38,0.35); }
  .${p}-hero-topic-popover-head{
    display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;
  }
  .${p}-hero-topic-popover-title{ margin:0; font-size:12px; font-weight:700; letter-spacing:.4px; }
  .${p}-hero-topic-popover-positive .${p}-hero-topic-popover-title{ color:${C.green}; }
  .${p}-hero-topic-popover-negative .${p}-hero-topic-popover-title{ color:${C.amber}; }
  .${p}-hero-topic-popover-critical .${p}-hero-topic-popover-title{ color:${C.red}; }
  .${p}-hero-topic-popover-close{
    border:none; background:transparent; color:${C.textFaint}; font-size:18px; line-height:1;
    cursor:pointer; padding:0 4px; font-family:inherit;
  }
  .${p}-hero-topic-popover-close:hover{ color:${C.text}; }
  .${p}-hero-topic-popover-list{
    margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px;
  }
  .${p}-hero-topic-popover-list li{
    padding-bottom:10px; border-bottom:1px solid ${C.borderSoft};
  }
  .${p}-hero-topic-popover-list li:last-child{ padding-bottom:0; border-bottom:none; }
  .${p}-hero-topic-popover-label{
    display:block; font-size:11px; font-weight:700; color:${C.text}; margin-bottom:3px;
  }
  .${p}-hero-topic-popover-detail{
    display:block; font-size:10px; line-height:1.45; color:${C.textDim};
  }
  .${p}-metric-rows{ margin-top:4px; }
  .${p}-metric-row{ margin-bottom:8px; }
  .${p}-metric-row:last-child{ margin-bottom:0; }
  @media(max-width:1100px){
    .${p}-hero-layout{ grid-template-columns:minmax(260px,36%) 1fr; column-gap:12px; }
    .${p}-hero-ai-grid{ grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(0,1fr); }
    .${p}-hero-kpis .${p}-kpi .v{ font-size:11px; }
    .${p}-hero-kpis{ gap:8px; }
  }
  @media(max-width:900px){
    .${p}-hero-layout{
      grid-template-columns:1fr;
      grid-template-areas:
        "title"
        "kpis"
        "ai"
        "score";
      row-gap:12px;
    }
    .${p}-hero-kpis{
      display:flex; flex-wrap:nowrap; gap:8px; overflow-x:auto;
      padding-bottom:2px; -webkit-overflow-scrolling:touch;
    }
    .${p}-hero-kpis .${p}-kpi{ flex:0 0 104px; min-height:48px; }
    .${p}-hero-score-zone{ grid-template-columns:1fr; grid-template-rows:auto auto auto; }
    .${p}-hero-score-stack{ grid-column:1; grid-row:1; }
    .${p}-hero-chart-col{ grid-column:1; grid-row:2; align-items:flex-start; text-align:left; }
    .${p}-hero-chart-block{ align-items:flex-start; text-align:left; }
    .${p}-hero-chart-hint-wrap{ text-align:left; }
    .${p}-hero-chart-hint-wrap .${p}-hero-hint{ text-align:left; }
    .${p}-hero-topic-wrap{ grid-column:1; grid-row:3; }
    .${p}-hero-topic-btns, .${p}-hero-score-zone .${p}-hero-topic-btns{
      flex-wrap:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch;
    }
    .${p}-hero-ai-grid{ grid-template-columns:1fr; gap:8px; }
    .${p}-hero-topic-popover{
      position:fixed; right:12px; bottom:12px; left:auto; width:min(300px,calc(100vw - 24px));
    }
  }
`;
}

/** Operations KPI card — title + badge header, icon + value + delta footer (no sparkline). */
export function opsDrillHeroKpiStyles(prefix) {
  const p = prefix;
  return `
  .${p}-hero-kpis .${p}-ops-kpi{
    position:relative; overflow:hidden; display:flex; flex-direction:column; gap:3px;
    width:100%; height:100%; min-width:0; padding:5px 7px 5px 10px; border-radius:7px; box-sizing:border-box;
    border:1px solid ${C.borderSoft};
    background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    box-shadow:0 1px 0 rgba(15,23,42,0.05);
    min-height:54px; max-height:54px;
  }
  .${p}-ops-kpi-accent{
    position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:7px 0 0 7px;
  }
  .${p}-ops-kpi-head{
    display:flex; align-items:center; justify-content:space-between; gap:4px; min-width:0;
  }
  .${p}-ops-kpi-title{
    font-size:8px; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
    line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .${p}-ops-kpi-badge{
    flex-shrink:0; display:inline-flex; align-items:center; gap:3px;
    font-size:7px; font-weight:600; line-height:1; padding:1px 5px; border-radius:999px;
    white-space:nowrap; max-width:52%; overflow:hidden; text-overflow:ellipsis;
  }
  .${p}-ops-kpi-badge-dot{ width:4px; height:4px; border-radius:50%; flex-shrink:0; }
  .${p}-ops-kpi-badge--up{ color:#047857; background:rgba(5,150,105,0.12); }
  .${p}-ops-kpi-badge--up .${p}-ops-kpi-badge-dot{ background:#059669; }
  .${p}-ops-kpi-badge--down{ color:#b45309; background:rgba(217,119,6,0.12); }
  .${p}-ops-kpi-badge--down .${p}-ops-kpi-badge-dot{ background:#d97706; }
  .${p}-ops-kpi-badge--flat{ color:#64748b; background:rgba(148,163,184,0.14); }
  .${p}-ops-kpi-badge--flat .${p}-ops-kpi-badge-dot{ background:#94a3b8; }
  .${p}-ops-kpi-body{ display:flex; align-items:center; gap:6px; min-width:0; flex:1; min-height:0; }
  .${p}-ops-kpi-icon-wrap{
    flex-shrink:0; width:26px; height:26px; border-radius:6px;
    display:grid; place-items:center; border:1px solid transparent;
    background:rgba(37,99,235,0.08);
  }
  .${p}-ops-kpi-icon-wrap svg{ width:14px; height:14px; }
  .${p}-ops-kpi-data{ flex:1; min-width:0; display:flex; flex-direction:column; gap:1px; justify-content:center; }
  .${p}-ops-kpi-value{
    font-size:13px; font-weight:800; line-height:1.05; letter-spacing:-0.03em;
    font-variant-numeric:tabular-nums;
    font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .${p}-ops-kpi-foot{
    display:flex; align-items:center; flex-wrap:nowrap; gap:4px; min-width:0;
    font-size:7px; line-height:1.15;
  }
  .${p}-ops-kpi-delta{ font-weight:700; white-space:nowrap; }
  .${p}-ops-kpi-delta--up{ color:#059669; }
  .${p}-ops-kpi-delta--down{ color:#d97706; }
  .${p}-ops-kpi-delta--flat{ color:#64748b; }
  .${p}-ops-kpi-sep{ color:${C.border}; font-weight:300; }
  .${p}-ops-kpi-compare{ color:${C.textFaint}; white-space:nowrap; }
  .${p}-ops-kpi--blue .${p}-ops-kpi-accent{ background:#2563eb; }
  .${p}-ops-kpi--blue .${p}-ops-kpi-title{ color:#2563eb; }
  .${p}-ops-kpi--blue{ border-color:rgba(37,99,235,0.18); }
  .${p}-ops-kpi--green .${p}-ops-kpi-accent{ background:#059669; }
  .${p}-ops-kpi--green .${p}-ops-kpi-title{ color:#059669; }
  .${p}-ops-kpi--green{ border-color:rgba(5,150,105,0.2); }
  .${p}-ops-kpi--teal .${p}-ops-kpi-accent{ background:#0d9488; }
  .${p}-ops-kpi--teal .${p}-ops-kpi-title{ color:#0d9488; }
  .${p}-ops-kpi--violet .${p}-ops-kpi-accent{ background:#7c3aed; }
  .${p}-ops-kpi--violet .${p}-ops-kpi-title{ color:#7c3aed; }
  .${p}-ops-kpi--violet{ border-color:rgba(124,58,237,0.18); }
  .${p}-ops-kpi--indigo .${p}-ops-kpi-accent{ background:#4f46e5; }
  .${p}-ops-kpi--indigo .${p}-ops-kpi-title{ color:#4f46e5; }
  .${p}-ops-kpi--indigo{ border-color:rgba(79,70,229,0.18); }
  .${p}-ops-kpi--emerald .${p}-ops-kpi-accent{ background:#10b981; }
  .${p}-ops-kpi--emerald .${p}-ops-kpi-title{ color:#059669; }
  .${p}-ops-kpi--amber .${p}-ops-kpi-accent{ background:#d97706; }
  .${p}-ops-kpi--amber .${p}-ops-kpi-title{ color:#d97706; }
  .${p}-ops-kpi--amber{ border-color:rgba(217,119,6,0.22); }
  .${p}-ops-kpi--red .${p}-ops-kpi-accent{ background:#dc2626; }
  .${p}-ops-kpi--red .${p}-ops-kpi-title{ color:#dc2626; }
  .${p}-ops-kpi--red{ border-color:rgba(220,38,38,0.2); }
  `;
}

/** Crumb bar title: icon + black sentence-case question (shared across drill-downs). */
export function drillCrumbTitleStyles(prefix) {
  const p = prefix;
  return `
  .${p}-crumb{
    display:inline-flex; align-items:center; gap:8px;
    font-size:14px; font-weight:600; letter-spacing:0; text-transform:none; line-height:1.25;
    color:${C.text}; margin-bottom:0;
  }
  .${p}-crumb-icon{
    width:26px; height:26px; border-radius:7px; flex-shrink:0;
    display:grid; place-items:center;
    background:rgba(15,23,42,0.06); color:${C.text}; font-size:13px;
  }
  .${p}-crumb-text{ color:${C.text}; }
  `;
}

/**
 * Compact hero: KPI stat grid left (stretched), topic-driven AI right.
 * Page title lives in the crumb bar, not the hero panel.
 * @param {string} prefix — CSS class prefix (e.g. pf, gd)
 * @param {{ kpiColumns?: number, kpiRows?: number, kpiWidth?: number }} [opts]
 */
export function compactDrillHeroStyles(prefix, opts = {}) {
  const p = prefix;
  const kpiColumns = opts.kpiColumns ?? 2;
  const kpiRows = opts.kpiRows ?? 2;
  const kpiColWidth = opts.kpiWidth ?? 140;
  const kpiGridWidth = kpiColumns * kpiColWidth + (kpiColumns - 1) * 8;
  const kpiRowTracks = Array(kpiRows).fill('1fr').join(' ');
  return `
  .${p}-hero-panel{ padding:10px 12px; position:relative; overflow:visible; }
  .${p}-hero-layout{
    display:flex; flex-direction:row; align-items:stretch; gap:12px; margin-bottom:0; min-width:0;
  }
  .${p}-hero-left{
    display:flex; flex-direction:column; align-self:stretch;
    flex:0 0 auto; width:max-content; max-width:100%; min-width:0; min-height:0;
  }
  .${p}-hero-metrics{
    width:100%; min-width:0; flex:1; display:flex; align-items:stretch; height:100%;
  }
  .${p}-hero-kpis{
    display:grid; grid-template-columns:repeat(${kpiColumns},${kpiColWidth}px);
    grid-template-rows:${kpiRowTracks};
    gap:8px; width:${kpiGridWidth}px; height:100%; margin:0; box-sizing:border-box;
    align-items:stretch; align-content:stretch; min-height:0;
  }
  ${opsDrillHeroKpiStyles(p)}
  .${p}-hero-kpis .${p}-ops-kpi{ height:100%; min-height:54px; max-height:none; }
  .${p}-hero-ai{
    flex:1 1 0; min-width:0; margin:0;
    padding:6px 8px 6px 10px; border-radius:8px;
    border:1px solid ${C.borderSoft};
    background:linear-gradient(135deg, rgba(124,58,237,0.06), ${C.panel});
    position:relative; width:100%; box-sizing:border-box; min-height:0;
    display:flex; flex-direction:column; overflow:hidden;
  }
  .${p}-hero-ai-expanded .${p}-hero-ai-grid{
    flex:1;
    display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
    gap:6px; align-items:stretch; min-height:0;
  }
  .${p}-hero-ai-expanded .${p}-hero-ai-card{
    display:flex; flex-direction:column; justify-content:flex-start;
    padding:7px 9px; min-height:0; height:100%; max-height:100%;
    box-sizing:border-box; overflow:hidden;
  }
  .${p}-hero-ai:before{
    content:""; position:absolute; left:0; top:5px; bottom:5px; width:3px; border-radius:2px;
    background:linear-gradient(180deg, ${C.violet}, ${C.blue});
  }
  .${p}-hero-ai-title{ color:${C.violet}; letter-spacing:1.1px; margin:0; }
  .${p}-hero-ai-head{
    display:flex; justify-content:space-between; align-items:center; gap:8px;
    margin-bottom:4px; flex-shrink:0; flex-wrap:wrap; min-width:0;
  }
  .${p}-hero-ai-head-main{
    display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; flex:1;
  }
  .${p}-hero-ai-confidence{ font-size:9px; color:${C.textFaint}; white-space:nowrap; flex-shrink:0; }
  .${p}-hero-ai-topic-btns{
    display:inline-flex; align-items:stretch; flex-wrap:nowrap; gap:6px; min-width:0;
  }
  .${p}-hero-ai-topic-btns .${p}-hero-topic-btn-positive{ order:1; }
  .${p}-hero-ai-topic-btns .${p}-hero-topic-btn-negative{ order:2; }
  .${p}-hero-ai-topic-btns .${p}-hero-topic-btn-critical{ order:3; }
  .${p}-hero-ai-topic-btns .${p}-hero-topic-btn{
    display:inline-flex; align-items:center; justify-content:center;
    min-height:24px; height:24px; padding:0 10px; border-radius:6px;
    font-size:9px; font-weight:600; line-height:1;
    cursor:pointer; transition:background .15s, border-color .15s, color .15s, box-shadow .15s;
    font-family:inherit; border:1px solid ${C.borderSoft}; background:${C.panel}; color:${C.textDim};
    box-sizing:border-box; white-space:nowrap;
  }
  .${p}-hero-ai-grid{ min-width:0; }
  .${p}-hero-ai-card{
    border-radius:7px; border:1px solid ${C.borderSoft}; background:${C.panel};
    font-size:10.6px; color:#334155; min-width:0;
  }
  .${p}-hero-ai-card b{
    display:block; font-size:9.6px; letter-spacing:.7px; text-transform:uppercase;
    margin-bottom:3px; font-weight:800; color:#334155; flex-shrink:0;
  }
  .${p}-hero-ai-expanded .${p}-hero-ai-points{
    font-size:11.1px; line-height:1.37;
  }
  .${p}-hero-ai-points{
    margin:0; padding:0 0 0 12px; list-style:disc;
    font-size:10.6px; line-height:1.38; font-weight:600; color:#1e293b;
    flex:1; min-height:0; overflow:hidden;
    overflow-wrap:break-word; word-break:break-word;
  }
  .${p}-hero-ai-points li{ margin-bottom:2px; padding-left:1px; }
  .${p}-hero-ai-points li:last-child{ margin-bottom:0; }
  .${p}-hero-ai-positive .${p}-hero-ai-topic-title{ color:${C.green}; }
  .${p}-hero-ai-negative .${p}-hero-ai-topic-title{ color:${C.amber}; }
  .${p}-hero-ai-critical .${p}-hero-ai-topic-title{ color:${C.red}; }
  .${p}-hero-ai-card.warn b{ color:${C.amber}; }
  .${p}-hero-ai-card.ok b{ color:${C.green}; }
  .${p}-hero-ai-card.info b{ color:${C.blue}; }
  .${p}-hero-topic-btn-positive{ color:${C.green}; border-color:rgba(5,150,105,0.35); }
  .${p}-hero-topic-btn-negative{ color:${C.amber}; border-color:rgba(217,119,6,0.35); }
  .${p}-hero-topic-btn-critical{ color:${C.red}; border-color:rgba(220,38,38,0.35); }
  .${p}-hero-topic-btn.active{
    color:${C.text}; box-shadow:0 2px 8px rgba(15,23,42,0.08);
  }
  .${p}-hero-topic-btn-positive.active{ background:rgba(5,150,105,0.12); border-color:rgba(5,150,105,0.5); }
  .${p}-hero-topic-btn-negative.active{ background:rgba(217,119,6,0.12); border-color:rgba(217,119,6,0.5); }
  .${p}-hero-topic-btn-critical.active{ background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.5); }
  @media(max-width:1100px){
    .${p}-hero-layout{ gap:10px; }
    .${p}-hero-kpis .${p}-ops-kpi-value{ font-size:12px; }
  }
  @media(max-width:900px){
    .${p}-hero-layout{ flex-direction:column; gap:8px; }
    .${p}-hero-left{ width:100%; max-width:100%; min-height:0; }
    .${p}-hero-metrics{ margin-top:0; }
    .${p}-hero-ai-expanded .${p}-hero-ai-grid{ grid-template-columns:1fr; }
    .${p}-hero-kpis{
      width:100%; height:auto;
      grid-template-columns:repeat(${kpiColumns},minmax(0,1fr));
      grid-template-rows:repeat(${kpiRows},54px);
    }
    .${p}-hero-kpis .${p}-ops-kpi{ height:54px; min-height:52px; max-height:54px; }
    .${p}-hero-kpis .${p}-ops-kpi-value{ font-size:12px; }
    .${p}-hero-ai-head{ align-items:flex-start; }
    .${p}-hero-ai-topic-btns{ flex-wrap:wrap; }
  }
`;
}

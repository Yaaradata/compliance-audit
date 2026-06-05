/**
 * Light theme + compact density for FASTag Operations drill-downs.
 */

import {
  compactDrillHeroStyles,
  drillCrumbTitleStyles,
  drillHeroStyles,
  opsDrillHeroKpiStyles,
} from './fastTagDrillHeroStyles';
import { issuesVizStyles } from './fastTagIssuesVizStyles';
import { drillVizStyles } from './fastTagDrillVizStyles';

export const DRILL_C = {
  bg: '#f8fafc',
  panel: '#ffffff',
  panelAlt: '#ffffff',
  card: '#ffffff',
  border: '#e2e8f0',
  borderSoft: '#f1f5f9',
  text: '#0f172a',
  textDim: '#475569',
  textFaint: '#64748b',
  red: '#dc2626',
  redDeep: '#b91c1c',
  amber: '#d97706',
  amberDeep: '#b45309',
  green: '#059669',
  blue: '#2563eb',
  teal: '#0891b2',
  violet: '#7c3aed',
  orange: '#ea580c',
};

function rootBlock(prefix, glowPrimary, glowSecondary) {
  const C = DRILL_C;
  return `
  .${prefix}-root *{box-sizing:border-box;}
  .${prefix}-root{
    background:
      radial-gradient(900px 400px at 12% -8%, ${glowPrimary}, transparent 58%),
      radial-gradient(800px 360px at 92% 0%, ${glowSecondary}, transparent 55%),
      ${C.bg};
    color:${C.text};
    font-family:ui-sans-serif,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    min-height:0;
    padding:12px 14px 24px;
    letter-spacing:.1px;
    font-size:12px;
  }
  .${prefix}-stack > * + *{ margin-top:${DRILL_GAP}px; }
  .${prefix}-panel{
    background:${C.panel};
    border:1px solid ${C.border};
    border-radius:12px;
    box-shadow:0 1px 2px rgba(15,23,42,0.05);
    padding:12px 14px;
  }
  .${prefix}-card{
    background:${C.card};
    border:1px solid ${C.border};
    border-radius:12px;
    padding:12px 14px;
    box-shadow:0 1px 2px rgba(15,23,42,0.04);
  }
  .${prefix}-faint{ color:${C.textFaint}; }
  .${prefix}-dim{ color:${C.textDim}; }
  .${prefix}-label{
    font-size:9px; letter-spacing:1.2px; text-transform:uppercase; color:${C.textFaint};
  }
  .${prefix}-row{ display:flex; justify-content:space-between; align-items:center; gap:8px; }
  .${prefix}-badge{
    font-size:9px; font-weight:700; letter-spacing:.5px; padding:3px 7px; border-radius:6px;
    display:inline-flex; align-items:center; gap:4px; white-space:nowrap;
  }
  .${prefix}-back{
    display:inline-flex; align-items:center; gap:6px; cursor:pointer; color:${C.textDim};
    font-size:11px; padding:5px 10px; border-radius:8px; border:1px solid ${C.border};
    background:${C.panel}; transition:.15s; flex-shrink:0;
    font-family:inherit; line-height:1.2;
  }
  button.${prefix}-back{ appearance:none; margin:0; }
  .${prefix}-back:hover{
    color:${C.text}; border-color:#cbd5e1; background:${C.borderSoft};
  }
  .${prefix}-sechead{ display:flex; align-items:flex-start; gap:8px; margin:0 0 8px; }
  .${prefix}-sechead .n{
    width:20px; height:20px; border-radius:6px; display:grid; place-items:center;
    font-size:10px; font-weight:700; flex-shrink:0;
  }
  .${prefix}-sechead h3, .${prefix}-insight{
    margin:0; font-size:12.5px; font-weight:600; color:${C.text}; line-height:1.35;
  }
  .${prefix}-chart-hint{
    font-size:10px; color:${C.textFaint}; margin-top:4px; line-height:1.35;
    display:flex; align-items:flex-start; gap:4px;
  }
  .${prefix}-chart-hint span{ color:${C.teal}; flex-shrink:0; }
  .${prefix}-th{
    font-size:9px; letter-spacing:.7px; text-transform:uppercase; color:${C.textFaint};
    text-align:left; padding:0 8px 5px; font-weight:600;
  }
  .${prefix}-td{
    font-size:11.5px; padding:7px 8px; border-top:1px solid ${C.borderSoft};
    vertical-align:middle; color:${C.textDim};
  }
  .${prefix}-track, .${prefix}-bar-track{
    height:7px; border-radius:4px; background:${C.borderSoft}; overflow:hidden;
  }
  .${prefix}-fill, .${prefix}-bar-fill{ height:100%; border-radius:4px; }
  .${prefix}-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:stretch; }
  .${prefix}-grid3{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .${prefix}-aibox{
    border:1px solid ${C.borderSoft}; border-radius:10px; padding:8px 10px 8px 12px;
    background:linear-gradient(180deg, ${C.borderSoft}, ${C.panel}); position:relative;
  }
  .${prefix}-aibox:before{
    content:""; position:absolute; left:0; top:6px; bottom:6px; width:3px; border-radius:2px;
    background:linear-gradient(180deg, var(--ac, ${C.violet}), transparent);
  }
  .${prefix}-crumb-row{
    display:flex; justify-content:space-between; align-items:center; gap:10px;
    margin-bottom:8px; flex-wrap:wrap;
  }
  .${prefix}-crumb{
    font-size:10px; font-weight:700; letter-spacing:1.1px; text-transform:uppercase;
    margin-bottom:0;
  }
  .${prefix}-crumb-actions{
    display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap;
    margin-left:auto;
  }
  .${prefix}-period-filter{
    display:inline-flex; align-items:center; gap:1px; padding:2px;
    border-radius:9px; border:1px solid ${C.border}; background:${C.panel};
  }
  .${prefix}-period-btn{
    appearance:none; margin:0; border:none; cursor:pointer; font-family:inherit;
    font-size:10px; font-weight:600; padding:4px 8px; border-radius:7px;
    color:${C.textDim}; background:transparent; transition:.15s; white-space:nowrap;
  }
  .${prefix}-period-btn:hover{ color:${C.text}; background:${C.borderSoft}; }
  .${prefix}-period-btn.active{
    color:#fff; background:${C.text}; box-shadow:0 1px 3px rgba(15,23,42,0.12);
  }
  @media(max-width:1024px){
    .${prefix}-grid2, .${prefix}-grid3{ grid-template-columns:1fr; }
  }`;
}

const C = DRILL_C;
const DRILL_GAP = 10;

function compactKpi(prefix) {
  return `
  .${prefix}-kpi{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:10px;
    background:${C.bg};
  }
  .${prefix}-kpi .v{ font-size:17px; font-weight:700; line-height:1.1; color:${C.text}; }
`;
}

export const PERFORMANCE_STYLE = `${rootBlock('pf', 'rgba(123,47,240,0.08)', 'rgba(37,99,235,0.06)')}
  .pf-up{ color:${C.green}; font-weight:600; font-size:10px; }
  .pf-down{ color:${C.red}; font-weight:600; font-size:10px; }
  .pf-track{ height:7px; }
  .pf-grid6{ display:grid; grid-template-columns:repeat(6,1fr); gap:8px; }
  ${drillCrumbTitleStyles('pf')}
  .pf-hero-panel{ padding:10px 12px; position:relative; overflow:visible; }
  .pf-hero-layout{
    display:flex; flex-direction:row; align-items:stretch; gap:12px; margin-bottom:0; min-width:0;
  }
  .pf-hero-left{
    display:flex; flex-direction:column; align-self:stretch;
    flex:0 0 auto; width:max-content; max-width:100%; min-width:0; min-height:0;
  }
  .pf-hero-title-stack{
    display:flex; flex-direction:column; gap:2px; min-width:0; max-width:100%; flex-shrink:0;
  }
  .pf-hero-subtitle{
    margin:0; line-height:1.25; white-space:nowrap;
  }
  .pf-hero-metrics{
    width:100%; min-width:0; flex:1; display:flex; align-items:stretch; height:100%;
  }
  .pf-hero-title-text{ font-size:14px; font-weight:600; line-height:1.25; color:${C.text}; }
  .pf-hero-kpis{
    display:grid; grid-template-columns:repeat(2,140px); grid-template-rows:1fr 1fr;
    gap:8px; width:288px; height:100%; margin:0; box-sizing:border-box;
    align-items:stretch; align-content:stretch; min-height:0;
  }
  .pf-hero-score-zone{
    grid-area:score;
    display:grid;
    grid-template-columns:auto minmax(0,1fr);
    grid-template-rows:auto auto auto;
    column-gap:10px; row-gap:10px;
    min-width:0; width:100%; align-self:start;
  }
  .pf-hero-score-stack{
    grid-column:1; grid-row:1;
    display:flex; flex-direction:column; gap:4px; min-width:0;
  }
  .pf-hero-score-main{
    display:flex; align-items:flex-start; min-width:0;
  }
  .pf-hero-score-val{
    font-size:36px; font-weight:700; line-height:1; flex-shrink:0;
  }
  .pf-hero-chart-col{
    grid-column:2; grid-row:1 / 3;
    display:flex; flex-direction:column; align-items:stretch; gap:4px;
    min-width:0; width:100%; text-align:left; align-self:stretch; justify-self:stretch;
  }
  .pf-hero-chart-block{
    width:100%; min-width:0; max-width:none;
    display:flex; flex-direction:column; align-items:stretch; gap:4px;
    text-align:left;
  }
  .pf-hero-chart-hint-wrap{
    min-width:0; width:100%; text-align:left; align-self:stretch;
  }
  .pf-hero-chart-hint-wrap .pf-hero-hint{ text-align:left; }
  .pf-hero-chart-block .drill-hero-trend-chart{ width:100%; }
  .pf-hero-chart-block > .pf-label{ margin:0; width:100%; text-align:center; }
  .pf-hero-score-zone .pf-hero-topic-btns{
    display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center;
    justify-content:flex-start; gap:6px; min-width:0;
  }
  .pf-hero-score-zone .pf-hero-topic-btn-positive{ order:1; }
  .pf-hero-score-zone .pf-hero-topic-btn-negative{ order:2; }
  .pf-hero-score-zone .pf-hero-topic-btn-critical{ order:3; }
  .pf-hero-score-zone .pf-hero-topic-btn{
    flex:0 1 auto; min-width:0; padding:5px 10px; font-size:10px; text-align:center;
    white-space:nowrap;
  }
  .pf-hero-score-label{ font-size:10px; margin-top:0; }
  ${opsDrillHeroKpiStyles('pf')}
  .pf-hero-kpis .pf-ops-kpi{ height:100%; min-height:54px; max-height:none; }
  .pf-hero-hint{ margin:0; font-size:9px; line-height:1.35; }
  .pf-hero-ai{
    flex:1 1 0; min-width:0; margin:0;
    padding:6px 8px 6px 10px; border-radius:8px;
    border:1px solid ${C.borderSoft};
    background:linear-gradient(135deg, rgba(124,58,237,0.06), ${C.panel});
    position:relative; width:100%; box-sizing:border-box; min-height:0;
    display:flex; flex-direction:column; overflow:hidden;
  }
  .pf-hero-ai-expanded .pf-hero-ai-grid{
    flex:1;
    display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
    gap:6px; align-items:stretch; min-height:0;
  }
  .pf-hero-ai-expanded .pf-hero-ai-card{
    display:flex; flex-direction:column; justify-content:flex-start;
    padding:7px 9px; min-height:0; height:100%; max-height:100%;
    box-sizing:border-box; overflow:hidden;
  }
  .pf-hero-ai:before{
    content:""; position:absolute; left:0; top:5px; bottom:5px; width:3px; border-radius:2px;
    background:linear-gradient(180deg, ${C.violet}, ${C.blue});
  }
  .pf-hero-ai-title{ color:${C.violet}; letter-spacing:1.1px; margin:0; }
  .pf-hero-ai-head{
    display:flex; justify-content:space-between; align-items:center; gap:8px;
    margin-bottom:4px; flex-shrink:0; flex-wrap:wrap; min-width:0;
  }
  .pf-hero-ai-head-main{
    display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; flex:1;
  }
  .pf-hero-ai-confidence{ font-size:9px; color:${C.textFaint}; white-space:nowrap; flex-shrink:0; }
  .pf-hero-ai-topic-btns{
    display:inline-flex; align-items:stretch; flex-wrap:nowrap; gap:6px; min-width:0;
  }
  .pf-hero-ai-topic-btns .pf-hero-topic-btn-positive{ order:1; }
  .pf-hero-ai-topic-btns .pf-hero-topic-btn-negative{ order:2; }
  .pf-hero-ai-topic-btns .pf-hero-topic-btn-critical{ order:3; }
  .pf-hero-ai-topic-btns .pf-hero-topic-btn{
    display:inline-flex; align-items:center; justify-content:center;
    min-height:24px; height:24px; padding:0 10px; border-radius:6px;
    font-size:9px; font-weight:600; line-height:1;
    cursor:pointer; transition:background .15s, border-color .15s, color .15s, box-shadow .15s;
    font-family:inherit; border:1px solid ${C.borderSoft}; background:${C.panel}; color:${C.textDim};
    box-sizing:border-box; white-space:nowrap;
  }
  .pf-hero-ai-grid{ min-width:0; }
  .pf-hero-ai-card{
    border-radius:7px; border:1px solid ${C.borderSoft}; background:${C.panel};
    font-size:10.6px; color:#334155; min-width:0;
  }
  .pf-hero-ai-card b{
    display:block; font-size:9.6px; letter-spacing:.7px; text-transform:uppercase;
    margin-bottom:3px; font-weight:800; color:#334155; flex-shrink:0;
  }
  .pf-hero-ai-expanded .pf-hero-ai-points{
    font-size:11.1px; line-height:1.37;
  }
  .pf-hero-ai-points{
    margin:0; padding:0 0 0 12px; list-style:disc;
    font-size:10.6px; line-height:1.38; font-weight:600; color:#1e293b;
    flex:1; min-height:0; overflow:hidden;
    overflow-wrap:break-word; word-break:break-word;
  }
  .pf-hero-ai-points li{
    margin-bottom:2px; padding-left:1px;
  }
  .pf-hero-ai-points li:last-child{ margin-bottom:0; }
  .pf-hero-ai-topic-title{ font-size:10px; font-weight:700; letter-spacing:.5px; }
  .pf-hero-ai-positive .pf-hero-ai-topic-title{ color:${C.green}; }
  .pf-hero-ai-negative .pf-hero-ai-topic-title{ color:${C.amber}; }
  .pf-hero-ai-critical .pf-hero-ai-topic-title{ color:${C.red}; }
  .pf-hero-ai-card.warn b{ color:${C.amber}; }
  .pf-hero-ai-card.ok b{ color:${C.green}; }
  .pf-hero-ai-card.info b{ color:${C.blue}; }
  .pf-hero-topic-btn-positive{ color:${C.green}; border-color:rgba(5,150,105,0.35); }
  .pf-hero-topic-btn-negative{ color:${C.amber}; border-color:rgba(217,119,6,0.35); }
  .pf-hero-topic-btn-critical{ color:${C.red}; border-color:rgba(220,38,38,0.35); }
  .pf-hero-topic-btn.active{
    color:${C.text}; box-shadow:0 2px 8px rgba(15,23,42,0.08);
  }
  .pf-hero-topic-btn-positive.active{ background:rgba(5,150,105,0.12); border-color:rgba(5,150,105,0.5); }
  .pf-hero-topic-btn-negative.active{ background:rgba(217,119,6,0.12); border-color:rgba(217,119,6,0.5); }
  .pf-hero-topic-btn-critical.active{ background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.5); }
  .pf-hero-topic-backdrop{
    position:fixed; inset:0; z-index:40; border:none; background:transparent; cursor:default;
  }
  .pf-hero-topic-popover{
    position:absolute; right:0; bottom:0; z-index:50; width:min(320px,calc(100vw - 48px));
    padding:12px 14px; border-radius:10px; border:1px solid ${C.border};
    background:${C.panel}; box-shadow:0 12px 32px rgba(15,23,42,0.14);
  }
  .pf-hero-topic-popover-positive{ border-color:rgba(5,150,105,0.35); }
  .pf-hero-topic-popover-negative{ border-color:rgba(217,119,6,0.35); }
  .pf-hero-topic-popover-critical{ border-color:rgba(220,38,38,0.35); }
  .pf-hero-topic-popover-head{
    display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;
  }
  .pf-hero-topic-popover-title{ margin:0; font-size:12px; font-weight:700; letter-spacing:.4px; }
  .pf-hero-topic-popover-positive .pf-hero-topic-popover-title{ color:${C.green}; }
  .pf-hero-topic-popover-negative .pf-hero-topic-popover-title{ color:${C.amber}; }
  .pf-hero-topic-popover-critical .pf-hero-topic-popover-title{ color:${C.red}; }
  .pf-hero-topic-popover-close{
    border:none; background:transparent; color:${C.textFaint}; font-size:18px; line-height:1;
    cursor:pointer; padding:0 4px; font-family:inherit;
  }
  .pf-hero-topic-popover-close:hover{ color:${C.text}; }
  .pf-hero-topic-popover-list{
    margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px;
  }
  .pf-hero-topic-popover-list li{
    padding-bottom:10px; border-bottom:1px solid ${C.borderSoft};
  }
  .pf-hero-topic-popover-list li:last-child{ padding-bottom:0; border-bottom:none; }
  .pf-hero-topic-popover-label{
    display:block; font-size:11px; font-weight:700; color:${C.text}; margin-bottom:3px;
  }
  .pf-hero-topic-popover-detail{
    display:block; font-size:10px; line-height:1.45; color:${C.textDim};
  }
  @media(max-width:1100px){
    .pf-hero-layout{ gap:10px; }
    .pf-hero-kpis .pf-ops-kpi-value{ font-size:12px; }
  }
  @media(max-width:900px){
    .pf-hero-layout{ flex-direction:column; gap:8px; }
    .pf-hero-left{ width:100%; max-width:100%; min-height:0; }
    .pf-hero-left{ justify-content:flex-start; }
    .pf-hero-metrics{ margin-top:0; }
    .pf-hero-kpis{ width:100%; grid-template-columns:repeat(2,minmax(0,1fr)); }
    .pf-hero-subtitle{ white-space:normal; }
    .pf-hero-ai-expanded .pf-hero-ai-grid{
      grid-template-columns:1fr;
    }
    .pf-hero-kpis{
      grid-template-columns:repeat(2,minmax(0,1fr));
    }
    .pf-hero-kpis{ height:auto; grid-template-rows:repeat(2,54px); }
    .pf-hero-kpis .pf-ops-kpi{ height:54px; min-height:52px; max-height:54px; }
    .pf-hero-kpis .pf-ops-kpi-value{ font-size:12px; }
    .pf-hero-ai-head{ align-items:flex-start; }
    .pf-hero-ai-topic-btns{ flex-wrap:wrap; }
    .pf-hero-score-zone{
      grid-template-columns:1fr; grid-template-rows:auto auto auto;
    }
    .pf-hero-score-stack{ grid-column:1; grid-row:1; }
    .pf-hero-chart-col{ grid-column:1; grid-row:2; align-items:flex-start; text-align:left; }
    .pf-hero-chart-block{ align-items:flex-start; text-align:left; }
    .pf-hero-chart-hint-wrap{ text-align:left; }
    .pf-hero-chart-hint-wrap .pf-hero-hint{ text-align:left; }
    .pf-hero-ai-grid{ grid-template-columns:1fr; gap:8px; }
    .pf-hero-topic-popover{
      position:fixed; right:12px; bottom:12px; left:auto; width:min(300px,calc(100vw - 24px));
    }
  }
  .pf-pnl-viz{ display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:stretch; }
  .pf-pnl-unit{
    padding:10px 12px; border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
  }
  .pf-pnl-stack{
    padding:10px 12px; border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
  }
  .pf-pnl-bar-row{ margin-bottom:7px; }
  .pf-pnl-bar-row:last-child{ margin-bottom:0; }
  .pf-pnl-tag-bar{ height:10px; border-radius:4px; }
  @media(max-width:900px){ .pf-pnl-viz{ grid-template-columns:1fr; } }
  .pf-cash-strip{
    display:flex; height:52px; border-radius:10px; overflow:hidden; border:1px solid ${C.borderSoft};
  }
  .pf-cash-seg{
    display:flex; align-items:center; justify-content:center; min-width:2px;
    font-size:9px; font-weight:700; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.25);
  }
  .pf-cash-legend{
    display:grid; grid-template-columns:1fr 1fr; gap:4px 12px; margin-top:10px;
  }
  .pf-cash-legend-item{
    display:grid; grid-template-columns:8px 1fr auto auto; gap:6px; align-items:center; font-size:10px;
  }
  .pf-cash-swatch{ width:8px; height:8px; border-radius:2px; }
  .pf-cash-legend-label{ color:${C.textDim}; line-height:1.25; }
  .pf-cash-legend-val{ font-weight:700; color:${C.text}; white-space:nowrap; }
  @media(max-width:640px){ .pf-cash-legend{ grid-template-columns:1fr; } }
  .pf-contrib-toggle{
    display:inline-flex; border:1px solid ${C.border}; border-radius:8px; overflow:hidden; flex-shrink:0;
  }
  .pf-contrib-toggle button{
    border:none; background:${C.panel}; color:${C.textDim}; padding:5px 11px; font-size:10px;
    font-weight:600; cursor:pointer; transition:.15s; letter-spacing:.2px;
  }
  .pf-contrib-toggle button:hover{ color:${C.text}; background:${C.borderSoft}; }
  .pf-contrib-toggle button.active{
    color:${C.text}; background:rgba(124,58,237,0.1); box-shadow:inset 0 0 0 1px rgba(124,58,237,0.25);
  }
  .pf-contrib-toggle button.pf-toggle-ai{
    display:inline-flex; align-items:center; justify-content:center;
    border-left:1px solid ${C.border}; color:${C.blue}; padding:5px 11px; min-width:36px;
  }
  .pf-toggle-ai-icon{ width:16px; height:16px; flex-shrink:0; }
  .pf-contrib-toggle button.pf-toggle-ai:hover{ background:rgba(37,99,235,0.08); }
  .pf-contrib-toggle button.pf-toggle-ai.active{
    background:rgba(37,99,235,0.14); box-shadow:inset 0 0 0 1px rgba(37,99,235,0.35);
  }
  .pf-cash-ai-backdrop{
    position:fixed; inset:0; z-index:80; border:none; cursor:default;
    background:rgba(15,23,42,0.4);
  }
  .pf-cash-ai-popover{
    position:fixed; z-index:90; left:50%; top:50%; transform:translate(-50%,-50%);
    width:min(420px,calc(100vw - 32px)); max-height:min(85vh,520px); overflow-y:auto;
    padding:14px 16px; border-radius:12px; border:1px solid ${C.border};
    background:${C.panel}; box-shadow:0 16px 40px rgba(15,23,42,0.2);
  }
  .pf-cash-ai-popover-inflow{ border-color:rgba(5,150,105,0.4); }
  .pf-cash-ai-popover-outflow{ border-color:rgba(220,38,38,0.35); }
  .pf-cash-ai-popover-head{
    display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:12px;
  }
  .pf-cash-ai-popover-title-wrap{ display:flex; align-items:center; gap:8px; min-width:0; }
  .pf-cash-ai-popover-icon{ width:18px; height:18px; flex-shrink:0; }
  .pf-cash-ai-popover-title{ margin:0; font-size:13px; font-weight:700; color:${C.text}; letter-spacing:.2px; }
  .pf-cash-ai-popover-inflow .pf-cash-ai-popover-title{ color:${C.green}; }
  .pf-cash-ai-popover-outflow .pf-cash-ai-popover-title{ color:${C.red}; }
  .pf-cash-ai-popover-close{
    border:none; background:transparent; color:${C.textFaint}; font-size:20px; line-height:1;
    cursor:pointer; padding:0 4px; font-family:inherit; flex-shrink:0;
  }
  .pf-cash-ai-popover-close:hover{ color:${C.text}; }
  .pf-cash-ai-drill-insight{ margin:0 0 12px; font-size:11.5px; line-height:1.5; color:${C.textDim}; }
  .pf-cash-ai-improve-label{ margin-bottom:6px; }
  .pf-cash-ai-improve-list{
    margin:0; padding:0 0 0 16px; font-size:11px; line-height:1.45; color:${C.text};
  }
  .pf-cash-ai-improve-list li + li{ margin-top:6px; }
  .pf-cash-ai-drill-meta{ margin:12px 0 0; font-size:9px; line-height:1.35; }
  @media(max-width:640px){
    .pf-cash-ai-popover{
      top:auto; bottom:12px; left:12px; right:12px; transform:none; width:auto; max-height:70vh;
    }
  }
  .pf-cash-viz{
    padding:10px 12px; border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
  }
  .pf-contrib-map{
    margin:10px 0 12px; padding:10px 12px; max-width:440px;
    border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
  }
  .pf-grid2 > .pf-panel{ min-width:0; height:100%; }
  .pf-grid2-cash-region{
    grid-template-columns:minmax(0,1fr) minmax(0,1fr);
    align-items:start;
  }
  .pf-grid2-col-stack{
    display:flex; flex-direction:column; gap:10px; min-width:0; min-height:0;
    align-self:start; height:auto;
  }
  .pf-grid2-col-stack > .pf-panel{ height:auto; flex-shrink:0; flex-grow:0; }
  .pf-grid2-cash-region .pf-cash-panel,
  .pf-grid2-cash-region .pf-contrib-panel,
  .pf-grid2-cash-region .pf-region-panel,
  .pf-grid2-cash-region .pf-hob-panel,
  .pf-grid2-cash-region .pf-hob-settle-panel,
  .pf-grid2-cash-region .pf-medium-panel{
    min-height:0; flex-grow:0;
    padding:8px 10px;
  }
  .pf-grid2-cash-region .pf-cash-panel > .pf-row,
  .pf-grid2-cash-region .pf-contrib-panel > .pf-row,
  .pf-grid2-cash-region .pf-region-panel > .pf-row,
  .pf-grid2-cash-region .pf-hob-settle-panel > .pf-row{ margin-bottom:6px; }
  .pf-hero-panel,
  .pf-cash-panel,
  .pf-contrib-panel,
  .pf-region-panel,
  .pf-hob-settle-panel,
  .pf-hob-panel{
    background:linear-gradient(180deg, rgba(8,145,178,0.035) 0%, ${C.panel} 28px);
    border-color:rgba(8,145,178,0.12);
  }
  .pf-hero-panel{
    background:linear-gradient(180deg, rgba(8,145,178,0.035) 0%, ${C.panel} 36px);
  }
  .pf-hob-ledger{ min-width:0; margin-top:0; }
  .pf-hob-ledger-stage{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .pf-hob-ledger-pair{
    display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:start;
  }
  .pf-hob-ledger-pie-card{
    min-width:0; padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:10px;
    background:${C.bg};
  }
  .pf-hob-ledger-pie-title{
    display:block; width:100%; margin-bottom:6px; text-align:center;
    font-weight:600; color:${C.text}; text-transform:none; letter-spacing:0.02em;
    font-size:10px; line-height:1.35;
  }
  .pf-hob-ledger-pie-chart{
    width:100%; max-width:140px; min-height:120px; margin:0 auto 2px;
  }
  .pf-hob-ledger-pie-legend{
    grid-template-columns:1fr; gap:6px; margin-top:8px;
  }
  .pf-hob-ledger-pie-legend .pf-cash-legend-item{
    font-size:11px; gap:8px;
  }
  .pf-hob-ledger-pie-legend .pf-cash-legend-label{
    font-size:11px; font-weight:600; color:${C.text};
  }
  .pf-hob-ledger-pie-legend .pf-cash-legend-val{
    font-size:11px;
  }
  .pf-hob-ledger-pie-pct{
    font-size:11px; font-weight:700; font-variant-numeric:tabular-nums; white-space:nowrap;
  }
  @media(max-width:640px){
    .pf-hob-ledger-pair{ grid-template-columns:1fr; }
  }
  .pf-hob-panel > .pf-row{ margin-bottom:6px; }
  .pf-hob-float{ min-width:0; margin-top:0; }
  .pf-hob-float-stage{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .pf-hob-kpi-row{
    display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; margin-bottom:8px;
  }
  .pf-hob-kpi{
    padding:6px 7px; border-radius:7px; border:1px solid ${C.borderSoft}; background:${C.panel};
    display:flex; flex-direction:column; gap:2px; min-width:0;
  }
  .pf-hob-kpi-label{
    font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:${C.textFaint};
  }
  .pf-hob-kpi-val{
    font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:${C.text}; line-height:1.1;
  }
  .pf-hob-kpi-val--warn{ color:${C.amber}; }
  .pf-hob-float-pool{ margin-bottom:8px; }
  .pf-hob-float-pool .pf-label{ margin-bottom:4px; }
  .pf-hob-float-strip{
    display:flex; height:22px; border-radius:6px; overflow:hidden;
    border:1px solid ${C.borderSoft};
  }
  .pf-hob-float-seg{
    display:flex; align-items:center; justify-content:center; min-width:0;
    font-size:8px; font-weight:800; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.25);
  }
  .pf-hob-float-legend{
    list-style:none; margin:4px 0 0; padding:0;
    display:flex; flex-wrap:wrap; gap:8px 12px; font-size:9px;
  }
  .pf-hob-float-legend li{ display:flex; align-items:center; gap:5px; }
  .pf-hob-swatch{ width:7px; height:7px; border-radius:2px; flex-shrink:0; }
  .pf-hob-split{
    display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;
  }
  .pf-hob-unit-bars{ display:flex; flex-direction:column; gap:5px; }
  .pf-hob-unit-row{
    display:grid; grid-template-columns:52px 1fr 36px; gap:6px; align-items:center; font-size:9px;
  }
  .pf-hob-unit-label{ color:${C.textDim}; font-weight:600; }
  .pf-hob-unit-track{
    height:8px; border-radius:4px; background:${C.borderSoft}; overflow:hidden;
  }
  .pf-hob-unit-fill{ display:block; height:100%; border-radius:4px; min-width:3px; }
  .pf-hob-unit-fill--rev{ background:${C.green}; }
  .pf-hob-unit-fill--cost{ background:${C.amber}; }
  .pf-hob-unit-val{ font-weight:800; text-align:right; font-variant-numeric:tabular-nums; }
  .pf-hob-unit-val--rev{ color:${C.green}; }
  .pf-hob-unit-margin{
    display:flex; align-items:baseline; gap:4px; margin-top:2px; padding-top:4px;
    border-top:1px dashed ${C.borderSoft}; font-size:9px;
  }
  .pf-hob-unit-margin-val{ color:${C.teal}; font-size:11px; }
  .pf-hob-recharge{ min-width:0; }
  .pf-hob-recharge-head{
    display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;
  }
  .pf-hob-recharge-label{ font-size:9px; font-weight:700; color:${C.textDim}; }
  .pf-hob-recharge-pct{ font-size:14px; font-weight:800; font-variant-numeric:tabular-nums; }
  .pf-hob-recharge-pct.is-ok{ color:${C.green}; }
  .pf-hob-recharge-pct.is-warn{ color:${C.amber}; }
  .pf-hob-recharge-track{
    position:relative; height:10px; border-radius:5px; background:${C.borderSoft}; overflow:visible;
  }
  .pf-hob-recharge-fill{
    display:block; height:100%; border-radius:5px; transition:width .35s ease;
  }
  .pf-hob-recharge-fill.is-ok{ background:${C.green}; }
  .pf-hob-recharge-fill.is-warn{ background:${C.amber}; }
  .pf-hob-recharge-target{
    position:absolute; top:-2px; bottom:-2px; width:2px; margin-left:-1px;
    background:${C.text}; opacity:0.35; border-radius:1px;
  }
  .pf-hob-recharge-hint{ display:block; margin-top:4px; font-size:8px; }
  .pf-hob-actions .pf-label{ margin-bottom:4px; }
  .pf-hob-action-list{
    list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px;
  }
  .pf-hob-action{
    display:grid; grid-template-columns:auto 1fr auto; grid-template-rows:auto auto;
    gap:2px 8px; align-items:center; width:100%; padding:7px 8px; border-radius:7px;
    border:1px solid ${C.borderSoft}; background:${C.panel}; cursor:pointer;
    text-align:left; font-family:inherit; font-size:9px; color:inherit;
    transition:background .15s, border-color .15s, box-shadow .15s;
  }
  .pf-hob-action:hover{ background:${C.borderSoft}; border-color:${C.border}; }
  .pf-hob-action.is-active{
    border-color:rgba(8,145,178,0.4); background:rgba(8,145,178,0.06);
    box-shadow:0 0 0 1px rgba(8,145,178,0.12);
  }
  .pf-hob-action-pri{
    grid-row:span 2; font-size:7px; font-weight:800; text-transform:uppercase;
    padding:3px 5px; border-radius:4px; letter-spacing:0.03em;
  }
  .pf-hob-action-pri--high{ background:rgba(220,38,38,0.1); color:${C.red}; }
  .pf-hob-action-pri--medium{ background:rgba(217,119,6,0.1); color:${C.amber}; }
  .pf-hob-action-title{ font-size:10px; font-weight:800; color:${C.text}; grid-column:2; }
  .pf-hob-action-metric{ color:${C.textDim}; grid-column:2; }
  .pf-hob-action-impact{
    grid-row:span 2; grid-column:3; font-weight:700; text-align:right; align-self:center;
    color:${C.text};
  }
  .pf-hob-action-detail{
    margin-top:8px; padding:8px 10px; border-radius:7px; border:1px solid ${C.borderSoft};
    background:${C.panel};
  }
  .pf-hob-action-detail--high{ border-color:rgba(220,38,38,0.25); }
  .pf-hob-action-detail-title{ display:block; font-size:10px; font-weight:800; margin-bottom:4px; }
  .pf-hob-action-detail-text{ margin:0 0 4px; font-size:9px; line-height:1.4; }
  @media(max-width:720px){
    .pf-hob-kpi-row{ grid-template-columns:repeat(2,minmax(0,1fr)); }
    .pf-hob-split{ grid-template-columns:1fr; }
  }
  @media(max-width:520px){
    .pf-hob-kpi-row{ grid-template-columns:1fr 1fr; }
    .pf-hob-action{ grid-template-columns:auto 1fr; }
    .pf-hob-action-impact{ grid-column:2; grid-row:3; text-align:left; }
  }
  .pf-medium-panel{
    background:linear-gradient(180deg, rgba(124,58,237,0.05) 0%, ${C.panel} 52px);
    border-color:rgba(124,58,237,0.2);
    padding:8px 10px;
  }
  .pf-medium-panel > .pf-row{ margin-bottom:6px; }
  .pf-medium-sl{ min-width:0; margin-top:0; }
  .pf-medium-sl-stage{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .pf-medium-sl.is-drilled .pf-medium-sl-stage{
    border-color:rgba(124,58,237,0.22);
    background:linear-gradient(135deg, rgba(124,58,237,0.04) 0%, ${C.bg} 48%);
  }
  .pf-medium-sl-toolbar{ min-height:16px; margin-bottom:4px; }
  .pf-medium-sl-hint{ font-size:8px; line-height:1.3; }
  .pf-medium-sl-back{
    border:none; background:none; padding:0; cursor:pointer; font-family:inherit;
    font-size:9px; font-weight:700; color:${C.violet};
  }
  .pf-medium-sl-back:hover{ text-decoration:underline; }
  .pf-medium-sl-canvas{
    width:100%; max-width:400px; margin:0 auto 6px;
  }
  .pf-medium-sl-svg{ width:100%; height:auto; display:block; overflow:visible; }
  .pf-medium-sl-grid line{
    stroke:${C.borderSoft}; stroke-width:1; stroke-dasharray:4 5;
  }
  .pf-medium-sl-tick{
    font-size:8px; fill:${C.textFaint}; font-variant-numeric:tabular-nums;
  }
  .pf-medium-sl-axis{
    stroke:${C.border}; stroke-width:2;
  }
  .pf-medium-sl-axis-title{
    font-size:8px; font-weight:800; fill:${C.textDim}; text-transform:uppercase;
    letter-spacing:0.05em;
  }
  .pf-medium-sl-line{ cursor:pointer; }
  .pf-medium-sl-stroke{ transition:stroke-width .15s, opacity .2s; }
  .pf-medium-sl-line.is-muted{ opacity:0.28; }
  .pf-medium-sl-line:hover .pf-medium-sl-stroke, .pf-medium-sl-line.is-hot .pf-medium-sl-stroke{
    filter:brightness(1.05);
  }
  .pf-medium-sl-hit{ pointer-events:stroke; }
  .pf-medium-sl-label{
    pointer-events:none; font-size:9px; font-weight:800; fill:${C.text};
  }
  .pf-medium-sl-label--sub{ font-size:8px; font-weight:600; fill:${C.textDim}; }
  .pf-medium-sl-legend{
    list-style:none; margin:0; padding:0;
    display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px;
  }
  .pf-medium-sl-leg{
    display:grid; grid-template-columns:8px 1fr auto; grid-template-rows:auto auto;
    gap:2px 6px; align-items:center; width:100%; padding:6px 7px; border-radius:7px;
    border:1px solid ${C.borderSoft}; background:${C.panel}; cursor:pointer;
    text-align:left; font-family:inherit; font-size:9px; color:inherit;
    transition:background .15s, border-color .15s, box-shadow .15s;
  }
  .pf-medium-sl-leg:hover, .pf-medium-sl-leg.is-hot{
    background:${C.borderSoft}; border-color:${C.border};
  }
  .pf-medium-sl-leg.is-active{
    background:rgba(124,58,237,0.06); border-color:rgba(124,58,237,0.35);
    box-shadow:0 0 0 1px rgba(124,58,237,0.12);
  }
  .pf-medium-sl-swatch{
    grid-row:span 2; width:8px; height:8px; border-radius:2px;
  }
  .pf-medium-sl-leg-name{ font-weight:800; color:${C.text}; font-size:10px; }
  .pf-medium-sl-leg-metric{
    grid-column:2; font-weight:700; font-variant-numeric:tabular-nums; color:${C.textDim};
  }
  .pf-medium-sl-leg-delta{
    grid-column:3; grid-row:span 2; font-size:8px; font-weight:700; text-align:right;
    align-self:center;
  }
  .pf-medium-sl-leg-delta--up{ color:${C.green}; }
  .pf-medium-sl-leg-delta--down{ color:${C.amber}; }
  .pf-medium-sl-leg-delta--flat{ color:${C.textFaint}; }
  .pf-medium-sl-detail{
    margin-top:8px; padding:7px 9px; border-radius:7px; border:1px solid ${C.borderSoft};
    background:${C.panel}; display:flex; flex-direction:column; gap:2px;
  }
  .pf-medium-sl-detail-title{ font-size:10px; font-weight:800; }
  .pf-medium-sl-detail-sub{ font-size:9px; line-height:1.35; }
  .pf-medium-sl-foot{
    margin-top:6px; padding-top:6px; border-top:1px solid ${C.borderSoft};
    font-size:8px; text-align:center;
  }
  @media(max-width:520px){
    .pf-medium-sl-legend{ grid-template-columns:1fr; }
    .pf-medium-sl-leg-delta{ grid-row:2; grid-column:2; text-align:left; }
  }
  .pf-medium-qd{ min-width:0; margin-top:0; }
  .pf-medium-qd-stage{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .pf-medium-qd.is-drilled .pf-medium-qd-stage{
    border-color:rgba(124,58,237,0.22);
  }
  .pf-medium-qd-canvas{
    width:100%; max-width:420px; margin:0 auto;
  }
  .pf-medium-qd-svg{
    width:100%; height:auto; display:block; overflow:visible;
  }
  .pf-medium-qd-grid line{
    stroke:${C.borderSoft}; stroke-width:1; stroke-dasharray:3 4;
  }
  .pf-medium-qd-tick{
    font-size:8px; fill:${C.textFaint}; font-variant-numeric:tabular-nums;
  }
  .pf-medium-qd-axis{
    font-size:8px; font-weight:700; fill:${C.textDim}; text-transform:uppercase;
    letter-spacing:0.04em;
  }
  .pf-medium-qd-align{
    stroke:${C.textFaint}; stroke-width:1.5; stroke-dasharray:6 5; opacity:0.65;
  }
  .pf-medium-qd-align-label{
    font-size:7px; fill:${C.textFaint}; font-weight:600;
  }
  .pf-medium-qd-zone--lift{
    fill:rgba(5,150,105,0.06); stroke:none;
  }
  .pf-medium-qd-zone-label{
    font-size:7px; fill:${C.green}; font-weight:700; opacity:0.85;
  }
  .pf-medium-qd-bubble{ cursor:pointer; transition:opacity .2s; }
  .pf-medium-qd-bubble-fill{
    stroke:#fff; stroke-width:2; transition:filter .15s;
  }
  .pf-medium-qd-bubble:hover .pf-medium-qd-bubble-fill,
  .pf-medium-qd-bubble.is-hot .pf-medium-qd-bubble-fill{
    filter:brightness(1.08);
  }
  .pf-medium-qd-bubble.is-active .pf-medium-qd-bubble-fill{
    filter:brightness(1.12); stroke-width:2.5;
  }
  .pf-medium-qd-bubble.is-muted{ opacity:0.32; }
  .pf-medium-qd-bubble-pct{
    pointer-events:none; font-size:9px; font-weight:800; fill:#fff;
    paint-order:stroke; stroke:rgba(15,23,42,0.35); stroke-width:2px;
  }
  .pf-medium-qd-bubble-name{
    pointer-events:none; font-size:8px; font-weight:700; fill:${C.text};
  }
  .pf-medium-qd-tip{
    margin-top:6px; padding:6px 8px; border-radius:6px; border:1px solid ${C.borderSoft};
    background:${C.panel}; display:flex; flex-direction:column; gap:2px;
  }
  .pf-medium-qd-tip-title{ font-size:10px; font-weight:800; line-height:1.2; }
  .pf-medium-qd-tip-line{ font-size:9px; line-height:1.3; }
  .pf-medium-qd-tip-line--up{ color:${C.green}; }
  .pf-medium-qd-tip-line--down{ color:${C.amber}; }
  .pf-medium-qd-hint{ margin:6px 0 0; font-size:8px; line-height:1.35; text-align:center; }
  .pf-medium-qd-foot{
    margin-top:6px; padding-top:6px; border-top:1px solid ${C.borderSoft};
    font-size:8px; text-align:center;
  }
  .pf-medium-qd-subs{
    margin-top:8px; padding:8px 10px; border-radius:8px; border:1px solid ${C.borderSoft};
    background:${C.panel};
  }
  .pf-medium-qd-subs-head{
    display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; margin-bottom:6px;
  }
  .pf-medium-qd-swatch{ width:8px; height:8px; border-radius:2px; flex-shrink:0; }
  .pf-medium-qd-subs-title{ font-size:10px; font-weight:800; }
  .pf-medium-qd-sublist{
    list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px;
  }
  .pf-medium-qd-sub{
    display:grid; grid-template-columns:minmax(0,1fr) minmax(0,72px) 36px 52px; gap:6px;
    align-items:center; width:100%; padding:5px 6px; border-radius:6px; border:none;
    background:transparent; cursor:pointer; text-align:left; font-family:inherit; font-size:9px;
    color:inherit; transition:background .15s;
  }
  .pf-medium-qd-sub:hover{ background:${C.borderSoft}; }
  .pf-medium-qd-sub.is-active{ background:rgba(124,58,237,0.06); }
  .pf-medium-qd-sub-label{ color:${C.text}; font-weight:600; line-height:1.2; }
  .pf-medium-qd-sub-track{
    height:6px; border-radius:3px; background:${C.borderSoft}; overflow:hidden;
  }
  .pf-medium-qd-sub-fill{ display:block; height:100%; border-radius:3px; min-width:2px; }
  .pf-medium-qd-sub-pct{ font-weight:800; text-align:right; font-variant-numeric:tabular-nums; }
  .pf-medium-qd-sub-meta{ font-size:8px; text-align:right; }
  @media(max-width:520px){
    .pf-medium-qd-sub{
      grid-template-columns:minmax(0,1fr) 56px 32px;
    }
    .pf-medium-qd-sub-meta{ display:none; }
  }
  .pf-medium-tm{ min-width:0; margin-top:0; }
  .pf-medium-tm-stage{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .pf-medium-tm.is-drilled .pf-medium-tm-stage{
    border-color:rgba(124,58,237,0.22);
    background:linear-gradient(135deg, rgba(124,58,237,0.04) 0%, ${C.bg} 48%);
  }
  .pf-medium-tm-head{
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    margin-bottom:6px; flex-wrap:wrap;
  }
  .pf-medium-tm-legend{ font-size:8px; line-height:1.3; }
  .pf-medium-tm-back{
    border:none; background:none; padding:0; cursor:pointer; font-family:inherit;
    font-size:9px; font-weight:700; color:${C.violet};
  }
  .pf-medium-tm-back:hover{ text-decoration:underline; }
  .pf-medium-tm-canvas{
    position:relative; width:100%; aspect-ratio:2/1; max-height:210px;
  }
  .pf-medium-tm-svg{
    width:100%; height:100%; display:block; overflow:visible;
    filter:drop-shadow(0 1px 4px rgba(15,23,42,0.06));
  }
  .pf-medium-tm-cell{ cursor:pointer; transition:opacity .2s; }
  .pf-medium-tm-cell-bg{
    stroke:#fff; stroke-width:2; transition:filter .15s, opacity .2s;
  }
  .pf-medium-tm-cell:hover .pf-medium-tm-cell-bg, .pf-medium-tm-cell.is-hot .pf-medium-tm-cell-bg{
    filter:brightness(1.06);
  }
  .pf-medium-tm-cell.is-active .pf-medium-tm-cell-bg{ filter:brightness(1.1); }
  .pf-medium-tm-cell.is-muted{ opacity:0.35; }
  .pf-medium-tm-label{
    pointer-events:none; font-size:11px; font-weight:800; fill:#fff;
    paint-order:stroke; stroke:rgba(15,23,42,0.35); stroke-width:2px;
  }
  .pf-medium-tm-sublabel{
    pointer-events:none; font-size:8px; font-weight:600; fill:rgba(255,255,255,0.92);
    paint-order:stroke; stroke:rgba(15,23,42,0.3); stroke-width:1.5px;
  }
  .pf-medium-tm-tip{
    position:absolute; z-index:3; min-width:100px; max-width:140px;
    padding:7px 9px 6px; border-radius:7px; border:1px solid ${C.border};
    background:${C.panel}; box-shadow:0 6px 18px rgba(15,23,42,0.12);
    transform:translate(-50%, calc(-100% - 8px)); pointer-events:auto;
    display:flex; flex-direction:column; gap:1px; text-align:left;
  }
  .pf-medium-tm-tip-val{
    font-size:13px; font-weight:800; font-family:ui-monospace,monospace; line-height:1.2;
  }
  .pf-medium-tm-tip-title{
    font-size:10px; font-weight:700; color:${C.text}; line-height:1.25;
  }
  .pf-medium-tm-tip-sub{ font-size:8px; line-height:1.3; }
  .pf-medium-tm-tip-close{
    position:absolute; top:1px; right:3px; border:none; background:transparent;
    color:${C.textFaint}; font-size:13px; cursor:pointer; padding:0; font-family:inherit;
  }
  .pf-medium-tm-foot{
    display:flex; flex-wrap:wrap; justify-content:space-between; gap:6px;
    margin-top:6px; padding-top:6px; border-top:1px solid ${C.borderSoft};
    font-size:8px; line-height:1.3;
  }
  .pf-medium-bf{ min-width:0; margin-top:0; }
  .pf-medium-bf-stage{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .pf-medium-bf.is-drilled .pf-medium-bf-stage{
    border-color:rgba(124,58,237,0.22);
    background:linear-gradient(135deg, rgba(124,58,237,0.04) 0%, ${C.bg} 48%);
  }
  .pf-medium-bf-axis{
    display:grid; grid-template-columns:1fr minmax(76px,96px) 1fr; gap:8px; align-items:center;
    margin-bottom:6px; font-size:8px; font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${C.textFaint};
  }
  .pf-medium-bf-axis-l{ text-align:right; }
  .pf-medium-bf-axis-c{ text-align:center; color:${C.textDim}; }
  .pf-medium-bf-axis-r{ text-align:left; }
  .pf-medium-bf-list{
    list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:5px;
  }
  .pf-medium-bf-list > li.is-expanded{
    border-radius:8px; background:rgba(124,58,237,0.03);
    box-shadow:inset 0 0 0 1px rgba(124,58,237,0.1);
  }
  .pf-medium-bf-row{
    display:grid; grid-template-columns:1fr minmax(76px,96px) 1fr; gap:8px; align-items:center;
    width:100%; padding:6px 4px; border:none; border-radius:7px; background:transparent;
    cursor:pointer; font-family:inherit; color:inherit; text-align:inherit;
    transition:background .15s, opacity .2s;
  }
  .pf-medium-bf-row:hover, .pf-medium-bf-row.is-hot{ background:${C.borderSoft}; }
  .pf-medium-bf-row.is-active{ background:rgba(124,58,237,0.07); }
  .pf-medium-bf-row.is-muted{ opacity:0.42; }
  .pf-medium-bf-bar{
    display:flex; align-items:center; gap:5px; min-width:0;
  }
  .pf-medium-bf-bar--join{ flex-direction:row-reverse; justify-content:flex-start; }
  .pf-medium-bf-bar--rev{ flex-direction:row; justify-content:flex-start; }
  .pf-medium-bf-track{
    flex:1; min-width:0; height:12px; border-radius:3px; background:${C.borderSoft}; overflow:hidden;
  }
  .pf-medium-bf-fill{
    display:block; height:100%; border-radius:3px; min-width:3px;
    transition:width .35s ease;
  }
  .pf-medium-bf-bar--join .pf-medium-bf-fill{ margin-left:auto; }
  .pf-medium-bf-pct{
    font-size:10px; font-weight:800; font-variant-numeric:tabular-nums; flex-shrink:0; width:28px;
  }
  .pf-medium-bf-bar--join .pf-medium-bf-pct{ text-align:right; }
  .pf-medium-bf-bar--rev .pf-medium-bf-pct{ text-align:left; }
  .pf-medium-bf-mid{
    display:flex; flex-direction:column; align-items:center; gap:2px; min-width:0; text-align:center;
  }
  .pf-medium-bf-mid--sub .pf-medium-bf-name{ font-size:8px; font-weight:600; }
  .pf-medium-bf-swatch{
    width:8px; height:8px; border-radius:2px; flex-shrink:0;
  }
  .pf-medium-bf-swatch--sm{ width:6px; height:6px; }
  .pf-medium-bf-name{
    font-size:10px; font-weight:800; line-height:1.15; color:${C.text};
  }
  .pf-medium-bf-delta{
    font-size:7px; font-weight:700; line-height:1.2; letter-spacing:0.02em;
  }
  .pf-medium-bf-delta--up{ color:${C.green}; }
  .pf-medium-bf-delta--down{ color:${C.amber}; }
  .pf-medium-bf-delta--flat{ color:${C.textFaint}; }
  .pf-medium-bf-subs{
    list-style:none; margin:0; padding:2px 6px 6px; display:flex; flex-direction:column; gap:3px;
  }
  .pf-medium-bf-sub{
    display:grid; grid-template-columns:1fr minmax(76px,96px) 1fr; gap:8px; align-items:center;
    width:100%; padding:4px; border:none; border-radius:5px; background:transparent;
    cursor:pointer; font-family:inherit; color:inherit; transition:background .15s;
  }
  .pf-medium-bf-sub:hover{ background:${C.panel}; }
  .pf-medium-bf-sub.is-active{ background:${C.panel}; box-shadow:0 0 0 1px ${C.borderSoft}; }
  .pf-medium-bf-sub .pf-medium-bf-track{ height:8px; }
  .pf-medium-bf-sub .pf-medium-bf-pct{ font-size:8px; width:24px; }
  .pf-medium-bf-foot{
    display:flex; flex-wrap:wrap; justify-content:space-between; gap:6px;
    margin-top:8px; padding-top:6px; border-top:1px solid ${C.borderSoft};
    font-size:8px; line-height:1.3;
  }
  .pf-medium-bf-detail{
    margin-top:8px; padding:8px 10px; border-radius:8px; border:1px solid ${C.borderSoft};
    background:${C.panel};
  }
  .pf-medium-bf-detail-head{
    display:flex; align-items:flex-start; gap:8px; flex-wrap:wrap;
  }
  .pf-medium-bf-detail-copy{ flex:1; min-width:0; }
  .pf-medium-bf-detail-title{ display:block; font-size:11px; font-weight:800; line-height:1.25; }
  .pf-medium-bf-detail-sub{ display:block; font-size:9px; line-height:1.35; margin-top:2px; }
  .pf-medium-bf-detail-badge{ flex-shrink:0; }
  .pf-medium-bf-detail-close{
    border:none; background:transparent; color:${C.textFaint}; font-size:14px; line-height:1;
    cursor:pointer; padding:0 2px; font-family:inherit; margin-left:auto;
  }
  .pf-medium-bf-detail-close:hover{ color:${C.text}; }
  .pf-medium-bf-detail-points{
    margin:6px 0 0; padding-left:14px; font-size:9px; line-height:1.4; color:${C.textDim};
  }
  .pf-medium-bf-detail-points li{ margin-bottom:3px; }
  .pf-medium-bf-detail-points li:last-child{ margin-bottom:0; }
  @media(max-width:520px){
    .pf-medium-bf-axis, .pf-medium-bf-row, .pf-medium-bf-sub{
      grid-template-columns:1fr minmax(64px,80px) 1fr; gap:5px;
    }
    .pf-medium-bf-pct{ width:24px; font-size:9px; }
  }
  .pf-medium-donut, .pf-medium-sunburst{ min-width:0; margin-top:0; }
  .pf-medium-donut-layout{
    display:flex; flex-direction:row; align-items:flex-start; gap:10px;
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
    height:auto; flex:0 0 auto;
  }
  .pf-medium-donut.is-drilled .pf-medium-donut-layout{
    border-color:rgba(124,58,237,0.22);
    background:linear-gradient(135deg, rgba(124,58,237,0.04) 0%, ${C.bg} 48%);
  }
  .pf-medium-donut-chart-col{
    display:flex; flex-direction:column; align-items:center; gap:0; min-width:0; flex-shrink:0;
    align-self:flex-start;
  }
  .pf-medium-donut-chart-wrap{
    position:relative; width:188px; max-width:100%; height:188px; flex-shrink:0;
  }
  .pf-medium-sunburst .pf-medium-donut-chart-wrap{ width:200px; height:200px; }
  .pf-medium-donut-svg{
    width:100%; height:100%; display:block; overflow:visible;
    filter:drop-shadow(0 2px 8px rgba(15,23,42,0.07));
  }
  .pf-donut-hole{
    fill:#fff; stroke:none; pointer-events:none;
  }
  .pf-sun-seg{
    cursor:pointer; transition:opacity .35s ease, filter .18s ease;
  }
  .pf-sun-seg:hover{ filter:brightness(1.05); }
  .pf-sun-seg.is-active{ filter:brightness(1.08); }
  .pf-sun-seg.is-muted{ opacity:0.3; }
  .pf-sun-pct{
    pointer-events:none; font-size:9px; font-weight:800; fill:#fff;
    paint-order:stroke; stroke:rgba(15,23,42,0.4); stroke-width:2.5px;
    font-variant-numeric:tabular-nums;
  }
  .pf-sun-pct.is-muted{ opacity:0.45; }
  .pf-sun-explode-ring{
    transform-box:fill-box; transform-origin:center;
    animation:pf-sun-explode-in .5s cubic-bezier(0.34,1.2,0.64,1) both;
  }
  .pf-sun-explode-seg{
    transform-box:fill-box; transform-origin:center;
    opacity:0;
    animation:pf-sun-explode-seg .42s cubic-bezier(0.34,1.15,0.64,1) forwards;
  }
  @keyframes pf-sun-explode-in{
    0%{ opacity:0; transform:scale(0.92); }
    100%{ opacity:1; transform:scale(1); }
  }
  @keyframes pf-sun-explode-seg{
    0%{ opacity:0; transform:scale(0.85); }
    100%{ opacity:1; transform:scale(1); }
  }
  .pf-sun-popover-leader{
    position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:2;
  }
  .pf-sun-popover-leader-line{
    stroke-width:1.5; stroke-dasharray:none; opacity:0.55;
  }
  .pf-sun-popover{
    position:absolute; z-index:4; min-width:108px; max-width:132px;
    padding:8px 10px 7px; border-radius:8px; border:1px solid ${C.border};
    background:${C.panel}; box-shadow:0 8px 22px rgba(15,23,42,0.14);
    display:flex; flex-direction:column; align-items:flex-start; text-align:left; gap:1px;
    pointer-events:auto; animation:pf-sun-pop-in .2s ease both;
  }
  .pf-sun-popover.is-pinned{
    border-color:color-mix(in srgb, var(--pop-color, ${C.violet}) 42%, ${C.border});
    box-shadow:0 10px 26px rgba(15,23,42,0.16);
  }
  .pf-sun-popover--br{ transform:translate(10px, 10px); }
  .pf-sun-popover--bl{ transform:translate(calc(-100% - 10px), 10px); }
  .pf-sun-popover--tl{ transform:translate(calc(-100% - 10px), calc(-100% - 10px)); }
  .pf-sun-popover--tr{ transform:translate(10px, calc(-100% - 10px)); }
  .pf-sun-popover::before{
    content:""; position:absolute; width:8px; height:8px; background:${C.panel};
    border:1px solid ${C.border}; transform:rotate(45deg);
  }
  .pf-sun-popover--br::before{ left:-4px; top:8px; border-right:none; border-bottom:none; }
  .pf-sun-popover--bl::before{ right:-4px; top:8px; border-left:none; border-bottom:none; }
  .pf-sun-popover--tl::before{ right:-4px; bottom:8px; border-left:none; border-top:none; }
  .pf-sun-popover--tr::before{ left:-4px; bottom:8px; border-right:none; border-top:none; }
  .pf-sun-popover-close{
    position:absolute; top:2px; right:4px; border:none; background:transparent;
    color:${C.textFaint}; font-size:14px; line-height:1; cursor:pointer; padding:0;
    font-family:inherit;
  }
  .pf-sun-popover-close:hover{ color:${C.text}; }
  .pf-sun-popover-val{
    font-size:14px; font-weight:800; font-family:ui-monospace,monospace; line-height:1.2;
    padding-right:12px;
  }
  .pf-sun-popover-title{
    font-size:10px; font-weight:700; color:${C.text}; line-height:1.25;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
  }
  .pf-sun-popover-sub{ font-size:9px; line-height:1.3; }
  .pf-sun-popover-kicker{
    font-size:7px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;
    margin-top:2px;
  }
  @keyframes pf-sun-pop-in{
    0%{ opacity:0; transform:translate(10px, 10px) scale(0.92); }
    100%{ opacity:1; transform:translate(10px, 10px) scale(1); }
  }
  .pf-sun-popover--bl{ animation-name:pf-sun-pop-in-bl; }
  @keyframes pf-sun-pop-in-bl{
    0%{ opacity:0; transform:translate(calc(-100% - 10px), 10px) scale(0.92); }
    100%{ opacity:1; transform:translate(calc(-100% - 10px), 10px) scale(1); }
  }
  .pf-sun-popover--tl{ animation-name:pf-sun-pop-in-tl; }
  @keyframes pf-sun-pop-in-tl{
    0%{ opacity:0; transform:translate(calc(-100% - 10px), calc(-100% - 10px)) scale(0.92); }
    100%{ opacity:1; transform:translate(calc(-100% - 10px), calc(-100% - 10px)) scale(1); }
  }
  .pf-sun-popover--tr{ animation-name:pf-sun-pop-in-tr; }
  @keyframes pf-sun-pop-in-tr{
    0%{ opacity:0; transform:translate(10px, calc(-100% - 10px)) scale(0.92); }
    100%{ opacity:1; transform:translate(10px, calc(-100% - 10px)) scale(1); }
  }
  @media (prefers-reduced-motion:reduce){
    .pf-sun-explode-ring, .pf-sun-explode-seg, .pf-sun-popover{
      animation:none; opacity:1;
    }
    .pf-sun-popover--br{ transform:translate(10px, 10px); }
    .pf-sun-popover--bl{ transform:translate(calc(-100% - 10px), 10px); }
    .pf-sun-popover--tl{ transform:translate(calc(-100% - 10px), calc(-100% - 10px)); }
    .pf-sun-popover--tr{ transform:translate(10px, calc(-100% - 10px)); }
  }
  .pf-medium-donut-rail{
    display:flex; flex-direction:column; gap:6px; min-width:0; flex:1 1 auto; align-self:flex-start;
  }
  .pf-medium-donut-rail-head{
    display:flex; align-items:baseline; justify-content:space-between; gap:6px;
    padding-bottom:3px; border-bottom:1px solid ${C.borderSoft};
  }
  .pf-medium-donut-rail-title{
    font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;
    color:${C.textDim};
  }
  .pf-medium-donut-channel-list{
    list-style:none; margin:0; padding:0;
    display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px;
  }
  .pf-medium-donut-channel-list > li{ min-width:0; }
  .pf-medium-donut-channel{
    display:flex; flex-direction:column; align-items:stretch; gap:4px;
    width:100%; min-height:0; padding:6px 7px; border-radius:7px;
    border:1px solid ${C.borderSoft}; background:${C.panel};
    cursor:pointer; text-align:left; font-family:inherit; color:inherit;
    transition:background .15s, border-color .15s, box-shadow .15s;
  }
  .pf-medium-donut-channel:hover, .pf-medium-donut-channel.is-hot{
    background:${C.borderSoft}; border-color:${C.border};
  }
  .pf-medium-donut-channel.is-active{
    background:rgba(124,58,237,0.05); border-color:rgba(124,58,237,0.35);
    box-shadow:0 0 0 1px rgba(124,58,237,0.12);
  }
  .pf-medium-donut-channel-top{
    display:flex; align-items:center; gap:6px; min-width:0;
  }
  .pf-medium-donut-channel-swatch{
    width:8px; height:8px; border-radius:2px; flex-shrink:0;
  }
  .pf-medium-donut-channel-name{
    flex:1; min-width:0; font-size:10px; font-weight:700; line-height:1.2; color:${C.text};
  }
  .pf-medium-donut-channel-pct{
    font-size:11px; font-weight:800; font-variant-numeric:tabular-nums; flex-shrink:0;
  }
  .pf-medium-donut-channel-bar{
    height:4px; border-radius:2px; background:${C.borderSoft}; overflow:hidden;
  }
  .pf-medium-donut-channel-fill{
    display:block; height:100%; border-radius:2px; min-width:2px;
    transition:width .35s ease;
  }
  .pf-medium-donut-channel-rev{ font-size:9px; line-height:1.2; }
  @media(max-width:720px){
    .pf-medium-donut-layout{ flex-direction:column; align-items:stretch; }
    .pf-medium-donut-chart-col{ align-self:center; }
    .pf-medium-donut-rail{ width:100%; }
  }
  @media(max-width:520px){
    .pf-medium-donut-channel-list{ grid-template-columns:1fr; }
    .pf-medium-donut-chart-wrap{ width:min(100%,176px); height:176px; margin:0 auto; }
    .pf-medium-sunburst .pf-medium-donut-chart-wrap{ width:min(100%,188px); height:188px; }
  }
  .pf-medium-pie-swatch{ width:8px; height:8px; border-radius:2px; flex-shrink:0; }
  .pf-medium-drill{
    margin-top:10px; padding:10px 12px; border-radius:10px;
    border:1px solid ${C.borderSoft}; background:${C.bg};
  }
  .pf-medium-drill-head{
    display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; flex-wrap:wrap;
  }
  .pf-medium-drill-title{ display:block; font-size:12px; font-weight:800; line-height:1.25; }
  .pf-medium-drill-sub{ display:block; font-size:9px; line-height:1.35; margin-top:2px; max-width:280px; }
  .pf-medium-drill-points{
    margin:0 0 10px; padding-left:16px; font-size:10px; line-height:1.4; color:${C.text};
  }
  .pf-medium-drill-points li{ margin-bottom:4px; }
  .pf-medium-drill-points li:last-child{ margin-bottom:0; }
  .pf-medium-drill-submix .pf-label{ margin-bottom:6px; }
  .pf-medium-submix-row{
    display:grid; grid-template-columns:minmax(0,1fr) minmax(0,72px) 32px; gap:8px;
    align-items:center; margin-bottom:5px; font-size:10px;
  }
  .pf-medium-submix-row:last-child{ margin-bottom:0; }
  .pf-medium-submix-label{ color:${C.textDim}; line-height:1.25; }
  .pf-medium-submix-bar{ height:6px; }
  .pf-medium-submix-pct{ font-weight:700; text-align:right; font-variant-numeric:tabular-nums; }
  .pf-medium-submix-row.is-highlight{
    background:rgba(124,58,237,0.04); border-radius:6px; padding:2px 4px; margin:0 -4px 5px;
  }
  .pf-grid2-contrib-region{
    grid-template-columns:minmax(0,44%) minmax(0,1fr);
    align-items:start;
  }
  .pf-grid2-contrib-region > .pf-region-panel{
    display:flex; flex-direction:column; min-width:0; max-height:100%;
  }
  .pf-contrib-panel .pf-contrib-head{
    flex-wrap:wrap; align-items:flex-start; gap:6px 8px;
  }
  .pf-contrib-panel .pf-contrib-head .pf-sechead{
    flex:1 1 160px; min-width:0;
  }
  .pf-contrib-panel .pf-insight{
    font-size:11.5px; line-height:1.3;
  }
  .pf-contrib-panel .pf-contrib-toggle{ flex-shrink:0; }
  .pf-contrib-table-wrap{
    margin-top:4px; border:1px solid ${C.borderSoft}; border-radius:10px;
    background:${C.bg}; overflow-x:auto;
  }
  .pf-contrib-table{
    width:100%; border-collapse:collapse; min-width:520px;
  }
  .pf-contrib-table .pf-th{ padding:8px 10px 6px; font-size:9px; }
  .pf-contrib-th-num{ text-align:right; }
  .pf-contrib-table .pf-td{ padding:7px 10px; font-size:11px; color:${C.text}; vertical-align:top; }
  .pf-contrib-line-cell{
    display:flex; align-items:flex-start; gap:8px; color:${C.textDim}; min-width:160px;
  }
  .pf-contrib-line-text{ display:flex; flex-direction:column; gap:2px; min-width:0; }
  .pf-contrib-line-name{ font-weight:600; color:${C.text}; line-height:1.25; }
  .pf-contrib-line-sub{ font-size:9px; line-height:1.35; color:${C.textFaint}; }
  .pf-contrib-swatch{ width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
  .pf-contrib-td-num{
    text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap;
  }
  .pf-contrib-td-basis{ font-size:10px; color:${C.textDim}; white-space:nowrap; }
  .pf-contrib-mom{ font-weight:600; font-size:10px; }
  .pf-contrib-mom-up{ color:${C.green}; }
  .pf-contrib-mom-down{ color:${C.red}; }
  .pf-contrib-total-row .pf-td{
    border-top:1px solid ${C.border}; background:${C.panel};
  }
  .pf-contrib-table-wrap .pf-chart-hint{ padding:8px 10px 10px; margin-top:0; }
  @media(max-width:1024px){
    .pf-grid2-cash-region{ grid-template-columns:1fr; }
    .pf-grid2-contrib-region{ grid-template-columns:1fr; }
  }
  .pf-region-panel{ display:flex; flex-direction:column; min-height:0; flex:1; }
  .pf-region-head{
    align-items:flex-start; gap:8px; margin-bottom:8px;
  }
  .pf-region-head .pf-sechead{
    flex:0 1 auto; min-width:0; max-width:42%;
  }
  .pf-region-head .pf-insight{
    font-size:11.5px; line-height:1.25;
  }
  .pf-region-filters-inline{
    flex:1 1 58%; min-width:0; margin:0;
  }
  @media(max-width:900px){
    .pf-region-head{ flex-wrap:wrap; }
    .pf-region-head .pf-sechead{ max-width:100%; flex:1 1 100%; }
    .pf-region-filters-inline{ flex:1 1 100%; justify-content:flex-start; }
  }
  .pf-region-drill{
    flex:1; min-height:0; width:100%; margin:0;
    border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
    padding:8px 10px; box-sizing:border-box;
  }
  .pf-region-drill--compact{
    display:flex; flex-direction:column; min-height:0; overflow:visible;
  }
  .pf-region-drill--compact > div{
    display:flex; flex-direction:column; min-height:0;
  }
  .pf-contrib-map-hint{ font-size:10px; margin:8px 0 0; line-height:1.4; }
  .pf-ai-panel{ background:linear-gradient(180deg, rgba(37,99,235,0.04) 0%, ${C.panel} 48px); }
  .pf-ai-dual-head{
    display:grid; grid-template-columns:minmax(0,1.08fr) minmax(0,0.92fr); gap:12px 16px;
    align-items:stretch; margin-bottom:12px;
  }
  .pf-ai-dual-col{ min-width:0; display:flex; flex-direction:column; }
  .pf-ai-dual-col .pf-row{ flex-wrap:wrap; }
  .pf-ai-col-main{ gap:0; }
  .pf-ai-main-row{
    display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,1fr); gap:10px;
    margin-top:10px; align-items:stretch; min-width:0;
  }
  .pf-ai-coverage-col{
    display:flex; flex-direction:column; min-width:0; min-height:0;
  }
  .pf-ai-coverage-label{ margin:0 0 8px; }
  .pf-ai-coverage{
    display:grid; grid-template-columns:1fr 1fr; gap:8px; flex:1; align-content:start;
  }
  .pf-ai-coverage .pf-kpi{ padding:8px 9px; min-height:0; }
  .pf-ai-coverage .pf-kpi .pf-label{ font-size:8px; line-height:1.25; }
  .pf-flags-col{
    padding-left:16px; border-left:1px solid ${C.borderSoft};
  }
  .pf-flags-list{ margin:0; padding:0; flex:1; }
  .pf-ai-flow-viz{
    margin-top:0; padding:12px; border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
    min-width:0; display:flex; flex-direction:column;
  }
  .pf-ai-flow-body{
    display:flex; align-items:center; gap:12px; margin-top:8px; min-height:0;
  }
  .pf-ai-flow-donut-wrap{
    flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:6px;
  }
  .pf-ai-flow-donut{
    width:96px; height:96px; border-radius:50%; position:relative;
    box-shadow:inset 0 0 0 1px rgba(15,23,42,0.06);
  }
  .pf-ai-flow-donut-hole{
    position:absolute; inset:14px; border-radius:50%; background:${C.panel};
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; line-height:1.2;
  }
  .pf-ai-flow-donut-val{
    font-size:14px; font-weight:800; color:${C.blue}; font-family:ui-monospace,monospace;
  }
  .pf-ai-flow-donut-legend{
    display:flex; gap:8px; font-size:9px; font-weight:700;
  }
  .pf-ai-flow-donut-leg{ display:flex; align-items:center; gap:3px; }
  .pf-ai-flow-swatch{ width:7px; height:7px; border-radius:2px; }
  .pf-ai-flow-lanes{
    flex:1; min-width:0; display:flex; flex-direction:column; gap:0;
  }
  .pf-ai-flow-lane{
    position:relative; display:grid; grid-template-columns:22px 1fr auto; gap:8px; align-items:center;
    padding:8px 0;
  }
  .pf-ai-flow-lane + .pf-ai-flow-lane{ border-top:1px solid ${C.borderSoft}; }
  .pf-ai-flow-lane-n{
    width:22px; height:22px; border-radius:50%; display:grid; place-items:center;
    font-size:10px; font-weight:800;
  }
  .pf-ai-flow-lane-mid{ min-width:0; display:flex; flex-direction:column; gap:2px; }
  .pf-ai-flow-lane-title{ font-size:11px; font-weight:700; line-height:1.2; }
  .pf-ai-flow-lane-sub{ font-size:9px; color:${C.textDim}; line-height:1.25; }
  .pf-ai-flow-lane-amt{
    font-size:12px; font-weight:800; font-family:ui-monospace,monospace; white-space:nowrap;
  }
  .pf-ai-flow-lane-line{
    position:absolute; left:10px; top:100%; width:2px; height:8px; opacity:0.45; border-radius:1px;
  }
  .pf-ai-flow-caption{ margin:8px 0 0; font-size:9px; line-height:1.35; }
  ${compactKpi('pf')}
  @media(max-width:1200px){ .pf-grid6{ grid-template-columns:repeat(3,1fr);} }
  @media(max-width:640px){ .pf-grid6{ grid-template-columns:repeat(2,1fr);} }
`;

export const GROWTH_STYLE = `${rootBlock('gd', 'rgba(5,150,105,0.08)', 'rgba(234,88,12,0.06)')}
  ${drillCrumbTitleStyles('gd')}
  ${compactDrillHeroStyles('gd')}
  ${drillVizStyles('gd')}
  .gd-up{ color:${C.green}; font-weight:600; font-size:10px; }
  .gd-down{ color:${C.red}; font-weight:600; font-size:10px; }
  .gd-track{ height:7px; }
  .gd-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:start; }
  .gd-grid2 > .gd-panel, .gd-grid2 > .gd-col-stack > .gd-panel{ min-width:0; display:flex; flex-direction:column; }
  .gd-col-stack{
    display:flex; flex-direction:column; gap:10px; min-width:0;
    align-self:start; height:auto;
  }
  .gd-grid2 > .gd-col-stack > .gd-panel{ height:auto; flex-shrink:0; flex-grow:0; }
  .gd-grid2 > .gd-panel:only-child, .gd-grid2 > .gd-col-stack + .gd-panel{
    align-self:start; height:auto;
  }
  .gd-sechead .n{ background:rgba(5,150,105,0.12); color:${C.green}; }
  .gd-panel--highlight{ border-color:rgba(8,145,178,0.28); background:linear-gradient(180deg, rgba(8,145,178,0.04), ${C.panel}); }
  .gd-panel--drivers{
    padding:10px 12px 10px;
    align-self:start;
  }
  .gd-panel--drivers .gd-viz-driver-pie{ margin-top:0; margin-bottom:0; }
  @media(max-width:900px){ .gd-grid2{ grid-template-columns:1fr; } }
`;

export const ISSUES_STYLE = `${rootBlock('dd', 'rgba(220,38,38,0.06)', 'rgba(217,119,6,0.06)')}
  ${drillCrumbTitleStyles('dd')}
  ${compactDrillHeroStyles('dd', { kpiColumns: 2, kpiRows: 2 })}
  ${drillVizStyles('dd')}
  ${issuesVizStyles('dd')}
  .dd-up{ color:${C.red}; font-weight:600; font-size:10px; }
  .dd-down{ color:${C.green}; font-weight:600; font-size:10px; }
  .dd-sechead .n{ background:rgba(220,38,38,0.12); color:${C.red}; }
  .dd-verdict-badge{
    font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; white-space:nowrap;
    color:#b45309; background:rgba(217,119,6,0.12); border:1px solid rgba(217,119,6,0.28);
  }
  .dd-verdict-badge--bad{
    color:#dc2626; background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.28);
  }
  .dd-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:start; }
  .dd-grid2 > .dd-panel, .dd-grid2 > .dd-col-stack > .dd-panel{ min-width:0; display:flex; flex-direction:column; }
  .dd-col-stack{
    display:flex; flex-direction:column; gap:10px; min-width:0;
    align-self:start; height:auto;
  }
  .dd-grid2 > .dd-col-stack > .dd-panel{ height:auto; flex-shrink:0; flex-grow:0; }
  .dd-col-stack > .dd-panel{ padding:10px 12px; }
  .dd-col-stack > .dd-panel .dd-sechead{ margin:0 0 6px; }
  .dd-col-stack > .dd-panel .dd-iq,
  .dd-col-stack > .dd-panel .dd-viz-stage-table-wrap{ margin-top:0; margin-bottom:0; }
  .dd-panel--highlight{ border-color:rgba(220,38,38,0.28); background:linear-gradient(180deg, rgba(220,38,38,0.04), ${C.panel}); }
  @media(max-width:900px){ .dd-grid2{ grid-template-columns:1fr; } }
`;

export function performanceTheme() {
  return { C: DRILL_C, styleTag: PERFORMANCE_STYLE, gap: DRILL_GAP };
}

export function growthTheme() {
  return { C: DRILL_C, styleTag: GROWTH_STYLE, gap: DRILL_GAP };
}

export function issuesTheme() {
  return { C: DRILL_C, styleTag: ISSUES_STYLE, gap: DRILL_GAP };
}

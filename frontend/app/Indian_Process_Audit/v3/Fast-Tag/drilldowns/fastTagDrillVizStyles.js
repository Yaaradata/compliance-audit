/** Shared viz chrome for drill-down body charts (aligned with pf-cash-viz / pf-pnl-viz). */
import { DRILL_C as C } from './fastTagDrilldownTheme';

export function drillVizStyles(prefix) {
  const p = prefix;
  return `
  .${p}-viz-frame{
    margin-top:8px; padding:10px 12px; border:1px solid ${C.borderSoft};
    border-radius:10px; background:${C.bg};
  }
  .${p}-viz-frame-label{ margin-bottom:8px; display:block; }
  .${p}-viz-foot{ font-size:10px; margin-top:8px; line-height:1.35; }
  .${p}-metric-bar-row{ margin-bottom:8px; }
  .${p}-metric-bar-row:last-child{ margin-bottom:0; }
  .${p}-viz-track{ border-radius:4px; }
  .${p}-viz-metric-sub{ font-size:9px; margin-top:3px; line-height:1.3; }
  .${p}-viz-funnel-lanes{ margin-top:4px; display:flex; flex-direction:column; gap:6px; }
  .${p}-viz-funnel-row{
    display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) 36px 40px;
    gap:6px; align-items:center;
  }
  .${p}-viz-funnel-step{
    font-size:10px; font-weight:600; color:${C.textDim}; line-height:1.25; min-width:0;
  }
  .${p}-viz-funnel-step--drop{ color:${C.red}; }
  .${p}-viz-funnel-bar-wrap{
    height:26px; border-radius:6px; background:${C.borderSoft}; overflow:hidden;
  }
  .${p}-viz-funnel-bar{
    display:flex; align-items:center; min-width:2.5rem; height:100%; padding:0 8px;
    font-size:9px; font-weight:700; color:#fff; border-radius:6px; transition:width .35s ease;
  }
  .${p}-viz-funnel-bar--is-strong{ background:linear-gradient(90deg, ${C.green}, ${C.teal}); }
  .${p}-viz-funnel-bar--is-mid{ background:linear-gradient(90deg, ${C.teal}, ${C.blue}); opacity:.92; }
  .${p}-viz-funnel-bar--is-drop{ background:linear-gradient(90deg, ${C.amber}, ${C.red}); }
  .${p}-viz-funnel-pct{ font-size:10px; font-weight:600; color:${C.text}; text-align:right; font-variant-numeric:tabular-nums; }
  .${p}-viz-funnel-drop{
    font-size:9px; font-weight:700; text-align:right; color:transparent; font-variant-numeric:tabular-nums;
  }
  .${p}-viz-funnel-drop--show{ color:${C.red}; }
  .${p}-viz-donut-mix{
    display:grid; grid-template-columns:minmax(0,148px) minmax(0,1fr); gap:12px; align-items:center;
  }
  .${p}-viz-driver-pie{
    width:100%; box-sizing:border-box; margin:0;
    display:flex; flex-direction:row; align-items:center; justify-content:flex-start;
    gap:14px 18px;
  }
  .${p}-viz-driver-pie-chart{
    flex:0 0 auto; width:min(168px,38%); display:flex; align-items:center; justify-content:center;
  }
  .${p}-viz-driver-pie-chart .${p}-viz-donut-ring,
  .${p}-viz-driver-pie-ring{
    position:relative; width:100%; height:168px; min-width:148px; max-width:168px;
  }
  .${p}-viz-driver-pie .${p}-viz-donut-hole-val{ font-size:19px; }
  .${p}-viz-driver-pie .${p}-viz-donut-hole .${p}-faint{ font-size:10px; max-width:7.5rem; line-height:1.25; }
  .${p}-viz-driver-pie-table-wrap{
    flex:1; min-width:0; align-self:center;
  }
  .${p}-viz-driver-pie-table{
    width:100%; border-collapse:collapse; table-layout:fixed;
  }
  .${p}-viz-driver-pie-th{
    font-size:8px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    color:${C.textFaint}; text-align:left; padding:0 6px 6px 0; line-height:1.2;
    border-bottom:1px solid ${C.borderSoft}; white-space:nowrap;
  }
  .${p}-viz-driver-pie-th-num{ text-align:right; padding-right:0; padding-left:4px; }
  .${p}-viz-driver-pie-th-dot{ width:14px; padding:0 4px 6px 0; border-bottom:1px solid ${C.borderSoft}; }
  .${p}-viz-driver-pie-td-dot{
    width:14px; padding:5px 4px 5px 0; vertical-align:middle;
  }
  .${p}-viz-driver-pie-td-name{
    font-size:10px; font-weight:600; color:${C.textDim}; line-height:1.25;
    padding:5px 8px 5px 0; vertical-align:middle; text-align:left;
  }
  .${p}-viz-driver-pie-td-num{
    font-size:9px; font-weight:600; color:${C.textDim}; font-variant-numeric:tabular-nums;
    text-align:right; padding:5px 0 5px 4px; vertical-align:middle; white-space:nowrap;
  }
  .${p}-viz-driver-pie-td-yoy{ white-space:normal; line-height:1.25; }
  .${p}-viz-driver-pie-td-lift{ font-weight:700; color:${C.text}; }
  .${p}-viz-driver-pie-table .${p}-viz-legend-mom{ font-size:8px; font-weight:500; }
  .${p}-viz-driver-pie-table tbody tr:last-child .${p}-viz-driver-pie-td-dot,
  .${p}-viz-driver-pie-table tbody tr:last-child .${p}-viz-driver-pie-td-name,
  .${p}-viz-driver-pie-table tbody tr:last-child .${p}-viz-driver-pie-td-num{ padding-bottom:0; }
  .${p}-panel--drivers{ justify-content:flex-start; }
  .${p}-panel--drivers > .${p}-row{ margin-bottom:2px !important; }
  .${p}-panel--drivers .${p}-viz-driver-pie{ flex:0 0 auto; }
  .${p}-viz-donut-ring{ position:relative; height:168px; min-width:0; }
  .${p}-viz-donut-hole{
    pointer-events:none; position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; text-align:center;
  }
  .${p}-viz-donut-hole-val{ font-size:18px; font-weight:700; color:${C.text}; line-height:1.1; }
  .${p}-viz-legend{ margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px; }
  .${p}-viz-legend-item{
    display:grid; grid-template-columns:8px 1fr auto auto; gap:6px 8px; align-items:center;
  }
  .${p}-viz-swatch{ width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .${p}-viz-legend-name{ font-size:10px; color:${C.textDim}; line-height:1.25; min-width:0; }
  .${p}-viz-legend-val{ font-size:10px; font-weight:700; color:${C.text}; font-variant-numeric:tabular-nums; }
  .${p}-viz-legend-growth{ font-size:9px; white-space:nowrap; }
  .${p}-viz-drivers-pass-split{
    display:grid; grid-template-columns:minmax(0,1.12fr) minmax(0,1fr); gap:14px; align-items:stretch;
    margin-top:4px;
  }
  .${p}-viz-drivers-pass-col{
    min-width:0; padding:10px 12px; border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
  }
  .${p}-viz-drivers-pass-col--pass{
    border-color:rgba(8,145,178,0.28);
    background:linear-gradient(180deg, rgba(8,145,178,0.06), ${C.bg});
  }
  .${p}-viz-drivers-pass-heading{ margin-bottom:8px; display:block; }
  .${p}-viz-stack{ min-width:0; }
  .${p}-viz-stack-bar{
    display:flex; height:28px; border-radius:8px; overflow:hidden;
    border:1px solid ${C.borderSoft}; background:${C.panel};
  }
  .${p}-viz-stack-seg{
    display:flex; align-items:center; justify-content:center; min-width:4px;
    transition:flex 0.2s ease;
  }
  .${p}-viz-stack-seg--pass{ box-shadow:inset 0 0 0 2px rgba(8,145,178,0.55); }
  .${p}-viz-stack-seg-label{ font-size:9px; font-weight:700; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.25); white-space:nowrap; }
  .${p}-viz-stack-foot{
    display:flex; align-items:baseline; justify-content:space-between; gap:8px; margin-top:8px;
  }
  .${p}-viz-stack-total{ font-size:16px; font-weight:700; color:${C.text}; }
  .${p}-viz-stack-legend{
    margin:10px 0 0; padding:0; list-style:none;
    display:grid; grid-template-columns:repeat(auto-fill, minmax(168px, 1fr)); gap:6px 12px;
  }
  .${p}-viz-stack-legend li{
    display:grid; grid-template-columns:8px 1fr auto; gap:6px; align-items:center;
  }
  .${p}-viz-stage-table-wrap{
    margin-top:4px; border:1px solid ${C.borderSoft}; border-radius:10px;
    background:${C.bg}; overflow-x:auto;
  }
  .${p}-viz-stage-table-toolbar{ padding:8px 10px 0; display:flex; justify-content:flex-end; }
  .${p}-viz-stage-table{
    width:100%; border-collapse:collapse; min-width:480px;
  }
  .${p}-viz-stage-table .${p}-th{
    padding:8px 10px 6px; font-size:9px; text-align:left; white-space:nowrap;
    border-bottom:1px solid ${C.borderSoft}; background:${C.panel};
  }
  .${p}-viz-stage-tbl-th-num{ text-align:right; }
  .${p}-viz-stage-table .${p}-td{
    padding:8px 10px; font-size:10.5px; color:${C.text}; vertical-align:top;
    border-bottom:1px solid ${C.borderSoft};
  }
  .${p}-viz-stage-table tbody tr:last-child .${p}-td{ border-bottom:none; }
  .${p}-viz-stage-tbl-td-num{
    text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap;
  }
  .${p}-viz-stage-tbl-td-detail{ font-size:10px; color:${C.textDim}; line-height:1.4; min-width:140px; }
  .${p}-viz-stage-tbl-td-note{ font-size:9.5px; white-space:nowrap; }
  .${p}-viz-stage-tbl-stage-cell{ display:inline-flex; align-items:center; gap:6px; }
  .${p}-viz-stage-tbl-stage-name{ font-weight:600; white-space:nowrap; }
  .${p}-viz-stage-tbl-delta{ font-weight:600; font-size:10px; }
  .${p}-viz-stage-tbl-delta--up{ color:${C.green}; }
  .${p}-viz-stage-tbl-delta--drop{ color:${C.red}; }
  .${p}-viz-stage-tbl-row--bottleneck .${p}-td{
    background:rgba(217,119,6,0.06);
  }
  .${p}-viz-stage-tbl-row--bottleneck .${p}-viz-stage-tbl-stage-name{ color:${C.amber}; }
  .${p}-viz-stage-tbl-flag{
    font-size:8px; padding:2px 6px; margin-right:6px; color:${C.amber};
    background:rgba(217,119,6,0.12); border:1px solid rgba(217,119,6,0.35);
  }
  .${p}-viz-stage-tbl-total .${p}-td{
    border-top:1px solid ${C.border}; border-bottom:none; background:${C.panel}; font-size:10.5px;
  }
  .${p}-viz-channel-growth{ min-width:0; display:flex; flex-direction:column; gap:10px; }
  .${p}-viz-channel-table-label{ margin:4px 0 6px; display:block; }
  .${p}-viz-channel-table{ min-width:360px; }
  .${p}-viz-channel-table .${p}-th,
  .${p}-viz-channel-table .${p}-td{ vertical-align:middle; }
  .${p}-viz-channel-th-channel,
  .${p}-viz-channel-td-channel{ text-align:left; }
  .${p}-viz-channel-table .${p}-viz-stage-tbl-stage-name{ white-space:normal; line-height:1.3; }
  .${p}-viz-channel-table .${p}-viz-stage-tbl-stage-cell{ align-items:center; }
  .${p}-viz-channel-th-center,
  .${p}-viz-channel-td-center{ text-align:center; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .${p}-viz-channel-tbl-note{ font-size:9px; font-weight:500; }
  .${p}-viz-channel-row--fast .${p}-td{ background:rgba(8,145,178,0.06); }
  .${p}-viz-stage-list{ min-width:0; }
  .${p}-viz-stage-list-head{
    display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px;
  }
  .${p}-viz-stage-list-label-only{ display:block; margin-bottom:8px; }
  .${p}-viz-stage-list-items{
    margin:0; padding:0; list-style:none; display:flex; flex-direction:column;
  }
  .${p}-viz-stage-list-item{
    padding:8px 0; border-top:1px solid ${C.borderSoft};
  }
  .${p}-viz-stage-list-item:first-child{ border-top:none; padding-top:0; }
  .${p}-viz-stage-list-item--bottleneck{
    margin:0 -8px; padding:8px 8px; border-radius:8px;
    border:1px solid rgba(217,119,6,0.35); background:rgba(217,119,6,0.06);
  }
  .${p}-viz-stage-list-item--bottleneck + .${p}-viz-stage-list-item{ border-top-color:transparent; }
  .${p}-viz-stage-list-row{ display:flex; gap:8px; align-items:flex-start; }
  .${p}-viz-stage-list-num{
    flex-shrink:0; width:18px; height:18px; border-radius:50%; font-size:9px; font-weight:700;
    color:#fff; display:inline-flex; align-items:center; justify-content:center; margin-top:1px;
  }
  .${p}-viz-stage-list-main{ flex:1; min-width:0; }
  .${p}-viz-stage-list-title-row{
    display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 8px; margin-bottom:2px;
  }
  .${p}-viz-stage-list-title{ font-size:11px; font-weight:700; color:${C.text}; }
  .${p}-viz-stage-list-val{ font-size:11px; font-weight:700; font-variant-numeric:tabular-nums; margin-left:auto; }
  .${p}-viz-stage-list-growth{
    font-size:9px; font-weight:600; color:${C.green}; padding:1px 5px; border-radius:4px;
    background:rgba(5,150,105,0.1); white-space:nowrap;
  }
  .${p}-viz-stage-list-growth--drop{ color:${C.red}; background:rgba(220,38,38,0.08); }
  .${p}-viz-stage-list-desc{ margin:0; font-size:9.5px; line-height:1.35; }
  .${p}-viz-stage-flow, .${p}-viz-pass-flow{ min-width:0; display:flex; flex-direction:column; }
  .${p}-viz-stage-flow-head, .${p}-viz-pass-flow-head{
    display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px; margin-bottom:10px;
  }
  .${p}-viz-stage-badge, .${p}-viz-pass-badge{
    color:${C.teal}; background:rgba(8,145,178,0.12); border:1px solid rgba(8,145,178,0.35);
    font-size:9px; padding:3px 8px; border-radius:6px; white-space:nowrap;
  }
  .${p}-viz-stage-flow-scroll{
    overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:4px; margin:0 -4px; padding-left:4px; padding-right:4px;
  }
  .${p}-viz-stage-flow-row, .${p}-viz-pass-flow-row{
    display:flex; flex-wrap:nowrap; align-items:flex-start; gap:2px; min-width:min-content;
  }
  .${p}-viz-stage-flow-item, .${p}-viz-pass-flow-item{ display:flex; align-items:center; flex-shrink:0; }
  .${p}-viz-stage-flow-arrow, .${p}-viz-pass-flow-arrow{
    color:${C.textDim}; font-size:12px; font-weight:600; padding:0 2px; flex-shrink:0;
  }
  .${p}-viz-stage-flow-step, .${p}-viz-pass-flow-step{
    width:88px; padding:8px 6px 6px; border-radius:8px;
    border:1px solid ${C.borderSoft}; background:${C.panel}; text-align:center; flex-shrink:0;
  }
  .${p}-viz-stage-flow-step--bottleneck{
    border-color:rgba(217,119,6,0.45); background:rgba(217,119,6,0.08);
    box-shadow:0 0 0 1px rgba(217,119,6,0.15);
  }
  .${p}-viz-stage-flow-num, .${p}-viz-pass-flow-num{
    display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px;
    border-radius:50%; font-size:8px; font-weight:700; color:#fff; margin-bottom:4px;
  }
  .${p}-viz-stage-flow-stage, .${p}-viz-pass-flow-stage{
    display:block; font-size:9px; font-weight:700; color:${C.text}; line-height:1.2;
  }
  .${p}-viz-stage-flow-val, .${p}-viz-pass-flow-val{
    display:block; font-size:14px; font-weight:700; line-height:1.15; margin:4px 0 2px;
  }
  .${p}-viz-stage-flow-period, .${p}-viz-pass-flow-period{ display:block; font-size:8px; line-height:1.2; }
  .${p}-viz-stage-flow-growth, .${p}-viz-pass-flow-growth{
    display:inline-block; margin-top:4px; font-size:8px; font-weight:600; color:${C.green};
    padding:2px 5px; border-radius:4px; background:rgba(5,150,105,0.1);
  }
  .${p}-viz-stage-flow-growth--drop{ color:${C.red}; background:rgba(220,38,38,0.08); }
  .${p}-viz-pass-grid{
    display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:0;
  }
  .${p}-viz-pass-tile{
    padding:10px 10px 8px; border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg};
  }
  .${p}-viz-pass-val{ font-size:18px; font-weight:700; line-height:1.1; margin-bottom:6px; }
  .${p}-viz-usage-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px 14px; }
  .${p}-viz-split{
    display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.15fr); gap:12px; align-items:start;
    margin-top:4px;
  }
  .${p}-viz-split-col{ min-width:0; }
  .${p}-viz-geo-chart{ min-width:0; }
  .${p}-grid2 > .${p}-panel{ min-width:0; }
  .${p}-viz-growth-data{ min-width:0; display:flex; flex-direction:column; gap:10px; }
  .${p}-viz-growth-data-bench{
    display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:8px;
  }
  .${p}-viz-growth-data-bench-card{
    padding:8px 10px; border-radius:10px; border:1px solid ${C.borderSoft}; background:${C.bg};
    display:flex; flex-direction:column; gap:2px; min-width:0;
  }
  .${p}-viz-growth-data-bench-val{ font-size:16px; font-weight:800; color:${C.text}; line-height:1.15; }
  .${p}-viz-growth-data-bench-delta{ font-size:10px; font-weight:600; color:${C.textDim}; }
  .${p}-viz-growth-data-mom-up, .${p}-viz-growth-data-bench-delta.${p}-viz-growth-data-mom-up{ color:${C.green}; }
  .${p}-viz-growth-data-mom-down, .${p}-viz-growth-data-bench-delta.${p}-viz-growth-data-mom-down{ color:${C.red}; }
  .${p}-viz-growth-data-split{
    display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.2fr); gap:10px; align-items:start;
  }
  .${p}-viz-growth-data-chart{ min-width:0; margin-top:2px; }
  .${p}-viz-growth-data-bridge{
    display:flex; flex-wrap:wrap; align-items:baseline; gap:6px 10px; margin-top:8px; padding-top:8px;
    border-top:1px solid ${C.borderSoft}; font-size:10px;
  }
  .${p}-viz-growth-data-bridge-val{ font-size:14px; font-weight:800; color:${C.textDim}; }
  .${p}-viz-growth-data-bridge-val--cy{ color:${C.green}; }
  .${p}-viz-growth-data-bridge-arrow{ font-weight:700; color:${C.teal}; font-size:10px; }
  .${p}-viz-growth-data-side{ display:flex; flex-direction:column; gap:10px; min-width:0; }
  .${p}-viz-growth-data-trend-foot{
    display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:4px 8px; margin-top:6px;
    font-size:9px;
  }
  .${p}-viz-growth-data-table-wrap{
    border:1px solid ${C.borderSoft}; border-radius:10px; background:${C.bg}; overflow-x:auto;
  }
  .${p}-viz-growth-data-table{ width:100%; border-collapse:collapse; min-width:520px; }
  .${p}-viz-growth-data-table .${p}-th{ padding:8px 10px 6px; font-size:9px; }
  .${p}-viz-growth-data-th-num{ text-align:right; }
  .${p}-viz-growth-data-table .${p}-td{ padding:7px 10px; font-size:10.5px; color:${C.text}; vertical-align:top; }
  .${p}-viz-growth-data-line-cell{
    display:flex; align-items:flex-start; gap:8px; min-width:140px;
  }
  .${p}-viz-growth-data-swatch{ width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
  .${p}-viz-growth-data-line-text{ display:flex; flex-direction:column; gap:2px; min-width:0; }
  .${p}-viz-growth-data-line-name{ font-weight:600; line-height:1.25; }
  .${p}-viz-growth-data-line-sub{ font-size:9px; line-height:1.35; }
  .${p}-viz-growth-data-td-num{ text-align:right; white-space:nowrap; }
  .${p}-viz-growth-data-mom-sub{ display:block; font-size:9px; }
  .${p}-viz-growth-data-row--pass .${p}-viz-growth-data-line-name{
    color:${C.teal};
  }
  .${p}-viz-growth-data-total .${p}-td{
    border-top:1px solid ${C.borderSoft}; background:rgba(5,150,105,0.04);
  }
  .${p}-viz-txn-growth{ min-width:0; display:flex; flex-direction:column; gap:4px; }
  .${p}-viz-txn-series{
    display:grid; grid-template-columns:minmax(0,0.95fr) minmax(0,1.35fr); gap:10px 12px; align-items:stretch;
    padding:10px 0; border-bottom:1px solid ${C.borderSoft};
  }
  .${p}-viz-txn-series:last-of-type{ border-bottom:none; }
  .${p}-viz-txn-series-meta{ display:flex; flex-direction:column; gap:5px; min-width:0; }
  .${p}-viz-txn-series-label{ font-size:11px; font-weight:700; color:${C.text}; line-height:1.25; }
  .${p}-viz-txn-series-hero{
    display:flex; align-items:baseline; flex-wrap:wrap; gap:6px 8px;
  }
  .${p}-viz-txn-series-now{ font-size:15px; font-weight:800; line-height:1.1; }
  .${p}-viz-txn-series-range{
    display:flex; flex-direction:column; gap:2px; font-size:9px; color:${C.textDim}; line-height:1.35; min-width:0;
  }
  .${p}-viz-txn-series-range strong{ color:${C.text}; font-weight:700; }
  .${p}-viz-txn-range-main{
    display:flex; flex-direction:row; flex-wrap:nowrap; align-items:baseline; gap:5px; white-space:nowrap;
  }
  .${p}-viz-txn-range-arrow{ color:${C.textFaint}; font-weight:600; flex-shrink:0; }
  .${p}-viz-txn-range-sub{ font-size:8.5px; line-height:1.3; }
  .${p}-viz-txn-series-chart{ min-width:0; min-height:96px; }
  .${p}-viz-retention{ min-width:0; display:flex; flex-direction:column; gap:10px; }
  .${p}-viz-retention-line-chart{ min-width:0; min-height:280px; }
  .${p}-viz-retention-latest{
    display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; font-size:9.5px; margin-top:8px;
    padding-top:8px; border-top:1px solid ${C.borderSoft}; line-height:1.4;
  }
  .${p}-viz-explain-story{ min-width:0; }
  .${p}-viz-explain-thesis{
    margin:0 0 12px; padding:10px 12px; border-radius:10px; font-size:11.5px; line-height:1.45;
    color:${C.text}; background:linear-gradient(135deg, rgba(5,150,105,0.08), rgba(37,99,235,0.05));
    border:1px solid rgba(5,150,105,0.2);
  }
  .${p}-viz-explain-blocks{ margin:0; padding:0; list-style:none; display:flex; flex-direction:column; }
  .${p}-viz-explain-block{
    display:grid; grid-template-columns:28px 1fr; gap:10px; padding:10px 0;
  }
  .${p}-viz-explain-block-rail{ display:flex; flex-direction:column; align-items:center; }
  .${p}-viz-explain-step{
    width:22px; height:22px; border-radius:50%; font-size:10px; font-weight:700; color:#fff;
    display:grid; place-items:center; background:var(--explain-accent, ${C.teal});
  }
  .${p}-viz-explain-block--context .${p}-viz-explain-step{ background:${C.blue}; }
  .${p}-viz-explain-block--risk .${p}-viz-explain-step{ background:${C.amber}; }
  .${p}-viz-explain-block--opportunity .${p}-viz-explain-step{ background:${C.green}; }
  .${p}-viz-explain-connector{
    flex:1; width:2px; min-height:16px; margin:4px 0;
    background:linear-gradient(180deg, var(--explain-accent, ${C.border}), ${C.borderSoft});
  }
  .${p}-viz-explain-block-body{
    padding:8px 10px; border-radius:10px; border:1px solid ${C.borderSoft}; background:${C.panel};
  }
  .${p}-viz-explain-block--context .${p}-viz-explain-block-body{
    border-color:rgba(37,99,235,0.22); background:linear-gradient(180deg, rgba(37,99,235,0.04), ${C.panel});
  }
  .${p}-viz-explain-block--risk .${p}-viz-explain-block-body{
    border-color:rgba(217,119,6,0.28); background:rgba(217,119,6,0.04);
  }
  .${p}-viz-explain-block-top{
    display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:4px;
  }
  .${p}-viz-explain-phase{
    font-size:9px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; color:${C.textFaint};
  }
  .${p}-viz-explain-contrib{
    font-size:10px; font-weight:700; color:var(--explain-accent, ${C.teal});
    padding:2px 6px; border-radius:4px; background:rgba(8,145,178,0.1);
  }
  .${p}-viz-explain-title{ margin:0 0 4px; font-size:12px; font-weight:700; color:${C.text}; line-height:1.3; }
  .${p}-viz-explain-text{ margin:0 0 8px; font-size:10.5px; line-height:1.45; color:${C.textDim}; }
  .${p}-viz-explain-proof{
    display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 8px; font-size:9.5px; line-height:1.35;
  }
  .${p}-viz-explain-proof-label{
    font-size:8px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:${C.teal};
  }
  .${p}-viz-explain-ref{
    display:inline-block; margin-top:6px; font-size:8.5px; font-weight:600; color:${C.teal};
    padding:2px 6px; border-radius:4px; background:rgba(8,145,178,0.08); border:1px solid rgba(8,145,178,0.08);
  }
  .${p}-viz-explain-plays{ min-width:0; }
  .${p}-viz-explain-play-list{ margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px; }
  .${p}-viz-explain-play{
    display:grid; grid-template-columns:32px 1fr; gap:10px; align-items:start;
    padding:10px; border-radius:10px; border:1px solid ${C.borderSoft}; background:${C.panel};
  }
  .${p}-viz-explain-play--urgent{
    border-color:rgba(217,119,6,0.35); background:linear-gradient(180deg, rgba(217,119,6,0.06), ${C.panel});
  }
  .${p}-viz-explain-play-rank{
    width:28px; height:28px; border-radius:8px; font-size:13px; font-weight:700; color:#fff;
    display:grid; place-items:center; background:${C.teal};
  }
  .${p}-viz-explain-play--urgent .${p}-viz-explain-play-rank{ background:${C.amber}; }
  .${p}-viz-explain-play-head{
    display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:6px; margin-bottom:8px;
  }
  .${p}-viz-explain-play-title{ margin:0; font-size:12px; font-weight:700; color:${C.text}; line-height:1.3; flex:1; min-width:120px; }
  .${p}-viz-explain-play-impact{
    font-size:10px; font-weight:700; color:${C.green}; white-space:nowrap;
    padding:3px 8px; border-radius:6px; background:rgba(5,150,105,0.1);
  }
  .${p}-viz-explain-play-grid{
    display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;
  }
  .${p}-viz-explain-play-cell p{ margin:4px 0 0; font-size:10px; line-height:1.4; color:${C.textDim}; }
  .${p}-viz-explain-play-foot{
    display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px;
    padding-top:6px; border-top:1px solid ${C.borderSoft}; font-size:9px;
  }
  .${p}-viz-issues-th-center, .${p}-viz-issues-td-center{ text-align:center; }
  .${p}-viz-issues-chip{
    font-size:9px; font-weight:700; padding:2px 7px; border-radius:20px; display:inline-block;
  }
  .${p}-viz-issues-impact{ margin-top:0; }
  .${p}-viz-happiness{ min-width:0; }
  .${p}-viz-happiness-grid{
    display:grid; grid-template-columns:1fr 1fr; gap:6px 8px;
  }
  .${p}-viz-happiness-tile{
    padding:6px 8px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .${p}-viz-partner-happy-row{ display:flex; align-items:center; gap:8px; min-width:0; }
  .${p}-viz-partner-row--strain .${p}-td{ background:rgba(220,38,38,0.04); }
  .${p}-viz-churn{ min-width:0; display:flex; flex-direction:column; gap:6px; }
  .${p}-viz-churn-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
  .${p}-viz-churn-tile{
    padding:6px 8px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
    display:flex; flex-direction:column; gap:2px; min-width:0;
  }
  .${p}-viz-churn-val{ font-size:16px; font-weight:800; line-height:1.1; }
  .${p}-viz-churn-note{ margin:0; font-size:9.5px; line-height:1.4; color:${C.textDim}; }
  .${p}-viz-sentiment-head{
    display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px; margin-bottom:6px;
  }
  .${p}-viz-sentiment{ min-width:0; }
  .${p}-viz-sentiment-chart{ min-height:108px; }
  .${p}-viz-sentiment-foot{
    display:flex; flex-direction:column; gap:2px; margin-top:6px; font-size:9px; line-height:1.3;
  }
  .${p}-viz-root-actions{ min-width:0; }
  .${p}-viz-root-actions-split{
    display:grid; grid-template-columns:minmax(0,0.85fr) minmax(0,1.15fr); gap:10px; align-items:start;
  }
  .${p}-viz-root-actions-col{ min-width:0; }
  .${p}-viz-root-actions-label{ margin:0 0 6px; display:block; }
  .${p}-viz-actions-table{ min-width:360px; }
  .${p}-viz-cx-trend{ min-width:0; margin-bottom:8px; }
  .${p}-viz-cx-trend-head{
    display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px; margin-bottom:4px;
  }
  .${p}-viz-cx-trend-chart{ min-height:88px; }
  .${p}-viz-cx-trend-hint{ margin:4px 0 0; font-size:9.5px; line-height:1.4; color:${C.textDim}; }
  .${p}-viz-region-channel{
    display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:start; min-width:0;
  }
  .${p}-viz-region-channel-col{ min-width:0; }
  .${p}-viz-region-channel-label{ margin:0 0 6px; display:block; }
  .${p}-viz-channel-row--rising .${p}-td{ background:rgba(220,38,38,0.04); }
  .${p}-viz-resolution{ min-width:0; display:flex; flex-direction:column; gap:8px; }
  .${p}-viz-resolution-kpis{
    display:grid; grid-template-columns:repeat(4,1fr); gap:6px;
  }
  .${p}-viz-resolution-kpi{
    padding:6px 8px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
    display:flex; flex-direction:column; gap:2px; min-width:0;
  }
  .${p}-viz-resolution-kpi-val{ font-size:15px; font-weight:800; line-height:1.1; }
  .${p}-viz-resolution-chart{ min-height:120px; }
  .${p}-viz-resolution-gap{ margin:6px 0 0; font-size:9.5px; line-height:1.4; color:${C.textDim}; }
  .${p}-viz-resolution-causes{ min-width:0; }
  .${p}-section-stack{ display:flex; flex-direction:column; gap:8px; min-width:0; }
  .${p}-verdict-badge{
    font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; white-space:nowrap;
    color:#b45309; background:rgba(217,119,6,0.12); border:1px solid rgba(217,119,6,0.28);
  }
  .${p}-verdict-badge--bad{
    color:#dc2626; background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.28);
  }
  @media(max-width:640px){
    .${p}-viz-stack-legend{ grid-template-columns:1fr; }
    .${p}-viz-stage-flow-step, .${p}-viz-pass-flow-step{ width:80px; }
  }
  @media(max-width:900px){
    .${p}-viz-txn-series{ grid-template-columns:1fr; }
    .${p}-viz-retention-line-chart{ min-height:220px; }
    .${p}-viz-growth-data-split{ grid-template-columns:1fr; }
    .${p}-viz-growth-data-bench{ grid-template-columns:repeat(2, 1fr); }
    .${p}-viz-explain-play-grid{ grid-template-columns:1fr; }
    .${p}-viz-drivers-pass-split{ grid-template-columns:1fr; }
    .${p}-viz-donut-mix{ grid-template-columns:1fr; }
    .${p}-viz-driver-pie{ flex-direction:column; align-items:stretch; gap:10px; }
    .${p}-viz-driver-pie-chart{ width:100%; max-width:none; }
    .${p}-viz-driver-pie-chart .${p}-viz-driver-pie-ring{ max-width:none; margin:0 auto; }
    .${p}-viz-split{ grid-template-columns:1fr; }
    .${p}-viz-usage-grid{ grid-template-columns:1fr; }
    .${p}-viz-funnel-row{ grid-template-columns:1fr 1fr; grid-template-rows:auto auto; }
    .${p}-viz-funnel-step{ grid-column:1 / -1; }
    .${p}-viz-funnel-bar-wrap{ grid-column:1 / -1; }
    .${p}-viz-funnel-pct, .${p}-viz-funnel-drop{ text-align:left; }
    .${p}-viz-happiness-grid{ grid-template-columns:1fr; }
    .${p}-viz-churn-grid{ grid-template-columns:1fr; }
    .${p}-viz-root-actions-split{ grid-template-columns:1fr; }
    .${p}-viz-region-channel{ grid-template-columns:1fr; }
    .${p}-viz-resolution-kpis{ grid-template-columns:repeat(2,1fr); }
  }
`;
}

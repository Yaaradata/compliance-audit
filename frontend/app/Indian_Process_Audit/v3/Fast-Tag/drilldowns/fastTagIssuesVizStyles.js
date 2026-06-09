import { DRILL_C as C } from './fastTagDrilldownTheme';

export function issuesVizStyles(prefix) {
  const p = prefix;
  return `
  .${p}-iq{ min-width:0; display:flex; flex-direction:column; gap:8px; }
  .${p}-iq-chart{ min-height:130px; width:100%; }
  .${p}-iq-chart--sm{ min-height:100px; }
  .${p}-iq-drivers{
    display:grid; grid-template-columns:repeat(3,1fr); gap:6px;
  }
  .${p}-iq-driver{
    padding:6px 8px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.panel};
    display:flex; flex-direction:column; gap:3px; min-width:0;
  }
  .${p}-iq-driver-metric{ font-size:9px; font-weight:600; color:${C.textDim}; line-height:1.25; }
  .${p}-iq-driver-now{ font-size:14px; font-weight:800; line-height:1.1; }
  .${p}-iq-driver-delta{ font-size:9px; font-weight:700; }
  .${p}-iq-driver-delta--bad{ color:#dc2626; }
  .${p}-iq-driver-delta--good{ color:#059669; }
  .${p}-iq-split{ display:grid; grid-template-columns:1.15fr 0.85fr; gap:10px; align-items:start; min-width:0; }
  .${p}-iq-map-scope-hint{ margin:0 0 4px; font-size:9.5px; line-height:1.35; }
  .${p}-iq-map{ min-width:0; display:flex; flex-direction:column; gap:6px; }
  .${p}-iq-map-split{
    display:grid;
    grid-template-columns:1.1fr 0.9fr;
    grid-template-rows:auto 1fr;
    gap:4px 10px;
    align-items:stretch;
    min-width:0;
  }
  .${p}-iq-map-col{ min-width:0; display:flex; flex-direction:column; gap:4px; }
  .${p}-iq-map-head{
    display:flex; align-items:flex-end; justify-content:space-between; gap:8px;
    min-height:24px; width:100%;
  }
  .${p}-iq-map-head--detail{ justify-content:flex-start; }
  .${p}-iq-map-hover-panel{
    padding:8px 10px; border-radius:8px; border:1px solid ${C.borderSoft}; background:${C.bg};
    min-height:200px; height:100%; display:flex; flex-direction:column; gap:0;
  }
  .${p}-iq-map-hover-empty{
    padding:12px 10px; border-radius:8px; border:1px dashed ${C.borderSoft}; background:${C.panel};
    min-height:160px; display:flex; align-items:center;
  }
  .${p}-iq-map-hover-empty p{ margin:0; font-size:9.5px; line-height:1.4; }
  .${p}-iq-map-section-label{
    font-size:10px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
    color:${C.textDim}; line-height:1.2;
  }
  .${p}-iq-map-overall{
    appearance:none; border:1px solid rgba(79,70,229,0.35); background:${C.panel};
    color:#4f46e5; font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    padding:4px 10px; border-radius:6px; cursor:pointer; font-family:inherit;
  }
  .${p}-iq-map-overall--active{
    background:#4f46e5; color:#fff; border-color:#4f46e5;
  }
  .${p}-iq-map-frame{
    position:relative; border-radius:8px; background:rgba(248,250,252,0.9);
    border:1px solid ${C.borderSoft}; padding:4px; min-height:200px;
  }
  .${p}-iq-map-svg{ display:block; width:100%; height:auto; max-height:220px; margin:0 auto; }
  .${p}-iq-map-path{ cursor:pointer; transition:filter .15s; }
  .${p}-iq-map-path:hover{ filter:brightness(0.96); }
  .${p}-iq-map-path--dim{ opacity:0.55; pointer-events:none; }
  .${p}-iq-map-loading, .${p}-iq-map-error{
    margin:0; padding:32px 12px; text-align:center; font-size:11px; color:${C.textDim};
  }
  .${p}-iq-map-error{ color:#dc2626; }
  .${p}-iq-map-tooltip{
    pointer-events:none; position:absolute; left:8px; right:8px; bottom:8px;
    padding:6px 8px; border-radius:7px; background:rgba(15,23,42,0.92); color:#f8fafc;
    font-size:9.5px; line-height:1.35; box-shadow:0 4px 12px rgba(15,23,42,0.2);
  }
  .${p}-iq-map-tooltip-title{ display:block; font-weight:700; margin-bottom:2px; }
  .${p}-iq-map-tooltip-line{ display:block; color:#cbd5e1; }
  .${p}-iq-map-legend{
    display:flex; flex-wrap:wrap; align-items:center; justify-content:flex-end; gap:8px;
    font-size:9px; color:${C.textFaint}; margin-left:auto; flex-shrink:0;
  }
  .${p}-iq-map-legend-item{ display:inline-flex; align-items:center; gap:4px; }
  .${p}-iq-map-legend-dot{ width:8px; height:8px; border-radius:50%; border:1px solid rgba(15,23,42,0.08); }
  .${p}-iq-map-detail{
    padding:8px 10px; border-radius:8px; border:1px solid ${C.borderSoft}; background:${C.bg};
  }
  .${p}-iq-map-detail-head{
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    margin-bottom:4px; font-size:12px; flex-shrink:0;
  }
  .${p}-iq-map-detail-grid{
    display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px 10px;
    flex:1; align-content:start;
  }
  .${p}-iq-map-detail-cell{
    display:flex; flex-direction:column; gap:2px; min-width:0; min-height:36px;
  }
  .${p}-iq-map-detail-cell .${p}-label{ line-height:1.2; }
  .${p}-iq-map-detail-cell .${p}-faint{ font-size:8.5px; line-height:1.25; }
  .${p}-iq-map-detail-val{ font-size:15px; font-weight:800; color:${C.text}; line-height:1.1; }
  .${p}-iq-map-detail-sub{
    font-size:10px; font-weight:600; color:${C.text}; line-height:1.3;
    overflow:hidden; text-overflow:ellipsis;
  }
  .${p}-iq-map-hint{ margin:0; font-size:9.5px; line-height:1.35; }
  .${p}-iq-hotspots{ display:flex; flex-direction:column; gap:4px; }
  .${p}-iq-hotspot{
    font-size:9.5px; line-height:1.35; padding:5px 8px; border-radius:7px;
    border:1px solid rgba(217,119,6,0.28); background:rgba(217,119,6,0.08); color:#92400e; font-weight:600;
  }
  .${p}-iq-channel-list{ display:flex; flex-direction:column; gap:5px; }
  .${p}-iq-channel-row{
    display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:8px; align-items:center;
    padding:5px 8px; border:1px solid ${C.borderSoft}; border-radius:7px; background:${C.bg};
  }
  .${p}-iq-channel-row--hot{ background:rgba(220,38,38,0.05); border-color:rgba(220,38,38,0.22); }
  .${p}-iq-channel-name{ font-size:10px; font-weight:600; color:${C.text}; min-width:0; }
  .${p}-iq-channel-vol{ font-size:10px; font-weight:700; color:${C.text}; white-space:nowrap; }
  .${p}-iq-channel-delta{ font-size:9px; font-weight:700; white-space:nowrap; }
  .${p}-iq-loss-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; min-width:0; }
  .${p}-iq-loss-col{ min-width:0; }
  .${p}-iq-loss-col-label{ font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:${C.textFaint}; margin:0 0 6px; }
  .${p}-iq-loss-pie-wrap{ display:flex; flex-direction:column; gap:8px; min-width:0; }
  .${p}-iq-loss-split{
    display:grid; grid-template-columns:minmax(148px,0.36fr) minmax(0,1fr); gap:10px; align-items:start; min-width:0;
  }
  .${p}-iq-loss-pie-only{
    display:flex; align-items:center; justify-content:center; min-width:0; padding:4px 0;
  }
  .${p}-iq-loss-pie-only .${p}-viz-driver-pie-ring{
    position:relative; width:100%; max-width:168px; height:168px; margin:0 auto;
  }
  .${p}-iq-loss-table-col{ min-width:0; }
  .${p}-iq-loss-table-col .${p}-iq-case-table-wrap{ max-height:280px; }
  .${p}-iq-loss-row--active{ background:rgba(79,70,229,0.06) !important; }
  .${p}-iq-rating-split{
    display:grid; grid-template-columns:minmax(0,0.95fr) minmax(0,1.05fr); gap:10px; align-items:start;
    min-width:0;
  }
  .${p}-iq-rating-donut-wrap{ min-width:0; display:flex; flex-direction:column; gap:6px; }
  .${p}-iq-rating-donut-ring{
    position:relative; width:100%; max-width:156px; height:156px; margin:0 auto;
  }
  .${p}-iq-rating-donut-label{
    font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
    color:${C.textDim}; line-height:1;
  }
  .${p}-iq-rating-bars{ min-width:0; display:flex; flex-direction:column; gap:6px; }
  .${p}-iq-rating-bars-label{
    margin:0; font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    color:${C.textFaint}; line-height:1.2;
  }
  .${p}-iq-rating-band-toggle{
    display:inline-flex; flex-shrink:0; align-items:center; gap:3px; padding:3px;
    border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .${p}-iq-rating-band-btn{
    appearance:none; border:0; background:transparent; color:${C.textDim};
    font-size:9px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
    padding:4px 11px; border-radius:6px; cursor:pointer; font-family:inherit;
    transition:background .15s,color .15s,box-shadow .15s;
  }
  .${p}-iq-rating-band-btn--active.${p}-iq-rating-band-btn--high{
    background:#059669; color:#fff; box-shadow:0 1px 3px rgba(5,150,105,0.28);
  }
  .${p}-iq-rating-band-btn--active.${p}-iq-rating-band-btn--med{
    background:#d97706; color:#fff; box-shadow:0 1px 3px rgba(217,119,6,0.28);
  }
  .${p}-iq-rating-band-btn--active.${p}-iq-rating-band-btn--low{
    background:#dc2626; color:#fff; box-shadow:0 1px 3px rgba(220,38,38,0.28);
  }
  .${p}-iq-rating-seg-rows{ display:flex; flex-direction:column; gap:6px; }
  .${p}-iq-rating-seg-row{
    display:grid; grid-template-columns:minmax(0,1fr) auto;
    gap:10px; align-items:start; min-width:0;
  }
  .${p}-iq-rating-seg-meta{ display:flex; flex-direction:column; gap:3px; min-width:0; }
  .${p}-iq-rating-seg-name-row{
    display:flex; flex-wrap:wrap; align-items:baseline; gap:5px 6px; min-width:0;
  }
  .${p}-iq-rating-seg-name{
    font-size:11px; font-weight:700; color:${C.text}; line-height:1.3;
    text-align:left; flex-shrink:0;
  }
  .${p}-iq-rating-seg-driver{
    font-size:9.5px; font-weight:500; color:${C.textDim}; line-height:1.35;
  }
  .${p}-iq-rating-seg-sub{
    font-size:8.5px; font-weight:600; color:${C.textFaint}; line-height:1.25;
    font-variant-numeric:tabular-nums; white-space:nowrap;
  }
  .${p}-iq-rating-seg-pct{
    font-size:12px; font-weight:800; text-align:right;
    font-variant-numeric:tabular-nums; white-space:nowrap; padding-top:1px;
  }
  .${p}-iq-rating-seg-pct--low{ color:#dc2626; }
  .${p}-iq-rating-seg-pct--med{ color:#d97706; }
  .${p}-iq-rating-seg-pct--high{ color:#059669; }
  .${p}-iq-rating-seg-row--low{
    padding:6px 8px; margin:0 -8px; border-radius:8px;
    background:linear-gradient(90deg, rgba(220,38,38,0.04), transparent);
  }
  .${p}-iq-rating-seg-row--med{
    padding:6px 8px; margin:0 -8px; border-radius:8px;
    background:linear-gradient(90deg, rgba(217,119,6,0.05), transparent);
  }
  .${p}-iq-rating-seg-row--high{
    padding:6px 8px; margin:0 -8px; border-radius:8px;
    background:linear-gradient(90deg, rgba(5,150,105,0.05), transparent);
  }
  .${p}-iq-loss-toggle{
    display:inline-flex; flex-shrink:0; align-self:center; gap:4px; padding:3px;
    border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .${p}-iq-loss-toggle-btn{
    appearance:none; border:0; background:transparent; color:${C.textDim};
    font-size:9px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
    padding:4px 10px; border-radius:6px; cursor:pointer; font-family:inherit;
  }
  .${p}-iq-loss-toggle-btn--active{
    background:#4f46e5; color:#fff; box-shadow:0 1px 3px rgba(79,70,229,0.28);
  }
  .${p}-iq-loss-row--active .${p}-viz-driver-pie-td-name,
  .${p}-iq-loss-row--active .${p}-viz-driver-pie-td-num{ color:${C.text}; }
  .${p}-iq-loss-row--active{ background:rgba(79,70,229,0.06); }
  .${p}-iq-loss-detail{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .${p}-iq-loss-detail-head{
    display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:6px;
  }
  .${p}-iq-loss-detail-title{ font-size:11px; font-weight:700; color:${C.text}; line-height:1.25; }
  .${p}-iq-loss-detail-grid{
    display:grid; grid-template-columns:repeat(2,1fr); gap:6px 10px; margin-bottom:6px;
  }
  .${p}-iq-loss-detail-val{ font-size:15px; font-weight:800; color:${C.text}; line-height:1.1; }
  .${p}-iq-loss-detail-sub{ font-size:10px; font-weight:600; color:#92400e; line-height:1.3; }
  .${p}-iq-loss-detail-driver{ margin:0; font-size:9.5px; line-height:1.35; color:${C.textDim}; }
  .${p}-iq-totals{
    display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:8px;
  }
  .${p}-iq-total-tile{
    padding:6px 8px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
    display:flex; flex-direction:column; gap:2px;
  }
  .${p}-iq-total-val{ font-size:15px; font-weight:800; line-height:1.1; color:#dc2626; }
  .${p}-iq-sev{
    font-size:8px; font-weight:700; padding:2px 6px; border-radius:999px; display:inline-block;
  }
  .${p}-iq-sev--Critical{ color:#dc2626; background:rgba(220,38,38,0.12); border:1px solid rgba(220,38,38,0.3); }
  .${p}-iq-sev--High{ color:#d97706; background:rgba(217,119,6,0.12); border:1px solid rgba(217,119,6,0.3); }
  .${p}-iq-sev--Watch{ color:#059669; background:rgba(5,150,105,0.1); border:1px solid rgba(5,150,105,0.28); }
  .${p}-iq-sla-row{ display:flex; flex-direction:column; gap:4px; margin-top:4px; }
  .${p}-iq-sla-item{ display:flex; align-items:center; gap:8px; min-width:0; }
  .${p}-iq-sla-label{ font-size:9px; font-weight:600; color:${C.textDim}; width:72px; flex-shrink:0; }
  .${p}-iq-sla-track{ flex:1; height:8px; border-radius:4px; background:${C.borderSoft}; overflow:hidden; }
  .${p}-iq-sla-fill{ height:100%; border-radius:4px; }
  .${p}-iq-sla-pct{ font-size:9px; font-weight:700; width:28px; text-align:right; flex-shrink:0; }
  .${p}-iq-pace{
    display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:6px 10px;
    border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg}; margin-top:4px;
  }
  .${p}-iq-pace-val{ font-size:16px; font-weight:800; }
  .${p}-iq-pace--bad .${p}-iq-pace-val{ color:#dc2626; }
  .${p}-iq-pace--ok .${p}-iq-pace-val{ color:#059669; }
  .${p}-iq-res-kpis{
    display:grid; grid-template-columns:repeat(3,1fr); gap:6px;
  }
  .${p}-iq-res-kpi{
    padding:6px 8px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
    display:flex; flex-direction:column; gap:2px; min-width:0;
  }
  .${p}-iq-res-kpi--ok{ border-color:rgba(5,150,105,0.28); background:rgba(5,150,105,0.06); }
  .${p}-iq-res-kpi--bad{ border-color:rgba(220,38,38,0.28); background:rgba(220,38,38,0.06); }
  .${p}-iq-res-kpi-val{ font-size:15px; font-weight:800; line-height:1.1; color:${C.text}; }
  .${p}-iq-res-kpi--ok .${p}-iq-res-kpi-val{ color:#059669; }
  .${p}-iq-res-kpi--bad .${p}-iq-res-kpi-val{ color:#dc2626; }
  .${p}-iq-res-split{
    display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,0.85fr); gap:10px; align-items:start;
  }
  .${p}-iq-res-main, .${p}-iq-res-side{ min-width:0; display:flex; flex-direction:column; gap:6px; }
  .${p}-iq-res-race{
    display:flex; flex-direction:column; gap:4px;
    padding:6px 8px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.panel};
  }
  .${p}-iq-res-race-head{
    display:grid; grid-template-columns:52px minmax(0,1fr) 44px; gap:8px; align-items:center;
    padding:0 2px 2px;
  }
  .${p}-iq-res-race-row{
    appearance:none; border:1px solid transparent; background:transparent;
    display:grid; grid-template-columns:52px minmax(0,1fr) 44px; gap:8px; align-items:center;
    padding:4px 2px; border-radius:6px; cursor:pointer; font-family:inherit; text-align:left;
  }
  .${p}-iq-res-race-row:hover, .${p}-iq-res-race-row:focus-visible{
    background:rgba(79,70,229,0.05); border-color:rgba(79,70,229,0.18); outline:none;
  }
  .${p}-iq-res-race-row--active{
    background:rgba(79,70,229,0.08); border-color:rgba(79,70,229,0.28);
  }
  .${p}-iq-res-race-label{ font-size:9px; font-weight:700; color:${C.textDim}; }
  .${p}-iq-res-race-lanes{ display:flex; flex-direction:column; gap:3px; min-width:0; }
  .${p}-iq-res-race-lane{
    position:relative; height:14px; border-radius:4px; background:${C.borderSoft}; overflow:hidden;
  }
  .${p}-iq-res-race-lane--in .${p}-iq-res-race-fill{ background:linear-gradient(90deg,#fca5a5,#dc2626); }
  .${p}-iq-res-race-lane--out .${p}-iq-res-race-fill{ background:linear-gradient(90deg,#6ee7b7,#059669); }
  .${p}-iq-res-race-fill{ height:100%; border-radius:4px; transition:width .2s ease; }
  .${p}-iq-res-race-val{
    position:absolute; inset:0; display:flex; align-items:center; justify-content:flex-end;
    padding-right:5px; font-size:8px; font-weight:700; color:#fff; text-shadow:0 1px 1px rgba(15,23,42,0.35);
  }
  .${p}-iq-res-race-net{
    font-size:9px; font-weight:800; text-align:right; font-variant-numeric:tabular-nums;
  }
  .${p}-iq-res-race-net--bad{ color:#dc2626; }
  .${p}-iq-res-race-net--good{ color:#059669; }
  .${p}-iq-res-backlog{
    padding:6px 8px 2px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .${p}-iq-res-pace{
    padding:8px 10px; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.bg};
  }
  .${p}-iq-res-pace--bad{ border-color:rgba(220,38,38,0.24); }
  .${p}-iq-res-pace-head{
    display:flex; align-items:baseline; justify-content:space-between; gap:8px; margin-bottom:6px;
  }
  .${p}-iq-res-pace-val{ font-size:18px; font-weight:800; color:${C.text}; line-height:1; }
  .${p}-iq-res-pace--bad .${p}-iq-res-pace-val{ color:#dc2626; }
  .${p}-iq-res-pace-track{
    position:relative; height:10px; border-radius:5px; background:${C.borderSoft}; overflow:visible;
  }
  .${p}-iq-res-pace-fill{
    height:100%; border-radius:5px; background:linear-gradient(90deg,#34d399,#059669); transition:width .25s ease;
  }
  .${p}-iq-res-pace-fill--over{ background:linear-gradient(90deg,#fbbf24,#dc2626); }
  .${p}-iq-res-pace-marker{
    position:absolute; top:-3px; bottom:-3px; width:2px; margin-left:-1px;
    background:#0f172a; border-radius:1px; opacity:.55;
  }
  .${p}-iq-res-pace-note{ margin:6px 0 0; font-size:9px; line-height:1.35; color:${C.textDim}; }
  .${p}-iq-res-sla-stack{
    display:flex; width:100%; height:12px; border-radius:6px; overflow:hidden;
    border:1px solid ${C.borderSoft};
  }
  .${p}-iq-res-sla-seg{ height:100%; min-width:2px; }
  .${p}-iq-res-sla-legend{
    display:flex; flex-wrap:wrap; gap:6px 10px; font-size:8.5px; color:${C.textDim};
  }
  .${p}-iq-res-sla-legend-item{ display:inline-flex; align-items:center; gap:4px; }
  .${p}-iq-case-table-wrap{
    max-height:320px; overflow:auto; border:1px solid ${C.borderSoft}; border-radius:8px; background:${C.panel};
  }
  .${p}-iq-case-toolbar{
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    padding:8px 10px 6px; position:sticky; top:0; z-index:1; background:${C.panel};
    border-bottom:1px solid ${C.borderSoft};
  }
  .${p}-iq-case-table .${p}-th{
    position:sticky; top:0; z-index:1; background:${C.panel};
  }
  .${p}-iq-case-id{ font-size:9px; font-weight:700; color:#4f46e5; white-space:nowrap; }
  .${p}-iq-case-row--hot{ background:rgba(220,38,38,0.04); }
  .${p}-iq-case-chip{
    display:inline-flex; align-items:center; font-size:8px; font-weight:700;
    padding:2px 6px; border-radius:999px; white-space:nowrap;
  }
  .${p}-iq-case-chip--open{ color:#dc2626; background:rgba(220,38,38,0.12); border:1px solid rgba(220,38,38,0.28); }
  .${p}-iq-case-chip--progress{ color:#2563eb; background:rgba(37,99,235,0.12); border:1px solid rgba(37,99,235,0.28); }
  .${p}-iq-case-chip--resolved{ color:#059669; background:rgba(5,150,105,0.12); border:1px solid rgba(5,150,105,0.28); }
  .${p}-iq-case-chip--escalated{ color:#7c3aed; background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.28); }
  .${p}-iq-case-chip--sla-ok{ color:#059669; background:rgba(5,150,105,0.1); border:1px solid rgba(5,150,105,0.24); }
  .${p}-iq-case-chip--sla-risk{ color:#d97706; background:rgba(217,119,6,0.12); border:1px solid rgba(217,119,6,0.28); }
  .${p}-iq-case-chip--sla-breached{ color:#dc2626; background:rgba(220,38,38,0.12); border:1px solid rgba(220,38,38,0.3); }
  .${p}-iq-legend{
    display:flex; flex-wrap:wrap; align-items:center; gap:10px; font-size:9px; font-weight:600;
    color:${C.textDim}; flex-shrink:0;
  }
  .${p}-iq-legend-item{ display:inline-flex; align-items:center; gap:4px; white-space:nowrap; }
  .${p}-iq-legend-dot{ width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .${p}-iq-legend-line{
    width:14px; height:0; border-top:2px dashed #7c3aed; flex-shrink:0;
  }
  @media(max-width:900px){
    .${p}-iq-drivers{ grid-template-columns:1fr; }
    .${p}-iq-split{ grid-template-columns:1fr; }
    .${p}-iq-map-split{ grid-template-columns:1fr; }
    .${p}-iq-loss-grid{ grid-template-columns:1fr; }
    .${p}-iq-totals{ grid-template-columns:1fr; }
    .${p}-iq-res-kpis{ grid-template-columns:1fr; }
    .${p}-iq-res-split{ grid-template-columns:1fr; }
    .${p}-iq-loss-split{ grid-template-columns:1fr; }
    .${p}-iq-loss-pie-only .${p}-viz-driver-pie-ring{ max-width:148px; height:148px; }
    .${p}-iq-rating-split{ grid-template-columns:1fr; }
    .${p}-iq-rating-donut-ring{ max-width:140px; height:140px; }
  }
`;
}

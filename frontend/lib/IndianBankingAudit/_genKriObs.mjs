/** One-off generator for mock kriObservations — 12 weekly points per KRI, oldest → newest. */
const kris = [
  { kri_id: 'KRI-FC-001', amber: 100, red: 250, v0: 68, v11: 287 },
  { kri_id: 'KRI-CD-001', amber: 5, red: 25, v0: 2.2, v11: 28 },
  { kri_id: 'KRI-CO-001', amber: 500, red: 2000, v0: 410, v11: 520 },
  { kri_id: 'KRI-OP-001', amber: 0.05, red: 0.15, v0: 0.022, v11: 0.092 },
  { kri_id: 'KRI-TC-001', amber: 4, red: 6, v0: 2.4, v11: 3.2 },
  { kri_id: 'KRI-CR-001', amber: 50, red: 200, v0: 8, v11: 88 },
  { kri_id: 'KRI-TP-001', amber: 5, red: 15, v0: 0, v11: 3 },
  { kri_id: 'KRI-FR-001', amber: 10, red: 50, v0: 2, v11: 22 },
  { kri_id: 'KRI-MR-001', amber: 2, red: 5, v0: 0, v11: 2 },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function bandFor(k, v) {
  if (v >= k.red) return 'red';
  if (v >= k.amber) return 'amber';
  return 'green';
}

function reasonFor(k) {
  const m = {
    'KRI-FC-001': 'BPO queue backlog post-FIU FINnet uplift; L1 capacity below plan.',
    'KRI-CD-001': 'DSA channel KFS-after-acceptance cluster from LOS clock drift.',
    'KRI-OP-001': 'VEND-2024-00203 staffing gap; dual-key waiver not in MOM.',
    'KRI-CR-001': 'Bureau pull freshness degraded on fast-track sanctions.',
    'KRI-FR-001': 'NPCI feedback + mule typology rules pending FCC sign-off.',
  };
  return m[k.kri_id] || 'Threshold excursion on latest reading.';
}

const base = new Date('2026-02-13T23:59:59Z');
const out = [];

for (const k of kris) {
  const tag = k.kri_id.replace('KRI-', '').replace(/-/g, '-');
  for (let wi = 0; wi < 12; wi++) {
    const t = new Date(base);
    t.setUTCDate(t.getUTCDate() + wi * 7);
    const iso = t.toISOString().replace(/\.\d{3}Z/, 'Z');
    const progress = wi / 11;
    const raw = lerp(k.v0, k.v11, Math.pow(progress, 0.92));
    const v =
      k.kri_id === 'KRI-OP-001' || k.kri_id === 'KRI-CD-001' || k.kri_id === 'KRI-TC-001'
        ? Math.round(raw * 1000) / 1000
        : Math.round(raw);
    const b = bandFor(k, v);
    const short = k.kri_id.replace('KRI-', '');
    const obs = {
      observation_id: `KOBS-${short}-W${String(wi + 1).padStart(2, '0')}`,
      kri_id: k.kri_id,
      value: v,
      band: b,
      as_of_ts: iso,
    };
    if (wi === 11 && (b === 'red' || b === 'amber')) {
      obs.breach_reason = reasonFor(k);
    }
    out.push(obs);
  }
}

process.stdout.write(JSON.stringify(out, null, 2));

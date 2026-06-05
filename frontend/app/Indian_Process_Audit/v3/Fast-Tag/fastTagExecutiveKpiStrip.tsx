'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  PieChart,
  TrendingUp,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import {
  Scope3KpiStrip,
  type AutoKpiTone,
  type Scope3KpiItem,
} from '@/components/scope3emissions/scope3-kpi';
import type { ExecKpi, ExecKpiTone } from './fastTagExecutiveData';
import type { HobExecutiveKpi, HobKpiStatus } from './fastTagHobExecutive';
import type { CohKpiDrillId, HobKpiDrillId } from './fastTagExecutiveTypes';

const COLS = 'grid-cols-2 lg:grid-cols-4';

const HOB_ICONS: Record<string, LucideIcon> = {
  'toll-volume': IndianRupee,
  'new-customers': UserPlus,
  'activation-rate': TrendingUp,
  'retail-mix': PieChart,
};

const COH_ICONS: Record<string, LucideIcon> = {
  'Customer Experience Score': TrendingUp,
  'Customer Issues': AlertTriangle,
  'Avg Fix Time': Clock,
  'Zero-Issue Rate': CheckCircle2,
};

function hobStatusToTone(status: HobKpiStatus): AutoKpiTone {
  if (status === 'healthy') return 'emerald';
  if (status === 'warning') return 'amber';
  return 'rose';
}

function execToneToAuto(tone: ExecKpiTone): AutoKpiTone {
  if (tone === 'good') return 'emerald';
  if (tone === 'warn') return 'amber';
  if (tone === 'bad') return 'rose';
  return 'blue';
}

function parsePct(value: string): number | undefined {
  const m = value.match(/([\d.]+)\s*%/);
  return m ? Math.min(100, parseFloat(m[1])) : undefined;
}

function sparkToBarPct(spark: number[]): number {
  const last = spark[spark.length - 1] ?? 0;
  const max = Math.max(...spark, 1);
  return Math.round((last / max) * 100);
}

/** One short subtitle for the card; detail lives in the drill panel. */
function hobKpiSimpleSub(kpi: HobExecutiveKpi): string {
  switch (kpi.id) {
    case 'toll-volume':
      return `${kpi.trendPct >= 0 ? '+' : ''}${kpi.trendPct}% vs last month`;
    case 'new-customers': {
      const digital = kpi.breakdown?.find((b) => b.label === 'Digital')?.value;
      const branch = kpi.breakdown?.find((b) => b.label === 'Branch')?.value;
      if (digital && branch) return `${digital} digital · ${branch} branch`;
      return kpi.primarySub ?? 'Retail issuances';
    }
    case 'activation-rate':
      return kpi.primarySub ?? 'Retail go-live rate';
    case 'retail-mix':
      return kpi.primarySub ?? 'Issuance portfolio';
    default:
      return kpi.context;
  }
}

/** Maps HoB executive KPIs to Journey-matrix `Scope3KpiStrip` items. */
export function hobExecutiveKpisToScope3Items(
  kpis: HobExecutiveKpi[],
  onKpiClick: (kpiId: HobKpiDrillId) => void,
): Scope3KpiItem[] {
  return kpis.map((kpi) => {
    const barPct = parsePct(kpi.primaryValue) ?? sparkToBarPct(kpi.spark);
    return {
      label: kpi.title,
      value: kpi.primaryValue,
      sub: hobKpiSimpleSub(kpi),
      tone: hobStatusToTone(kpi.status),
      icon: HOB_ICONS[kpi.id] ?? IndianRupee,
      barPct,
      onClick: () => onKpiClick(kpi.id as HobKpiDrillId),
    };
  });
}

function cohKpiSimpleSub(k: ExecKpi): string | undefined {
  switch (k.label) {
    case 'Customer Experience Score':
      return k.badge;
    case 'Customer Issues':
      return `${k.trend.replace(/\s*·.*/, '')}`;
    case 'Avg Fix Time':
      return k.badge;
    case 'Zero-Issue Rate':
      return k.trend;
    default:
      return k.badge;
  }
}

/** Maps COH / legacy `ExecKpi` rows to Journey-matrix `Scope3KpiStrip` items. */
export function execKpisToScope3Items(kpis: ExecKpi[]): Scope3KpiItem[] {
  return kpis.map((k) => ({
    label: k.label,
    value: k.value,
    sub: cohKpiSimpleSub(k),
    tone: execToneToAuto(k.tone),
    icon: COH_ICONS[k.label] ?? AlertTriangle,
    barPct: parsePct(k.value) ?? sparkToBarPct(k.spark),
  }));
}

export function FastTagHoBKpiStrip({
  kpis,
  onKpiClick,
}: {
  kpis: HobExecutiveKpi[];
  onKpiClick: (kpiId: HobKpiDrillId) => void;
}) {
  const items = hobExecutiveKpisToScope3Items(kpis, onKpiClick);
  return <Scope3KpiStrip cols={COLS} items={items} />;
}

const COH_KPI_IDS: Record<string, CohKpiDrillId> = {
  'Customer Experience Score': 'experience-index',
  'Customer Issues': 'open-findings',
  'Avg Fix Time': 'resolution',
  'Zero-Issue Rate': 'clean-completion',
};

export function FastTagCohKpiStrip({
  kpis,
  onKpiClick,
}: {
  kpis: ExecKpi[];
  onKpiClick: (kpiId: CohKpiDrillId) => void;
}) {
  const items = execKpisToScope3Items(kpis).map((item, i) => {
    const id = COH_KPI_IDS[kpis[i]?.label ?? ''];
    return id ? { ...item, onClick: () => onKpiClick(id) } : item;
  });
  return <Scope3KpiStrip cols={COLS} items={items} />;
}

export function FastTagExecKpiStrip({ kpis }: { kpis: ExecKpi[] }) {
  const items = execKpisToScope3Items(kpis);
  return <Scope3KpiStrip cols={COLS} items={items} />;
}

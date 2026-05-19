import { bandFromScore } from '../../../../../theme';
import { COCKPIT } from '../../cockpitTokens';
import type { SupervisoryLensRow } from '../buildZone2PostureData';
import { formatSupervisoryLensLabel } from './formatSupervisoryLensLabel';

export type SupervisoryBarBand = 'green' | 'amber' | 'red' | 'gap';

export type SupervisoryBarPlotRow = {
  lensId: string;
  shortLabel: string;
  score: number | null;
  band: SupervisoryBarBand;
  barColor: string;
  scoreColor: string;
  hasGap: boolean;
  primaryPackId: string | null;
  packCount: number;
  tooltip: string;
};

const BAR_COLOR: Record<Exclude<SupervisoryBarBand, 'gap'>, string> = {
  green: COCKPIT.green.bar,
  amber: COCKPIT.amber.bar,
  red: COCKPIT.red.bar,
};

const SCORE_COLOR: Record<Exclude<SupervisoryBarBand, 'gap'>, string> = {
  green: COCKPIT.green.text,
  amber: COCKPIT.amber.text,
  red: COCKPIT.red.text,
};

function bandForRow(row: SupervisoryLensRow): SupervisoryBarBand {
  if (row.hasGap) return 'gap';
  const band = bandFromScore(row.lensARS, { green: 85, amber: 70 });
  if (band === 'green' || band === 'amber' || band === 'red') return band;
  return row.lensARS >= 70 ? 'amber' : 'red';
}

export function buildSupervisoryBarPlotModel(lenses: SupervisoryLensRow[]): SupervisoryBarPlotRow[] {
  return lenses.map((row) => {
    const shortLabel = formatSupervisoryLensLabel(row.label);
    const band = bandForRow(row);

    if (band === 'gap') {
      return {
        lensId: row.lensId,
        shortLabel,
        score: null,
        band,
        barColor: COCKPIT.red.bar,
        scoreColor: COCKPIT.red.text,
        hasGap: true,
        primaryPackId: row.primaryPackId,
        packCount: row.packCount,
        tooltip: `${shortLabel} — no evidence packs uploaded`,
      };
    }

    const packsNote =
      row.packCount === 1 ? '1 pack active' : `${row.packCount} packs active`;

    return {
      lensId: row.lensId,
      shortLabel,
      score: row.lensARS,
      band,
      barColor: BAR_COLOR[band],
      scoreColor: SCORE_COLOR[band],
      hasGap: false,
      primaryPackId: row.primaryPackId,
      packCount: row.packCount,
      tooltip: `${shortLabel} · ARS ${row.lensARS} · ${packsNote}`,
    };
  });
}

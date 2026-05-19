import { getPostureDataRefreshAt } from '../../../dataModel';
import { POSTURE_DATA_REFRESH_CADENCE_MINUTES } from './constants';

const IST = 'Asia/Kolkata';

export function formatPostureDataAsOfLine(asOf: Date = getPostureDataRefreshAt(POSTURE_DATA_REFRESH_CADENCE_MINUTES)): string {
  const date = asOf.toLocaleDateString('en-IN', { timeZone: IST, day: 'numeric', month: 'short', year: 'numeric' });
  const time = asOf.toLocaleTimeString('en-IN', { timeZone: IST, hour: '2-digit', minute: '2-digit', hour12: false });
  return `Data as of ${date}, ${time} IST`;
}

export function formatSignalsUpdatedLine(asOf: Date = getPostureDataRefreshAt(POSTURE_DATA_REFRESH_CADENCE_MINUTES)): string {
  const time = asOf.toLocaleTimeString('en-IN', { timeZone: IST, hour: '2-digit', minute: '2-digit', hour12: false });
  return `Signals updated: ${time} IST`;
}

/** Uses posture refresh anchor (stable SSR) instead of `Date.now()`. */
export function formatIssuesAsOfLine(
  asOf: Date = getPostureDataRefreshAt(POSTURE_DATA_REFRESH_CADENCE_MINUTES)
): string {
  const date = asOf.toLocaleDateString('en-IN', { timeZone: IST, day: 'numeric', month: 'short', year: 'numeric' });
  return `Issues as of: ${date}`;
}

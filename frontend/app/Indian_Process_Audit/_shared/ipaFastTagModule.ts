import type { IpaVersion } from '@/components/Indian_Process_Audit/ipa/ipaVersion';
import { hasModernIpaFeatures } from '@/components/Indian_Process_Audit/ipa/ipaVersion';
import * as fastTagV2 from '@/app/Indian_Process_Audit/v2/Fast-Tag';
import * as fastTagV3 from '@/app/Indian_Process_Audit/v3/Fast-Tag';

export type IpaFastTagModule = typeof fastTagV2;

/** Fast-Tag bundle for v2/v3 routes; `null` on v1. */
export function getIpaFastTagModule(version: IpaVersion): IpaFastTagModule | null {
  if (!hasModernIpaFeatures(version)) return null;
  return version === 'v3' ? fastTagV3 : fastTagV2;
}

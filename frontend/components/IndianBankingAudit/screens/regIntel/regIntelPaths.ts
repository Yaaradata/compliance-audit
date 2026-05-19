/**
 * ORI route helpers — prefer `useOriVersion()` from `@/components/IndianBankingAudit/ori/OriVersionProvider`
 * inside versioned app routes (`/IndianBankingAudit/v1`, `/IndianBankingAudit/v2`).
 */
import {
  buildOriRoutes,
  buildRegIntelRoutes,
  DEFAULT_ORI_VERSION,
  getOriBasePath,
  type OriRoutes,
  type OriVersion,
} from '../../ori/oriVersion';

export type { OriRoutes, OriVersion };

/** Default base path (v2). Use `buildOriRoutes(version)` when version is known. */
export const ORI_BASE_PATH = getOriBasePath(DEFAULT_ORI_VERSION);

const defaultRoutes = buildOriRoutes(DEFAULT_ORI_VERSION);

/** @deprecated Prefer `useOriVersion().routes` for version-aware navigation. */
export const ORI_ROUTES = defaultRoutes;

/** @deprecated Prefer `useOriVersion().routes.regulatoryIntelligence`. */
export const ORI_REG_INTEL_INBOX_HREF = defaultRoutes.regulatoryIntelligence;

/** @deprecated Prefer `useOriVersion().regIntelRoutes`. */
export const REG_INTEL_ROUTES = buildRegIntelRoutes(defaultRoutes);

export { buildOriRoutes, buildRegIntelRoutes, getOriBasePath };

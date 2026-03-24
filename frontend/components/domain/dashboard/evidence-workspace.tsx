"use client";

/**
 * Framework-agnostic evidence workspace: loads the correct implementation
 * (SWIFT CSCF or SOC 2) from the registry based on the cycle's schema_name.
 * All framework-specific UI lives under components/frameworks/<framework>/ so
 * adding SOC 2 does not require editing SWIFT code (avoids merge conflicts).
 */

import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { getEvidenceWorkspaceLoader } from "@/lib/frameworks/registry";
import type { EvidenceWorkspaceProps } from "@/lib/frameworks/types";
import { LoadingState } from "@/components/ui/loading-state";

export type { EvidenceWorkspaceProps };

export function EvidenceWorkspace(
  props: EvidenceWorkspaceProps & { schemaName?: string | null; cscfVersion?: string }
) {
  const { schemaName, cscfVersion, ...rest } = props;
  const workspaceProps = { ...rest, cscfVersion };
  const [Component, setComponent] = useState<ComponentType<EvidenceWorkspaceProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = getEvidenceWorkspaceLoader(schemaName);
    loader()
      .then((m) => {
        if (!cancelled) setComponent(() => m.default);
      })
      .catch(() => {
        if (!cancelled) setComponent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [schemaName]);

  if (Component == null) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-(--border) bg-(--surface)">
        <LoadingState message="Loading workspace…" />
      </div>
    );
  }

  return <Component {...workspaceProps} />;
}

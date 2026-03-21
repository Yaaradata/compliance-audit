"use client";

import type { ReactNode } from "react";
import {
  SwiftReviewSidebar,
  SwiftReviewTopbar,
  SwiftReviewControlHeader,
  SwiftReviewEvidenceColumn,
  SwiftReviewEvaluationColumn,
  type SwiftReviewSidebarItem,
  type SwiftReviewBadgeColor,
  type SwiftReviewEvalTab,
} from "./swift-review-template";

export type SwiftReviewTemplatePageProps = {
  className?: string;
  sidebar: {
    items: SwiftReviewSidebarItem[];
    activeId: string;
    onChange: (id: string) => void;
    logoLetter?: string;
    userLetter?: string;
  };
  breadcrumbs: string[];
  topbarTrailing?: ReactNode;
  control: {
    code: string;
    metaLine: string;
    title: string;
    submittedAt?: string;
    showAssignedBadge?: boolean;
    onBack?: () => void;
    backLabel?: string;
  };
  evidence: {
    title: string;
    headerBadge?: { text: string; color?: SwiftReviewBadgeColor };
    widthPercent?: number;
    children: ReactNode;
  };
  evaluation: {
    title: string;
    scoreStrip: { notMet: number; met: number; manual: number };
    showGapsBadge?: boolean;
    tabs: SwiftReviewEvalTab[];
    activeTabId: string;
    onTabChange: (id: string) => void;
    children: ReactNode;
  };
};

/**
 * Full-height shell: navy sidebar + topbar + control header + two scrollable columns.
 * Feed all strings and bodies from your route/API — this file has no domain copy.
 */
export function SwiftReviewTemplatePage({
  className,
  sidebar,
  breadcrumbs,
  topbarTrailing,
  control,
  evidence,
  evaluation,
}: SwiftReviewTemplatePageProps) {
  return (
    <div
      className={`swift-review-tpl ${className ?? ""}`.trim()}
      style={{ display: "flex", height: "100vh", maxHeight: "100dvh", overflow: "hidden" }}
    >
      <SwiftReviewSidebar {...sidebar} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <SwiftReviewTopbar breadcrumbs={breadcrumbs} trailing={topbarTrailing} />
        <SwiftReviewControlHeader {...control} />
        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          <SwiftReviewEvidenceColumn
            title={evidence.title}
            headerBadge={evidence.headerBadge}
            widthPercent={evidence.widthPercent}
          >
            {evidence.children}
          </SwiftReviewEvidenceColumn>
          <SwiftReviewEvaluationColumn
            title={evaluation.title}
            scoreStrip={evaluation.scoreStrip}
            showGapsBadge={evaluation.showGapsBadge}
            tabs={evaluation.tabs}
            activeTabId={evaluation.activeTabId}
            onTabChange={evaluation.onTabChange}
          >
            {evaluation.children}
          </SwiftReviewEvaluationColumn>
        </div>
      </div>
    </div>
  );
}

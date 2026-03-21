"use client";

/**
 * Visual preview for the Swift review template (design system + layout).
 * Replace props with API/state from your review flow — nothing here is required at runtime.
 */
import { useMemo, useState } from "react";
import {
  SwiftReviewTemplatePage,
  SwiftReviewComparisonField,
  SwiftReviewFindingCard,
  SwiftReviewNotesEmpty,
  SwiftReviewManualEmpty,
  SwiftReviewIcons,
  type SwiftReviewEvalTab,
  type SwiftReviewFindingStatus,
} from "@/components/review/swift-review-template";

type SampleFinding = { id: string; title: string; detail?: string; status: SwiftReviewFindingStatus };

/** Supply from API in production */
function useSampleFindings(): { notMet: SampleFinding[]; met: SampleFinding[] } {
  return useMemo(
    () => ({
      notMet: [
        {
          id: "1",
          status: "not_met",
          title: "Stateful firewall devices shown at every ingress/egress point of the secure zone",
          detail:
            "While a brick wall icon is shown at an ingress point, it is not explicitly labeled as a stateful firewall, and firewalls are not depicted at all ingress/egress points.",
        },
        {
          id: "2",
          status: "not_met",
          title:
            "All SWIFT systems visible inside zone: messaging interface, communication interface, GUI, SwiftNet Link, HSM (including Luna SA7), connectors, jump server",
          detail:
            "Several SWIFT components are visible; explicit mention of 'Luna SA7' is absent, and connectors are generic.",
        },
      ],
      met: [
        { id: "m1", status: "met", title: "Secure zone boundary is clearly delineated on the diagram" },
        { id: "m2", status: "met", title: "Network architecture diagram is dated within the last 12 months" },
      ],
    }),
    []
  );
}

export default function SwiftReviewTemplateDemoPage() {
  const [nav, setNav] = useState("shield");
  const [tab, setTab] = useState("not_met");
  const [note, setNote] = useState("");
  const { notMet, met } = useSampleFindings();

  const tabs: SwiftReviewEvalTab[] = useMemo(
    () => [
      { id: "not_met", label: "Not met", count: notMet.length, icon: "✕", tone: "red" },
      { id: "met", label: "Met", count: met.length, icon: "✓", tone: "green" },
      { id: "manual", label: "Manually met", count: 0, icon: "○", tone: "amber" },
      { id: "notes", label: "Notes", count: null, icon: null, tone: "blue" },
    ],
    [notMet.length, met.length]
  );

  const evalBody =
    tab === "notes" ? (
      <SwiftReviewNotesEmpty message="No reviewer notes yet. Wire this to your notes API." />
    ) : tab === "manual" ? (
      <SwiftReviewManualEmpty title="No manually met findings recorded." />
    ) : tab === "met" ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {met.map((f, i) => (
          <SwiftReviewFindingCard key={f.id} index={i} title={f.title} detail={f.detail} status="met" />
        ))}
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {notMet.map((f, i) => (
          <SwiftReviewFindingCard
            key={f.id}
            index={i}
            title={f.title}
            detail={f.detail}
            status="not_met"
            onAddComment={() => {}}
          />
        ))}
      </div>
    );

  return (
    <div className="fixed inset-0 z-200">
      <SwiftReviewTemplatePage
        sidebar={{
          items: [
            { id: "search", icon: "search" },
            { id: "grid", icon: "grid" },
            { id: "shield", icon: "shield" },
            { id: "list", icon: "list" },
            { id: "file", icon: "file" },
          ],
          activeId: nav,
          onChange: setNav,
        }}
        breadcrumbs={["CYC-2026-853C2E — test (2026)", "A1 · Full Local SWIFT Infrastructure", "Cycle", "Review Queue"]}
        topbarTrailing={
          <>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                padding: 6,
              }}
            >
              <SwiftReviewIcons.Bell width={18} height={18} />
            </button>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                padding: 6,
              }}
            >
              <SwiftReviewIcons.Moon width={16} height={16} />
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              <SwiftReviewIcons.Eye width={15} height={15} />
              Internal Reviewer (L1)
            </span>
            {(["Switch cycle", "Log out"] as const).map((t) => (
              <button
                key={t}
                type="button"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "5px 13px",
                  background: t === "Log out" ? "var(--red-lt)" : "var(--surface-2)",
                  color: t === "Log out" ? "var(--red)" : "var(--text-secondary)",
                  border: `1.5px solid ${t === "Log out" ? "var(--red-mid)" : "var(--border)"}`,
                  borderRadius: 7,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </>
        }
        control={{
          code: "A1",
          metaLine: "L1 — Completeness",
          title: "L1 — Completeness",
          submittedAt: "Submitted · Mar 21, 2026, 10:58 AM",
          showAssignedBadge: true,
          onBack: () => history.back(),
          backLabel: "Back to Review Queue",
        }}
        evidence={{
          title: "Evidence",
          headerBadge: { text: "A1 — Network Architecture", color: "blue" },
          children: (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="fade-up" style={{ animationDelay: ".05s" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 7,
                  }}
                >
                  Diagram version / date (must be within last 12 months)
                  <span style={{ color: "var(--red)", marginLeft: 2 }}>*</span>
                </label>
                <div
                  style={{
                    padding: "10px 14px",
                    background: "var(--surface-2)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 9,
                    fontSize: 13,
                    fontFamily: "var(--mono)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  2026-03-21
                </div>
              </div>
              <div className="fade-up" style={{ animationDelay: ".1s" }}>
                <SwiftReviewComparisonField
                  question="Is there any direct internet path from any system inside the secure zone?"
                  required
                  humanVal="No"
                  awsVal="No"
                  showAwsFromBadge
                  helperText="Submitted evidence and the AWS snapshot are shown together. If they differ, a comparison section appears below."
                />
              </div>
              <div className="fade-up" style={{ animationDelay: ".15s" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 7,
                  }}
                >
                  If YES — provide business / technical justification and compensating controls
                </label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    border: "1.5px solid var(--border)",
                    borderRadius: 9,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontFamily: "var(--font)",
                    color: "var(--text-primary)",
                    background: "var(--surface)",
                    lineHeight: 1.6,
                    transition: "border-color .15s, box-shadow .15s",
                  }}
                />
              </div>
            </div>
          ),
        }}
        evaluation={{
          title: "AI evaluation results",
          scoreStrip: { notMet: notMet.length, met: met.length, manual: 0 },
          showGapsBadge: true,
          tabs,
          activeTabId: tab,
          onTabChange: setTab,
          children: evalBody,
        }}
      />
    </div>
  );
}

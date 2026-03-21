"use client";

/**
 * Swift review UI shell — design tokens + layout from the product template.
 * All copy, counts, and body content are passed via props (no domain data here).
 */
import { useState, type CSSProperties, type ReactNode } from "react";
import "./swift-review-template.css";

const px = (n: number) => `${n}px`;

const row = (extra: CSSProperties = {}): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  ...extra,
});

const sz = (n: number): CSSProperties => ({ width: n, height: n });

/* ── icons ─────────────────────────────────────────────────────────── */
const Ico = {
  X: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevL: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevR: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Bell: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Moon: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  AWS: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.072.056.144.056.208 0 .088-.056.176-.176.264l-.584.392c-.08.056-.16.08-.232.08-.088 0-.176-.04-.264-.12a2.731 2.731 0 0 1-.312-.408 6.673 6.673 0 0 1-.272-.512c-.688.808-1.544 1.216-2.56 1.216-.728 0-1.312-.208-1.744-.624-.432-.416-.648-.976-.648-1.68 0-.744.264-1.352.8-1.808.536-.456 1.248-.688 2.152-.688.296 0 .6.024.92.064.32.04.648.104.992.176v-.632c0-.656-.136-1.12-.408-1.392-.28-.28-.752-.416-1.424-.416-.304 0-.616.04-.944.112a7.028 7.028 0 0 0-.944.288 2.468 2.468 0 0 1-.304.112.52.52 0 0 1-.136.024c-.12 0-.176-.088-.176-.272V5.8c0-.144.016-.248.064-.312.048-.064.136-.128.264-.192.304-.16.672-.288 1.096-.4A5.38 5.38 0 0 1 4.2 4.72c.952 0 1.648.216 2.096.648.44.432.664 1.096.664 1.984v2.68l-.2.004zm-3.536 1.32c.288 0 .584-.056.896-.168.312-.112.592-.312.832-.592.144-.168.248-.352.296-.568.056-.216.08-.472.08-.776V9.6a7.354 7.354 0 0 0-.8-.128 6.495 6.495 0 0 0-.784-.048c-.56 0-.968.112-1.248.336-.28.224-.416.544-.416.96 0 .392.096.688.296.888.2.2.488.296.848.296zm6.76.88c-.16 0-.264-.024-.336-.08-.072-.048-.136-.16-.192-.312L7.624 5.736c-.056-.16-.08-.264-.08-.32 0-.128.064-.2.192-.2h.784c.168 0 .28.024.344.08.072.048.128.16.184.312l1.504 5.928 1.4-5.928c.048-.16.104-.264.176-.312a.59.59 0 0 1 .352-.08h.64c.168 0 .28.024.352.08.072.048.136.16.176.312l1.416 6L16.6 5.608c.056-.16.12-.264.184-.312.072-.048.184-.08.344-.08h.744c.128 0 .2.064.2.2 0 .04-.008.08-.016.128a1.136 1.136 0 0 1-.064.2l-1.88 6.108c-.056.16-.12.264-.192.312-.072.056-.184.08-.336.08h-.688c-.168 0-.28-.024-.352-.08-.072-.056-.136-.16-.176-.32L12.992 6.2l-1.384 5.616c-.04.16-.104.264-.176.32-.072.056-.192.08-.352.08h-.688zm10.024.248c-.416 0-.832-.048-1.232-.152a3.54 3.54 0 0 1-.92-.352c-.128-.072-.216-.152-.248-.224a.56.56 0 0 1-.048-.224v-.456c0-.184.064-.272.2-.272.048 0 .096.008.144.024.048.016.12.048.2.08.272.12.568.216.88.28.32.064.632.096.952.096.504 0 .896-.088 1.168-.264a.867.867 0 0 0 .408-.752.784.784 0 0 0-.216-.56c-.144-.152-.424-.288-.824-.416l-1.184-.368c-.592-.184-1.032-.464-1.312-.832a1.947 1.947 0 0 1-.416-1.232c0-.36.072-.672.224-.944.152-.272.36-.512.616-.704.256-.2.552-.344.888-.448.336-.104.688-.152 1.056-.152.184 0 .376.008.56.04.192.024.368.064.536.104.16.048.312.096.456.152.144.056.256.112.336.168.112.072.192.144.24.224.048.072.072.168.072.288v.424c0 .184-.064.28-.192.28a.876.876 0 0 1-.32-.104 3.853 3.853 0 0 0-1.616-.336c-.456 0-.816.072-1.064.224-.248.152-.376.384-.376.704 0 .216.08.4.232.552.152.152.456.304.896.44l1.16.368c.584.184 1.008.44 1.272.776.264.336.392.72.392 1.152 0 .368-.072.704-.216.992-.144.288-.344.536-.608.736-.264.208-.576.36-.944.464-.384.112-.8.168-1.248.168z" />
    </svg>
  ),
  Plus: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Shield: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Grid: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  File: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  List: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Note: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Info: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Eye: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

const SIDEBAR_ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  search: Ico.Search,
  grid: Ico.Grid,
  shield: Ico.Shield,
  list: Ico.List,
  file: Ico.File,
};

export type SwiftReviewBadgeColor = "blue" | "red" | "green" | "amber" | "purple" | "navy";

const BADGE_MAP: Record<
  SwiftReviewBadgeColor,
  { bg: string; text: string; border: string }
> = {
  blue: { bg: "var(--blue-lt)", text: "var(--blue)", border: "var(--blue-mid)" },
  red: { bg: "var(--red-lt)", text: "var(--red)", border: "var(--red-mid)" },
  green: { bg: "var(--green-lt)", text: "var(--green)", border: "var(--green-mid)" },
  amber: { bg: "var(--amber-lt)", text: "var(--amber)", border: "var(--amber-mid)" },
  purple: { bg: "var(--purple-lt)", text: "var(--purple)", border: "#c4b5fd" },
  navy: { bg: "var(--navy)", text: "#fff", border: "transparent" },
};

export function SwiftReviewBadge({
  children,
  color = "blue",
  dot = false,
}: {
  children: ReactNode;
  color?: SwiftReviewBadgeColor;
  dot?: boolean;
}) {
  const c = BADGE_MAP[color] ?? BADGE_MAP.blue;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".05em",
        padding: "3px 9px",
        borderRadius: 99,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: "var(--mono)",
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: c.text,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

export type SwiftReviewSidebarItem = { id: string; icon: keyof typeof SIDEBAR_ICON_MAP };

export function SwiftReviewSidebar({
  items,
  activeId,
  onChange,
  logoLetter = "S",
  userLetter = "L",
}: {
  items: SwiftReviewSidebarItem[];
  activeId: string;
  onChange: (id: string) => void;
  logoLetter?: string;
  userLetter?: string;
}) {
  return (
    <aside
      style={{
        width: 56,
        flexShrink: 0,
        background: "var(--navy)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 12,
        gap: 4,
      }}
    >
      <div
        style={{
          ...sz(36),
          borderRadius: 10,
          background: "var(--blue)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--mono)",
          fontWeight: 800,
          fontSize: 15,
          marginBottom: 16,
        }}
      >
        {logoLetter}
      </div>
      {items.map(({ id, icon }) => {
        const I = SIDEBAR_ICON_MAP[icon];
        return (
          <button
            key={id}
            type="button"
            title={id}
            onClick={() => onChange(id)}
            style={{
              ...sz(40),
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              background: activeId === id ? "rgba(255,255,255,.14)" : "transparent",
              color: activeId === id ? "#fff" : "rgba(255,255,255,.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s",
            }}
          >
            {I ? <I width={18} height={18} /> : null}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div
        style={{
          ...sz(34),
          borderRadius: "50%",
          background: "var(--blue)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        {userLetter}
      </div>
    </aside>
  );
}

export function SwiftReviewTopbar({
  breadcrumbs,
  trailing,
}: {
  breadcrumbs: string[];
  trailing?: ReactNode;
}) {
  const last = breadcrumbs.length - 1;
  return (
    <header
      style={{
        height: 50,
        flexShrink: 0,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        ...row({ padding: "0 20px", gap: 8 }),
      }}
    >
      {breadcrumbs.map((c, i) => (
        <span key={`${i}-${c}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <Ico.ChevR width={12} height={12} style={{ color: "var(--text-muted)" }} />}
          <span
            style={{
              fontSize: 12,
              fontWeight: i === 0 ? 700 : i === last ? 600 : 400,
              color: i === last ? "var(--blue)" : i === 0 ? "var(--text-primary)" : "var(--text-secondary)",
              fontFamily: i === 0 ? "var(--mono)" : "var(--font)",
              whiteSpace: "nowrap",
            }}
          >
            {c}
          </span>
        </span>
      ))}
      <div style={{ flex: 1 }} />
      {trailing}
    </header>
  );
}

export function SwiftReviewControlHeader({
  code,
  metaLine,
  title,
  submittedAt,
  showAssignedBadge,
  onBack,
  backLabel,
}: {
  code: string;
  metaLine: string;
  title: string;
  submittedAt?: string;
  showAssignedBadge?: boolean;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 20px",
        ...row({ gap: 16, flexWrap: "wrap", rowGap: 10 }),
        flexShrink: 0,
      }}
    >
      <div
        style={{
          ...sz(48),
          borderRadius: 12,
          border: "2px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--mono)",
          fontWeight: 800,
          fontSize: 16,
          color: "var(--text-primary)",
          flexShrink: 0,
        }}
      >
        {code}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={row({ gap: 10 })}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              fontFamily: "var(--mono)",
              letterSpacing: ".05em",
            }}
          >
            {metaLine}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
          {showAssignedBadge ? (
            <SwiftReviewBadge color="amber" dot>
              Assigned
            </SwiftReviewBadge>
          ) : null}
        </div>
        {submittedAt ? (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{submittedAt}</span>
        ) : null}
      </div>
      <div style={{ flex: 1 }} />
      {onBack && backLabel ? (
        <button
          type="button"
          onClick={onBack}
          style={{
            ...row({ gap: 8 }),
            fontSize: 13,
            fontWeight: 700,
            padding: "9px 18px",
            background: "var(--navy)",
            color: "#fff",
            border: "none",
            borderRadius: 9,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "opacity .15s",
          }}
        >
          <Ico.ChevL width={15} height={15} />
          {backLabel}
        </button>
      ) : null}
    </div>
  );
}

export function SwiftReviewComparisonField({
  question,
  required,
  humanVal,
  awsVal,
  helperText,
  showAwsFromBadge,
}: {
  question: string;
  required?: boolean;
  humanVal: string;
  awsVal: string;
  helperText: string;
  showAwsFromBadge?: boolean;
}) {
  const match = humanVal.trim().toLowerCase() === awsVal.trim().toLowerCase();
  return (
    <div
      style={{
        border: "1.5px solid var(--border)",
        borderRadius: px(12),
        overflow: "hidden",
        background: "var(--surface-2)",
      }}
    >
      <div
        style={{
          ...row({ gap: 10, justifyContent: "space-between" }),
          padding: "12px 16px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
          {question} {required ? <span style={{ color: "var(--red)" }}>*</span> : null}
        </span>
        {showAwsFromBadge ? (
          <span
            style={{
              ...row({ gap: 5 }),
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".06em",
              padding: "3px 9px",
              borderRadius: 99,
              background: "var(--amber-lt)",
              color: "var(--amber)",
              border: "1px solid var(--amber-mid)",
              fontFamily: "var(--mono)",
            }}
          >
            <Ico.AWS width={12} height={12} />
            AI FROM AWS
          </span>
        ) : null}
      </div>
      <div style={{ padding: "10px 14px" }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>{helperText}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          {(
            [
              { label: "SUBMITTED (HUMAN)", val: humanVal, color: "var(--text-secondary)" },
              { label: "AI (AWS) SNAPSHOT", val: awsVal, color: "var(--blue)" },
            ] as const
          ).map(({ label, val, color }) => (
            <div
              key={label}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: 9,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "7px 12px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  color: "var(--text-muted)",
                  fontFamily: "var(--mono)",
                }}
              >
                {label}
              </div>
              <div style={{ padding: "12px 14px", fontSize: 15, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
        {!match ? (
          <div
            style={{
              ...row({ gap: 9, justifyContent: "center" }),
              padding: "10px 16px",
              borderRadius: 9,
              background: "var(--red-lt)",
              border: "1px solid var(--red-mid)",
            }}
          >
            <span
              style={{
                ...sz(20),
                borderRadius: "50%",
                background: "var(--red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ico.X width={11} height={11} style={{ color: "#fff" }} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>
              Mismatch detected between submitted and AI snapshot.
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SwiftReviewEvidenceColumn({
  title,
  headerBadge,
  children,
  widthPercent = 44,
}: {
  title: string;
  headerBadge?: { text: string; color?: SwiftReviewBadgeColor };
  children: ReactNode;
  widthPercent?: number;
}) {
  return (
    <div
      style={{
        flex: `0 0 ${widthPercent}%`,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          ...row({ justifyContent: "space-between" }),
          flexShrink: 0,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{title}</h2>
        {headerBadge ? (
          <SwiftReviewBadge color={headerBadge.color ?? "blue"}>{headerBadge.text}</SwiftReviewBadge>
        ) : null}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>{children}</div>
    </div>
  );
}

export type SwiftReviewFindingStatus = "not_met" | "met" | "manual";

export function SwiftReviewFindingCard({
  title,
  detail,
  index,
  status,
  onAddComment,
}: {
  title: string;
  detail?: string | null;
  index: number;
  status: SwiftReviewFindingStatus;
  /** If omitted, comment UI is read-only / hidden */
  onAddComment?: (text: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!comment.trim() || !onAddComment) return;
    onAddComment(comment.trim());
    setSaved(true);
    setShowInput(false);
  };

  const isGreen = status === "met";
  const isAmber = status === "manual";

  return (
    <div
      className="fade-up"
      style={{
        animationDelay: `${index * 0.06}s`,
        border: `1.5px solid ${isGreen ? "var(--green-mid)" : isAmber ? "var(--amber-mid)" : "var(--red-mid)"}`,
        borderRadius: px(12),
        overflow: "hidden",
        background: "var(--surface)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div
        style={{
          height: 3,
          background: isGreen ? "var(--green)" : isAmber ? "var(--amber)" : "var(--red)",
        }}
      />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ ...row({ gap: 10, alignItems: "flex-start" }), marginBottom: detail ? 10 : 0 }}>
          <div
            style={{
              ...sz(22),
              borderRadius: "50%",
              flexShrink: 0,
              marginTop: 1,
              background: isGreen ? "var(--green)" : isAmber ? "var(--amber)" : "var(--red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isGreen ? (
              <Ico.Check width={12} height={12} style={{ color: "#fff" }} />
            ) : (
              <Ico.X width={11} height={11} style={{ color: "#fff" }} />
            )}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.55, flex: 1, margin: 0 }}>
            {title}
          </p>
        </div>
        {detail ? (
          <div
            style={{
              marginLeft: 32,
              padding: "10px 13px",
              background: isGreen ? "var(--green-lt)" : isAmber ? "var(--amber-lt)" : "var(--red-lt)",
              borderRadius: px(8),
              fontSize: 12,
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              marginBottom: 10,
            }}
          >
            {detail}
          </div>
        ) : null}
        {onAddComment ? (
          <div style={{ marginLeft: 32 }}>
            {saved && (
              <div
                className="pop-in"
                style={{
                  ...row({ gap: 6 }),
                  fontSize: 12,
                  color: "var(--green)",
                  background: "var(--green-lt)",
                  border: "1px solid var(--green-mid)",
                  borderRadius: 7,
                  padding: "6px 10px",
                  marginBottom: 8,
                }}
              >
                <Ico.Check width={12} height={12} />
                Comment saved: &quot;{comment}&quot;
              </div>
            )}
            {showInput ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <textarea
                  autoFocus
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your reviewer comment…"
                  style={{
                    width: "100%",
                    resize: "none",
                    border: "1.5px solid var(--blue)",
                    borderRadius: 7,
                    padding: "8px 10px",
                    fontSize: 12,
                    fontFamily: "var(--font)",
                    color: "var(--text-primary)",
                    background: "var(--surface)",
                    boxShadow: "0 0 0 3px rgba(21,84,240,.1)",
                    outline: "none",
                    lineHeight: 1.5,
                    transition: "border-color .15s",
                  }}
                />
                <div style={{ ...row({ gap: 7, justifyContent: "flex-end" }) }}>
                  <button
                    type="button"
                    onClick={() => setShowInput(false)}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "5px 11px",
                      background: "var(--surface-2)",
                      color: "var(--text-secondary)",
                      border: "1.5px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 13px",
                      background: "var(--blue)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Save Comment
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowInput(true)}
                style={{
                  ...row({ gap: 5 }),
                  fontSize: 11,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--blue)",
                  padding: 0,
                }}
              >
                <Ico.Plus width={12} height={12} />
                {saved ? "Edit comment" : "Add comment"}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type SwiftReviewEvalTab = {
  id: string;
  label: string;
  count: number | null;
  icon: string | null;
  tone: "red" | "green" | "amber" | "blue";
};

const TAB_TONE: Record<
  SwiftReviewEvalTab["tone"],
  { border: string; bg: string; fg: string }
> = {
  red: { border: "var(--red-mid)", bg: "var(--red-lt)", fg: "var(--red)" },
  green: { border: "var(--green-mid)", bg: "var(--green-lt)", fg: "var(--green)" },
  amber: { border: "var(--amber-mid)", bg: "var(--amber-lt)", fg: "var(--amber)" },
  blue: { border: "var(--blue-mid)", bg: "var(--blue-lt)", fg: "var(--blue)" },
};

export function SwiftReviewEvaluationColumn({
  title,
  scoreStrip,
  showGapsBadge,
  tabs,
  activeTabId,
  onTabChange,
  children,
}: {
  title: string;
  scoreStrip: { notMet: number; met: number; manual: number };
  showGapsBadge?: boolean;
  tabs: SwiftReviewEvalTab[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <div
        style={{
          padding: "14px 20px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>{title}</h2>
        <div
          style={{
            ...row({ gap: 10 }),
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 16px",
            marginBottom: 14,
          }}
        >
          {(
            [
              { label: "Not met", val: scoreStrip.notMet, color: "var(--red)", bg: "var(--red-lt)" },
              { label: "Met", val: scoreStrip.met, color: "var(--green)", bg: "var(--green-lt)" },
              { label: "Manual", val: scoreStrip.manual, color: "var(--amber)", bg: "var(--amber-lt)" },
            ] as const
          ).map(({ label, val, color, bg }) => (
            <div key={label} style={row({ gap: 8 })}>
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 99,
                  background: bg,
                  fontSize: 13,
                  fontWeight: 800,
                  color,
                  fontFamily: "var(--mono)",
                }}
              >
                {val}
              </div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
              <span style={{ color: "var(--border-2)", fontSize: 16, marginLeft: 4 }}>·</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          {showGapsBadge ? (
            <SwiftReviewBadge color="amber" dot>
              Gaps identified
            </SwiftReviewBadge>
          ) : null}
        </div>
        <div style={row({ gap: 4 })}>
          {tabs.map((t) => {
            const tone = TAB_TONE[t.tone];
            const active = activeTabId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                style={{
                  ...row({ gap: 6 }),
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "7px 14px",
                  border: "1.5px solid",
                  borderColor: active ? tone.border : "transparent",
                  borderRadius: 8,
                  background: active ? tone.bg : "transparent",
                  color: active ? tone.fg : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all .15s",
                  fontFamily: "var(--mono)",
                }}
              >
                {t.icon ? <span>{t.icon}</span> : null}
                {t.label}
                {t.count !== null ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: active ? "rgba(0,0,0,.08)" : "var(--border)",
                      color: "inherit",
                    }}
                  >
                    {t.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>{children}</div>
    </div>
  );
}

export function SwiftReviewNotesEmpty({ message }: { message: string }) {
  return (
    <div
      style={{
        ...row({ gap: 10, alignItems: "flex-start" }),
        padding: 16,
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        fontSize: 13,
        color: "var(--text-secondary)",
        lineHeight: 1.65,
      }}
    >
      <Ico.Note width={16} height={16} style={{ flexShrink: 0, marginTop: 2, color: "var(--blue)" }} />
      {message}
    </div>
  );
}

export function SwiftReviewManualEmpty({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: 12,
      }}
    >
      <div
        style={{
          ...sz(48),
          borderRadius: "50%",
          background: "var(--amber-lt)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ico.Check width={22} height={22} style={{ color: "var(--amber)" }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>{title}</p>
    </div>
  );
}

/** Optional block exports for embedding real evidence (still props-only). */
export { Ico as SwiftReviewIcons };

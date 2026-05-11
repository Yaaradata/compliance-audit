import { useState } from "react";
import type { AuditedUser, Violation } from "../types";
import { severityClass } from "../utils/chips";

type ViolationRow = Violation & { user: string; userId?: string; role?: string };

export function RisksViolationsDashboard({ auditedUsers }: { auditedUsers: AuditedUser[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const allViolations: ViolationRow[] = auditedUsers.flatMap((u) =>
    u.violations.map((v) => ({ ...v, user: u.name, userId: u.id, role: u.role })),
  );
  const byType = (type: string) => allViolations.filter((v) => v.type === type);
  const orphan = byType("Orphan Account");
  const dormant = auditedUsers.filter((u) => u.violations.some((v) => v.type === "Dormant"));
  const sod = byType("SoD");
  const mfa = byType("MFA");
  const lp = byType("Least Privilege");
  const prov = byType("Provisioning");

  const tabs = [
    { id: "all", label: "All Violations", count: allViolations.length },
    { id: "sod", label: "SoD", count: sod.length },
    { id: "mfa", label: "MFA", count: mfa.length },
    { id: "dormant", label: "Dormant", count: dormant.length },
    { id: "orphan", label: "Orphan", count: orphan.length },
    { id: "lp", label: "Least Privilege", count: lp.length },
    { id: "prov", label: "Provisioning", count: prov.length },
  ];

  const displayViolations: ViolationRow[] =
    activeTab === "all"
      ? allViolations
      : activeTab === "sod"
        ? sod
        : activeTab === "mfa"
          ? mfa
          : activeTab === "dormant"
            ? dormant.flatMap((u) =>
                u.violations
                  .filter((v) => v.type === "Dormant")
                  .map((v) => ({ ...v, user: u.name, role: u.role })),
              )
            : activeTab === "orphan"
              ? orphan
              : activeTab === "lp"
                ? lp
                : activeTab === "prov"
                  ? prov
                  : [];

  const critViol = allViolations.filter((v) => v.severity === "Critical").length;
  const highViol = allViolations.filter((v) => v.severity === "High").length;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">Risk & Violations Dashboard</div>
        <div className="page-sub">
          {allViolations.length} total violations · {critViol} Critical · {highViol} High
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card critical">
          <div className="stat-label">SoD Violations</div>
          <div className="stat-value">{sod.length}</div>
          <div className="stat-sub">Separation of duty breach</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-label">MFA Gaps</div>
          <div className="stat-value">{mfa.length}</div>
          <div className="stat-sub">Missing MFA enforcement</div>
        </div>
        <div className="stat-card high">
          <div className="stat-label">Dormant Accounts</div>
          <div className="stat-value">{dormant.length}</div>
          <div className="stat-sub">Inactive beyond threshold</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-label">Orphan Accounts</div>
          <div className="stat-value">{orphan.length}</div>
          <div className="stat-sub">Terminated users, live access</div>
        </div>
        <div className="stat-card high">
          <div className="stat-label">Least Privilege</div>
          <div className="stat-value">{lp.length}</div>
          <div className="stat-sub">Over-provisioned access</div>
        </div>
        <div className="stat-card high">
          <div className="stat-label">Prov. Issues</div>
          <div className="stat-value">{prov.length}</div>
          <div className="stat-sub">Unapproved provisioning</div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}{" "}
            {t.count > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 9 }}>({t.count})</span>}
          </button>
        ))}
      </div>

      <div className="viol-list">
        {displayViolations.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
            No violations in this category
          </div>
        )}
        {displayViolations.map((v, i) => (
          <div key={i} className={`viol-card ${severityClass(v.severity)}`}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <div className={`viol-badge ${severityClass(v.severity)}`}>{v.type}</div>
                <span className={`badge-pill badge-${severityClass(v.severity)}`}>{v.severity}</span>
              </div>
              <div className="viol-desc">{v.desc}</div>
              <div className="viol-user">
                User: {v.user} · Role: {v.role}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                {v.severity === "Critical" ? "🔴 IMMEDIATE" : v.severity === "High" ? "🟠 48H ACTION" : "🟡 REVIEW"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

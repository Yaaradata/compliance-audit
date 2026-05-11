import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CornerDownRight,
  KeyRound,
  Scale,
  ShieldAlert,
  SlidersHorizontal,
  UserX,
} from "lucide-react";
import type { AuditMetadata, AuditedUser } from "../types";
import { formatDateUtc, formatIsoUtcReadable } from "../utils/formatAuditDates";
import { badgeFor, severityClass } from "../utils/chips";

const statIconProps = { size: 22, strokeWidth: 1.65, className: "stat-card__glyph" } as const;

export function Dashboard({
  auditedUsers,
  metadata,
  onNavigate,
}: {
  auditedUsers: AuditedUser[];
  metadata: AuditMetadata;
  onNavigate: (id: string) => void;
}) {
  const criticalCount = auditedUsers.filter((u) => u.severity === "Critical").length;
  const highCount = auditedUsers.filter((u) => u.severity === "High").length;
  const orphanCount = auditedUsers.filter((u) => u.violations.some((v) => v.type === "Orphan Account")).length;
  const dormantCount = auditedUsers.filter((u) => u.violations.some((v) => v.type === "Dormant")).length;
  const mfaGaps = auditedUsers.filter((u) => u.violations.some((v) => v.type === "MFA")).length;
  const sodCount = auditedUsers.filter((u) => u.violations.some((v) => v.type === "SoD")).length;
  const lpCount = auditedUsers.filter((u) => u.violations.some((v) => v.type === "Least Privilege")).length;
  const cleanCount = auditedUsers.filter((u) => u.severity === "Clean").length;

  const roleCounts: Record<string, number> = {};
  auditedUsers.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });

  const recentViolations = auditedUsers
    .flatMap((u) => u.violations.map((v) => ({ ...v, user: u.name })))
    .filter((v) => v.severity === "Critical" || v.severity === "High")
    .slice(0, 8);

  const envLine = [metadata?.environment, metadata?.accountAlias, metadata?.region].filter(Boolean).join(" · ");
  const auditWhen = metadata?.generatedAt
    ? formatIsoUtcReadable(metadata.generatedAt)
    : formatDateUtc(new Date());

  return (
    <div className="page page--audit-dashboard">
      <div className="page-header">
        <div className="page-heading">Access Management Audit — Overview</div>
        <div className="page-sub">
          {envLine || "AWS"} · {auditedUsers.length} IAM users · {metadata?.auditName || "Audit"} · Generated: {auditWhen}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card critical">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <ShieldAlert {...statIconProps} />
          </span>
          <div className="stat-label">Critical Risks</div>
          <div className="stat-value">{criticalCount}</div>
          <div className="stat-sub">Require immediate action</div>
        </div>
        <div className="stat-card high">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <AlertTriangle {...statIconProps} />
          </span>
          <div className="stat-label">High Risks</div>
          <div className="stat-value">{highCount}</div>
          <div className="stat-sub">Escalate within 48h</div>
        </div>
        <div className="stat-card medium">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <KeyRound {...statIconProps} />
          </span>
          <div className="stat-label">MFA Gaps</div>
          <div className="stat-value">{mfaGaps}</div>
          <div className="stat-sub">Missing multi-factor auth</div>
        </div>
        <div className="stat-card medium">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <Clock {...statIconProps} />
          </span>
          <div className="stat-label">Dormant Accounts</div>
          <div className="stat-value">{dormantCount}</div>
          <div className="stat-sub">Inactive past threshold</div>
        </div>
        <div className="stat-card critical">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <UserX {...statIconProps} />
          </span>
          <div className="stat-label">Orphan Accounts</div>
          <div className="stat-value">{orphanCount}</div>
          <div className="stat-sub">Terminated, access live</div>
        </div>
        <div className="stat-card high">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <Scale {...statIconProps} />
          </span>
          <div className="stat-label">SoD Violations</div>
          <div className="stat-value">{sodCount}</div>
          <div className="stat-sub">Separation of duty breach</div>
        </div>
        <div className="stat-card medium">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <SlidersHorizontal {...statIconProps} />
          </span>
          <div className="stat-label">Least Privilege</div>
          <div className="stat-value">{lpCount}</div>
          <div className="stat-sub">Over-provisioned users</div>
        </div>
        <div className="stat-card clean">
          <span className="stat-icon stat-icon--svg" aria-hidden>
            <CheckCircle2 {...statIconProps} />
          </span>
          <div className="stat-label">Clean Users</div>
          <div className="stat-value">{cleanCount}</div>
          <div className="stat-sub">No violations detected</div>
        </div>
      </div>

      <div className="two-col">
        <div className="section">
          <div className="section-header">
            <span className="section-title">Role Distribution</span>
          </div>
          <div className="section-body">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div className="chart-bar-row" key={role}>
                <div className="chart-bar-label chart-bar-label--full-role" title={role}>
                  {role}
                </div>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${(count / auditedUsers.length) * 100}%`,
                      background: "var(--accent2)",
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <span className="section-title">Critical & High Violations</span>
          </div>
          <div className="section-body" style={{ maxHeight: 280, overflowY: "auto" }}>
            <div className="viol-list">
              {recentViolations.map((v, i) => (
                <div key={i} className={`viol-card ${severityClass(v.severity)}`}>
                  <div>
                    <div className={`viol-badge ${severityClass(v.severity)}`}>
                      {v.type} · {v.severity}
                    </div>
                    <div className="viol-desc">{v.desc}</div>
                    <div className="viol-user viol-user--row">
                      <CornerDownRight size={14} strokeWidth={2} className="viol-user__mark" aria-hidden />
                      <span>{v.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-title">Audit Control Summary</span>
        </div>
        <div className="section-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit Control</th>
                <th>Total Users Checked</th>
                <th>Violations</th>
                <th>Risk Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Privileged Access Review",
                  total: auditedUsers.filter((u) => u.isPrivileged).length,
                  viol: auditedUsers.filter((u) => u.isPrivileged && u.severity !== "Clean").length,
                  risk: "Critical",
                },
                { name: "Least Privilege Principle", total: auditedUsers.length, viol: lpCount, risk: "High" },
                { name: "Dormant Account Analysis", total: auditedUsers.length, viol: dormantCount, risk: "High" },
                { name: "Separation of Duties (SoD)", total: auditedUsers.length, viol: sodCount, risk: "High" },
                { name: "MFA Enforcement", total: auditedUsers.length, viol: mfaGaps, risk: "Critical" },
                {
                  name: "Access Provisioning",
                  total: auditedUsers.length,
                  viol: auditedUsers.filter((u) => u.violations.some((v) => v.type === "Provisioning")).length,
                  risk: "High",
                },
                { name: "Orphan Accounts", total: auditedUsers.length, viol: orphanCount, risk: "Critical" },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.name}</td>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{row.total}</td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontWeight: 700,
                        color: row.viol > 0 ? "var(--critical)" : "var(--clean)",
                      }}
                    >
                      {row.viol}
                    </span>
                  </td>
                  <td>{badgeFor(row.risk)}</td>
                  <td>
                    <button type="button" className="filter-btn filter-btn--audit-action" onClick={() => onNavigate("risks")}>
                      <span>View</span>
                      <ArrowRight size={14} strokeWidth={2} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

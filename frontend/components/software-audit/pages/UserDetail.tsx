import type { AuditedUser, AuditMetadata } from "../types";
import { ROLE_DEFINITIONS } from "../constants/roleDefinitions";
import { accessChip, badgeFor, boolChip, initials, severityClass } from "../utils/chips";

export function UserDetail({
  user,
  metadata,
  onBack,
}: {
  user: AuditedUser | null;
  metadata: AuditMetadata;
  onBack: () => void;
}) {
  if (!user) return null;
  const roleDef = ROLE_DEFINITIONS.find((r) => r.role === user.role);
  const a = metadata?.assumptions;

  return (
    <div className="page">
      <button type="button" className="back-btn" onClick={onBack}>
        ← Back to Users
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, borderRadius: 12 }}>
          {initials(user.name)}
        </div>
        <div>
          <div className="page-heading">{user.name}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <span className="chip chip-info">{user.role}</span>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>{user.dept}</span>
            {badgeFor(user.severity)}
          </div>
          {user.source?.userName && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              IAM: {user.source.userName}
            </div>
          )}
        </div>
      </div>

      <div className="detail-grid" style={{ marginBottom: 20 }}>
        <div className="detail-card">
          <div className="detail-label">Provision Date</div>
          <div className="detail-value">{user.provisionDate}</div>
        </div>
        <div className="detail-card">
          <div className="detail-label">Last Login</div>
          <div
            className="detail-value"
            style={{ color: user.lastLogin > 60 ? "var(--critical)" : "var(--text)" }}
          >
            {user.lastLogin} days ago
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-label">HR Status</div>
          <div
            className="detail-value"
            style={{ color: user.hrStatus === "Terminated" ? "var(--critical)" : "var(--clean)" }}
          >
            {user.hrStatus}
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-label">Access Approved</div>
          <div className="detail-value">{user.accessApproved ? "✓ Approved" : "⚠ Not Approved"}</div>
        </div>
      </div>

      <div className="two-col">
        <div className="section">
          <div className="section-header">
            <span className="section-title">Permissions</span>
          </div>
          <div className="section-body">
            {[
              { label: "Repo Access", val: accessChip(user.repoAccess), expected: accessChip(roleDef?.repoAccess) },
              { label: "PR Approval", val: boolChip(user.prApproval), expected: boolChip(!!roleDef?.prApproval) },
              { label: "Infra Access", val: accessChip(user.infraAccess), expected: accessChip(roleDef?.infraAccess) },
              {
                label: "Production Access",
                val: boolChip(user.prodAccess, "Yes ⚠", "No"),
                expected: boolChip(!!roleDef?.prodAccess, "Yes ⚠", "No"),
              },
              {
                label: "DB Access",
                val: boolChip(user.dbAccess, "Yes ⚠", "No"),
                expected: boolChip(!!roleDef?.dbAccess, "Yes ⚠", "No"),
              },
              {
                label: "MFA Enabled",
                val: user.mfa ? (
                  <span className="chip chip-yes">✓ Enabled</span>
                ) : (
                  <span className="chip chip-flag">✗ Disabled</span>
                ),
                expected: roleDef?.mfaRequired ? (
                  <span className="chip chip-flag">Required</span>
                ) : (
                  <span className="chip chip-no">Optional</span>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="perm-row">
                <span className="perm-label">{item.label}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {item.val}
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>/ expected: {item.expected}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section" style={{ marginBottom: 16 }}>
            <div className="section-header">
              <span className="section-title">Violations ({user.violations.length})</span>
            </div>
            <div className="section-body">
              {user.violations.length === 0 ? (
                <div style={{ color: "var(--clean)", fontSize: 13 }}>✓ No violations detected</div>
              ) : (
                <div className="viol-list">
                  {user.violations.map((v, i) => (
                    <div key={i} className={`viol-card ${severityClass(v.severity)}`}>
                      <div>
                        <div className={`viol-badge ${severityClass(v.severity)}`}>
                          {v.type} · {v.severity}
                        </div>
                        <div className="viol-desc">{v.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="section-title">Data Sources</span>
            </div>
            <div className="section-body">
              {[
                { label: "Identity", val: a?.identitySource || "AWS IAM", icon: "🔐" },
                { label: "Code Access", val: a?.codeAccess || "GitHub", icon: "💻" },
                { label: "HR Record", val: a?.hrDataSource || "HRMS", icon: "🏢" },
                { label: "Login Logs", val: a?.logSource || "CloudTrail", icon: "📋" },
                { label: "MFA Status", val: a?.mfaProvider || "IAM / IdP", icon: "📱" },
              ].map((s, i) => (
                <div key={i} className="perm-row">
                  <span className="perm-label">
                    {s.icon} {s.label}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent2)" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

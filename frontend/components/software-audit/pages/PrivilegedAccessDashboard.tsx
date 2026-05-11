import type { AuditedUser } from "../types";
import { badgeFor, boolChip, initials, severityClass } from "../utils/chips";

export function PrivilegedAccessDashboard({
  auditedUsers,
  onSelectUser,
}: {
  auditedUsers: AuditedUser[];
  onSelectUser: (u: AuditedUser) => void;
}) {
  const privileged = auditedUsers.filter((u) => u.isPrivileged);
  const orphans = auditedUsers.filter((u) => u.violations.some((v) => v.type === "Orphan Account"));
  const dormPriv = privileged.filter((u) => u.violations.some((v) => v.type === "Dormant"));
  const noMfaPriv = privileged.filter((u) => !u.mfa);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">Privileged Access Dashboard</div>
        <div className="page-sub">Admins · Prod access · Infra Full · DB access</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card critical">
          <span className="stat-icon">👑</span>
          <div className="stat-label">Privileged Users</div>
          <div className="stat-value">{privileged.length}</div>
          <div className="stat-sub">of {auditedUsers.length} total</div>
        </div>
        <div className="stat-card critical">
          <span className="stat-icon">👻</span>
          <div className="stat-label">Orphan Accounts</div>
          <div className="stat-value">{orphans.length}</div>
          <div className="stat-sub">Terminated HR — active access</div>
        </div>
        <div className="stat-card high">
          <span className="stat-icon">💤</span>
          <div className="stat-label">Dormant Privileged</div>
          <div className="stat-value">{dormPriv.length}</div>
          <div className="stat-sub">&gt;30 days inactive</div>
        </div>
        <div className="stat-card critical">
          <span className="stat-icon">🔓</span>
          <div className="stat-label">No MFA (Privileged)</div>
          <div className="stat-value">{noMfaPriv.length}</div>
          <div className="stat-sub">Critical policy violation</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-title">Privileged User Register</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Privilege Reason</th>
                <th>HR Status</th>
                <th>MFA</th>
                <th>Last Login</th>
                <th>Approved</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {privileged.map((u) => {
                const reasons = [];
                if (u.role === "Admin") reasons.push("Admin Role");
                if (u.prodAccess) reasons.push("Prod Access");
                if (u.dbAccess) reasons.push("DB Access");
                if (u.infraAccess === "Full") reasons.push("Full Infra");
                return (
                  <tr
                    key={u.id}
                    className={`clickable row-${severityClass(u.severity)}`}
                    onClick={() => onSelectUser(u)}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div className="avatar">{initials(u.name)}</div>
                        {u.name}
                      </div>
                    </td>
                    <td>
                      <span className="chip chip-info">{u.role}</span>
                    </td>
                    <td>
                      {reasons.map((r, i) => (
                        <span
                          key={i}
                          className="tag"
                          style={{ background: "rgba(240,165,0,0.1)", color: "var(--accent)" }}
                        >
                          {r}
                        </span>
                      ))}
                    </td>
                    <td>
                      {u.hrStatus === "Terminated" ? (
                        <span className="chip chip-flag">⚠ Terminated</span>
                      ) : (
                        <span className="chip chip-yes">Active</span>
                      )}
                    </td>
                    <td>
                      {u.mfa ? (
                        <span className="chip chip-yes">✓ On</span>
                      ) : (
                        <span className="chip chip-flag">✗ Off</span>
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 12,
                        color: u.lastLogin > 30 ? "var(--critical)" : "var(--muted)",
                      }}
                    >
                      {u.lastLogin}d ago
                    </td>
                    <td>{boolChip(u.accessApproved, "Approved", "⚠ Unapproved")}</td>
                    <td>{badgeFor(u.severity)}</td>
                    <td>
                      <button type="button" className="filter-btn">
                        Detail →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {orphans.length > 0 && (
        <div className="section">
          <div className="section-header">
            <span className="section-title" style={{ color: "var(--critical)" }}>
              ⚠ Orphan Accounts — IMMEDIATE ACTION
            </span>
          </div>
          <div className="section-body">
            <div className="viol-list">
              {orphans.map((u) => (
                <div key={u.id} className="viol-card critical">
                  <div>
                    <div className="viol-badge critical">Orphan Account · Critical</div>
                    <div className="viol-desc">
                      <strong>{u.name}</strong> — {u.role} · HR Status:{" "}
                      <strong style={{ color: "var(--critical)" }}>{u.hrStatus}</strong>
                    </div>
                    <div className="viol-user">
                      Still has: Repo {u.repoAccess} · Infra {u.infraAccess} · Prod: {u.prodAccess ? "Yes" : "No"} · DB:{" "}
                      {u.dbAccess ? "Yes" : "No"}
                    </div>
                    <div className="viol-user">
                      Provisioned: {u.provisionDate} · Last login: {u.lastLogin} days ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

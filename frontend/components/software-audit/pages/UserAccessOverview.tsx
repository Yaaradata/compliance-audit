import { useMemo, useState } from "react";
import type { AuditedUser } from "../types";
import { ROLE_ORDER } from "../constants/roleDefinitions";
import { ROLE_VISUALS, type RoleVisualKey } from "../constants/roleVisuals";
import { GroupSummaryBar } from "../components/GroupSummaryBar";
import { accessChip, badgeFor, boolChip, initials, severityClass } from "../utils/chips";

export function UserAccessOverview({
  auditedUsers,
  onSelectUser,
}: {
  auditedUsers: AuditedUser[];
  onSelectUser: (u: AuditedUser) => void;
}) {
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("All");
  const [expanded, setExpanded] = useState<Record<RoleVisualKey, boolean>>(() =>
    Object.fromEntries(ROLE_ORDER.map((r) => [r, true])) as Record<RoleVisualKey, boolean>,
  );

  const roleGroups = useMemo(
    () =>
      ROLE_ORDER.map((role) => ({
        role,
        ...ROLE_VISUALS[role],
        count: auditedUsers.filter((u) => u.role === role).length,
      })),
    [auditedUsers],
  );

  const sevs = ["All", "Critical", "High", "Medium", "Clean"];

  function toggleGroup(role: RoleVisualKey) {
    setExpanded((prev) => ({ ...prev, [role]: !prev[role] }));
  }

  function getUsersForGroup(role: RoleVisualKey) {
    return auditedUsers.filter((u) => {
      const matchRole = u.role === role;
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.dept.toLowerCase().includes(search.toLowerCase());
      const matchSev = sevFilter === "All" || u.severity === sevFilter;
      return matchRole && matchSearch && matchSev;
    });
  }

  const totalShown = roleGroups.reduce((acc, g) => acc + getUsersForGroup(g.role).length, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">User Access Overview</div>
        <div className="page-sub">
          {auditedUsers.length} users · {roleGroups.filter((g) => g.count > 0).length} role groups · Click any row for full detail
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {roleGroups.map((g) => {
          const group = auditedUsers.filter((u) => u.role === g.role);
          const issues = group.filter((u) => u.severity !== "Clean").length;
          return (
            <div
              key={g.role}
              className="stat-card"
              style={{ cursor: "pointer", borderTop: `2px solid ${g.color}` }}
              onClick={() => {
                setExpanded((prev) => ({ ...prev, [g.role]: true }));
                setSevFilter("All");
                setSearch("");
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{g.icon}</div>
              <div className="stat-label" style={{ fontSize: 9 }}>
                {g.role.replace(" Engineer", "").replace("External", "Ext.")}
              </div>
              <div className="stat-value" style={{ fontSize: 26, color: g.color }}>
                {g.count}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, marginTop: 4 }}>
                {issues > 0 ? (
                  <span style={{ color: "var(--critical)" }}>
                    ⚠ {issues} issue{issues > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span style={{ color: "var(--clean)" }}>✓ clean</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="search-bar"
          placeholder="Search name or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sevs.map((s) => (
            <button
              type="button"
              key={s}
              className={`filter-btn ${sevFilter === s ? "active" : ""}`}
              onClick={() => setSevFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>
          {totalShown} / {auditedUsers.length} users
        </span>
      </div>

      {roleGroups.map((cfg) => {
        const groupUsers = getUsersForGroup(cfg.role);
        const allGroup = auditedUsers.filter((u) => u.role === cfg.role);
        const isOpen = expanded[cfg.role];
        if (cfg.count === 0) return null;

        return (
          <div key={cfg.role} className="section" style={{ marginBottom: 16 }}>
            <div
              className="section-header"
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => toggleGroup(cfg.role)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <span style={{ fontSize: 18, color: cfg.color }}>{cfg.icon}</span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: cfg.color,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    {cfg.role}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {allGroup.length} user{allGroup.length !== 1 ? "s" : ""}
                    {groupUsers.length !== allGroup.length ? ` · ${groupUsers.length} shown` : ""}
                  </div>
                </div>
                <div style={{ flex: 1, marginLeft: 8 }}>
                  <GroupSummaryBar auditedUsers={auditedUsers} role={cfg.role} />
                </div>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--muted)", marginLeft: 12 }}>
                {isOpen ? "▲" : "▼"}
              </span>
            </div>

            {isOpen && (
              <div style={{ overflowX: "auto" }}>
                {groupUsers.length === 0 ? (
                  <div
                    style={{
                      padding: "16px 20px",
                      color: "var(--muted)",
                      fontSize: 13,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    No users match current filters in this group.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Dept</th>
                        <th>Repo</th>
                        <th>PR Approval</th>
                        <th>Infra</th>
                        <th>Prod</th>
                        <th>DB</th>
                        <th>MFA</th>
                        <th>HR Status</th>
                        <th>Last Login</th>
                        <th>Approved</th>
                        <th>Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupUsers.map((u, idx) => (
                        <tr
                          key={u.id}
                          className={`clickable row-${severityClass(u.severity)}`}
                          onClick={() => onSelectUser(u)}
                        >
                          <td style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", width: 32 }}>
                            {String(idx + 1).padStart(2, "0")}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <div className="avatar" style={{ background: `${cfg.color}22`, color: cfg.color }}>
                                {initials(u.name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
                                {u.violations.length > 0 && (
                                  <div style={{ fontSize: 10, color: "var(--critical)", fontFamily: "var(--mono)" }}>
                                    ⚠ {u.violations.length} violation{u.violations.length > 1 ? "s" : ""}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ color: "var(--muted)", fontSize: 12 }}>{u.dept}</td>
                          <td>{accessChip(u.repoAccess)}</td>
                          <td>{boolChip(u.prApproval)}</td>
                          <td>{accessChip(u.infraAccess)}</td>
                          <td>
                            {u.prodAccess ? (
                              <span className="chip chip-flag">⚠ Yes</span>
                            ) : (
                              <span className="chip chip-no">— No</span>
                            )}
                          </td>
                          <td>
                            {u.dbAccess ? (
                              <span className="chip chip-warn">⚠ Yes</span>
                            ) : (
                              <span className="chip chip-no">— No</span>
                            )}
                          </td>
                          <td>
                            {u.mfa ? (
                              <span className="chip chip-yes">✓ On</span>
                            ) : (
                              <span className="chip chip-flag">✗ Off</span>
                            )}
                          </td>
                          <td>
                            {u.hrStatus === "Terminated" ? (
                              <span className="chip chip-flag">⚠ Term.</span>
                            ) : (
                              <span className="chip chip-yes">Active</span>
                            )}
                          </td>
                          <td
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: 12,
                              color:
                                u.lastLogin > 60 ? "var(--critical)" : u.lastLogin > 30 ? "var(--high)" : "var(--muted)",
                            }}
                          >
                            {u.lastLogin}d ago
                          </td>
                          <td>
                            {u.accessApproved ? (
                              <span className="chip chip-yes">✓</span>
                            ) : (
                              <span className="chip chip-flag">✗ No</span>
                            )}
                          </td>
                          <td>{badgeFor(u.severity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

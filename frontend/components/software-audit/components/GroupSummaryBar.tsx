import type { AuditedUser } from "../types";
import { ROLE_VISUALS, type RoleVisualKey } from "../constants/roleVisuals";

export function GroupSummaryBar({ auditedUsers, role }: { auditedUsers: AuditedUser[]; role: RoleVisualKey }) {
  const group = auditedUsers.filter((u) => u.role === role);
  const cfg = ROLE_VISUALS[role];
  if (group.length === 0) return null;

  const critCount = group.filter((u) => u.severity === "Critical").length;
  const highCount = group.filter((u) => u.severity === "High").length;
  const cleanCount = group.filter((u) => u.severity === "Clean").length;
  const mfaOff = group.filter((u) => !u.mfa).length;
  const pct = group.length ? Math.round((cleanCount / group.length) * 100) : 0;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {critCount > 0 && <span className="badge-pill badge-critical">{critCount} Critical</span>}
        {highCount > 0 && <span className="badge-pill badge-high">{highCount} High</span>}
        {cleanCount > 0 && <span className="badge-pill badge-clean">{cleanCount} Clean</span>}
      </div>
      {mfaOff > 0 && (
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--critical)" }}>⚠ {mfaOff} no MFA</span>
      )}
      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden", minWidth: 80 }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: cfg?.color,
            borderRadius: 2,
            transition: "width 0.6s",
          }}
        />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{pct}% clean</span>
    </div>
  );
}

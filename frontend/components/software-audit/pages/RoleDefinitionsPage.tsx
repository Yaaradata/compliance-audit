import type { AuditMetadata } from "../types";
import { ROLE_DEFINITIONS } from "../constants/roleDefinitions";
import { accessChip, boolChip, badgeFor } from "../utils/chips";

export function RoleDefinitionsPage({ metadata }: { metadata: AuditMetadata }) {
  const a = metadata?.assumptions;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">Role Definitions & Policy</div>
        <div className="page-sub">Expected access by role — baseline for audit comparisons</div>
      </div>
      <div className="section">
        <div className="section-header">
          <span className="section-title">Access Policy Matrix</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Repo Access</th>
                <th>PR Approval</th>
                <th>Infra Access</th>
                <th>Prod Access</th>
                <th>DB Access</th>
                <th>MFA Required</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_DEFINITIONS.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span className="chip chip-info">{r.role}</span>
                  </td>
                  <td>{accessChip(r.repoAccess)}</td>
                  <td>{boolChip(r.prApproval)}</td>
                  <td>{accessChip(r.infraAccess)}</td>
                  <td>{boolChip(r.prodAccess, "Yes ⚠", "No")}</td>
                  <td>{boolChip(r.dbAccess, "Yes ⚠", "No")}</td>
                  <td>
                    {r.mfaRequired ? (
                      <span className="chip chip-flag">Required</span>
                    ) : (
                      <span className="chip chip-no">Optional</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="two-col">
        <div className="section">
          <div className="section-header">
            <span className="section-title">SoD Rules</span>
          </div>
          <div className="section-body">
            {[
              { combo: "Developer + Prod Deploy", risk: "Critical" },
              { combo: "Initiator + Approver (same person)", risk: "Critical" },
              { combo: "Infra + Security Override", risk: "High" },
              { combo: "Infra Engineer + Repo Write", risk: "High" },
              { combo: "Junior Engineer + Prod Access", risk: "High" },
            ].map((rule, i) => (
              <div key={i} className="perm-row">
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)" }}>✗ {rule.combo}</span>
                {badgeFor(rule.risk)}
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <span className="section-title">Dormancy Thresholds</span>
          </div>
          <div className="section-body">
            <div className="perm-row">
              <span className="perm-label">Privileged Users</span>
              <span className="chip chip-flag">30 days</span>
            </div>
            <div className="perm-row">
              <span className="perm-label">Standard Users</span>
              <span className="chip chip-warn">60 days</span>
            </div>
            <div className="perm-row">
              <span className="perm-label">External / Vendor</span>
              <span className="chip chip-warn">30 days</span>
            </div>
            <div className="perm-row">
              <span className="perm-label">Access revocation (termination)</span>
              <span className="chip chip-flag">&lt; 24 hours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-title">Data Source Mapping</span>
        </div>
        <div className="section-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data Domain</th>
                <th>Source System</th>
                <th>Data Points</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  domain: "Identity",
                  source: a?.identitySource || "AWS IAM / IdP",
                  data: "User identity, groups, attached policies, MFA devices",
                },
                {
                  domain: "Code Access",
                  source: a?.codeAccess || "GitHub / GitLab",
                  data: "Org teams, repo permission, PR approval rights",
                },
                {
                  domain: "HR Records",
                  source: a?.hrDataSource || "HRMS",
                  data: "HRStatus tags, termination context",
                },
                {
                  domain: "Access Logs",
                  source: a?.logSource || "CloudTrail",
                  data: "Console login recency (lastLoginDaysAgo)",
                },
                {
                  domain: "MFA Status",
                  source: a?.mfaProvider || "AWS IAM MFA",
                  data: "MFADevices array vs policy requirement",
                },
                {
                  domain: "Approvals",
                  source: "ITSM / ServiceNow",
                  data: "accessApproved flag in audit export",
                },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "var(--accent2)", fontFamily: "var(--mono)", fontSize: 12 }}>
                    {row.domain}
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{row.source}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{row.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

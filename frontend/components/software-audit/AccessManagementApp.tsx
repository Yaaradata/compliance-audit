"use client";

import { useState } from "react";
import type { AuditedUser } from "./types";
import { useAwsAuditDataset } from "./hooks/useAwsAuditDataset";
import { formatDateUtc } from "./utils/formatAuditDates";
import { Dashboard } from "./pages/Dashboard";
import { PrivilegedAccessDashboard } from "./pages/PrivilegedAccessDashboard";
import { RoleDefinitionsPage } from "./pages/RoleDefinitionsPage";
import { RisksViolationsDashboard } from "./pages/RisksViolationsDashboard";
import { UserAccessOverview } from "./pages/UserAccessOverview";
import { UserDetail } from "./pages/UserDetail";
import "./styles/accessAudit.css";

export default function AccessManagementApp() {
  const { auditedUsers, metadata } = useAwsAuditDataset();
  type ScreenId = "dashboard" | "users" | "privileged" | "risks" | "roles" | "userDetail";

  const [screen, setScreen] = useState<ScreenId>("dashboard");
  const [selectedUser, setSelectedUser] = useState<AuditedUser | null>(null);

  const criticalCount = auditedUsers.filter((u) => u.severity === "Critical").length;
  const totalUsers = auditedUsers.length;

  const nav = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "users", icon: "⊞", label: "User Access" },
    { id: "privileged", icon: "◉", label: "Privileged Access" },
    { id: "risks", icon: "⚠", label: "Risks & Violations" },
    { id: "roles", icon: "⊟", label: "Role Definitions" },
  ];

  const titles: Record<ScreenId, string> = {
    dashboard: "AUDIT OVERVIEW",
    users: "USER ACCESS",
    privileged: "PRIVILEGED ACCESS",
    risks: "RISKS & VIOLATIONS",
    roles: "ROLE DEFINITIONS",
    userDetail: "USER DETAIL",
  };

  function handleSelectUser(u: AuditedUser) {
    setSelectedUser(u);
    setScreen("userDetail");
  }

  return (
    <div className="access-audit-app">
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-tag">// AUDIT SYS</div>
            <div className="logo-name">Access & Identity Governance</div>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section">Navigation</div>
            {nav.map((n) => (
              <button
                type="button"
                key={n.id}
                className={`nav-item ${screen === n.id || (screen === "userDetail" && n.id === "users") ? "active" : ""}`}
                onClick={() => {
                  setScreen(n.id as ScreenId);
                  setSelectedUser(null);
                }}
              >
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div style={{ marginBottom: 4 }}>
              {metadata?.environment || "AWS"} · {totalUsers} USERS
            </div>
            <div style={{ color: "var(--critical)" }}>⚠ {criticalCount} CRITICAL</div>
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <span className="topbar-title">{titles[screen] || "AUDIT"}</span>
            <div className="topbar-right">
              <span className="badge-pill badge-critical">{criticalCount} CRITICAL</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                {formatDateUtc(new Date())}
              </span>
            </div>
          </div>

          {screen === "dashboard" && (
            <Dashboard auditedUsers={auditedUsers} metadata={metadata} onNavigate={(id) => setScreen(id as ScreenId)} />
          )}
          {screen === "users" && <UserAccessOverview auditedUsers={auditedUsers} onSelectUser={handleSelectUser} />}
          {screen === "privileged" && (
            <PrivilegedAccessDashboard auditedUsers={auditedUsers} onSelectUser={handleSelectUser} />
          )}
          {screen === "risks" && <RisksViolationsDashboard auditedUsers={auditedUsers} />}
          {screen === "roles" && <RoleDefinitionsPage metadata={metadata} />}
          {screen === "userDetail" && (
            <UserDetail user={selectedUser} metadata={metadata} onBack={() => setScreen("users")} />
          )}
        </div>
      </div>
    </div>
  );
}

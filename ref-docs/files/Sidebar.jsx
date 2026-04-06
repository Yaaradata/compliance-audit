// components/layout/Sidebar.jsx
// ─────────────────────────────────────────────────────────
//  Left navigation sidebar — same for ALL roles.
//  Receives: user (object), activeNav (string), onNavChange (fn)
// ─────────────────────────────────────────────────────────

const CSS = `
.sidebar {
  width: 58px;
  background: var(--sb);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0 20px;
  gap: 3px;
  flex-shrink: 0;
  z-index: 10;
}
.sb-logo {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 14px;
  margin-bottom: 18px; letter-spacing: -0.5px; flex-shrink: 0;
}
.sb-nav-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #3D4F6E; cursor: pointer;
  font-size: 15px; transition: all 0.15s; flex-shrink: 0;
}
.sb-nav-icon:hover { background: #141D2E; color: #8B9CC4; }
.sb-nav-icon.active { background: #1A1F35; color: #818CF8; }
.sb-sep {
  width: 22px; height: 1px;
  background: #141D2E; margin: 8px 0; flex-shrink: 0;
}
.sb-footer {
  margin-top: auto;
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
}
.sb-user-dot {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 11px; cursor: pointer;
}
.sb-notif-wrap { position: relative; }
.sb-notif-pip {
  position: absolute; top: 6px; right: 6px;
  width: 6px; height: 6px;
  background: #EF4444; border-radius: 50%;
  border: 1.5px solid var(--sb);
}
`;

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard", key: "dashboard" },
  { icon: "📋", label: "My Tasks",  key: "tasks"     },
  { icon: "📁", label: "Evidence",  key: "evidence"  },
  { icon: "📊", label: "Reports",   key: "reports"   },
  { icon: "🏛",  label: "Cycles",   key: "cycles"    },
];

export default function Sidebar({ user, activeNav = "dashboard", onNavChange }) {
  return (
    <>
      <style>{CSS}</style>
      <aside className="sidebar">
        <div className="sb-logo">S</div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`sb-nav-icon ${activeNav === item.key ? "active" : ""}`}
            title={item.label}
            onClick={() => onNavChange?.(item.key)}
          >
            {item.icon}
          </div>
        ))}

        <div className="sb-sep" />
        <div className="sb-nav-icon" title="Settings">⚙️</div>

        <div className="sb-footer">
          <div className="sb-notif-wrap sb-nav-icon" title="Notifications">
            🔔
            <div className="sb-notif-pip" />
          </div>
          <div className="sb-user-dot" title={user?.name}>
            {user?.initials}
          </div>
        </div>
      </aside>
    </>
  );
}

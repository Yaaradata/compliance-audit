// components/layout/Topbar.jsx
// ─────────────────────────────────────────────────────────
//  Top navigation bar — same for ALL roles.
//  Receives: user (object), pageTitle (string)
// ─────────────────────────────────────────────────────────

const CSS = `
.topbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  height: 52px; padding: 0 24px;
  display: flex; align-items: center;
  justify-content: space-between;
  flex-shrink: 0; gap: 12px;
}
.tb-left { display: flex; align-items: center; gap: 6px; min-width: 0; }
.tb-title { font-size: 14px; font-weight: 800; color: var(--text); white-space: nowrap; }
.tb-sep   { font-size: 12px; color: var(--hint); }
.tb-crumb { font-size: 12px; color: var(--hint); white-space: nowrap; }

.tb-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.tb-btn {
  height: 30px; padding: 0 12px;
  border-radius: var(--rs);
  border: 1px solid var(--border2);
  background: var(--surface);
  display: flex; align-items: center; gap: 5px;
  cursor: pointer; font-size: 11px; font-weight: 600;
  color: var(--sub); font-family: var(--font);
  transition: all 0.15s; white-space: nowrap;
}
.tb-btn:hover { background: var(--surface2); color: var(--text); }
.tb-btn.primary {
  background: var(--accent); color: #fff; border-color: var(--accent);
}
.tb-btn.primary:hover { background: #4338CA; }

.tb-divider { width: 1px; height: 18px; background: var(--border2); flex-shrink: 0; }

.tb-notif {
  width: 30px; height: 30px; border-radius: var(--rs);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 13px; position: relative; color: var(--sub);
}
.tb-notif-pip {
  position: absolute; top: 6px; right: 6px;
  width: 6px; height: 6px;
  background: #EF4444; border-radius: 50%;
  border: 1.5px solid var(--surface);
}

.tb-user { display: flex; align-items: center; gap: 8px; cursor: pointer; flex-shrink: 0; }
.tb-user-av {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 10px;
}
.tb-uname { font-size: 12px; font-weight: 700; color: var(--text); }
.tb-urole { font-size: 10px; color: var(--hint); }
`;

export default function Topbar({ user, pageTitle = "Dashboard" }) {
  return (
    <>
      <style>{CSS}</style>
      <header className="topbar">
        <div className="tb-left">
          <span className="tb-title">{pageTitle}</span>
          <span className="tb-sep">/</span>
          <span className="tb-crumb">{user?.org}</span>
        </div>

        <div className="tb-right">
          <button className="tb-btn">📥 Export Report</button>
          <button className="tb-btn primary">＋ New Cycle</button>
          <div className="tb-divider" />

          <div className="tb-notif">
            🔔
            <div className="tb-notif-pip" />
          </div>

          <div className="tb-divider" />

          <div className="tb-user">
            <div className="tb-user-av">{user?.initials}</div>
            <div>
              <div className="tb-uname">{user?.name}</div>
              <div className="tb-urole">{user?.title}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

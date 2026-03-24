// components/dashboard/HeroBanner.jsx
// ─────────────────────────────────────────────────────────
//  Welcome hero strip.
//  Receives: user, cycles (array), todayTaskCount (number)
// ─────────────────────────────────────────────────────────

const CSS = `
.hero {
  background: var(--sb);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.hero-glow {
  position: absolute; right: -20px; top: -30px;
  width: 240px; height: 240px; border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.hero-glow2 {
  position: absolute; left: 40%; bottom: -60px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-content {}
.hero-date  { font-size: 10px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.hero-name  { font-size: 20px; font-weight: 800; color: #F1F5F9; margin-bottom: 3px; letter-spacing: -0.3px; }
.hero-sub   { font-size: 12px; color: #64748B; }

.hero-kpis  { display: flex; gap: 10px; position: relative; z-index: 1; }
.hk {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
  min-width: 72px;
}
.hk-value { font-size: 22px; font-weight: 800; color: #F1F5F9; font-family: var(--mono); line-height: 1; }
.hk-label { font-size: 9px;  color: #64748B; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
`;

export default function HeroBanner({ user, cycles = [], todayTaskCount = 0, completedCount = 0 }) {
  const pendingCount = cycles.reduce((s, c) => s + c.myTasks.pending, 0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const kpis = [
    { value: cycles.length,   label: "Cycles"    },
    { value: pendingCount,    label: "Pending"   },
    { value: todayTaskCount,  label: "Due today" },
    { value: completedCount,  label: "Completed" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="hero">
        <div className="hero-glow" />
        <div className="hero-glow2" />

        <div className="hero-content">
          <div className="hero-date">{today}</div>
          <div className="hero-name">Good morning, {user?.name?.split(" ")[0]} 👋</div>
          <div className="hero-sub">
            Assigned to{" "}
            <span style={{ color: "#94A3B8", fontWeight: 700 }}>
              {cycles.length} active cycle{cycles.length !== 1 ? "s" : ""}
            </span>
            {" · "}
            <span style={{ color: todayTaskCount > 0 ? "#F87171" : "#34D399", fontWeight: 700 }}>
              {todayTaskCount} task{todayTaskCount !== 1 ? "s" : ""} due today
            </span>
          </div>
        </div>

        <div className="hero-kpis">
          {kpis.map((k) => (
            <div className="hk" key={k.label}>
              <div className="hk-value">{k.value}</div>
              <div className="hk-label">{k.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

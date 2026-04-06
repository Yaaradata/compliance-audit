// ─────────────────────────────────────────────────────────
//  GLOBAL STYLES
//  Import once at the root (UserDashboard.jsx).
//  All components rely on these CSS variables.
// ─────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --font:    'Plus Jakarta Sans', sans-serif;
  --mono:    'JetBrains Mono', monospace;
  --bg:      #EFF1F7;
  --surface: #FFFFFF;
  --surface2:#F7F8FB;
  --border:  rgba(0,0,0,0.07);
  --border2: rgba(0,0,0,0.12);
  --text:    #0D1117;
  --sub:     #5B6278;
  --hint:    #9BA5B7;
  --accent:  #4F46E5;
  --aclt:    #EEF2FF;
  --sb:      #090E1A;
  --r:       14px;
  --rs:       8px;
  --rm:      10px;
}

html, body { height: 100%; overflow: hidden; }

.app {
  display: flex;
  height: 100vh;
  background: var(--bg);
  font-family: var(--font);
  color: var(--text);
  font-size: 13px;
  overflow: hidden;
}

/* Shared utility classes */
.mono { font-family: var(--mono); }
.text-hint { color: var(--hint); }
.text-sub  { color: var(--sub);  }

/* Shared section header */
.sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.sec-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.sec-link {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
}
.sec-link:hover { text-decoration: underline; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
`;

export default GLOBAL_STYLES;

# CodeGraph + Cursor — Full Setup Guide (Windows)

Use this document to replicate the same CodeGraph setup on **another laptop**. Follow steps in order.

**What you get:** A local code knowledge graph so Cursor agents can use `codegraph_search`, `codegraph_callers`, etc. instead of long grep chains.

**Repos used in this guide (adjust paths for your machine):**

| Project | Example path |
|---------|----------------|
| personal_agent | `D:\office\personal_agent` |
| cx_persona_agent (inside personal_agent) | `D:\office\personal_agent\cx_persona_agent` |
| clariverse-ui | `D:\office\clariverse-ui` |

> **Path note:** If your other laptop uses `E:\office\...` instead of `D:\office\...`, replace `D:` with `E:` everywhere below.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Install CodeGraph globally](#2-install-codegraph-globally)
3. [Fix native SQLite (critical on Windows)](#3-fix-native-sqlite-critical-on-windows)
4. [Initialize a project index](#4-initialize-a-project-index)
5. [Cursor MCP server (per project)](#5-cursor-mcp-server-per-project)
6. [Agent rules (so tools are actually used)](#6-agent-rules-so-tools-are-actually-used)
7. [Terminal commands (sync / query)](#7-terminal-commands-sync--query)
8. [Second project (e.g. clariverse-ui)](#8-second-project-eg-clariverse-ui)
9. [Verify everything works](#9-verify-everything-works)
10. [Troubleshooting](#10-troubleshooting)
11. [File checklist (copy to new laptop)](#11-file-checklist-copy-to-new-laptop)

---

## 1. Prerequisites

### 1.1 Install Node.js (system)

1. Install **Node.js LTS** from https://nodejs.org/ (22.x recommended).
2. Open **PowerShell** and check:

```powershell
node -v
npm -v
```

You may see **v22.x** here. That is fine for terminal use with the wrappers in this guide.

### 1.2 Install Cursor

1. Install **Cursor** from https://cursor.com/
2. Cursor ships its **own Node 22** at a path like:

```
C:\Users\<YOUR_USER>\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe
```

Replace `<YOUR_USER>` with your Windows username. **MCP must use this Node**, not `C:\Program Files\nodejs` if that is Node 25.

### 1.3 Confirm Cursor Node version

```powershell
& "$env:LOCALAPPDATA\Programs\cursor\resources\app\resources\helpers\node.exe" -v
```

Expected: **v22.x** (e.g. `v22.22.0`).

---

## 2. Install CodeGraph globally

```powershell
npm install -g @colbymchenry/codegraph
codegraph --version
```

Expected: version such as `0.6.8`.

---

## 3. Fix native SQLite (critical on Windows)

CodeGraph prefers **native** `better-sqlite3`. If it falls back to **WASM**, you will see:

```
[CodeGraph] Using WASM SQLite backend (native better-sqlite3 unavailable)
Failed to sync: unable to open database file
```

### 3.1 Install better-sqlite3 into CodeGraph’s package

**Close Cursor completely** before this step (avoids `EPERM` file lock).

```powershell
cd $env:APPDATA\npm\node_modules\@colbymchenry\codegraph
npm install better-sqlite3@11.10.0 --no-save
```

### 3.2 Rebuild with Cursor’s Node 22 (not Node 25)

**Do not** run plain `npm rebuild better-sqlite3` if your default `node` is v25 — it will fail.

```powershell
$node22 = "$env:LOCALAPPDATA\Programs\cursor\resources\app\resources\helpers\node.exe"
$cg = "$env:APPDATA\npm\node_modules\@colbymchenry\codegraph"
& $node22 "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" rebuild better-sqlite3 --prefix $cg
```

If rebuild fails with **Visual Studio / gyp** errors but the next test passes, you can skip rebuild.

### 3.3 Test native DB access

```powershell
$node22 = "$env:LOCALAPPDATA\Programs\cursor\resources\app\resources\helpers\node.exe"
& $node22 -e "const D=require(process.env.APPDATA+'/npm/node_modules/@colbymchenry/codegraph/node_modules/better-sqlite3'); const db=new D('D:/office/personal_agent/.codegraph/codegraph.db',{readonly:true}); console.log('native OK', db.pragma('journal_mode')); db.close();"
```

Expected: `native OK` (no WASM warning). If `.codegraph` does not exist yet, run [Section 4](#4-initialize-a-project-index) first.

### 3.4 Create a terminal wrapper (always use Node 22)

Create this file:

**Path:** `%APPDATA%\npm\codegraph-native.cmd`

```bat
@echo off
REM CodeGraph CLI using Cursor Node 22 (native SQLite).
"%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe" "%APPDATA%\npm\node_modules\@colbymchenry\codegraph\dist\bin\codegraph.js" %*
```

> **Note:** `%LOCALAPPDATA%` expands to `C:\Users\<YOU>\AppData\Local` — works for any user.

**Use in terminal:**

```powershell
codegraph-native status
codegraph-native sync
codegraph-native query crew
```

**Avoid** plain `codegraph` in terminal if you see WASM errors — it may use Node 25 from `C:\Program Files\nodejs`.

---

## 4. Initialize a project index

Run **once per repo** (from the project root):

```powershell
cd D:\office\personal_agent
codegraph-native init -i
```

For Python subproject only (optional separate index):

```powershell
cd D:\office\personal_agent\cx_persona_agent
codegraph-native init -i
```

For clariverse-ui:

```powershell
cd D:\office\clariverse-ui
codegraph-native init -i
```

This creates:

```
<project>/.codegraph/
  codegraph.db
  config.json
```

### 4.1 Add to .gitignore

In each repo’s `.gitignore`:

```
.codegraph/
```

---

## 5. Cursor MCP server (per project)

Each Cursor workspace needs **its own** `.cursor/mcp.json` pointing at **that** project’s launcher.

### 5.1 MCP launcher script (per project)

Create **`scripts/codegraph-mcp.js`** in the project root.

**Example for `D:\office\personal_agent`:**

**Path:** `D:\office\personal_agent\scripts\codegraph-mcp.js`

```javascript
#!/usr/bin/env node
/**
 * Cursor MCP launcher: open CodeGraph DB before MCP starts.
 */
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

const codegraphRoot = path.join(
  process.env.APPDATA || '',
  'npm',
  'node_modules',
  '@colbymchenry',
  'codegraph'
);

const CodeGraph = require(path.join(codegraphRoot, 'dist', 'index.js')).default;
const { MCPServer } = require(path.join(codegraphRoot, 'dist', 'mcp', 'index.js'));

const dbPath = path.join(projectRoot, '.codegraph', 'codegraph.db');
if (!fs.existsSync(dbPath)) {
  process.stderr.write(
    `[codegraph-mcp] No index. Run: cd "${projectRoot}" && codegraph-native init -i\n`
  );
  process.exit(1);
}

const cg = CodeGraph.openSync(projectRoot);
const server = new MCPServer(projectRoot);
server.cg = cg;
server.projectPath = projectRoot;
server.toolHandler.setDefaultCodeGraph(cg);
server.start();
```

**For clariverse-ui**, same file at `D:\office\clariverse-ui\scripts\codegraph-mcp.js` (content is identical — `projectRoot` resolves to clariverse-ui automatically).

### 5.2 Project `.cursor/mcp.json`

**Important:** Use **forward slashes** in JSON paths. Use **Cursor’s Node 22**, not `"node"` alone (which may resolve to Node 25).

**`D:\office\personal_agent\.cursor\mcp.json`:**

```json
{
  "mcpServers": {
    "codegraph": {
      "command": "c:/Users/YOUR_USERNAME/AppData/Local/Programs/cursor/resources/app/resources/helpers/node.exe",
      "args": [
        "D:/office/personal_agent/scripts/codegraph-mcp.js"
      ]
    }
  }
}
```

**`D:\office\clariverse-ui\.cursor\mcp.json`:**

```json
{
  "mcpServers": {
    "codegraph": {
      "command": "c:/Users/YOUR_USERNAME/AppData/Local/Programs/cursor/resources/app/resources/helpers/node.exe",
      "args": [
        "D:/office/clariverse-ui/scripts/codegraph-mcp.js"
      ]
    }
  }
}
```

Replace `YOUR_USERNAME` with your Windows login name.

### 5.3 Global MCP config — keep empty to avoid duplicates

**Path:** `C:\Users\<YOU>\.cursor\mcp.json`

```json
{
  "mcpServers": {}
}
```

Having **two** `codegraph` entries in Settings (global + project) causes confusion. Use **project-level only**.

### 5.4 Enable MCP in Cursor

1. **Quit Cursor completely** (File → Exit).
2. Reopen the project folder (`personal_agent` or `clariverse-ui`).
3. **Settings → MCP**
4. Find **codegraph** — toggle **On**
5. Status should be **green** (not “Error - Show Output”)
6. Command should show Cursor’s `node.exe` + your `codegraph-mcp.js`

---

## 6. Agent rules (so tools are actually used)

Without rules, the agent may still grep before/after CodeGraph.

### 6.1 `.cursor/rules/codegraph.mdc`

**Path:** `<project>/.cursor/rules/codegraph.mdc`

```markdown
---
description: Mandatory CodeGraph usage for code navigation
alwaysApply: true
---

## CodeGraph

This repo has `.codegraph/` indexed. For callers, callees, or symbol search:

1. Call **`codegraph_callers`** or **`codegraph_search`** first — **no grep first**.
2. Use **`limit: 100`** (max supported in v0.6.8; there is no unlimited mode).
3. Do not grep after CodeGraph to verify. Do not read `mcps/*.json` files.
4. To trace further up the stack, call **`codegraph_callers`** on the next symbol name — not grep.

If MCP fails, ask the user to restart the **codegraph** MCP server.
```

### 6.2 Optional `AGENTS.md` in project root

```markdown
# Agent instructions

For callers / callees / symbols: use CodeGraph MCP with `limit: 100`. No grep before or after.
Example: `codegraph_callers` with `{ "symbol": "crew", "limit": 100 }`.
```

---

## 7. Terminal commands (sync / query)

Always prefer **`codegraph-native`** (or project `scripts\codegraph.cmd`):

**Optional project wrapper** — `scripts\codegraph.cmd`:

```bat
@echo off
"%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe" "%APPDATA%\npm\node_modules\@colbymchenry\codegraph\dist\bin\codegraph.js" %*
```

| Command | Purpose |
|---------|---------|
| `codegraph-native init -i` | First-time index |
| `codegraph-native sync` | Update after code changes |
| `codegraph-native status` | Index health |
| `codegraph-native query SYMBOL` | Search symbols |
| `codegraph-native query chainlit` | Example |

**Tool limits in MCP:** default 20, max **100** per call. Tell the agent: `limit: 100`.

---

## 8. Second project (e.g. clariverse-ui)

Repeat for each repo:

```powershell
cd D:\office\clariverse-ui
codegraph-native init -i
```

Then add:

- `scripts/codegraph-mcp.js` (copy from Section 5.1)
- `.cursor/mcp.json` (paths → clariverse-ui)
- `.cursor/rules/codegraph.mdc`
- `AGENTS.md` (optional)

**Open the correct folder in Cursor** — MCP index is per workspace root. You cannot query clariverse-ui while Cursor has only `personal_agent` open (unless you pass `projectPath` in tool args — project MCP config is simpler).

---

## 9. Verify everything works

### 9.1 Terminal

```powershell
cd D:\office\personal_agent
codegraph-native status
```

No `WASM SQLite` warning. Shows file/node counts.

### 9.2 MCP log (Cursor)

Settings → MCP → codegraph → **Show Output**

**Good:** no crash on startup, no `unable to open database file`, no `Node.js v25.8.0` in stack trace.

**Bad:** `Using WASM SQLite` + crash → revisit [Section 3](#3-fix-native-sqlite-critical-on-windows) and [Section 5](#5-cursor-mcp-server-per-project).

### 9.3 New chat in Cursor

Ask:

> Use **codegraph_callers** only with limit 100: who calls `crew()`?

**Good:** `Ran codegraph_callers` with 1–2 tool calls.

**Bad:** long grep chain before/after → reload window; confirm rules file exists.

---

## 10. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `CodeGraph not initialized` | Run `codegraph-native init -i` in project root; restart MCP |
| `unable to open database file` + WASM | Use Cursor Node 22 in MCP + `codegraph-native`; install `better-sqlite3` ([Section 3](#3-fix-native-sqlite-critical-on-windows)) |
| MCP **Error** (red), Node v25 in log | MCP must use Cursor `node.exe` path, not `C:\Program Files\nodejs` |
| Two **codegraph** servers in Settings | Empty global `~/.cursor/mcp.json`; keep only project `.cursor/mcp.json` |
| `npm rebuild` EPERM | Close Cursor; delete `better-sqlite3\build` folder; rebuild with Node 22 |
| `npm rebuild` / gyp / Visual Studio | Skip rebuild if [Section 3.3](#33-test-native-db-access) passes; use `codegraph-native` |
| Agent greps before/after tools | Strengthen `codegraph.mdc`; new chat; ask “CodeGraph only” |
| `limit: 30` | Agent choice; max is **100** — set in rules |
| Symbol not found (e.g. `chainlitPath`) | Name may only exist in diagrams/docs, not code — search `chainlit` instead |
| `E:\office\...` not found | Use actual drive (`D:\office\...` on this machine) |

### MCP tools reference

| Tool | Use for |
|------|---------|
| `codegraph_search` | Find symbols by name |
| `codegraph_callers` | Who calls this function |
| `codegraph_callees` | What this function calls |
| `codegraph_impact` | Blast radius before edits |
| `codegraph_node` | One symbol details |
| `codegraph_context` | Large exploration payload |
| `codegraph_status` | Index health |

---

## 11. File checklist (copy to new laptop)

Copy or recreate these per project:

```
<project>/
  .codegraph/                    # generated by init -i (or re-run init on new machine)
  .cursor/
    mcp.json                     # Section 5.2 — update YOUR_USERNAME and paths
    rules/
      codegraph.mdc              # Section 6.1
  scripts/
    codegraph-mcp.js             # Section 5.1
    codegraph.cmd                # Section 7 (optional terminal helper)
  AGENTS.md                      # Section 6.2 (optional)
  .gitignore                     # add .codegraph/
```

**Global (once per machine):**

```
%APPDATA%\npm\
  codegraph-native.cmd           # Section 3.4

C:\Users\<YOU>\.cursor\
  mcp.json                       # { "mcpServers": {} }  Section 5.3

%APPDATA%\npm\node_modules\@colbymchenry\codegraph\
  node_modules\better-sqlite3\   # Section 3.1
```

**Install commands on new laptop (quick sequence):**

```powershell
npm install -g @colbymchenry/codegraph
cd $env:APPDATA\npm\node_modules\@colbymchenry\codegraph
npm install better-sqlite3@11.10.0 --no-save
# Create codegraph-native.cmd (Section 3.4)
cd D:\office\personal_agent
codegraph-native init -i
# Create scripts/codegraph-mcp.js + .cursor/mcp.json + rules
# Quit Cursor, reopen, enable MCP
```

---

## Architecture (how it fits together)

```
Cursor Agent
    │
    ▼
MCP: codegraph (stdio)
    │
    ▼
Cursor Node 22 → scripts/codegraph-mcp.js
    │              (openSync DB before start)
    ▼
<project>/.codegraph/codegraph.db
    │
    ▼
Tools: search, callers, callees, impact, ...
```

---

## Links

- CodeGraph repo: https://github.com/colbymchenry/codegraph
- npm: `@colbymchenry/codegraph`

---

*Document version: 2026-05-21 — based on Windows 10/11 + Cursor + CodeGraph 0.6.8 setup.*

#!/usr/bin/env node
/**
 * Cursor MCP launcher (CodeGraph 0.9.x).
 * Delegates to bundled runtime: codegraph serve --mcp
 */
const path = require('path');
const { spawn } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const bundleRoot = path.join(
  process.env.APPDATA || '',
  'npm',
  'node_modules',
  '@colbymchenry',
  'codegraph',
  'node_modules',
  '@colbymchenry',
  'codegraph-win32-x64'
);

const nodeExe = path.join(bundleRoot, 'node.exe');
const entry = path.join(bundleRoot, 'lib', 'dist', 'bin', 'codegraph.js');

const child = spawn(
  nodeExe,
  [entry, 'serve', '--mcp', '-p', projectRoot],
  { stdio: 'inherit', cwd: projectRoot }
);

child.on('error', (err) => {
  process.stderr.write(`[codegraph-mcp] ${err.message}\n`);
  process.exit(1);
});

child.on('exit', (code) => process.exit(code ?? 1));

/**
 * UK Board v1 — no network sinks. The product drafts; it never files or notifies.
 * Run: npx tsx --test lib/ukboard/v1/noOutbound.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const SCAN_DIRS = [join(ROOT, "components", "UKBoard"), join(ROOT, "lib", "ukboard")];
const SINKS = [/\bfetch\(/, /XMLHttpRequest/, /sendBeacon\(/, /\baxios\b/, /\.post\(/, /WebSocket/];
const STORAGE = [/localStorage/, /sessionStorage/, /indexedDB/, /document\.cookie/];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [p] : [];
  });
}

const files = SCAN_DIRS.flatMap(walk);

test("scans at least the shell and the data module", () => {
  assert.ok(files.length > 5);
});

test("no network sink in UK Board files", () => {
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const re of SINKS) assert.ok(!re.test(src), `${f} matches ${re}`);
  }
});

test("no browser storage in UK Board files", () => {
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const re of STORAGE) assert.ok(!re.test(src), `${f} matches ${re}`);
  }
});

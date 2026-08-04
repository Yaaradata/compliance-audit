/**
 * Guardrail: v6 performs NO outbound network I/O — least of all a POST to a regulator.
 * There is no integration to fca.org.uk, occ.gov or nca.gov.uk. Not disabled — ABSENT.
 *
 * This test greps the whole v6 surface (components + lib) for any network sink. If a
 * sink ever appears, a POST to a regulator becomes possible, and this test fails the
 * build. Regulator hostnames may appear only as inert precedent sourceUrl strings /
 * anchor hrefs, never as a call target — which the "no sink" assertion guarantees.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = join(HERE, "..", "..", "..");

const SCAN_DIRS = [
  join(FRONTEND_ROOT, "components", "UKBankingAudit", "v6"),
  join(FRONTEND_ROOT, "lib", "ukbankingaudit", "v6"),
];

const NETWORK_SINKS: { name: string; re: RegExp }[] = [
  { name: "fetch()", re: /\bfetch\s*\(/ },
  { name: "XMLHttpRequest", re: /\bXMLHttpRequest\b/ },
  { name: "sendBeacon()", re: /\bsendBeacon\s*\(/ },
  { name: "axios", re: /\baxios\b/ },
  { name: ".post(", re: /\.post\s*\(/ },
  { name: "WebSocket", re: /\bWebSocket\b/ },
];

const REGULATOR_HOSTS = /fca\.org\.uk|occ\.gov|nca\.gov\.uk/;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...sourceFiles(full));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (entry.name.includes(".test")) continue; // skip the guard tests themselves
    out.push(full);
  }
  return out;
}

const FILES = SCAN_DIRS.flatMap(sourceFiles);

test("v6 contains no outbound network sinks", () => {
  const offenders: string[] = [];
  for (const file of FILES) {
    const text = readFileSync(file, "utf8");
    for (const sink of NETWORK_SINKS) {
      if (sink.re.test(text)) offenders.push(`${file} → ${sink.name}`);
    }
  }
  assert.deepEqual(offenders, [], `v6 must have no network sinks; found: ${offenders.join(", ")}`);
});

test("no regulator hostname sits on a line with a network sink", () => {
  const offenders: string[] = [];
  for (const file of FILES) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (!REGULATOR_HOSTS.test(line)) continue;
      if (NETWORK_SINKS.some((s) => s.re.test(line))) offenders.push(`${file} :: ${line.trim()}`);
    }
  }
  assert.deepEqual(offenders, [], `regulator host used as a call target: ${offenders.join(", ")}`);
});

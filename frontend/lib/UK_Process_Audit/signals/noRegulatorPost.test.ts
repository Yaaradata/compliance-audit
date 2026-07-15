/**
 * ABSENT outbound regulator integration — not disabled, absent.
 * Fails if any fca.org.uk / nca.gov.uk POST target appears in the repo.
 *
 * Run: npx tsx --test lib/UK_Process_Audit/signals/noRegulatorPost.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");

const REGULATOR_HOST =
  /(?:https?:\/\/)?(?:www\.)?(?:fca\.org\.uk|nca\.gov\.uk)/i;

/** Heuristics for an outbound POST to a regulator host. */
const POST_PATTERNS: RegExp[] = [
  /fetch\s*\(\s*['"`][^'"`]*(?:fca\.org\.uk|nca\.gov\.uk)[^'"`]*['"`]\s*,\s*\{[\s\S]*?method\s*:\s*['"`]POST['"`]/i,
  /axios\.post\s*\(\s*['"`][^'"`]*(?:fca\.org\.uk|nca\.gov\.uk)/i,
  /\.post\s*\(\s*['"`][^'"`]*(?:fca\.org\.uk|nca\.gov\.uk)/i,
  /method\s*:\s*['"`]POST['"`][\s\S]{0,200}(?:fca\.org\.uk|nca\.gov\.uk)/i,
  /(?:fca\.org\.uk|nca\.gov\.uk)[\s\S]{0,200}method\s*:\s*['"`]POST['"`]/i,
  /['"`]POST['"`]\s*,\s*['"`][^'"`]*(?:fca\.org\.uk|nca\.gov\.uk)/i,
];

const SKIP_DIR = new Set([
  "node_modules",
  ".next",
  "out",
  "build",
  ".git",
  "coverage",
  "dist",
]);

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (SKIP_DIR.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|mjs|cjs|json|md)$/i.test(ent.name)) continue;
    // Allow this test file to mention the patterns.
    if (full.replace(/\\/g, "/").endsWith("signals/noRegulatorPost.test.ts")) continue;
    out.push(full);
  }
}

describe("no outbound regulator POST", () => {
  it("finds no fca.org.uk / nca.gov.uk POST targets in the codebase", () => {
    const files: string[] = [];
    walk(ROOT, files);
    const hits: string[] = [];

    for (const file of files) {
      let text: string;
      try {
        text = fs.readFileSync(file, "utf8");
      } catch {
        continue;
      }
      if (!REGULATOR_HOST.test(text)) continue;
      for (const re of POST_PATTERNS) {
        if (re.test(text)) {
          hits.push(`${path.relative(ROOT, file)} matched ${re.source.slice(0, 60)}…`);
          break;
        }
      }
    }

    assert.deepEqual(
      hits,
      [],
      `Outbound regulator POST must be ABSENT (not disabled).\n${hits.join("\n")}`,
    );
  });
});

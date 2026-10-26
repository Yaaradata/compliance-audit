/**
 * Next.js uses a dummy base `http://n` when building NextRequest from a relative
 * Node request URL. Paths that start with `//` are treated as protocol-relative
 * and throw ERR_INVALID_URL (input: '//', base: 'http://n').
 *
 * Collapse leading slashes so those probes normalize to a same-origin path.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  "node_modules/next/dist/server/web/spec-extension/adapters/next-request.js",
  "node_modules/next/dist/esm/server/web/spec-extension/adapters/next-request.js",
];

const from = "url = new URL(request.url, 'http://n');";
const to =
  "url = new URL(((request.url || '/').replace(/^\\/+/g, '/') || '/'), 'http://n');";

let patched = 0;
for (const rel of targets) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("replace(/^\\/+/g, '/')")) continue;
  if (!src.includes(from)) {
    console.warn(`[patch-next-double-slash-url] pattern not found in ${rel}`);
    continue;
  }
  fs.writeFileSync(file, src.replaceAll(from, to));
  patched += 1;
  console.log(`[patch-next-double-slash-url] patched ${rel}`);
}

if (patched === 0) {
  console.log("[patch-next-double-slash-url] nothing to patch (already applied or next missing)");
}

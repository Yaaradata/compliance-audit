/**
 * Flatten arbitrary evidence payloads into stable dotted paths → display strings
 * for run-vs-run comparison. Avoids JSON.stringify so the UI stays human-readable.
 */

const MAX_DEPTH = 7;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Leaf scalar for display (never serializes objects as JSON). */
export function evidenceValueToReadable(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "No items";
    if (v.every((x) => x === null || x === undefined || typeof x !== "object")) {
      return v.map((x) => (x === null || x === undefined ? "—" : String(x))).join(", ");
    }
    return `${v.length} items (see nested rows)`;
  }
  if (isPlainObject(v)) {
    const n = Object.keys(v).length;
    return n === 0 ? "Empty" : `Object (${n} fields — see nested rows)`;
  }
  return String(v);
}

/**
 * Flatten nested structures into "path" → cell text. Paths use dot + [n] segments
 * so the same field lines up across runs.
 */
export function flattenEvidenceForCompare(
  content: unknown,
  prefix = "",
  out: Record<string, string> = {},
  depth = 0
): Record<string, string> {
  if (depth > MAX_DEPTH) {
    out[prefix || "value"] = evidenceValueToReadable(content);
    return out;
  }

  if (content === null || content === undefined) {
    out[prefix || "value"] = "—";
    return out;
  }

  if (typeof content === "string") {
    const t = content.trim();
    if (
      (t.startsWith("{") && t.endsWith("}")) ||
      (t.startsWith("[") && t.endsWith("]"))
    ) {
      try {
        return flattenEvidenceForCompare(JSON.parse(content) as unknown, prefix, out, depth);
      } catch {
        /* treat as plain text */
      }
    }
    out[prefix || "value"] = content;
    return out;
  }

  if (typeof content !== "object") {
    out[prefix || "value"] = String(content);
    return out;
  }

  if (Array.isArray(content)) {
    if (content.length === 0) {
      out[prefix || "items"] = "No items";
      return out;
    }
    const allPrimitive = content.every(
      (item) => item === null || item === undefined || typeof item !== "object"
    );
    if (allPrimitive) {
      out[prefix || "items"] = content
        .map((item) => (item === null || item === undefined ? "—" : String(item)))
        .join(", ");
      return out;
    }
    content.forEach((item, idx) => {
      const next = prefix ? `${prefix}[${idx}]` : `[${idx}]`;
      flattenEvidenceForCompare(item, next, out, depth + 1);
    });
    return out;
  }

  const obj = content as Record<string, unknown>;
  const entries = Object.entries(obj);
  if (!entries.length) {
    out[prefix || "value"] = "Empty";
    return out;
  }

  for (const [k, v] of entries) {
    const segment = k.replace(/^\$/, "");
    const nextPrefix = prefix ? `${prefix}.${segment}` : segment;
    if (v !== null && typeof v === "object") {
      flattenEvidenceForCompare(v, nextPrefix, out, depth + 1);
    } else {
      out[nextPrefix] = evidenceValueToReadable(v);
    }
  }
  return out;
}

/** 1-based “Item N” labels for array indices (avoids “#14” style). */
function formatPathSegmentForDisplay(segment: string): string {
  return segment.replace(/\[(\d+)\]/g, (_, idx: string) => {
    const n = Number(idx) + 1;
    return ` · Item ${n}`;
  });
}

/** Turn `a.b[0].c` into a short readable label for the first table column. */
export function formatAttributePathForDisplay(path: string): string {
  return path
    .split(".")
    .map((part) => {
      const withIndex = formatPathSegmentForDisplay(part);
      return withIndex
        .split("_")
        .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
        .join(" ");
    })
    .join(" › ");
}

/** Top-level section key for grouping (e.g. `subnets[14].id` → `subnets`). */
export function rootSectionKey(path: string): string {
  const head = path.split(".")[0] ?? path;
  const base = head.replace(/\[\d+\]/g, "").trim();
  return base || "general";
}

/** Human-readable section title for dropdown labels. */
export function formatSectionLabel(sectionKey: string): string {
  if (sectionKey === "general") return "General";
  return formatPathSegmentForDisplay(sectionKey)
    .split("_")
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

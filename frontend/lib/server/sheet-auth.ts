/**
 * Server-only Google Sheet auth bridge.
 * SHEET_AUTH_URL / SHEET_SHARED_SECRET must never be imported from client code.
 */

export type SheetAuthAction = "login" | "signup";

export type SheetAuthResult = {
  ok: boolean;
  error?: string;
  name?: string;
  role?: string;
  access?: string;
};

export function getSheetAuthConfig():
  | { ok: true; url: string; secret: string }
  | { ok: false; error: string } {
  const url = (process.env.SHEET_AUTH_URL ?? "").trim();
  const secret = (process.env.SHEET_SHARED_SECRET ?? "").trim();

  if (!url) {
    return {
      ok: false,
      error:
        "Sheet auth is not configured. Set SHEET_AUTH_URL in frontend/.env and restart the dev server.",
    };
  }
  if (!secret) {
    return {
      ok: false,
      error:
        "Sheet auth is not configured. Set SHEET_SHARED_SECRET in frontend/.env and restart the dev server.",
    };
  }

  try {
    // Validate before fetch — empty string throws ERR_INVALID_URL.
    new URL(url);
  } catch {
    return {
      ok: false,
      error: "SHEET_AUTH_URL is not a valid URL.",
    };
  }

  return { ok: true, url, secret };
}

export async function callSheetAuth(
  action: SheetAuthAction,
  body: Record<string, unknown>,
): Promise<{ status: number; data: SheetAuthResult }> {
  const config = getSheetAuthConfig();
  if (!config.ok) {
    return { status: 503, data: { ok: false, error: config.error } };
  }

  const r = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      action,
      secret: config.secret,
    }),
    cache: "no-store",
  });

  let data: SheetAuthResult;
  try {
    data = (await r.json()) as SheetAuthResult;
  } catch {
    return {
      status: 502,
      data: { ok: false, error: "Sheet auth returned an invalid response." },
    };
  }

  return { status: r.ok ? 200 : r.status, data };
}

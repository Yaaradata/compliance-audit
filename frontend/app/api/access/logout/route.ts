import { NextResponse } from "next/server";

/** Clears the session cookie only — never calls the sheet. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("demo_session", "", { maxAge: 0, path: "/" });
  return res;
}

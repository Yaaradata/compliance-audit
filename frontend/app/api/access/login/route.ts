import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { effectiveAccess } from "@/lib/demo-access";
import { callSheetAuth } from "@/lib/server/sheet-auth";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { status, data } = await callSheetAuth("login", { email, password });

  if (!data.ok) {
    if (status === 503 || status === 502) {
      return NextResponse.json({ ok: false, error: data.error }, { status });
    }
    const error =
      data.error === "pending"
        ? "Your access request is awaiting approval."
        : data.error || "Email or password not recognised.";
    return NextResponse.json({ ok: false, error }, { status: 401 });
  }

  const role = String(data.role ?? "");
  const access = effectiveAccess(role, data.access);

  const token = await new SignJWT({
    email,
    name: data.name,
    role,
    access,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const res = NextResponse.json({
    ok: true,
    name: data.name,
    role,
    access,
  });
  res.cookies.set("demo_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });
  return res;
}

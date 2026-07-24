import { NextResponse } from "next/server";
import { callSheetAuth } from "@/lib/server/sheet-auth";

export async function POST(req: Request) {
  const { name, email, password, requested } = await req.json();

  const { status, data } = await callSheetAuth("signup", {
    name,
    email,
    password,
    requested,
  });

  if (!data.ok) {
    if (status === 503 || status === 502) {
      return NextResponse.json({ ok: false, error: data.error }, { status });
    }
    const error =
      data.error === "pending"
        ? "Your signup is awaiting approval."
        : data.error === "exists"
          ? "An account with this email already exists."
          : data.error || "Sign up failed. Please try again.";
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  // Sign up never signs anyone in — no cookie. active stays FALSE until an admin approves.
  return NextResponse.json({ ok: true });
}

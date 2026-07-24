import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { effectiveAccess } from "@/lib/demo-access";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

/**
 * Returns the signed-in demo session from the httpOnly cookie.
 * Missing or invalid token → { signedIn: false }; never throws.
 */
export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get("demo_session")?.value;
    if (!token) {
      return NextResponse.json({ signedIn: false });
    }

    const { payload } = await jwtVerify(token, secret);
    const role = typeof payload.role === "string" ? payload.role : undefined;
    const rawAccess = typeof payload.access === "string" ? payload.access : undefined;
    return NextResponse.json({
      signedIn: true,
      name: typeof payload.name === "string" ? payload.name : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      role,
      access: effectiveAccess(role, rawAccess),
    });
  } catch {
    return NextResponse.json({ signedIn: false });
  }
}

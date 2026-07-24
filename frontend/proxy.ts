import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { keyForPath, canOpenDashboard } from "@/lib/demo-access";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const key = keyForPath(pathname);
  if (!key) return NextResponse.next(); // SWIFT and everything ungated

  const token = req.cookies.get("demo_session")?.value;
  if (!token) return toAccess(req, pathname);

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = String(payload.role || "");
    const access = String(payload.access || "");
    if (!canOpenDashboard(role, access, key)) {
      const url = req.nextUrl.clone();
      url.pathname = "/access/denied";
      url.searchParams.set("d", key);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch {
    return toAccess(req, pathname);
  }
}

function toAccess(req: NextRequest, from: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/access";
  url.searchParams.set("next", from);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/UKBankingAudit/:path*",
    "/UK_Process_Audit/:path*",
    "/USBankingAudit/:path*",
    "/IndianBankingAudit/:path*",
    "/Indian_Process_Audit/:path*",
    "/Srilanka_Retail/:path*",
    "/software_audit/:path*",
    "/Internal_Audit/:path*",
    "/scope3emissions/:path*",
  ],
};

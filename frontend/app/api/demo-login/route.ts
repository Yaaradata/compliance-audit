import { NextResponse } from "next/server";

import { isDemoRole } from "@/lib/demo-auth";
import { getDemoCredential } from "@/lib/server/demo-credentials";
import type { UserRole } from "@/lib/types";

type BackendLoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole | null;
    tenant_id: string | null;
  };
};

export const dynamic = "force-dynamic";

function errorResponse(status: number, error: string) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

/**
 * Exchanges a demo role for a backend session entirely on the server.
 * The browser receives the normal auth token/user response, never the password.
 */
export async function POST(request: Request) {
  if (process.env.DEMO_LOGIN_ENABLED !== "true") {
    return errorResponse(404, "Demo login is disabled.");
  }

  const body: unknown = await request.json().catch(() => null);
  const role =
    body && typeof body === "object" && "role" in body
      ? (body as { role?: unknown }).role
      : undefined;

  if (!isDemoRole(role)) {
    return errorResponse(400, "Unknown demo role.");
  }

  const credentials = getDemoCredential(role);
  if (!credentials) {
    return errorResponse(503, "Demo credentials are not configured.");
  }

  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/+$/, "");
  if (!backendOrigin) {
    return errorResponse(503, "Backend URL is not configured.");
  }

  try {
    const response = await fetch(`${backendOrigin}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    if (!response.ok) {
      return errorResponse(401, "Demo login failed.");
    }

    const session = (await response.json()) as BackendLoginResponse;
    if (!session.token || session.user.role !== role) {
      return errorResponse(409, "Demo account role does not match its configuration.");
    }

    return NextResponse.json(session, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return errorResponse(502, "Demo authentication service is unavailable.");
  }
}

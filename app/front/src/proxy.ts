import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { allowedOrigins } from "@/config/appConfig";

const protectedRoutes = ["/main/"];
const adminRoutes = ["/main/admin"];
const loginRoute = ["/login"];
const contractConfigRoute = "/main/configs";

function normalizeOrigin(origin: string): string | null {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.replace(/^www\./, "");
    const port = url.port ? `:${url.port}` : "";
    return `${url.protocol}//${hostname}${port}`;
  } catch {
    return null;
  }
}

const normalizedAllowedOrigins = new Set(
  allowedOrigins
    .map(normalizeOrigin)
    .filter((origin): origin is string => origin !== null)
);

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // CSRF: validate origin on state-changing API requests
  // No origin/referer = server-side call (allowed); browsers always send Origin on cross-origin POSTs
  if (path.startsWith("/api/") && req.method !== "GET" && req.method !== "HEAD") {
    let origin = req.headers.get("origin");
    if (!origin) {
      try { origin = new URL(req.headers.get("referer") ?? "").origin; } catch { /* no valid referer */ }
    }

    if (origin) {
      const normalizedOrigin = normalizeOrigin(origin);
      const normalizedRequestOrigin = normalizeOrigin(req.nextUrl.origin);
      if (
        !normalizedOrigin ||
        !normalizedRequestOrigin ||
        (
          normalizedOrigin !== normalizedRequestOrigin &&
          !normalizedAllowedOrigins.has(normalizedOrigin)
        )
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isLoginRoute = loginRoute.some((route) => path.startsWith(route));

  const cookie = (await cookies()).get("session")?.value;
  const session = await verifySession(cookie);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (session) {
    // Admin route protection
    if (isAdminRoute) {
      const userData = typeof session.userData === "string"
        ? JSON.parse(session.userData)
        : session.userData;
      if (userData?.user_type !== "admin") {
        return NextResponse.redirect(new URL("/main/campaign", req.nextUrl.origin));
      }
    }

    const contractSigned = session.contract.contract_signed === true;

    if (!contractSigned) {
      const isConfigPage = path.startsWith(contractConfigRoute);

      if (isProtectedRoute && !isConfigPage) {
        return NextResponse.redirect(
          new URL(contractConfigRoute, req.nextUrl.origin)
        );
      }
    }
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/main/campaign", req.nextUrl.origin))
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};

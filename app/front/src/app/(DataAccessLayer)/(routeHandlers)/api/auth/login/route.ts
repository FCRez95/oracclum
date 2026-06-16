import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { rateLimit, getClientIp } from "@/utils/rateLimit";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

type LoginBackendResponse = {
  accessToken?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = rateLimit(`${ip}:/api/auth/login`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: Math.ceil(retryAfterMs / 1000) },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const credentials = await request.json();
    const { controller, timeoutId } = abortTimeout();

    const backendResponse = await fetch(`${ExternalURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const backendData = (await backendResponse.json().catch((parseError) => {
      console.error("[Auth Login] Backend returned a non-JSON response:", {
        status: backendResponse.status,
        contentType: backendResponse.headers.get("content-type"),
        parseError,
      });
      return null;
    })) as LoginBackendResponse | null;

    if (!backendData) {
      return upstreamErrorResponse(
        "Unable to complete login.",
        backendResponse.ok ? 502 : backendResponse.status
      );
    }

    if (!backendResponse.ok) {
      console.error("[Auth Login] Backend rejected login:", backendResponse.status, backendData);
      return upstreamErrorResponse("Invalid login credentials.", backendResponse.status);
    }

    if (typeof backendData.accessToken !== "string" || !backendData.accessToken) {
      console.error("[Auth Login] Backend login response did not include an access token.");
      return upstreamErrorResponse("Invalid login response.", 502);
    }

    return NextResponse.json({ accessToken: backendData.accessToken }, { status: 200 });
  } catch (error) {
    console.error("[Auth Login] Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error during login process." },
      { status: 500 }
    );
  }
}

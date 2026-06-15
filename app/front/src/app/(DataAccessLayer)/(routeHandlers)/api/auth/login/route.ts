import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { rateLimit, getClientIp } from "@/utils/rateLimit";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

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

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("[Auth Login] Backend rejected login:", backendResponse.status, backendData);
      return upstreamErrorResponse("Invalid login credentials.", backendResponse.status);
    }
    const accessToken = backendData.accessToken;

    return NextResponse.json({ accessToken: accessToken }, { status: 200 });
  } catch (error) {
    console.error("[Auth Login] Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error during login process." },
      { status: 500 }
    );
  }
}

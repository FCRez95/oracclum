import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { rateLimit, getClientIp } from "@/utils/rateLimit";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = rateLimit(`${ip}:/api/auth/signup`, 3, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: Math.ceil(retryAfterMs / 1000) },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const userData = await request.json();
    const { controller, timeoutId } = abortTimeout();

    const backendResponse = await fetch(`${ExternalURL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("[Auth Signup] Backend rejected signup:", backendResponse.status, backendData);
      return upstreamErrorResponse("Unable to complete signup.", backendResponse.status);
    }

    return NextResponse.json(backendData, { status: 201 });
  } catch (error) {
    console.error("[Auth Signup] Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error during signup." },
      { status: 500 }
    );
  }
}

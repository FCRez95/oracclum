import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { rateLimit, getClientIp } from "@/utils/rateLimit";
import { isDemoAccessToken } from "@/demo/demoMode";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = rateLimit(`${ip}:/api/user/changePassword`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: Math.ceil(retryAfterMs / 1000) },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const authHeader = request.headers.get("Authorization");
    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      return NextResponse.json(
        { message: "Authorization token is missing" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields: id_user, currentPassword or newPassword." },
        { status: 400 }
      );
    }

    if (isDemoAccessToken(accessToken)) {
      return NextResponse.json(
        { success: true, message: "Senha alterada no modo demo." },
        { status: 200 }
      );
    }

    const { controller, timeoutId } = abortTimeout();

    const response = await fetch(`${ExternalURL}/change-pass`, {
      method: "POST",
      headers: {
        "x-access-token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Backend returned error changing password:", response.status, errorText);
      return upstreamErrorResponse("Failed to change password.", response.status);
    }


    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in BFF /api/user/changePassword route:", error);
    return NextResponse.json(
      { message: "Failed to change password due to an internal server error." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { verifySession } from "@/lib/session";
import { ExternalURL } from "@/utils/apiRouter";
import { isFrontendMockDemoSession } from "@/demo/demoMode";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    const session = sessionCookie ? await verifySession(sessionCookie) : null;
    const accessToken = session?.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Authorization token is missing or invalid" },
        { status: 401 }
      );
    }

    if (isFrontendMockDemoSession(session)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { controller, timeoutId } = abortTimeout();

    const backendResponse = await fetch(`${ExternalURL}/delete-my-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      },
      body: JSON.stringify({}),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();

      return NextResponse.json(
        {
          message: "Failed to delete user data",
          detail: errorBody,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in BFF /api/delete-my-data:", error);

    return NextResponse.json(
      { message: "Failed to delete user data due to internal server error." },
      { status: 500 }
    );
  }
}

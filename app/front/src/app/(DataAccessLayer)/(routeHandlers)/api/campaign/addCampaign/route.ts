import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { ExternalURL } from "@/utils/apiRouter";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

interface SessionPayload {
  userData?: {
    access_token?: string;
  };
}

export async function POST(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Missing session" }, { status: 401 });
  }

  const payload = (await verifySession(session)) as SessionPayload | null;
  const accessToken = payload?.userData?.access_token;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Invalid user token" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { controller, timeoutId } = abortTimeout();

    const response = await fetch(`${ExternalURL}/add-campaign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": String(accessToken),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Intern error:", response.status, errorText);
      return upstreamErrorResponse("Failed to add campaign.", response.status);
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error in BFF /api/campaign/addCampaign route:", error);

    return NextResponse.json(
      { message: "Failed to load user data due to an internal server error." },
      { status: 500 }
    );
  }
}

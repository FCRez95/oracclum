import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const accessToken = authHeader?.split(" ")[1];

  if (!accessToken) {
    return NextResponse.json(
      { message: "Authorization token is missing." },
      { status: 401 }
    );
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const body = await request.json();
    const { accountId, clientId, clientSecret } = body;

    const { controller, timeoutId: tId } = abortTimeout();
    timeoutId = tId;

    const response = await fetch(`${ExternalURL}add-taboola-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      },
      body: JSON.stringify({ accountId, clientId, clientSecret }),
      signal: controller.signal,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text().catch(() => "");
      data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.error_description ||
            data?.error ||
            "Failed to update Taboola integration data.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Taboola integration data updated successfully.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in BFF /api/addTaboolaInfo:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error while updating Taboola integration data.",
      },
      { status: 500 }
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

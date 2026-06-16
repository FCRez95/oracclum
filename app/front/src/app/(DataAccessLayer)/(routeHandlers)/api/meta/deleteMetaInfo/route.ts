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
    const { controller, timeoutId: tId } = abortTimeout();
    timeoutId = tId;

    const response = await fetch(`${ExternalURL}/delete-meta-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      },
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
            data?.message ||
            "Failed to delete Meta integration data.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data?.message || "Meta integration data deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in BFF /api/meta/deleteMetaInfo:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error while deleting Meta integration data.",
      },
      { status: 500 }
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

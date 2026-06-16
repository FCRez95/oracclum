import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { isDemoAccessToken } from "@/demo/demoMode";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      return NextResponse.json(
        { message: "Authorization token is missing." },
        { status: 401 }
      );
    }

    if (isDemoAccessToken(accessToken)) {
      return NextResponse.json(
        {
          success: true,
          data: {
            meta_access_token: "demo-meta-token",
            allowed_accounts: [
              { account_id: "1234567890", name: "Oracclum Demo Ads" },
              { account_id: "9876543210", name: "Scale Lab Demo" },
            ],
          },
        },
        { status: 200 }
      );
    }

    const backendResponse = await fetch(
      `${ExternalURL}/load-meta-info`,
      {
        method: "GET",
        headers: {
          "x-access-token": accessToken,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (backendResponse.status === 204) {
      return NextResponse.json(
        { success: true, data: { meta_access_token: null } },
        { status: 200 }
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: true, data: { meta_access_token: null } },
        { status: 200 }
      );
    }

    const backendData = await backendResponse.json();

    return NextResponse.json(
      { success: true, data: backendData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Meta data:", error);
    return NextResponse.json(
      { success: true, data: { meta_access_token: null } },
      { status: 200 }
    );
  }
}

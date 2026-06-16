import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { verifySession } from "@/lib/session";
import {
  emptyMetaIntegrationStatus,
  type MetaIntegrationStatus,
} from "@/app/main/campaign/components/MetaIntegrationTutorial/metaIntegrationSteps";
import { isFrontendMockDemoSession } from "@/demo/demoMode";
import { getDemoMetaIntegrationStatus } from "@/demo/demoData";

function normalizeValue(value: unknown): 0 | 1 {
  return Number(value) === 1 ? 1 : 0;
}

function normalizeIntegrationStatus(payload: unknown): MetaIntegrationStatus {
  const source = Array.isArray(payload)
    ? payload[0]
    : typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data?: unknown }).data
      : payload;

  const record =
    typeof source === "object" && source !== null
      ? (source as Record<string, unknown>)
      : {};

  return {
    ad_provider: normalizeValue(record.ad_provider),
    funnel: normalizeValue(record.funnel),
    checkout: normalizeValue(record.checkout),
    test: normalizeValue(record.test),
  };
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    const session = sessionCookie ? await verifySession(sessionCookie) : null;
    const accessToken = session?.accessToken as string | undefined;
    const campaignId = request.nextUrl.searchParams.get("campaign_id");

    if (!campaignId) {
      return NextResponse.json(
        { message: "Missing required query parameter: campaign_id" },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { message: "Authorization token is missing or invalid" },
        { status: 401 }
      );
    }

    if (isFrontendMockDemoSession(session)) {
      return NextResponse.json(
        { success: true, data: getDemoMetaIntegrationStatus() },
        { status: 200 }
      );
    }

    const backendResponse = await fetch(
      `${ExternalURL}/load-integration-status/${campaignId}`,
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
        { success: true, data: emptyMetaIntegrationStatus },
        { status: 200 }
      );
    }

    if (!backendResponse.ok) {
      const detail = await backendResponse.text();
      return NextResponse.json(
        {
          message: "Failed to fetch integration status from backend",
          detail,
        },
        { status: backendResponse.status }
      );
    }

    const textResponse = await backendResponse.text();
    const backendData = textResponse ? JSON.parse(textResponse) : {};

    return NextResponse.json(
      { success: true, data: normalizeIntegrationStatus(backendData) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching integration status:", error);
    return NextResponse.json(
      { message: "Failed to load integration status due to internal server error." },
      { status: 500 }
    );
  }
}

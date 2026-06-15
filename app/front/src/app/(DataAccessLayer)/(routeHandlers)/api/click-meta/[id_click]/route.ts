import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { verifySession } from "@/lib/session";
import { isFrontendMockDemoSession } from "@/demo/demoMode";
import { getDemoMetaClickSteps } from "@/demo/demoData";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id_click: string }> }
) {
  try {
    const { id_click: idClick } = await params;
    const sessionCookie = request.cookies.get("session")?.value;
    const session = sessionCookie ? await verifySession(sessionCookie) : null;
    const accessToken = session?.accessToken as string | undefined;

    if (!idClick) {
      return NextResponse.json(
        { message: "Missing required route parameter: id_click" },
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
      return NextResponse.json(getDemoMetaClickSteps(idClick), { status: 200 });
    }

    const backendUrl = `${ExternalURL}/click-meta/${encodeURIComponent(idClick)}`;
    const { controller, timeoutId } = abortTimeout();

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "x-access-token": accessToken,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const responseBody = await backendResponse.text();

    if (!backendResponse.ok) {
      if (backendResponse.status === 400) {
        console.error("Backend Meta test click not ready:", backendResponse.status, responseBody);
        return upstreamErrorResponse(
          "Click de teste da Meta ainda nao foi gerado no backend. O usuario ainda nao clicou no link ou houve erro no digestor.",
          412
        );
      }

      console.error("Backend returned error loading Meta test click:", backendResponse.status, responseBody);
      return upstreamErrorResponse("Failed to fetch Meta test click from backend", backendResponse.status);
    }

    return NextResponse.json(JSON.parse(responseBody), { status: 200 });
  } catch (error) {
    console.error("Error loading Meta test click:", error);
    return NextResponse.json(
      {
        message:
          "Failed to load Meta test click due to internal server error.",
      },
      { status: 500 }
    );
  }
}

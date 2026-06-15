import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { verifySession } from "@/lib/session";
import { isFrontendMockDemoSession } from "@/demo/demoMode";

function parseResponseMessage(rawBody: string, fallback: string) {
  if (!rawBody) return fallback;

  try {
    const parsed = JSON.parse(rawBody) as { message?: string; detail?: string };
    return parsed.message || parsed.detail || fallback;
  } catch {
    return rawBody;
  }
}

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
      return NextResponse.json(
        { success: true, message: "Status da integração atualizado no modo demo." },
        { status: 200 }
      );
    }

    const body = await request.json();
    const backendResponse = await fetch(
      `${ExternalURL}update-integration-status`,
      {
        method: "POST",
        headers: {
          "x-access-token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const responseBody = await backendResponse.text();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: parseResponseMessage(
            responseBody,
            "Failed to update integration status on backend"
          ),
        },
        { status: backendResponse.status }
      );
    }

    if (!responseBody) {
      return NextResponse.json(
        { success: true, message: "Status da integração atualizado com sucesso." },
        { status: 200 }
      );
    }

    try {
      const parsedResponse = JSON.parse(responseBody) as {
        message?: string;
        detail?: string;
      };

      return NextResponse.json(
        {
          success: true,
          message:
            parsedResponse.message ||
            parsedResponse.detail ||
            "Status da integração atualizado com sucesso.",
          data: parsedResponse,
        },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { success: true, message: responseBody },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating Meta integration status:", error);
    return NextResponse.json(
      { message: "Failed to update integration status due to internal server error." },
      { status: 500 }
    );
  }
}

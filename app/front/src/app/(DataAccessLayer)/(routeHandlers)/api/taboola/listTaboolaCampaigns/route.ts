import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { TaboolaURL } from "@/utils/apiRouter";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    console.error('[Taboola] Missing session');
    return NextResponse.json({ message: "Missing session" }, { status: 401 });
  }

  const payload = await verifySession(session);

  if (!payload?.accessToken || !payload?.taboolaData) {
    return NextResponse.json({ message: "Invalid session data" }, { status: 400 });
  }

  let taboolaData;
  try {
    taboolaData =
      typeof payload.taboolaData === "string"
        ? JSON.parse(payload.taboolaData)
        : payload.taboolaData;
  } catch {
    return NextResponse.json({ message: "Error parsing taboolaData" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const accountId = body.subAccount || taboolaData.account_id;

  const response = await fetch(
    `${TaboolaURL}${accountId}/campaigns/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${taboolaData.access_token}`,
        "Content-Type": "application/json",
      },

      
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Erro ao listar campanhas da Taboola:", response.status, errorData);
    return upstreamErrorResponse("Erro ao listar campanhas da Taboola", response.status);
  }

  const data = await response.json();
  return NextResponse.json(data);
}

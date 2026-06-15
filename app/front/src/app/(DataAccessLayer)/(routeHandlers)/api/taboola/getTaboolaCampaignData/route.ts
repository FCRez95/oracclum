import { NextRequest, NextResponse } from "next/server";
import { TaboolaURL } from "@/utils/apiRouter";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId");
    const campaignId = request.nextUrl.searchParams.get("campaignId");
    const subAccount = request.nextUrl.searchParams.get("subAccount");
    const access_token = request.headers.get("authorization")?.replace("Bearer ", "");

    const url = subAccount !== "null"? `${TaboolaURL}/${subAccount}/campaigns/${campaignId}` : `${TaboolaURL}/${accountId}/campaigns/${campaignId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${access_token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro ao buscar dados da campanha Taboola:", response.status, errorData);
      return upstreamErrorResponse("Erro ao buscar dados da campanha Taboola", response.status);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Taboola Campaign] Unexpected error:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar dados da campanha Taboola" },
      { status: 500 }
    );
  }
}

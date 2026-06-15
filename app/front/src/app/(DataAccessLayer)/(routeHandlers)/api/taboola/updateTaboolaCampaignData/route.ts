import { NextRequest, NextResponse } from "next/server";
import { TaboolaURL } from "@/utils/apiRouter";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const accountId = searchParams.get("accountId");
    const campaignId = searchParams.get("campaignId");
    const subAccount = searchParams.get("subAccount");
    const access_token = request.headers.get("authorization")?.replace("Bearer ", "");

    const data = await request.json();

    const url = subAccount !== "null"? `${TaboolaURL}/${subAccount}/campaigns/${campaignId}` : `${TaboolaURL}/${accountId}/campaigns/${campaignId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro ao atualizar dados da campanha Taboola:", response.status, errorData);
      return upstreamErrorResponse("Erro ao atualizar dados da campanha Taboola", response.status);
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("[Taboola Campaign Update] Unexpected error:", error);
    return NextResponse.json(
      { message: "Erro interno ao atualizar dados da campanha Taboola" },
      { status: 500 }
    );
  }
}

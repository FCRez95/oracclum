import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { TaboolaURL } from "@/utils/apiRouter";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Missing session" }, { status: 401 });
  }

  const payload = await verifySession(session);

  if (!payload?.taboolaData) {
    return NextResponse.json({ message: "Missing Taboola data" }, { status: 400 });
  }

  let account_id = "";
  let taboolaData;
  try {
    taboolaData =
      typeof payload.taboolaData === "string"
        ? JSON.parse(payload.taboolaData)
        : payload.taboolaData;
    account_id = taboolaData.account_id;
  } catch (error) {
    console.error("Erro ao parsear taboolaData:", error);
    return NextResponse.json({ message: "Invalid taboola data" }, { status: 500 });
  }

  const { campaignTaboolaId, subAccount } = await req.json();
  const searchAccId = subAccount ? subAccount : account_id;
  try {
    const response = await fetch(
      `${TaboolaURL}${searchAccId}/campaigns/${campaignTaboolaId}/items`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${taboolaData.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da Taboola:", errorText);
      return upstreamErrorResponse("Erro ao buscar anuncios da Taboola", response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro interno ao buscar anúncios:", err);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}

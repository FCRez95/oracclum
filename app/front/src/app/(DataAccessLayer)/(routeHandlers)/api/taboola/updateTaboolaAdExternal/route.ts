import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { TaboolaURL } from "@/utils/apiRouter";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Missing session" }, { status: 401 });
  }

  const payload = await verifySession(session);

  if (!payload?.accessToken || !payload?.taboolaData) {
    return NextResponse.json({ message: "Invalid session data" }, { status: 400 });
  }

  let account_id = "";
  let taboolaData;
  try {
    taboolaData =
      typeof payload.taboolaData === "string"
        ? JSON.parse(payload.taboolaData)
        : payload.taboolaData;
        account_id = taboolaData.account_id;
  } catch {
    return NextResponse.json({ message: "Error parsing taboolaData" }, { status: 500 });
  }

  const { campaignTaboolaId, item_id, updateData, subAccount } = await req.json();
  const searchAccId = subAccount ? subAccount : account_id;
  const response = await fetch(
    `${TaboolaURL}${searchAccId}/campaigns/${campaignTaboolaId}/items/${item_id}/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${taboolaData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Erro na resposta da Taboola:", errorData);
    return upstreamErrorResponse("Erro ao atualizar anuncio da Taboola", response.status);
  }

  const data = await response.json();
  return NextResponse.json(data);
}

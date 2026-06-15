import { InternalURL } from "@/utils/apiRouter";

export async function updateTaboolaAdInternal(
  cookiesHeader: string,
  campaignTaboolaId: number | string,
  itemId: number | string,
  updateData: Record<string, unknown>,
  subAccount?: string
) {
  try {
    const response = await fetch(`${InternalURL}/taboola/updateTaboolaAdExternal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
      },
      body: JSON.stringify({
        campaignTaboolaId: campaignTaboolaId,
        item_id: itemId,
        updateData,
        subAccount,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error("Erro na resposta do external:", errorText);
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro interno ao atualizar anúncio:", error);
    throw error;
  }
}

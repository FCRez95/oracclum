import { InternalURL } from "@/utils/apiRouter";
import { handleError } from "@/utils/handleError";

export async function getTaboolaAdsDataInternal(cookiesHeader: string, campaignTaboolaId: number, subAccount?: string) {
  try {
    const response = await fetch(`${InternalURL}/taboola/getTaboolaAdsDataExternal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
      },
      body: JSON.stringify({ campaignTaboolaId, subAccount }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta do external:", errorText);
      throw new Error(errorText);
    }

    return await response.json();
  } catch (err: unknown) {
    const msg = handleError(err);
    console.error("Erro no getTaboolaAdsDataInternal:", msg);
    throw err;
  }
}

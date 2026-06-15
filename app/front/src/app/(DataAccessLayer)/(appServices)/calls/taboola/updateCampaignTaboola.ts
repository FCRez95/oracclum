import { InternalURL } from "@/utils/apiRouter";

export const updateCampaignTaboola = async (
  accountId: string,
  campaignId: string,
  cookiesHeader: string,
  access_token: string,
  data: object,
  subAccount?: string | null
) => {
  try {
    const url = `${InternalURL}/taboola/updateTaboolaCampaignData?accountId=${encodeURIComponent(accountId)}&campaignId=${encodeURIComponent(campaignId)}&subAccount=${subAccount}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erro ao atualizar dados da campanha Taboola: " + response.status);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

import { InternalURL } from "@/utils/apiRouter";

export const loadUserCampaignTaboola = async (
  accountId: string,
  campaignId: string,
  cookiesHeader: string,
  access_token: string,
  subAccount?: string | null
) => {
  try {
    const url = `${InternalURL}/taboola/getTaboolaCampaignData?accountId=${accountId}&campaignId=${campaignId}&subAccount=${subAccount}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar dados da campanha Taboola: " + response.status);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

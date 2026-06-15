import { InternalURL } from "@/utils/apiRouter";

export const loadUserCampaignOptimData = async (
  campaign_id: number,
  days: number,
  cookiesHeader: string,
  signal?: AbortSignal
) => {
  try {
    const url = `${InternalURL}/campaign/loadCampaignOptimData?campaign_id=${campaign_id}&days=${days}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
      },
      signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar campanhas: " + response.status);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

import { InternalURL } from "@/utils/apiRouter";

export const callLoadCampaignStepsByTime = async (
    campaign_id: number,
    days: number,
    cookiesHeader: string,
    signal?: AbortSignal
) => {
    const url = `${InternalURL}/campaign/loadCampaignStepsByTime?campaign_id=${campaign_id}&days=${days}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Cookie: cookiesHeader,
            "Content-Type": "application/json",
        },
        signal,
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Erro ao buscar passos da campanha: " + response.status);
    }

    return response.json();
};
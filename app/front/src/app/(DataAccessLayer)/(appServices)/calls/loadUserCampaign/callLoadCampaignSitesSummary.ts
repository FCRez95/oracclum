export const loadCampaignSitesSummary = async (
    campaign_id: number,
    days: number,
    signal?: AbortSignal
) => {
    try {
        const url = `/api/campaign/loadCampaignSitesSummary?campaign_id=${campaign_id}&days=${days}`;
        const response = await fetch(url, {
            method: "GET",
            signal,
            cache: "no-store",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar campanhas: " + response.status);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

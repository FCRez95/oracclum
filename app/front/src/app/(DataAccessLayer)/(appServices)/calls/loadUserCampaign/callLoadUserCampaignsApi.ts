export const loadUserCampaigns = async (
    signal?: AbortSignal,
    days: string | number = 7
) => {
    try {
        const response = await fetch(`/api/campaign/loadUserCampaigns?days=${days}`, {
            method: "GET",
            signal,
            cache: "no-store",
            credentials: "include",
        });
        if (!response.ok)
            throw new Error("Erro ao buscar campanhas: " + response.status);
        return await response.json();
    } catch (error) {
        throw error;
    }
}; 
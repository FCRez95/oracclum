import { InternalURL } from "@/utils/apiRouter";

export async function callCampaignAdsSummary(
    campaignId: number | string,
    days: number,
    sessionCookies: string
) {
    const url = `${InternalURL}/campaign/loadCampaignAdsSummary?campaign_id=${encodeURIComponent(
        String(campaignId)
    )}&days=${encodeURIComponent(String(days))}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            cookie: sessionCookies,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar anúncios da campanha: ${res.status} - ${text}`);
    }

    return await res.json();
}

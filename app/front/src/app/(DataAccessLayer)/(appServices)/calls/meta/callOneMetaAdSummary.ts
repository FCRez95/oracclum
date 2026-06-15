import { InternalURL } from "@/utils/apiRouter";

export async function callOneMetaAdSummary(
  campaignId: number | string,
  adId: number | string,
  days: number | string,
  sessionCookies: string
) {
  const url = `${InternalURL}/meta/loadOneMetaAd?campaign_id=${encodeURIComponent(
    String(campaignId)
  )}&ad_id=${encodeURIComponent(String(adId))}&days=${encodeURIComponent(String(days))}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      cookie: sessionCookies,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar meta ad: ${res.status} - ${text}`);
  }

  return await res.json();
}

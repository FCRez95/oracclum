import { InternalURL } from "@/utils/apiRouter";

export async function callStepsByTime(
  campaignId: number | string,
  siteId: number | string,
  days: number,
  sessionCookies: string
) {
  const url = `${InternalURL}/sites/loadStepsByTime?campaign_id=${encodeURIComponent(
    String(campaignId)
  )}&id_site=${encodeURIComponent(String(siteId))}&days=${encodeURIComponent(String(days))}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      cookie: sessionCookies,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar info do site: ${res.status} - ${text}`);
  }

  return await res.json();
}
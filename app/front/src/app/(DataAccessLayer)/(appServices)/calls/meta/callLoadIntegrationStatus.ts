import { InternalURL } from "@/utils/apiRouter";
import { emptyMetaIntegrationStatus, type MetaIntegrationStatus } from "@/app/main/campaign/components/MetaIntegrationTutorial/metaIntegrationSteps";

export async function callLoadIntegrationStatus(
  campaignId: number | string,
  sessionCookies: string
): Promise<MetaIntegrationStatus> {
  const url = `${InternalURL}/meta/loadIntegrationStatus?campaign_id=${encodeURIComponent(
    String(campaignId)
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      cookie: sessionCookies,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar status da integração: ${res.status} - ${text}`);
  }

  const payload = (await res.json()) as {
    success?: boolean;
    data?: MetaIntegrationStatus;
  };

  return payload.data ?? emptyMetaIntegrationStatus;
}

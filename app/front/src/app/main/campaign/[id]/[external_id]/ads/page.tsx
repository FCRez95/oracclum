import AdsClientPage from "./adsPageClient";

export default async function CampaignAdsPage({
  params,
}: {
  params: Promise<{ id: string; external_id: string }>;
}) {
  const { id, external_id } = await params;

  return (
    <AdsClientPage
      campaignId={Number(id)}
      externalId={external_id}
    />
  );
}

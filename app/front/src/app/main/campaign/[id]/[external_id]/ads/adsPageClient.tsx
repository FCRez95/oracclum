"use client";

import { useEffect, useState } from "react";
import { useCampaignContext } from "@/context/CampaignContext";
import { loadCampaignAdsAction, getTaboolaAdsDataAction } from "../../../components/campaignActions";
import AdsCard from "../../../components/adCard";
import Loading from "@/components/Loading";
import { CallerWrapper } from "@/utils/CallerWrapper";

interface AdsClientPageProps {
  campaignId: number;
  externalId: number | string;
  subAccount?: string;
}

interface AdSummary {
  revenue: number;
  expenses: number;
  cpc: number;
  vcpm: number;
  cpa: number;
  vctr: number;
  clicks: number;
  checkout: number;
  sales: number;
  roas: number;
}

interface AdData {
  id_ads_taboola: string;
  title: string;
  thumbnail: string;
  campaign_name?: string;
  status: boolean;
  summary?: AdSummary;
}

interface TaboolaStatus {
  id: string;
  is_active: boolean;
}

export default function AdsClientPage({ campaignId, externalId }: AdsClientPageProps) {
  const [adsData, setAdsData] = useState<AdData[]>([]);
  const [baseAds, setBaseAds] = useState<AdData[]>([]);
  const [statusList, setStatusList] = useState<TaboolaStatus[]>([]);
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingTaboola, setLoadingTaboola] = useState(true);
  const { selectedSideDate, campaign } = useCampaignContext();
  const loading = loadingBase || loadingTaboola;

  useEffect(() => {
    async function fetchBaseAds() {
      setLoadingBase(true);

      const res = await CallerWrapper(
        loadCampaignAdsAction(campaignId, Number(selectedSideDate))
      );

      if (!res.success && res.errors?.general?.[0] === "401") {
        window.location.reload();
        return;
      }

      if (res.success && res.data) {
        setBaseAds(res.data as AdData[]);
      } else {
        console.error(res.errors?.general?.[0] || "Erro ao carregar anúncios.");
        setBaseAds([]);
      }

      setLoadingBase(false);
    }

    fetchBaseAds();
  }, [campaignId, selectedSideDate]);

  useEffect(() => {
    async function fetchTaboolaStatus() {
      setLoadingTaboola(true);
      setStatusList([]);
      const taboolaRes = await getTaboolaAdsDataAction(externalId, campaign?.sub_account as string);
      if (!taboolaRes.success && taboolaRes.errors?.general?.[0] === "401") {
        window.location.reload();
        return;
      }

      if (taboolaRes.success && taboolaRes.data?.results) {
        setStatusList(taboolaRes.data.results as TaboolaStatus[]);
      } else {
        console.error("Erro ao buscar status dos anúncios da Taboola.");
        setStatusList([]);
      }

      setLoadingTaboola(false);
    }
    if (externalId && campaign) { // Adicionando verificação para externalId e campaign
      fetchTaboolaStatus();
    }
  }, [externalId, campaign]);

  useEffect(() => {
    if (!baseAds.length) {
      setAdsData([]);
      return;
    }

    if (!statusList.length) {
      setAdsData(baseAds);
      return;
    }

    const finalAds = baseAds.map((ad) => {
      const found = statusList.find((a: TaboolaStatus) => a.id === ad.id_ads_taboola);
      return { ...ad, status: found?.is_active ?? false };
    });
    setAdsData(finalAds);
  }, [baseAds, statusList]);

  if (loading) {
    return (
      <div className="mt-56">
        <Loading text="Os anúncios estão sendo carregados!" fullscreen={false} />
      </div>
    );
  }

  if (adsData.length === 0) {
    return (
      <p className="text-center font-title text-lg text-main mt-giga-large">
        Nenhum anúncio encontrado.
      </p>
    );
  }

  return (
    <>
      {adsData.map((ad) => (
        <AdsCard
          key={ad.id_ads_taboola}
          campaignId={campaignId}
          externalId={externalId}
          nomeCampanha={ad.campaign_name || "Campanha"}
          adData={ad}
        />
      ))}
    </>
  );
}

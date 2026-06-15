"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMetaCampaignContext } from "@/context/MetaCampaignContext";
import { MetaAdModel } from "@/models/meta-ad-model";
import {
  loadMetaAdsSummaryAction,
  loadMetaAdsConfigAction,
} from "../../../components/metaCampaignActions";
import MetaAdCard from "../../../components/metaAdCard";
import Loading from "@/components/Loading";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { OptimizationData } from "@/models/optimization-data";

type MetaSummaryPayload = Partial<Record<keyof OptimizationData, unknown>>;

type MetaAdMetricPayload = {
  id_ad?: unknown;
  summary?: MetaSummaryPayload;
};

type MetaAdConfigPayload = {
  id?: unknown;
  name?: string;
  status?: string;
  effective_status?: string;
  adset_id?: string;
  creative?: {
    thumbnail_url?: string;
    title?: string;
    body?: string;
  };
};

function normalizeSummary(raw?: MetaSummaryPayload): OptimizationData | undefined {
  if (!raw) return undefined;

  return {
    revenue: Number(raw.revenue) || 0,
    expenses: Number(raw.expenses) || 0,
    clicks: Number(raw.clicks) || 0,
    checkout: Number(raw.checkout) || 0,
    sales: Number(raw.sales) || 0,
    cpc: Number(raw.cpc) || 0,
    cpa: Number(raw.cpa) || 0,
    vcpm: Number(raw.vcpm) || 0,
    vctr: Number(raw.vctr) || 0,
    roas: Number(raw.roas) || 0,
  };
}

function getSummaryMetric(summary: MetaAdModel["summary"], metric: string) {
  if (!summary) return 0;
  if (metric === "roas") {
    return summary.expenses > 0 ? summary.revenue / summary.expenses : 0;
  }
  if (!(metric in summary)) return 0;

  const value = summary[metric as keyof OptimizationData];
  return typeof value === "number" ? value : 0;
}

const AdsPageClient = () => {
  const params = useParams();
  const campaignId = params.id as string;
  const externalId = params.external_id as string;

  const [ads, setAds] = useState<MetaAdModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedSideDate, searchTerm, selectedMetric, orderDirection } =
    useMetaCampaignContext();

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsResult, configResult] = await Promise.all([
          CallerWrapper(
            loadMetaAdsSummaryAction(campaignId, selectedSideDate as number)
          ),
          loadMetaAdsConfigAction(externalId),
        ]);
        const metricsArray: MetaAdMetricPayload[] =
          metricsResult.success && Array.isArray(metricsResult.data)
            ? metricsResult.data
            : [];

        const configArray: MetaAdConfigPayload[] =
          configResult.success && Array.isArray(configResult.data)
            ? configResult.data
            : [];

        const merged: MetaAdModel[] = configArray.map((cfg) => {
          const metric = metricsArray.find(
            (m) => String(m.id_ad) === String(cfg.id)
          );
          const summary = normalizeSummary(metric?.summary);
          return {
            id: String(cfg.id),
            name: cfg.name ?? "",
            status: cfg.status ?? "",
            effective_status: cfg.effective_status,
            adset_id: cfg.adset_id ?? "",
            thumbnail: cfg.creative?.thumbnail_url,
            title: cfg.creative?.title,
            body: cfg.creative?.body,
            summary,
          };
        });
        setAds(merged);
      } catch (err) {
        setError("Erro ao carregar ads: " + err);
        setAds([]);
      }
      setLoading(false);
    };

    fetchAds();
  }, [campaignId, externalId, selectedSideDate]);

  const handleAdUpdate = (adId: string, updates: Partial<MetaAdModel>) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, ...updates } : a))
    );
  };

  const filteredAds = useMemo(() => {
    return ads
      .filter((a) => {
        const term = searchTerm.toLowerCase();
        return (
          a.name.toLowerCase().includes(term) ||
          (a.title && a.title.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        const metricA =
          getSummaryMetric(a.summary, selectedMetric);

        const metricB =
          getSummaryMetric(b.summary, selectedMetric);

        return orderDirection === "desc" ? metricB - metricA : metricA - metricB;
      });
  }, [ads, searchTerm, selectedMetric, orderDirection]);

  if (loading)
    return (
      <div className="mt-56">
        <Loading text="Os ads estão sendo carregados!" fullscreen={false} />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <>
      {filteredAds.length === 0 && <div>Nenhum ad encontrado.</div>}
      {filteredAds.map((ad) => (
        <MetaAdCard key={ad.id} ad={ad} onUpdate={handleAdUpdate} />
      ))}
    </>
  );
};

export default AdsPageClient;

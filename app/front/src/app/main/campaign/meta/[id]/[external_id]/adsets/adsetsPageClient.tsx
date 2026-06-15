"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMetaCampaignContext } from "@/context/MetaCampaignContext";
import { MetaAdsetModel } from "@/models/meta-adset-model";
import {
  loadMetaAdsetsSummaryAction,
  loadMetaAdsetsConfigAction,
} from "../../../components/metaCampaignActions";
import MetaAdsetRow from "../../../components/metaAdsetRow";
import Loading from "@/components/Loading";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { OptimizationData } from "@/models/optimization-data";

type MetaSummaryPayload = Partial<Record<keyof OptimizationData, unknown>>;

type MetaAdsetMetricPayload = {
  id_ad_set?: unknown;
  summary?: MetaSummaryPayload;
};

type MetaAdsetConfigPayload = {
  id?: unknown;
  name?: string;
  status?: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  bid_amount?: string;
  bid_strategy?: string;
  optimization_goal?: string;
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

function getSummaryMetric(summary: MetaAdsetModel["summary"], metric: string) {
  if (!summary) return 0;
  if (metric === "roas") {
    return summary.expenses > 0 ? summary.revenue / summary.expenses : 0;
  }
  if (!(metric in summary)) return 0;

  const value = summary[metric as keyof OptimizationData];
  return typeof value === "number" ? value : 0;
}

const AdsetsPageClient = () => {
  const params = useParams();
  const campaignId = params.id as string;
  const externalId = params.external_id as string;

  const [adsets, setAdsets] = useState<MetaAdsetModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedSideDate, searchTerm, selectedMetric, orderDirection } =
    useMetaCampaignContext();

  useEffect(() => {
    const fetchAdsets = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsResult, configResult] = await Promise.all([
          CallerWrapper(
            loadMetaAdsetsSummaryAction(campaignId, selectedSideDate as number)
          ),
          loadMetaAdsetsConfigAction(externalId),
        ]);

        const metricsArray: MetaAdsetMetricPayload[] =
          metricsResult.success && Array.isArray(metricsResult.data)
            ? metricsResult.data
            : [];

        const configArray: MetaAdsetConfigPayload[] =
          configResult.success && Array.isArray(configResult.data)
            ? configResult.data
            : [];

        // Merge: config is the base (has all adsets from Meta), metrics overlay
        const merged: MetaAdsetModel[] = configArray.map((cfg) => {
          const metric = metricsArray.find(
            (m) => String(m.id_ad_set) === String(cfg.id)
          );
          const summary = normalizeSummary(metric?.summary);
          return {
            id: String(cfg.id),
            name: cfg.name ?? "",
            status: cfg.status,
            effective_status: cfg.effective_status,
            daily_budget: cfg.daily_budget,
            lifetime_budget: cfg.lifetime_budget,
            bid_amount: cfg.bid_amount,
            bid_strategy: cfg.bid_strategy,
            optimization_goal: cfg.optimization_goal,
            summary,
          };
        });
        setAdsets(merged);
      } catch (err) {
        setError("Erro ao carregar adsets: " + err);
        setAdsets([]);
      }
      setLoading(false);
    };

    fetchAdsets();
  }, [campaignId, externalId, selectedSideDate]);

  const handleAdsetUpdate = (
    adsetId: string,
    updates: Partial<MetaAdsetModel>
  ) => {
    setAdsets((prev) =>
      prev.map((a) => (a.id === adsetId ? { ...a, ...updates } : a))
    );
  };

  const filteredAdsets = useMemo(() => {
    return adsets
      .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const metricA =
          getSummaryMetric(a.summary, selectedMetric);

        const metricB =
          getSummaryMetric(b.summary, selectedMetric);

        return orderDirection === "desc" ? metricB - metricA : metricA - metricB;
      });
  }, [adsets, searchTerm, selectedMetric, orderDirection]);

  if (loading)
    return (
      <div className="mt-56">
        <Loading text="Os adsets estão sendo carregados!" fullscreen={false} />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <>
      {filteredAdsets.length === 0 && <div>Nenhum adset encontrado.</div>}
      {filteredAdsets.map((adset) => (
        <MetaAdsetRow
          key={adset.id}
          adset={adset}
          onUpdate={handleAdsetUpdate}
        />
      ))}
    </>
  );
};

export default AdsetsPageClient;

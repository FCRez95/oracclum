"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { loadCampaignSitesAction } from "../../../components/campaignActions";
import SiteRow from "../../../components/siteRow";
import { CampaignSiteSummaryModel } from "@/models/campaign-sites-summary";
import { useCampaignContext } from "@/context/CampaignContext";
import { TargetSite } from "@/models/campaign-taboola-data";
import { OptimizationData } from "@/models/optimization-data";
import Loading from "@/components/Loading";
import { CallerWrapper } from "@/utils/CallerWrapper";

function getSummaryMetric(summary: OptimizationData, metric: string) {
    if (metric === "roas") {
        return summary.expenses > 0 ? summary.revenue / summary.expenses : 0;
    }

    if (!(metric in summary)) return 0;

    const value = summary[metric as keyof OptimizationData];
    return typeof value === "number" ? value : 0;
}

const ClientSite = () => {
    const params = useParams();
    const campaignId = params.id as string;
    const externalId = params.external_id as string;

    const [sites, setSites] = useState<CampaignSiteSummaryModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { taboolaData, setTaboolaData, selectedTabDates, selectedSideDate, searchTerm, selectedMetric, orderDirection, campaign } = useCampaignContext();

    useEffect(() => {
        const fetchSites = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await CallerWrapper(
                    loadCampaignSitesAction(campaignId, selectedSideDate as number)
                );
                if (!result.success) {
                    setError("Erro ao carregar sites.");
                    setSites([]);
                } else {
                    const loadedSites = result.data;
                    setSites(loadedSites);
                }
            } catch (error) {
                setError("Erro: " + error);
                setSites([]);
            }
            setLoading(false);
        };
        fetchSites();

    }, [campaignId, selectedSideDate]);

    const sitesMounted = useMemo(() => {
        if (taboolaData && sites) {
            return sites.map((site: CampaignSiteSummaryModel) => {
                const siteBid = taboolaData.publisher_bid_modifier?.find(
                    (element: TargetSite) => element.target === site.target
                );
                const isActive = !(
                    taboolaData?.publisher_targeting &&
                    taboolaData?.publisher_targeting?.includes(site.target)
                );

                const bid = siteBid ? siteBid.cpc_modification : 1;
                return {
                    ...site,
                    bid: bid * (taboolaData.cpc as number),
                    is_active: isActive,
                };
            });
        }
    }, [taboolaData, sites]);

    if (loading) return <div className="mt-56"><Loading text="Os sites estão sendo carregados!" fullscreen={false} /></div>;
    if (error) return <div>{error}</div>;

    const filteredSites = sitesMounted && sitesMounted
    .filter((c) => c.site.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const metricA = getSummaryMetric(a.summary, selectedMetric);
      const metricB = getSummaryMetric(b.summary, selectedMetric);

      return orderDirection === "desc" ? metricB - metricA : metricA - metricB;
    });

    return (
        <>
            {filteredSites && filteredSites.length === 0 && <div>Nenhum site encontrado.</div>}
            {campaign && filteredSites && filteredSites.map((site: CampaignSiteSummaryModel, i: number) => (
                <SiteRow key={site.id_site ?? i} site={site} taboolaData={taboolaData} setTaboolaData={setTaboolaData} taboolaId={externalId} taboolaCpc={taboolaData?.cpc as number} selectedTabDates={selectedTabDates} selectedSideDate={selectedSideDate} campaign={campaign} />
            ))}
        </>
    );
};

export default ClientSite;

"use client"

import OperationInfo from "@/components/operationInfo";
import Toggle from "@/components/Toggle/Toggle";
import { CampaignSiteSummaryModel } from "@/models/campaign-sites-summary";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/Icon/iconComponent";
import { CampaignTaboolaData } from "@/models/campaign-taboola-data";
import { ChevronDown, ChevronRight, Info, Loader } from "lucide-react";
import { loadOneSiteAction, loadSiteStepsSummaryAction, updateTaboolaCampaignDataAction } from "./campaignActions";
import { OptimizationData } from "@/models/optimization-data";
import { SiteStepsSummary } from "@/models/site-steps-summary";
import SiteStepFunnel from "./siteStepFunnel";
import SiteStepFunnelPreview from "./SiteStepFunnelPreview";
import Loading from "@/components/Loading";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";

type SiteRowProps = {
    site: CampaignSiteSummaryModel;
    taboolaData: CampaignTaboolaData | null | undefined;
    setTaboolaData: (data: CampaignTaboolaData) => void;
    taboolaId: string;
    taboolaCpc: number;
    selectedTabDates: number[];
    selectedSideDate: number | string;
    campaign: CampaignOptimizationModel;
};

const designLayout = false  // true = period outside border, false = period inside border

const getPeriodLabel = (days: number | string) => {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days === 720 || days === 100000) return "All time";

    return `${days} days`;
};

const emptyOptimizationData: OptimizationData = {
    revenue: 0,
    expenses: 0,
    cpc: 0,
    vcpm: 0,
    cpa: 0,
    vctr: 0,
    clicks: 0,
    checkout: 0,
    sales: 0,
    roas: 0
};

export default function SiteRow({ site, taboolaData, setTaboolaData, taboolaId, taboolaCpc = 1, selectedTabDates, selectedSideDate, campaign }: SiteRowProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const [showEdit, setShowEdit] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [dateSummaries, setDateSummaries] = useState<Record<number, OptimizationData | null>>({});
    const [dateStepSummaries, setDateStepSummaries] = useState<Record<number, SiteStepsSummary | null>>({});
    const [dateLoadingMap, setDateLoadingMap] = useState<Record<number, boolean>>({});
    const [siteSteps, setSiteSteps] = useState<SiteStepsSummary>();
    const [loadingSteps, setLoadingSteps] = useState(false);
    const [percentInput, setPercentInput] = useState<number>(
        site.bid !== undefined && taboolaCpc
            ? Number((((site.bid / taboolaCpc) - 1) * 100).toFixed(0))
            : 0
    );

    const percentBid = (1 - ((site.bid as number) / taboolaCpc));
    const newCpc = taboolaCpc * (1 + percentInput / 100);

    const handleSaveNewBid = async () => {
        setLoadingEdit(true);
        const cpc_modification = 1 + percentInput / 100;

        const safeModifiers = taboolaData?.publisher_bid_modifier ?? [];
        const filtered = safeModifiers.filter(mod => mod.target !== site.target);
        const newBidModifiers = [...filtered, { target: site.target, cpc_modification }];

        try {
            const res = await updateTaboolaCampaignDataAction(taboolaId, {
                publisher_bid_modifier: {
                    values: [...newBidModifiers]
                }
            }, campaign?.sub_account as string);
            if (!res.success && res.errors?.general?.[0] === "401") {
                window.location.reload();
                return;
            }
            setTaboolaData({
                ...taboolaData as CampaignTaboolaData,
                publisher_bid_modifier: newBidModifiers
            });
            setShowEdit(false);
        } catch (error) {
            alert("Erro de comuicação com a Taboola:");
            console.error("Erro ao atualizar bidModifiers:", error);
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleToggleActive = async () => {
        setToggleLoading(true);
        const newActive = !site.is_active;

        let newExcluded: string[] = [];
        if (newActive) {
            newExcluded = (taboolaData?.publisher_targeting ?? []).filter(
                (target: string) => target !== site.target
            );
        } else {
            newExcluded = [...(taboolaData?.publisher_targeting ?? []), site.target];
        }
        
        try {
            await updateTaboolaCampaignDataAction(taboolaId, {
                publisher_targeting: {
                    type: "EXCLUDE",
                    value: newExcluded
                }
            }, campaign?.sub_account as string);
            setTaboolaData({
                ...taboolaData as CampaignTaboolaData,
                publisher_targeting: newExcluded
            });;
        } catch (error) {
            console.error("Erro ao atualizar publisher_targeting:", error);
        } finally {
            setToggleLoading(false);
        }
    };

    const handleExpand = async () => {
        setExpanded((prev) => !prev);

        if (!expanded) {
            setLoadingSteps(true);
            try {
                const res = await CallerWrapper(
                    loadSiteStepsSummaryAction(site.id_campaign, site.id_site, selectedSideDate as number)
                );
                setSiteSteps(res.data);
            } catch (error) {
                console.error("Erro ao carregar site steps summary:", error);
            }
            setLoadingSteps(false);
        }
    };

    useEffect(() => {
        if (!expanded || selectedTabDates.length === 0) {
            setDateSummaries({});
            setDateStepSummaries({});
            setDateLoadingMap({});
            return;
        }

        let mounted = true;

        setDateSummaries({});
        setDateStepSummaries({});
        setDateLoadingMap(
            selectedTabDates.reduce<Record<number, boolean>>((acc, days) => {
                acc[days] = true;
                return acc;
            }, {})
        );

        async function fetchDates() {
            for (const days of selectedTabDates) {
                const [summaryResult, stepsResult] = await Promise.allSettled([
                    CallerWrapper(loadOneSiteAction(site.id_campaign, site.id_site, days)),
                    CallerWrapper(loadSiteStepsSummaryAction(site.id_campaign, site.id_site, days))
                ]);

                if (!mounted) return;

                setDateSummaries((prev) => ({
                    ...prev,
                    [days]: summaryResult.status === "fulfilled"
                        ? summaryResult.value?.data?.summary ?? summaryResult.value?.data ?? emptyOptimizationData
                        : null
                }));

                setDateStepSummaries((prev) => ({
                    ...prev,
                    [days]: stepsResult.status === "fulfilled" ? stepsResult.value?.data ?? null : null
                }));

                setDateLoadingMap((prev) => ({
                    ...prev,
                    [days]: false
                }));
            }
        }

        fetchDates();

        return () => {
            mounted = false;
        };
    }, [expanded, selectedTabDates, site.id_campaign, site.id_site]);

    return (
        <div className="flex gap-small items-start w-[1100px] 2xl:w-full">
            <div className="flex gap-0 items-start w-full">
                {/* Botão vertical */}
                <div className="flex flex-col justify-center">
                    <button
                        className="h-full min-h-[53px] w-10 flex items-center justify-center rounded-l-lg border-2 border-bg-alt-primary border-r-0 bg-bg-alt-primary hover:bg-bg-primary-hover transition cursor-pointer"
                        onClick={handleExpand}
                        title={expanded ? "Recolher" : "Expandir"}
                    >
                        <ChevronDown
                            size={24}
                            className={`transition-transform text-text-alt-main ${expanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
                {/* Card do site */}
                <div className="relative rounded-2xl rounded-tl-none shadow-md shadow-text-main/25 dark:shadow-none bg-bg-card p-small w-full">
                    <div className="flex flex-row w-full items-center gap-2">
                        <h2 className="font-semibold flex items-center">
                            {site.site ?? "Site"}
                            {/* Botão preview ao lado do nome */}
                            <button
                                className="ml-2 p-1 rounded hover:bg-bg-primary/10 transition hover:cursor-pointer"
                                onClick={async () => {
                                    if (!showPreview && !siteSteps) {
                                        setLoadingPreview(true);
                                        try {
                                            const res = await loadSiteStepsSummaryAction(site.id_campaign, site.id_site, selectedSideDate as number);
                                            setSiteSteps(res.data);
                                        } catch (error) {
                                            console.error("Erro ao carregar site steps summary (preview):", error);
                                        }
                                        setLoadingPreview(false);
                                    }
                                    setShowPreview((prev) => !prev);
                                }}
                                title={showPreview ? "Fechar preview" : "Abrir preview"}
                            >
                                {loadingPreview ? (
                                    <svg className="animate-spin h-[18px] w-[18px] text-primary" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                ) : (
                                    <ChevronRight
                                        size={18}
                                        className={`text-primary transition-transform ${showPreview ? "rotate-90" : ""}`}
                                    />
                                )}
                            </button>
                            {/* Preview inline */}
                            {showPreview && (
                                <div className="ml-2">
                                    {loadingPreview || !siteSteps ? (
                                        <Loading text="Carregando preview..." fullscreen={false} />
                                    ) : (
                                        <SiteStepFunnelPreview data={siteSteps} conversoes={siteSteps.sales ?? 0} />
                                    )}
                                </div>
                            )}
                        </h2>
                    </div>
                    <div className="h-[2px] bg-bg-card my-extra-small" />
                    {designLayout ? (
                        <div className="mt-extra-small flex gap-0 items-center">
                            <span className="rounded-full bg-bg-navbar text-text-primary p-small z-10 relative">
                                {getPeriodLabel(selectedSideDate)}
                            </span>
                            <div className="-ml-[55px] border-2 border-l-0 border-bg-primary rounded-full pl-[65px] pr-small p-[6px] flex flex-1 justify-between items-center">
                                <OperationInfo data={site.summary} allInfo={true} horizontalLayout={true} designStyle={designLayout} />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-extra-small flex">
                            <div className="border-2 border-bg-primary rounded-full pr-small flex w-full">
                                <span className="rounded-full bg-bg-black text-text-primary p-small z-10 relative mr-extra-small right-[10px] md:right-0">
                                    {getPeriodLabel(selectedSideDate)}
                                </span>
                                <OperationInfo data={site.summary} allInfo={true} horizontalLayout={true} designStyle={designLayout} />
                            </div>
                        </div>
                    )}
                    {expanded && (
                        <div className="mt-small flex flex-col gap-extra-small">
                            {/* SiteStepFunnel fixo ao expandir */}
                            {!loadingSteps && siteSteps && (
                                <div className="py-extra-small hidden md:block">
                                    <SiteStepFunnel data={siteSteps} conversoes={siteSteps.sales ?? 0} />
                                </div>
                            )}
                            {selectedTabDates.map(days => {
                                const isLoading = dateLoadingMap[days];
                                const summary = dateSummaries[days];
                                const stepSummary = dateStepSummaries[days];

                                return (
                                <div key={days} className="flex gap-small items-center justify-center text-xs">
                                    <div className="relative group hidden md:flex items-center">
                                        <button
                                            type="button"
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-bg-primary bg-bg-card text-text-primary transition hover:bg-bg-primary/10"
                                            aria-label={`Visualizar funil de ${getPeriodLabel(days)}`}
                                        >
                                            <Info size={16} />
                                        </button>
                                        <div className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-2 w-max max-w-[420px] rounded-xl border border-bg-primary bg-bg-card p-small opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                            {isLoading ? (
                                                <div className="flex items-center gap-extra-small text-xs text-text-main">
                                                    <Loader size={14} className="animate-spin" />
                                                    Carregando funil...
                                                </div>
                                            ) : stepSummary ? (
                                                <SiteStepFunnelPreview
                                                    data={stepSummary}
                                                    conversoes={stepSummary.sales ?? 0}
                                                />
                                            ) : (
                                                <div className="text-center text-xs text-text-main">
                                                    Funil indisponível para este período
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-full border bg-bg-card text-text-primary p-extra-small border-bg-primary font-semibold w-[90px] text-center">
                                        {getPeriodLabel(days)}
                                    </div>
                                    {isLoading ? (
                                        <div className="flex flex-grow items-center justify-center gap-extra-small py-small text-sm text-text-main/50">
                                            <Loader className="animate-spin" size={16} />
                                            Carregando...
                                        </div>
                                    ) : summary !== null && summary !== undefined ? (
                                        <OperationInfo
                                            data={summary}
                                            allInfo={true}
                                            horizontalLayout={true}
                                        />
                                    ) : (
                                        <div className="flex flex-grow items-center justify-center py-small text-sm text-text-main/50">
                                            Informações indisponíveis para este período
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* Edit Cpc */}
            {!showEdit ? (
                <div className="rounded-lg border-2 bg-bg-card border-bg-primary p-small flex flex-col items-center justify-center min-w-[120px]">
                    {toggleLoading ? (
                        <Loader className="animate-spin text-text-main flex-shrink-0" size={20} />
                    ) : (
                        <Toggle
                            size="small"
                            isOn={site.is_active ?? false}
                            onToggle={handleToggleActive}
                        />
                    )}
                    <span className="text-text-main font-semibold mt-1">
                        {site.bid === undefined ? "..." : (
                            <span
                                className="cursor-pointer"
                                onClick={() => setShowEdit(true)}
                            >
                                ${(site.bid).toFixed(3)}
                            </span>
                        )}
                    </span>
                    {/* Percentual */}
                    {site.bid !== undefined && (
                        percentBid > 0 ? (
                            <span
                                className="cursor-pointer text-text-error"
                                onClick={() => setShowEdit(true)}
                            >
                                (-{(percentBid * 100).toFixed(0)}%)
                            </span>
                        ) : percentBid === 0 ? (
                            <span
                                className="cursor-pointer"
                                onClick={() => setShowEdit(true)}
                            >
                                (Default)
                            </span>
                        ) : (
                            <span
                                className="cursor-pointer text-text-success"
                                onClick={() => setShowEdit(true)}
                            >
                                (+{(percentBid * 100 * (-1)).toFixed(0)}%)
                            </span>
                        )
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border-2 bg-bg-card border-bg-primary p-small shadow-lg flex flex-col items-center justify-center min-w-[120px]"
                >
                    <span className="text-text-main text-small font-semibold">
                        Atual: ${(site.bid ?? 0).toFixed(3)}
                    </span>
                    <div className="flex flex-col items-center mt-extra-small">
                        <label className="text-text-main text-small mb-1">Percentual(%)</label>
                        <input
                            type="number"
                            value={percentInput}
                            onChange={e => setPercentInput(Number(e.target.value))}
                            className="border rounded px-2 py-1 w-[80px] text-center"
                        />
                        <span className="text-text-main text-small text-center mt-2">
                            Novo CPC: ${newCpc.toFixed(3)}
                        </span>
                    </div>
                    {loadingEdit ? (
                        <Loader className="animate-spin text-text-main flex-shrink-0" size={20} />
                    ) : (
                        <>
                            <div className="flex gap-small mt-extra-small">
                                <button
                                    onClick={() => setShowEdit(false)}
                                    title="Cancelar"
                                >
                                    <Icon type="close" size="medium" color="cancel" />
                                </button>
                                <button
                                    onClick={handleSaveNewBid}
                                    title="Salvar"
                                >
                                    <Icon type="check" size="medium" color="primary" />
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}

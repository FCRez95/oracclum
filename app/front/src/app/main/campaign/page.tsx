"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CampaignSummaryModel } from "@/models/campaign-summary";

import { loadUserCampaigns } from "@/app/(DataAccessLayer)/(appServices)/calls/loadUserCampaign/callLoadUserCampaignsApi";
import CampaignCard from "@/app/main/campaign/components/campaignCard";
import { CreateCampaignModal } from "@/app/main/campaign/components/CreateCampaign/createCampaignModal";
import MetaTokenRenewalModal from "@/app/main/campaign/components/MetaTokenRenewalModal";
import { checkMetaTokenExpiration } from "@/app/main/integration/integrationActions";
import { getUserPlanInfo } from "@/app/main/campaign/components/campaignActions";
import { getMaxCampaigns } from "@/constants/planLimits";

import SideBar from "@/components/Sidebar/sideBar";
import { Icon } from "@/components/Icon/iconComponent";
import OperationInfo from "@/components/operationInfo";
import { Button } from "@/components/Button/buttonComponent";
import { Modal } from "@/components/Modal/modalComponent";
import PeriodSelector from "@/components/PeriodSelector/PeriodSelector";
import FilterCard from "@/components/Sidebar/filterCard";
import Loading from "@/components/Loading";

import CampaignFilterForm from "./components/campaignFilterForm";
import { motion } from "framer-motion";
import { CallerWrapper } from "@/utils/CallerWrapper";

import { useRouter } from "next/navigation";

const campaignMetricGetters: Record<string, (campaign: CampaignSummaryModel) => number> = {
  id: (campaign) => campaign.id,
  expenses: (campaign) => campaign.expenses,
  revenue: (campaign) => campaign.revenue,
  clicks: (campaign) => campaign.clicks,
  checkout: (campaign) => campaign.checkout,
  sales: (campaign) => campaign.sales,
  roas: (campaign) =>
    campaign.expenses > 0 ? campaign.revenue / campaign.expenses : 0,
};

function getCampaignMetric(campaign: CampaignSummaryModel, metric: string) {
  return campaignMetricGetters[metric]?.(campaign) ?? 0;
}

const CampaignsOverview = () => {
  const [campaigns, setCampaigns] = useState<CampaignSummaryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<number | string>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("id");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [horizontalLayout, setHorizontalLayout] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [tokenExpiryInfo, setTokenExpiryInfo] = useState<{
    daysUntilExpiry?: number;
    isExpired?: boolean;
  }>({});
  const [planInfo, setPlanInfo] = useState<{ user_type: string; allow_clicks: boolean }>({ user_type: "", allow_clicks: false });
  const filterRef = useRef<HTMLDivElement>(null);
  const periodSelectorRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<string | number>(
    "auto"
  );

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    //const controller = new AbortController();

    const fetchCampaigns = async () => {
      try {
        const baseCampaigns = await CallerWrapper(
          loadUserCampaigns(undefined, dates)
        );
        setCampaigns(baseCampaigns);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as Error & { name?: string; message?: string };
        if (
          error.name === "AbortError" ||
          error.message?.includes("signal is aborted")
        )
          return;
      }
    };

    fetchCampaigns();

    //return () => controller.abort();
  }, [dates]);

  useEffect(() => {
    getUserPlanInfo()
      .then(setPlanInfo)
      .catch(() => {});
  }, []);

  useEffect(() => {
    checkMetaTokenExpiration().then((result) => {
      if (result.connected && result.needsRenewal) {
        setTokenExpiryInfo({
          daysUntilExpiry: result.daysUntilExpiry,
          isExpired: result.isExpired,
        });
        setIsRenewalModalOpen(true);
      }
    });
  }, []);

  const filteredCampaigns = campaigns
    .filter((c) => selectedProvider === "all" || c.ad_provider === selectedProvider)
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const metricA = getCampaignMetric(a, selectedMetric);
      const metricB = getCampaignMetric(b, selectedMetric);

      return orderDirection === "desc" ? metricB - metricA : metricA - metricB;
    });

  const totals = filteredCampaigns.reduce(
    (acc, campaign) => {
      acc.expenses += campaign.expenses;
      acc.revenue += campaign.revenue;
      acc.clicks += campaign.clicks;
      acc.checkout += campaign.checkout;
      acc.sales += campaign.sales;
      return acc;
    },
    { expenses: 0, revenue: 0, clicks: 0, checkout: 0, sales: 0 }
  );

  const handleCampaignCreated = useCallback(
    (
      newCampaign:
        | {
          id: number;
          name: string;
          id_user: number;
          ad_provider: string;
          checkout_provider: string;
          link: string;
          sub_account?: string;
          click_auth: string;
          external_id: string;
        }
        | undefined
    ) => {
      if (!newCampaign) return;
      setCampaigns((prev) => [
        ...prev,
        {
          id: newCampaign.id,
          id_user: newCampaign.id_user,
          ad_provider: newCampaign.ad_provider || "",
          checkout_provider: newCampaign.checkout_provider || "",
          name: newCampaign.name,
          link: newCampaign.link,
          sub_account: newCampaign.sub_account,
          click_auth: newCampaign.click_auth,
          external_id: newCampaign.external_id,
          expenses: 0,
          revenue: 0,
          clicks: 0,
          checkout: 0,
          sales: 0,
        },
      ]);
    },
    []
  );

  const handleCampaignDeleted = useCallback((deletedId: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== deletedId));
  }, []);

  const handleEdit = useCallback(
    (id: number, updates: Partial<CampaignSummaryModel>) => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const handleOpenCampaign = useCallback(
    (campaign: CampaignSummaryModel) => {
      if (campaign.ad_provider === "meta") {
        router.push(`/main/campaign/meta/${campaign.id}/${campaign.external_id}/adsets`);
      } else {
        router.push(`/main/campaign/${campaign.id}/${campaign.external_id}/ads`);
      }
    },
    [router]
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setHorizontalLayout(e.matches);
    };

    setHorizontalLayout(mq.matches);

    mq.addEventListener("change", handleChange);

    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const filterElement = filterRef.current;
    const periodSelectorElement = periodSelectorRef.current;

    if (!filterElement || !periodSelectorElement) return;

    const observer = new ResizeObserver(() => {
      if (showPeriodSelector) {
        setContainerHeight(periodSelectorElement.scrollHeight);
      }
    });

    if (showPeriodSelector) {
      setContainerHeight(periodSelectorElement.scrollHeight);
      observer.observe(periodSelectorElement);
    } else {
      setContainerHeight(filterElement.scrollHeight);
    }

    return () => {
      observer.disconnect();
    };
  }, [showPeriodSelector]);

  const { expenses: totalExpenses, revenue: totalRevenue } = totals;
  const totalRoas =
    totalExpenses > 0 ? (totalRevenue / totalExpenses) : 0;

  return (
    <div className="md:flex w-full grow overflow-auto overflow-x-hidden">
      <SideBar>
        <div className="flex md:pb-small md:pt-none pt-small items-center gap-small">
          <div className="hidden md:flex gap-small text-medium font-semibold text-text-main">
            <Icon
              type="calendar"
              size="large"
              color="secondary"
              onClickAction={() => setShowPeriodSelector(!showPeriodSelector)}
            />
          </div>

          <Button
            type="confirm"
            size="small"
            onClickAction={() => setIsModalOpen(true)}
          >
            Criar campanha
          </Button>

          <div className="flex md:hidden gap-small">
            <Icon
              type="calendar"
              size="large"
              color="secondary"
              onClickAction={() => setIsCalendarModalOpen(true)}
            />
            <Icon
              type="filter"
              size="large"
              color="secondary"
              onClickAction={() => setIsFilterModalOpen(true)}
            />
          </div>
        </div>

        <motion.div
          className="hidden md:flex relative overflow-hidden w-full mb-small"
          animate={{ height: containerHeight }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* FilterCard */}
          <motion.div
            className="absolute top-0 left-0 w-full"
            animate={{
              x: showPeriodSelector ? "-100%" : "0%",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            inert={showPeriodSelector ? true : undefined}
          >
            <div
              ref={filterRef}
              tabIndex={showPeriodSelector ? -1 : 0}
              style={{
                pointerEvents: showPeriodSelector ? "none" : "auto",
                visibility: showPeriodSelector ? "hidden" : "visible",
              }}
            >
              <FilterCard>
                <CampaignFilterForm
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedMetric={selectedMetric}
                  setSelectedMetric={setSelectedMetric}
                  orderDirection={orderDirection}
                  setOrderDirection={setOrderDirection}
                  selectedProvider={selectedProvider}
                  setSelectedProvider={setSelectedProvider}
                />
              </FilterCard>
            </div>
          </motion.div>

          {/* PeriodSelector */}
          <motion.div
            className="absolute top-0 left-0 w-full"
            animate={{
              x: showPeriodSelector ? "0%" : "100%",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            inert={!showPeriodSelector ? true : undefined}
          >
            <div
              ref={periodSelectorRef}
              tabIndex={!showPeriodSelector ? -1 : 0}
              style={{
                pointerEvents: !showPeriodSelector ? "none" : "auto",
                visibility: !showPeriodSelector ? "hidden" : "visible",
              }}
            >
              <PeriodSelector
                onClose={() => setShowPeriodSelector(false)}
                previousSelectedDates={dates}
                onSelect={(newSelectedDates) => {
                  setDates(newSelectedDates);
                  setShowPeriodSelector(false);
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        <OperationInfo
          data={{ ...totals, roas: totalRoas }}
          loading={loading}
          horizontalLayout={horizontalLayout}
        />
      </SideBar>

      <div className="flex flex-wrap w-full my-extra-small py-small px-default max-h-[83vh] md:max-h-none overflow-y-scroll gap-default justify-center" id="wrapper">
        {loading ? (
          <Loading text="Suas campanhas estão sendo carregadas." />
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex w-full h-screen justify-center mt-giga-large text-center text-text-secondary">
            <span className="font-title text-lg text-main">
              Nenhuma campanha foi encontrada.
            </span>
          </div>
        ) : ( <>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              {...campaign}
              onDeleted={handleCampaignDeleted}
              onEdited={handleEdit}
              onClick={() => handleOpenCampaign(campaign)}
            />
          ))}
        </> )}
      </div>

      <Modal isOpen={isModalOpen} onCloseAction={() => setIsModalOpen(false)}>
        <CreateCampaignModal
          onCloseAction={() => setIsModalOpen(false)}
          onCreatedAction={handleCampaignCreated}
          campaignCount={campaigns.length}
          maxCampaigns={getMaxCampaigns(planInfo.user_type)}
          allowClicks={planInfo.allow_clicks}
        />
      </Modal>

      <Modal isOpen={isFilterModalOpen} onCloseAction={() => setIsFilterModalOpen(false)} showCloseButton={true}>
        <FilterCard>
          <CampaignFilterForm
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            orderDirection={orderDirection}
            setOrderDirection={setOrderDirection}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
          />
        </FilterCard>
      </Modal>

      <Modal isOpen={isCalendarModalOpen} onCloseAction={() => setIsCalendarModalOpen(false)} showCloseButton={true}>
        <PeriodSelector
          onClose={() => setIsCalendarModalOpen(false)}
          previousSelectedDates={dates}
          onSelect={(newSelectedDates) => {
            setDates(newSelectedDates);
            setIsCalendarModalOpen(false);
          }}
        />
      </Modal>

      <Modal isOpen={isRenewalModalOpen} onCloseAction={() => setIsRenewalModalOpen(false)} borderType="muted">
        <MetaTokenRenewalModal
          daysUntilExpiry={tokenExpiryInfo.daysUntilExpiry}
          isExpired={tokenExpiryInfo.isExpired}
          onCloseAction={() => setIsRenewalModalOpen(false)}
        />
      </Modal>
    </div >
  );
};

export default CampaignsOverview;

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import SideBar from "@/components/Sidebar/sideBar";
import { loadCampaignOptimAction } from "@/app/main/campaign/components/campaignActions";
import { loadMetaCampaignDataAction } from "@/app/main/campaign/meta/components/metaCampaignActions";
import MetaSideInfo from "@/components/metaSideInfo";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import { MetaCampaignData } from "@/models/meta-campaign-data";
import OperationInfo from "@/components/operationInfo";
import { Icon } from "@/components/Icon/iconComponent";
import { motion } from "framer-motion";
import PeriodSelector from "@/components/PeriodSelector/PeriodSelector";
import TabButton from "../../../components/tabButton";
import TabDaysPicker from "@/components/PeriodSelector/tabDaysPicker";
import { MetaIntegrationModal } from "../../../components/MetaIntegrationTutorial/metaIntegrationModal";
import MetaCampaignContext from "@/context/MetaCampaignContext";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { Button } from "@/components/Button/buttonComponent";
import { Modal } from "@/components/Modal/modalComponent";
import FilterCard from "@/components/Sidebar/filterCard";
import CampaignFilterForm from "../../../components/campaignFilterForm";

const MetaCampaignLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id;
  const externalId = params.external_id;
  const hasAutoOpenedIntegration = useRef(false);

  const pickerRef = useRef<HTMLDivElement>(null);

  const [dates, setDates] = useState<number | string>(0);
  const [selectedTabDates, setSelectedTabDates] = useState<number[]>([0, 1, 3, 7]);
  const [campaign, setCampaign] = useState<CampaignOptimizationModel>();
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [metaData, setMetaData] = useState<MetaCampaignData>();
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [showFilterSelector, setShowFilterSelector] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [horizontalLayout, setHorizontalLayout] = useState(false);
  const [showTabPeriodSelector, setShowTabPeriodSelector] = useState(false);
  const metaSideInfoRef = useRef<HTMLDivElement>(null);
  const periodSelectorRef = useRef<HTMLDivElement>(null);
  const filterSelectorRef = useRef<HTMLDivElement>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<string>("id");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [editMeta, setEditMeta] = useState(false);
  const [containerHeight, setContainerHeight] = useState<string | number>("auto");
  const DefaultDates = [0, 1, 3, 7, 15, 30, 60, 90, 100000];

  const fetchMeta = async (extId: string) => {
    const result = await loadMetaCampaignDataAction(extId);
    if (result.success && result.data) {
      setMetaData({
        status: result.data.status,
        effective_status: result.data.effective_status,
        issues_info: result.data.issues_info,
        objective: result.data.objective,
        daily_budget: result.data.daily_budget,
        lifetime_budget: result.data.lifetime_budget,
        buying_type: result.data.buying_type,
      });
    }
  };


  useEffect(() => {
    setCampaignLoading(true);
    const fetchCampaign = async () => {
      const result = await CallerWrapper(
        loadCampaignOptimAction(Number(campaignId), dates as number)
      );
      if (result.success) {
        setCampaign(result.data);
      } else throw new Error("Erro ao buscar dados da campanha");
      setCampaignLoading(false);
    };
    fetchCampaign();
  }, [campaignId, dates]);

  useEffect(() => {
    if (externalId) {
      fetchMeta(externalId as string);
    }
  }, [externalId]);

  useEffect(() => {
    if (searchParams.get("showIntegration") !== "1") return;
    if (hasAutoOpenedIntegration.current) return;

    hasAutoOpenedIntegration.current = true;
    setShowIntegrationModal(true);
    router.replace(pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowTabPeriodSelector(false);
      }
    }
    if (showTabPeriodSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTabPeriodSelector]);

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
    const periodSelectorElement = periodSelectorRef.current;
    const metaSideInfoElement = metaSideInfoRef.current;
    const filterSelectorElement = filterSelectorRef.current;

    if (!periodSelectorElement || !metaSideInfoElement || !filterSelectorElement) return;

    const observer = new ResizeObserver(() => {
      if (showPeriodSelector) {
        setContainerHeight(periodSelectorElement.scrollHeight);
      }
    });

    if (showPeriodSelector) {
      setContainerHeight(periodSelectorElement.scrollHeight);
      observer.observe(periodSelectorElement);
    } else if (showFilterSelector) {
      setContainerHeight(filterSelectorElement.scrollHeight);
    } else {
      setContainerHeight(metaSideInfoElement.scrollHeight);
    }

    return () => {
      observer.disconnect();
    };
  }, [showPeriodSelector, showFilterSelector, editMeta]);

  return (
    <div className="md:flex w-full grow overflow-auto overflow-x-hidden">
      <SideBar>
        <h2 className="hidden md:block font-bold text-xl text-center max-w-80 line-clamp-2">
          {campaign ? campaign.name : "Carregando..."}
        </h2>

        <div className="hidden w-full md:flex gap-small justify-center md:my-small">
          <div className="flex gap-extra-small items-center cursor-pointer" onClick={() => {
            setShowFilterSelector(false);
            setShowPeriodSelector(!showPeriodSelector);
          }}>
            <Icon type="calendar" size="medium" color="secondary" />
            <span>
              {dates === 100000 || dates === 720
                ? "Vitalício"
                : dates === 0
                  ? "Hoje"
                  : dates === 1
                    ? "Ontem"
                    : `${dates} dias`}
            </span>
          </div>

          {(pathname.includes("adsets") || pathname.endsWith("/ads")) && (
            <div className="flex gap-extra-small items-center cursor-pointer" onClick={() => {
              setShowPeriodSelector(false);
              setShowFilterSelector(!showFilterSelector);
            }}>
              <Icon type="filter" size="medium" color="secondary" />
              <span>Filtrar</span>
            </div>
          )}
        </div>

        <div className="flex md:hidden w-full items-center pt-small justify-around">
          <div className="flex gap-extra-small items-center">
            <Icon
              type="calendar"
              size="large"
              color="secondary"
              onClickAction={() => setIsCalendarModalOpen(true)}
            />
            <span>
              {dates === 100000 || dates === 720
                ? "Vitalício"
                : dates === 0
                  ? "Hoje"
                  : dates === 1
                    ? "Ontem"
                    : `${dates} dias`}
            </span>
          </div>
        </div>

        <motion.div
          className="hidden md:flex relative overflow-hidden w-full mb-small"
          animate={{ height: containerHeight }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* MetaSideInfo */}
          <motion.div
            className="absolute top-0 left-0 w-full"
            animate={{
              x: showPeriodSelector || showFilterSelector ? "-100%" : "0%",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            inert={showPeriodSelector || showFilterSelector ? true : undefined}
          >
            <div
              tabIndex={showPeriodSelector || showFilterSelector ? -1 : 0}
              ref={metaSideInfoRef}
              style={{
                pointerEvents: showPeriodSelector || showFilterSelector ? "none" : "auto",
                visibility: showPeriodSelector || showFilterSelector ? "hidden" : "visible",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <MetaSideInfo
                daily_budget={metaData?.daily_budget}
                status={metaData?.status}
                effective_status={metaData?.effective_status}
                issues_info={metaData?.issues_info}
                objective={metaData?.objective}
                loading={!metaData}
                edit={editMeta}
                externalId={externalId as string}
                setEditMeta={setEditMeta}
                metaData={metaData}
                setMetaData={setMetaData}
              />
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
              tabIndex={!showPeriodSelector ? -1 : 0}
              ref={periodSelectorRef}
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

          {/* FilterSelector */}
          <motion.div
            className="absolute top-0 left-0 w-full"
            animate={{
              x: showFilterSelector ? "0%" : "100%",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            inert={!showFilterSelector ? true : undefined}
          >
            <div
              tabIndex={!showFilterSelector ? -1 : 0}
              ref={filterSelectorRef}
              style={{
                pointerEvents: !showFilterSelector ? "none" : "auto",
                visibility: !showFilterSelector ? "hidden" : "visible",
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
                />
              </FilterCard>
            </div>
          </motion.div>
        </motion.div>

        <OperationInfo
          data={campaign?.summary}
          allInfo={true}
          horizontalLayout={horizontalLayout}
          loading={campaignLoading}
        />

        <h2 className="flex md:hidden font-bold text-xl text-center max-w-80 line-clamp-2 mb-extra-small">
          {campaign ? campaign.name : "Carregando..."}
        </h2>
      </SideBar>

      <div className="flex flex-col w-full py-small px-default gap-small z-10 bg-bg-app">
        <div className="flex w-full justify-between">
          <div className="flex gap-3">
            <TabButton href={`/main/campaign/meta/${campaignId}/${externalId}/adsets`}> Adsets </TabButton>
            <TabButton href={`/main/campaign/meta/${campaignId}/${externalId}/ads`}> Ads </TabButton>
            <TabButton href={`/main/campaign/meta/${campaignId}/${externalId}/funis`}> Funis </TabButton>
          </div>

          <div className="relative flex items-center gap-small">
            <div className="hidden md:block">
              <Button type="confirm" size="small" onClickAction={() =>
                setShowIntegrationModal(!showIntegrationModal)}>
                Integração
                <Icon type="integration" size="medium" color="secondary" />
              </Button>
            </div>
            <Icon type="calendar" size="medium" color="secondary" onClickAction={() => setShowTabPeriodSelector(!showTabPeriodSelector)} />
            {showTabPeriodSelector && (
              <div
                ref={pickerRef}
                className="absolute right-0 top-0 z-50 w-70 border-2 border-border-highlight rounded-extra-large p-small bg-bg-app shadow-lg"
              >
                <p className="text-center pb-extra-small text-text-alt-primary font-semibold">
                  Periodos comparativos
                </p>
                <TabDaysPicker
                  DefaultDates={DefaultDates}
                  selectedDates={selectedTabDates}
                  onSelect={(newSelectedDates) => {
                    setSelectedTabDates(newSelectedDates);
                  }}
                  onClose={() => setShowTabPeriodSelector(false)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-small w-full max-h-[83vh] md:max-h-none overflow-y-scroll">
          <MetaCampaignContext.Provider value={{
            campaign,
            metaData,
            setMetaData,
            selectedTabDates,
            setSelectedTabDates,
            selectedSideDate: dates,
            setSelectedSideDate: setDates,
            searchTerm,
            selectedMetric,
            orderDirection,
          }}>
            {children}
          </MetaCampaignContext.Provider>
        </div>
      </div>

      {showIntegrationModal && campaign && (
        <MetaIntegrationModal
          onCloseAction={() => setShowIntegrationModal(false)}
          campaign={campaign}
        />
      )}

      <Modal isOpen={isCalendarModalOpen} onCloseAction={() => setIsCalendarModalOpen(false)}>
        <PeriodSelector
          onClose={() => setIsCalendarModalOpen(false)}
          previousSelectedDates={dates}
          onSelect={(newSelectedDates) => {
            setDates(newSelectedDates);
            setIsCalendarModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default MetaCampaignLayout;

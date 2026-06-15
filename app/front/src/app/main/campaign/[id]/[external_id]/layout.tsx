"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import SideBar from "@/components/Sidebar/sideBar";
import {
  loadCampaignOptimAction,
  loadTaboolaCampaignDataAction,
} from "@/app/main/campaign/components/campaignActions";
import TaboolaSideInfo from "@/components/taboolaSideInfo";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import { CampaignTaboolaData } from "@/models/campaign-taboola-data";
import OperationInfo from "@/components/operationInfo";
import { Icon } from "@/components/Icon/iconComponent";
import { motion } from "framer-motion";
import PeriodSelector from "@/components/PeriodSelector/PeriodSelector";
import TabButton from "../../components/tabButton";
import TabDaysPicker from "@/components/PeriodSelector/tabDaysPicker";
import { IntegrationModal } from "../../components/IntegrationTutorial/integrationModal";
import CampaignContext from "@/context/CampaignContext";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { Button } from "@/components/Button/buttonComponent";
import { Modal } from "@/components/Modal/modalComponent";
import FilterCard from "@/components/Sidebar/filterCard";
import CampaignFilterForm from "../../components/campaignFilterForm";

const CampaignLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const params = useParams();
  const campaignId = params.id;
  const externalId = params.external_id;

  const pickerRef = useRef<HTMLDivElement>(null);

  const [dates, setDates] = useState<number | string>(0);
  const [selectedTabDates, setSelectedTabDates] = useState<number[]>([
    0, 1, 3, 7,
  ]);
  const [campaign, setCampaign] = useState<CampaignOptimizationModel>();
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [taboolaData, setTaboolaData] = useState<CampaignTaboolaData>();
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [showFilterSelector, setShowFilterSelector] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [horizontalLayout, setHorizontalLayout] = useState(false);
  const [showTabPeriodSelector, setShowTabPeriodSelector] = useState(false);
  const taboolaSideInfoRef = useRef<HTMLDivElement>(null);
  const periodSelectorRef = useRef<HTMLDivElement>(null);
  const filterSelectorRef = useRef<HTMLDivElement>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<string>("id");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [editTaboola, setEditTaboola] = useState(false);
  const [containerHeight, setContainerHeight] = useState<string | number>(
    "auto"
  );
  const DefaultDates = [0, 1, 3, 7, 15, 30, 60, 90, 100000];

  const fetchTaboola = async (campaignId: string, subAccount?: string) => {
    const result = await loadTaboolaCampaignDataAction(campaignId, subAccount? subAccount : null);
    if (!result.success && result.errors?.general?.[0] === "401") {
      window.location.reload();
      return;
    }
    const taboolaResult = {
      cpc: result.data.cpc,
      daily_cap: result.data.daily_cap,
      is_active: result.data.is_active,
      publisher_bid_modifier: result.data.publisher_bid_modifier.values,
      publisher_targeting: result.data.publisher_targeting.value,
    }

    if (result.success) {
      setTaboolaData(taboolaResult);
    } else throw new Error("Erro ao buscar dados do Taboola");
  };

  useEffect(() => {
    setCampaignLoading(true);
    const fetchCampaign = async () => {
      const result = await CallerWrapper(
        loadCampaignOptimAction(Number(campaignId), dates as number));
      if (result.success) {
        setCampaign(result.data);
      }
      else throw new Error("Erro ao buscar dados da campanha");
      setCampaignLoading(false);
    };
    fetchCampaign();
  }, [campaignId, dates]);

  useEffect(() => {
    if (externalId && campaign) {
      fetchTaboola(externalId as string, campaign?.sub_account as string);
    }
  }, [externalId, campaign]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
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
    const taboolaSideInfoElement = taboolaSideInfoRef.current;
    const filterSelectorElement = filterSelectorRef.current;
    
    if (!periodSelectorElement || !taboolaSideInfoElement || !filterSelectorElement) return;

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
      setContainerHeight(taboolaSideInfoElement.scrollHeight);
    }

    return () => {
      observer.disconnect();
    };
  }, [showPeriodSelector, showFilterSelector, editTaboola]);

  return (
    <div className="md:flex w-full grow overflow-auto overflow-x-hidden">
      <SideBar>
        <h2 className="hidden md:block font-bold text-xl text-center max-w-80 line-clamp-2">
          {campaign ? campaign.name : "Carregando..."}
        </h2>

        <div className="hidden w-full md:flex gap-small justify-center md:my-small">
          <div className="flex gap-extra-small items-center cursor-pointer" onClick={() => {
            setShowFilterSelector(false)
            setShowPeriodSelector(!showPeriodSelector)
          }}>
            <Icon
              type="calendar"
              size="medium"
              color="secondary"
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

          {pathname.includes("sites") && (
            <div className="flex gap-extra-small items-center cursor-pointer" onClick={() => {
              setShowPeriodSelector(false)
              setShowFilterSelector(!showFilterSelector)
            }}>
              <Icon
                type="filter"
                size="medium"
                color="secondary"
              />
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
          {/* TaboolaSideInfo */}
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
              ref={taboolaSideInfoRef}
              style={{
                pointerEvents: showPeriodSelector || showFilterSelector ? "none" : "auto",
                visibility: showPeriodSelector || showFilterSelector ? "hidden" : "visible",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <TaboolaSideInfo
                cpc={taboolaData?.cpc}
                daily_cap={taboolaData?.daily_cap}
                is_active={taboolaData?.is_active}
                loading={!taboolaData}
                edit={editTaboola}
                externalId={externalId as string}
                setEditTaboola={setEditTaboola}
                taboolaData={taboolaData}
                setTaboolaData={setTaboolaData}
                campaign={campaign}
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
                  sitePage={true}
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
            <TabButton href={`/main/campaign/${campaignId}/${externalId}/funis`}> Funis </TabButton>
            <TabButton href={`/main/campaign/${campaignId}/${externalId}/ads`}> Ads </TabButton>
            <TabButton href={`/main/campaign/${campaignId}/${externalId}/sites`}> Sites </TabButton>
          </div>

          <div className="relative flex items-center gap-small">
            <div className="hidden md:block">
              <Button type="confirm" size="small" onClickAction={() =>
                setShowIntegrationModal(!showIntegrationModal)}>
                Integração
                <Icon type="integration" size="medium" color="secondary"/>
              </Button>
            </div>
            <Icon type="calendar" size="medium" color="secondary" onClickAction={() => setShowTabPeriodSelector(!showTabPeriodSelector)}/>
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
                    setShowTabPeriodSelector(false);
                  }}
                  onClose={() => setShowTabPeriodSelector(false)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-small w-full max-h-[83vh] md:max-h-none overflow-y-scroll">
          <CampaignContext.Provider value={{
            campaign,
            taboolaData,
            setTaboolaData,
            selectedTabDates,
            setSelectedTabDates,
            selectedSideDate: dates,
            setSelectedSideDate: setDates,
            searchTerm,
            selectedMetric,
            orderDirection
          }}>
            {children}
          </CampaignContext.Provider>
        </div>
      </div>

      {showIntegrationModal && campaign && (
        <IntegrationModal
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
    </div >
  );
};

export default CampaignLayout;

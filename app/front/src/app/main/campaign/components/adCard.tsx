"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";

import Toggle from "@/components/Toggle/Toggle";
import OperationInfo from "@/components/operationInfo";
import { useCampaignContext } from "@/context/CampaignContext";
import { updateTaboolaAdAction, loadOneAdAction } from "./campaignActions";
import { CallerWrapper } from "@/utils/CallerWrapper";

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
  summary?: AdSummary;
  status: boolean;
}

interface AdsCardProps {
  nomeCampanha: string;
  adData: AdData;
  campaignId: number;
  externalId: number | string;
}

export default function AdsCard({ nomeCampanha, adData, campaignId, externalId }: AdsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detailsByDay, setDetailsByDay] = useState<Record<string | number, AdSummary | null>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});
  const [toggleLoading, setToggleLoading] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<boolean | null>(null);
  const isActive = optimisticStatus ?? adData.status;
  const { selectedTabDates, campaign } = useCampaignContext();
  const loadedDaysRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (!expanded) return;
    if (!Array.isArray(selectedTabDates) || selectedTabDates.length === 0) return;

    let mounted = true;

    async function fetchDetails() {
      for (const day of selectedTabDates) {
        if (loadedDaysRef.current.has(day)) continue;

        setLoadingMap((prev) => ({ ...prev, [day]: true }));

        try {
          const res = await CallerWrapper(loadOneAdAction(campaignId, adData.id_ads_taboola, day));
          const payload = res?.data?.summary ?? res?.data ?? null;

          if (mounted) {
            setDetailsByDay((prev) => ({ ...prev, [day]: payload }));
            loadedDaysRef.current.add(day);
          }
        } catch {
          if (mounted) setDetailsByDay((prev) => ({ ...prev, [day]: null }));
        } finally {
          if (mounted) setLoadingMap((prev) => ({ ...prev, [day]: false }));
        }
      }
    }

    fetchDetails();

    return () => {
      mounted = false;
    };
  }, [expanded, selectedTabDates, campaignId, adData.id_ads_taboola]);

  const handleToggle = async (value: boolean) => {
    setToggleLoading(true);
    try {
      const res = await updateTaboolaAdAction(externalId, adData.id_ads_taboola, {
        is_active: value,
      }, campaign?.sub_account as string);
      if (!res.success && res.errors?.general?.[0] === "401") {
        window.location.reload();
        return;
      }
      if (res.success) setOptimisticStatus(value);
    } catch (err) {
      console.error("Erro ao atualizar toggle:", err);
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-[1100px] 2xl:w-full">
      {/* Botão de expandir */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex h-[40px] w-[35px] items-center justify-center border-2 border-bg-alt-primary border-r-0 bg-bg-alt-primary hover:bg-bg-primary-hover rounded-l-lg hover:cursor-pointer transition"
      >
        {expanded ? (
          <ChevronUp className="text-text-alt-main" size={20} />
        ) : (
          <ChevronDown className="text-text-alt-main" size={20} />
        )}
      </button>

      {/* Card principal */}
      <div className="flex flex-col w-full bg-bg-card text-text-main rounded-large rounded-tl-none shadow-md shadow-text-main/25 dark:shadow-none overflow-hidden transition-all duration-300">
        <div className="flex items-center px-default py-small">
          <div className="flex w-full items-center gap-4">
            {/* 📸 Thumbnail */}
            <div className="relative w-28 h-28 rounded-large overflow-hidden flex-shrink-0">
              <Image
                src={
                  typeof adData.thumbnail === "string" && adData.thumbnail.startsWith("http")
                    ? adData.thumbnail
                    : "/placeholder.webp"
                }
                alt={adData.title ?? nomeCampanha}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* 🧠 Conteúdo principal */}
            <div className="flex w-full flex-col gap-small min-w-0">
              <div className="flex justify-between items-center gap-small">
                <div className="flex items-center gap-small min-w-0">
                  {toggleLoading ? (
                    <Loader className="animate-spin text-text-main flex-shrink-0" size={16} />
                  ) : (
                    <Toggle size="small" isOn={isActive} onToggle={handleToggle} />
                  )}
                  <h2
                    className="text-text-main font-title font-strong text-large leading-small truncate whitespace-nowrap overflow-hidden text-ellipsis select-none flex-1"
                    title={adData.title ?? nomeCampanha}
                  >
                    {adData.title ?? nomeCampanha}
                  </h2>
                </div>

                {/* 🆔 ID original */}
                <p className="text-text-info text-small mt-1 whitespace-nowrap flex-shrink-0">
                  ID: {adData.id_ads_taboola ?? "N/A"}
                </p>
              </div>

              <OperationInfo
                data={adData.summary ?? undefined}
                allInfo={true}
                horizontalLayout={true}
              />
            </div>
          </div>
        </div>

        {/* Seção expandida */}
        <div
          className={`grid transition-all duration-300 px-small ${expanded ? "opacity-100 mb-1 pt-small border-t border-border-muted" : "max-h-0 opacity-0"
            } overflow-hidden`}
        >
          {expanded &&
            selectedTabDates.map((days) => {
              const summary = detailsByDay[days];
              const isLoading = loadingMap[days];

              return (
                <div
                  key={days}
                  className="flex items-center pr-small gap-extra-small rounded-extra-large border-2 border-border-highlight mb-3"
                >
                  <span className="flex items-center justify-center bg-bg-navbar text-text-primary px-extra-small h-full xl:h-14 w-24 xl:rounded-full rounded-lg text-small -ml-[2px] my-[-4px]">
                    {days === 0
                      ? "Hoje"
                      : days === 1
                        ? "Ontem"
                        : days === 100000
                          ? "Vitalício"
                          : String(days).includes("|")
                            ? "Person."
                            : `${days} dias`}
                  </span>

                  {isLoading ? (
                    <div className="flex flex-grow justify-center items-center gap-extra-small text-text-main/50 text-sm py-small">
                      <Loader className="animate-spin" size={16} />
                      Carregando...
                    </div>
                  ) : summary ? (
                    <OperationInfo
                      data={{
                        expenses: summary.expenses,
                        revenue: summary.revenue,
                        clicks: summary.clicks,
                        checkout: summary.checkout,
                        sales: summary.sales,
                        roas: summary.roas,
                        cpc: summary.cpc,
                        vcpm: summary.vcpm,
                        cpa: summary.cpa,
                        vctr: summary.vctr,
                      }}
                      allInfo={true}
                      horizontalLayout={true}
                    />
                  ) : (
                    <p className="flex text-text-main/50 text-sm py-small flex-grow justify-center">
                      Na fila...
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";

import Toggle from "@/components/Toggle/Toggle";
import OperationInfo from "@/components/operationInfo";
import { useMetaCampaignContext } from "@/context/MetaCampaignContext";
import { updateMetaAdAction, loadOneMetaAdAction } from "./metaCampaignActions";
import { MetaAdModel } from "@/models/meta-ad-model";
import { OptimizationData } from "@/models/optimization-data";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { useParams } from "next/navigation";

type MetaAdCardProps = {
  ad: MetaAdModel;
  onUpdate: (adId: string, updates: Partial<MetaAdModel>) => void;
};

export default function MetaAdCard({ ad, onUpdate }: MetaAdCardProps) {
  const params = useParams();
  const campaignId = params.id as string;
  const [expanded, setExpanded] = useState(false);
  const [detailsByDay, setDetailsByDay] = useState<Record<string | number, OptimizationData | null>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});
  const [toggleLoading, setToggleLoading] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<boolean | null>(null);
  const isActive = optimisticStatus ?? ad.status === "ACTIVE";
  const { selectedTabDates } = useMetaCampaignContext();
  const loadedDaysRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (!expanded) return;
    if (!Array.isArray(selectedTabDates) || selectedTabDates.length === 0) return;

    async function fetchDetails() {
      for (const day of selectedTabDates) {
        if (loadedDaysRef.current.has(day)) continue;
        loadedDaysRef.current.add(day);

        setLoadingMap((prev) => ({ ...prev, [day]: true }));

        try {
          const res = await CallerWrapper(loadOneMetaAdAction(campaignId, ad.id, day));
          const raw = res?.data?.summary ?? res?.data ?? null;
          const payload = raw
            ? {
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
              }
            : null;

          setDetailsByDay((prev) => ({ ...prev, [day]: payload }));
        } catch {
          setDetailsByDay((prev) => ({ ...prev, [day]: null }));
        } finally {
          setLoadingMap((prev) => ({ ...prev, [day]: false }));
        }
      }
    }

    fetchDetails();
  }, [expanded, selectedTabDates, campaignId, ad.id]);

  const handleToggle = async (value: boolean) => {
    setToggleLoading(true);
    try {
      const newStatus = value ? "ACTIVE" : "PAUSED";
      const res = await updateMetaAdAction(ad.id, { status: newStatus });
      if (res.success) {
        setOptimisticStatus(value);
        onUpdate(ad.id, { status: newStatus });
      }
    } catch (err) {
      console.error("Erro ao atualizar ad:", err);
    } finally {
      setToggleLoading(false);
    }
  };

  const displayTitle = ad.name;

  return (
    <div className="flex justify-center w-[1100px] 2xl:w-full">
      {/* Expand button */}
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

      {/* Main card */}
      <div className="flex flex-col w-full bg-bg-card text-text-main rounded-large rounded-tl-none shadow-md shadow-text-main/25 dark:shadow-none overflow-hidden transition-all duration-300">
        <div className="flex items-center px-default py-small">
          <div className="flex w-full items-center gap-4">
            {/* Thumbnail */}
            <div className="relative w-28 h-28 rounded-large overflow-hidden flex-shrink-0">
              <Image
                src={
                  typeof ad.thumbnail === "string" && ad.thumbnail.startsWith("http")
                    ? ad.thumbnail
                    : "/placeholder.webp"
                }
                alt={displayTitle}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Content */}
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
                    title={displayTitle}
                  >
                    {displayTitle}
                  </h2>
                </div>

                <p className="text-text-info text-small mt-1 whitespace-nowrap flex-shrink-0">
                  ID: {ad.id ?? "N/A"}
                </p>
              </div>

              <OperationInfo
                data={ad.summary ?? undefined}
                allInfo={true}
                horizontalLayout={true}
              />
            </div>
          </div>
        </div>

        {/* Expanded section */}
        <div
          className={`grid transition-all duration-300 px-small ${
            expanded ? "opacity-100 mb-1 pt-small border-t border-border-muted" : "max-h-0 opacity-0"
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
                  <span className="flex items-center justify-center bg-bg-navbar text-text-primary px-extra-small h-full xl:h-14 w-24 xl:rounded-full rounded-lg text-small -ml-[3px] my-[-4px]">
                    {days === 0
                      ? "Hoje"
                      : days === 1
                        ? "Ontem"
                        : days === 100000
                          ? "Vitalicio"
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

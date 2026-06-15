"use client";

import { createContext, useContext } from "react";
import { CampaignTaboolaData } from "@/models/campaign-taboola-data";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";

type CampaignContextType = {
  campaign?: CampaignOptimizationModel;
  taboolaData?: CampaignTaboolaData | null;
  setTaboolaData: (data: CampaignTaboolaData) => void;
  selectedTabDates: number[];
  setSelectedTabDates: (dates: number[]) => void;
  selectedSideDate: number | string;
  setSelectedSideDate: (date: number | string) => void;
  searchTerm: string;
  selectedMetric: string;
  orderDirection: "asc" | "desc";
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const useCampaignContext = () => {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaignContext must be used within CampaignContext.Provider");
  return ctx;
};

export default CampaignContext;
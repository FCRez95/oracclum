"use client";

import { createContext, useContext } from "react";
import { MetaCampaignData } from "@/models/meta-campaign-data";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";

type MetaCampaignContextType = {
  campaign?: CampaignOptimizationModel;
  metaData?: MetaCampaignData | null;
  setMetaData: (data: MetaCampaignData) => void;
  selectedTabDates: number[];
  setSelectedTabDates: (dates: number[]) => void;
  selectedSideDate: number | string;
  setSelectedSideDate: (date: number | string) => void;
  searchTerm: string;
  selectedMetric: string;
  orderDirection: "asc" | "desc";
};

const MetaCampaignContext = createContext<MetaCampaignContextType | undefined>(undefined);

export const useMetaCampaignContext = () => {
  const ctx = useContext(MetaCampaignContext);
  if (!ctx) throw new Error("useMetaCampaignContext must be used within MetaCampaignContext.Provider");
  return ctx;
};

export default MetaCampaignContext;

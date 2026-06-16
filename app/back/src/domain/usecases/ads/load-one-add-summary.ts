import { OptimizationData } from "../../models/optimization-data";

export interface LoadOneAdSummary {
  loadOne(
    idUser: number,
    id_campaign: number,
    id_ads_taboola: number,
    days: number
  ): Promise<OptimizationData | null>;

  loadOneByDateRange?(
    idUser: number,
    id_campaign: number,
    id_ads_taboola: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<OptimizationData | null>;
}
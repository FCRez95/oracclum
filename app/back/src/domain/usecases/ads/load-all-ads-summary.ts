import { AdsSummaryModel } from "../../models/ads-summary";

export interface LoadAllAdsSummary {
  loadAll(
    idUser: number,
    id_campaign: number,
    days: number
  ): Promise<AdsSummaryModel[] | null>;

  loadAllByDateRange(
    idUser: number,
    id_campaign: number,
    dateRange: { startDate: string, endDate: string }
  ): Promise<AdsSummaryModel[] | null>;
}

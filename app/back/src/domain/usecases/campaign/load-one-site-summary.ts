import { OptimizationData } from "../../models/optimization-data";

export interface LoadOneSiteSummary {
  loadOne(
    idUser: number,
    id_campaign: number,
    id_site: number,
    days: number
  ): Promise<OptimizationData | null>;
  loadOneByDateRange(
    idUser: number,
    id_campaign: number,
    id_site: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<OptimizationData | null>;
}

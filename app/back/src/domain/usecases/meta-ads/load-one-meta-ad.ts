import { OptimizationData } from "../../models/optimization-data";

export interface LoadOneMetaAd {
  loadOne(idUser: number, id_campaign: number, id_ad_meta: string, days: number): Promise<OptimizationData | null>
  loadOneByDateRange(idUser: number, id_campaign: number, id_ad_meta: string, dateRange: { startDate: string; endDate: string }): Promise<OptimizationData | null>
}

import { InternalOptimizationData } from "./load-adset-optimization-data-repository"

export interface LoadAdOptimizationDataRepository {
  loadAdOptData (id_ad_meta: string, days: number): Promise<InternalOptimizationData | null>
  loadAdOptDataByDateRange (id_ad_meta: string, dateRange: { startDate: string; endDate: string }): Promise<InternalOptimizationData | null>
}

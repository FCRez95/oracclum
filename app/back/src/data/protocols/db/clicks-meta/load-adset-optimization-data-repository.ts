export interface InternalOptimizationData {
  revenue: number
  checkout: number
  sales: number
}

export interface LoadAdsetOptimizationDataRepository {
  loadAdsetOptData (id_ad_set: string, days: number): Promise<InternalOptimizationData | null>
  loadAdsetOptDataByDateRange (id_ad_set: string, dateRange: { startDate: string; endDate: string }): Promise<InternalOptimizationData | null>
}
  
export interface InternalOptimizationData {
  revenue: number
  checkout: number
  sales: number
}

export interface LoadCampaignOptimizationDataRepository {
  loadCampaignOptData (id_campaign: number, days: number): Promise<InternalOptimizationData | null>
  loadCampaignOptDataByDateRange (id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<InternalOptimizationData | null>
}

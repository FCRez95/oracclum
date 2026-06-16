export interface InternalOptimizationData {
  revenue: number
  checkout: number
  sales: number
}

export interface OptimizationDataByAd extends InternalOptimizationData {
  id_ads_taboola: number
}

export interface OptimizationDataBySite extends InternalOptimizationData {
  id_site: number | string
}

export interface LoadOptimizationDataRepository {
  load (
    days?: number,
    id_campaign?: number,
    id_ads?: number,
    id_site?: number | string
  ): Promise<InternalOptimizationData | null>

  loadByDateRange(
    dateRange: { startDate: string, endDate: string },
    id_campaign?: number,
    id_ads?: number,
    id_site?: number | string
  ): Promise<InternalOptimizationData | null>

  loadAdsSummariesByIds(
    days: number,
    adIds: number[]
  ): Promise<OptimizationDataByAd[]>

  loadAdsSummariesByIdsByDateRange(
    dateRange: { startDate: string, endDate: string },
    adIds: number[]
  ): Promise<OptimizationDataByAd[]>

  loadSitesSummariesByCampaignAndIds(
    days: number,
    id_campaign: number,
    siteIds: Array<number | string>
  ): Promise<OptimizationDataBySite[]>

  loadSitesSummariesByCampaignAndIdsByDateRange(
    dateRange: { startDate: string, endDate: string },
    id_campaign: number,
    siteIds: Array<number | string>
  ): Promise<OptimizationDataBySite[]>
}
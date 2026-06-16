export interface CampaignInternalData {
  revenue: number,
  sales: number
  checkout: number,
}

export interface CampaignInternalSummary extends CampaignInternalData {
  id_campaign: number
}

export interface LoadCampaignSummaryRepository {
  loadSummary (idCampaign: number, ad_provider:string, days: number): Promise<CampaignInternalData | null>
  loadSummaryByDateRange (idCampaign: number, ad_provider:string, dateRange: { startDate: string, endDate: string },): Promise<CampaignInternalData | null>
  loadSummariesByCampaignIds (ad_provider: string, campaignIds: number[], days: number): Promise<CampaignInternalSummary[]>
  loadSummariesByCampaignIdsByDateRange (ad_provider: string, campaignIds: number[], dateRange: { startDate: string, endDate: string }): Promise<CampaignInternalSummary[]>
}
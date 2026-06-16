export interface CampaignStepsData {
  total_clicks: number
  total_sales: number
  revenue: number
  total_step_1: number
  step_1_views: number
  total_step_2: number
  step_2_views: number
  total_step_3: number
  step_3_views: number
  total_checkout: number
  checkout_views: number
}

export interface LoadCampaignStepsSummaryByClicksRepository {
  loadCampaignSummaryByClick (id_campaign: number, days: number): Promise<CampaignStepsData | null>
  loadCampaignSummaryByClickByDateRange (id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<CampaignStepsData | null>
}
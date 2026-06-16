export interface SiteStepsData {
  total_clicks: number;
  total_sales: number;
  revenue: number;
  total_step_1: number;
  step_1_views: number;
  total_step_2: number;
  step_2_views: number;
  total_step_3: number;
  step_3_views: number;
  total_checkout: number;
  checkout_views: number;
}

export interface LoadSiteStepsRepository {
  loadSiteSteps(
    id_campaign: number,
    id_site: number | string,
    days: number
  ): Promise<SiteStepsData | null>;
  loadSiteStepsByDateRange(
    id_campaign: number,
    id_site: number | string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<SiteStepsData | null>;
}
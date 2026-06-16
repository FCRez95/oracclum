import { CampaignSiteSummaryModel } from "../../models/campaign-site-summary"

export interface LoadCampaignSitesSummary {
  loadAllSites (idUser: number, id_campaign: number, days: number): Promise<CampaignSiteSummaryModel[] | null>
  loadAllSitesByDateRange (idUser: number, id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<CampaignSiteSummaryModel[] | null>
}

import { CampaignSiteSummaryModel } from "../../../../domain/models/campaign-site-summary";

export interface LoadCampaignSitesRepository {
  loadSites (days:number, id_campaign: number, id_campaign_taboola: number): Promise<CampaignSiteSummaryModel[] | null>
}
  
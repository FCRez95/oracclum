import { CampaignSummaryModel } from "../../models/campaign-summary";

export interface LoadUserCampaigns {
  load(id_user: number, days: number): Promise<CampaignSummaryModel[] | null>;
  loadByDateRange(
    id_user: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignSummaryModel[] | null>;
}

import { CampaignStepsSummary } from "../../models/campaign-summary"

export interface LoadCampaignByTime {
  load (id_campaign: number, id_user: number, days: number): Promise<CampaignStepsSummary | null>
  loadByDateRange (id_campaign: number, id_user: number, dateRange: { startDate: string; endDate: string }): Promise<CampaignStepsSummary | null>
}

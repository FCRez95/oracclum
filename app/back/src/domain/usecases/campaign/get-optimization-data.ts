import { CampaignModel } from '../../models/campaign'

export interface GetCampaignOptimizationData {
  get(
    id_user: number,
    id_campaign: number,
    days: number
  ): Promise<CampaignModel | null>

  getByDateRange(
    id_user: number,
    id_campaign: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignModel | null>
}
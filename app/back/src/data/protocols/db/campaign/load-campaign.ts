import { CampaignModel } from "../../../../domain/models/campaign"

export interface LoadCampaignRepository {
  loadCampaign (id_campaign: number): Promise<CampaignModel | null>
}

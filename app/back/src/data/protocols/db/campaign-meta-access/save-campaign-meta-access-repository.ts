import { CampaignMetaAccessRow } from "./load-campaign-meta-access-repository"

export interface SaveCampaignMetaAccessRepository {
  save (pixelInfo: CampaignMetaAccessRow): Promise<void>
}

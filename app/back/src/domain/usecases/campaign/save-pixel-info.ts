import { CampaignMetaAccessModel } from "../../models/campaign-meta-access"

export interface SavePixelInfo {
  save (idUser: number, pixelInfo: CampaignMetaAccessModel): Promise<CampaignMetaAccessModel | null>
}

import { CampaignMetaAccessModel } from "../../../domain/models/campaign-meta-access"
import { SavePixelInfo } from "../../../domain/usecases/campaign/save-pixel-info"
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign"
import { LoadCampaignMetaAccessRepository } from "../../protocols/db/campaign-meta-access/load-campaign-meta-access-repository"
import { SaveCampaignMetaAccessRepository } from "../../protocols/db/campaign-meta-access/save-campaign-meta-access-repository"

export class DbSavePixelInfo implements SavePixelInfo {
  constructor (
    private readonly loadCampaignRepository: LoadCampaignRepository,
    private readonly loadCampaignMetaAccessRepository: LoadCampaignMetaAccessRepository,
    private readonly saveCampaignMetaAccessRepository: SaveCampaignMetaAccessRepository
  ) {}

  async save (idUser: number, pixelInfo: CampaignMetaAccessModel): Promise<CampaignMetaAccessModel | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(pixelInfo.id_campaign)

    if (!campaign || campaign.id_user !== idUser) {
      return null
    }

    await this.loadCampaignMetaAccessRepository.loadByCampaignId(pixelInfo.id_campaign)

    await this.saveCampaignMetaAccessRepository.save({
      id_campaign: pixelInfo.id_campaign,
      access_token: pixelInfo.access_token,
      pixel_id: pixelInfo.pixel_id
    })

    return pixelInfo
  }
}

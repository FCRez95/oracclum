import { DeleteCampaign } from "../../../domain/usecases/campaign/delete-campaign";
import { DeleteCampaignRepository } from "../../protocols/db/campaign/delete-campaign-repository";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";

export class DbDeleteCampaign implements DeleteCampaign {
  private readonly loadCampaignByIdRepository: LoadCampaignRepository
  private readonly deleteCampaignRepository: DeleteCampaignRepository

  constructor (loadCampaignByIdRepository: LoadCampaignRepository, deleteCampaignRepository: DeleteCampaignRepository) {
    this.loadCampaignByIdRepository = loadCampaignByIdRepository
    this.deleteCampaignRepository = deleteCampaignRepository
  }
  
  async delete(id_user: number, id_campaign: number): Promise<void> {
    const campaign = await this.loadCampaignByIdRepository.loadCampaign(id_campaign)
    if (!campaign || campaign.id_user !== id_user) return null

    await this.deleteCampaignRepository.delete(id_campaign)
  }
}
import { LoadIntegrationStatus, LoadIntegrationStatusResult } from "../../../domain/usecases/campaign/load-integration-status"
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign"
import { LoadIntegrationStatusRepository } from "../../protocols/db/integration-status/load-integration-status-repository"

export class DbLoadIntegrationStatus implements LoadIntegrationStatus {
  constructor (
    private readonly loadCampaignRepository: LoadCampaignRepository,
    private readonly loadIntegrationStatusRepository: LoadIntegrationStatusRepository
  ) {}

  async load (idUser: number, idCampaign: number): Promise<LoadIntegrationStatusResult> {
    const campaign = await this.loadCampaignRepository.loadCampaign(idCampaign)

    if (!campaign || campaign.id_user !== idUser) {
      return {
        authorized: false,
        status: null
      }
    }

    const status = await this.loadIntegrationStatusRepository.loadByCampaignId(idCampaign)

    return {
      authorized: true,
      status
    }
  }
}

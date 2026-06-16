import { IntegrationStatusModel } from "../../../domain/models/integration-status"
import { UpdateIntegrationStatus, UpdateIntegrationStatusParams } from "../../../domain/usecases/campaign/update-integration-status"
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign"
import { LoadIntegrationStatusRepository, SaveIntegrationStatusRepository, UpdateIntegrationStatusStepRepository } from "../../protocols/db/integration-status/load-integration-status-repository"

export class DbUpdateIntegrationStatus implements UpdateIntegrationStatus {
  constructor (
    private readonly loadCampaignRepository: LoadCampaignRepository,
    private readonly loadIntegrationStatusRepository: LoadIntegrationStatusRepository,
    private readonly saveIntegrationStatusRepository: SaveIntegrationStatusRepository,
    private readonly updateIntegrationStatusStepRepository: UpdateIntegrationStatusStepRepository
  ) {}

  async update (idUser: number, params: UpdateIntegrationStatusParams): Promise<IntegrationStatusModel | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(params.idCampaign)

    if (!campaign || campaign.id_user !== idUser) {
      return null
    }

    const currentStatus = await this.loadIntegrationStatusRepository.loadByCampaignId(params.idCampaign)

    if (!currentStatus) {
      const newStatus: IntegrationStatusModel = {
        id_campaign: params.idCampaign,
        ad_provider: 0,
        funnel: 0,
        checkout: 0,
        test: 0
      }
      newStatus[params.step] = params.status
      await this.saveIntegrationStatusRepository.save(newStatus)
      return newStatus
    }

    await this.updateIntegrationStatusStepRepository.updateStep(params.idCampaign, params.step, params.status)

    return {
      ...currentStatus,
      [params.step]: params.status
    }
  }
}

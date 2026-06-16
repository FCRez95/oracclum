import { IntegrationStatusModel } from "../../../../domain/models/integration-status"

export interface LoadIntegrationStatusRepository {
  loadByCampaignId (idCampaign: number): Promise<IntegrationStatusModel | null>
}

export interface SaveIntegrationStatusRepository {
  save (status: IntegrationStatusModel): Promise<void>
}

export interface UpdateIntegrationStatusStepRepository {
  updateStep (idCampaign: number, step: 'ad_provider' | 'funnel' | 'checkout' | 'test', status: 0 | 1): Promise<void>
}

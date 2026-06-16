import { IntegrationStatusModel } from "../../models/integration-status"

export interface UpdateIntegrationStatusParams {
  idCampaign: number
  step: 'ad_provider' | 'funnel' | 'checkout' | 'test'
  status: 0 | 1
}

export interface UpdateIntegrationStatus {
  update (idUser: number, params: UpdateIntegrationStatusParams): Promise<IntegrationStatusModel | null>
}

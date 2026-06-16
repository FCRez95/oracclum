import { IntegrationStatusModel } from "../../models/integration-status"

export interface LoadIntegrationStatusResult {
  authorized: boolean
  status: IntegrationStatusModel | null
}

export interface LoadIntegrationStatus {
  load (idUser: number, idCampaign: number): Promise<LoadIntegrationStatusResult>
}

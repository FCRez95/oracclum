import { Pool } from "mysql2"
import { LoadIntegrationStatusRepository, SaveIntegrationStatusRepository, UpdateIntegrationStatusStepRepository } from "../../../../data/protocols/db/integration-status/load-integration-status-repository"
import { IntegrationStatusModel } from "../../../../domain/models/integration-status"
import { getOne, insertOne, runQuery } from "../mysql-helper"

export class IntegrationStatusMySqlRepository implements LoadIntegrationStatusRepository, SaveIntegrationStatusRepository, UpdateIntegrationStatusStepRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async loadByCampaignId (idCampaign: number): Promise<IntegrationStatusModel | null> {
    const result = await getOne(this.connectionPool, 'integration_status', 'id_campaign', idCampaign)
    return result[0] || null
  }

  async save (status: IntegrationStatusModel): Promise<void> {
    await insertOne(this.connectionPool, 'integration_status', status)
  }

  async updateStep (idCampaign: number, step: 'ad_provider' | 'funnel' | 'checkout' | 'test', status: 0 | 1): Promise<void> {
    await runQuery(
      this.connectionPool,
      `UPDATE integration_status SET ${step} = ? WHERE id_campaign = ?`,
      [status, idCampaign]
    )
  }
}

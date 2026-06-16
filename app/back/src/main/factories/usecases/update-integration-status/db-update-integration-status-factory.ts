import { Pool } from "mysql2"
import { DbUpdateIntegrationStatus } from "../../../../data/usecases/update-integration-status/db-update-integration-status"
import { UpdateIntegrationStatus } from "../../../../domain/usecases/campaign/update-integration-status"
import { CampaignMySqlRepository } from "../../../../infra/db/mysql/campaign/campaign-mysql-repository"
import { IntegrationStatusMySqlRepository } from "../../../../infra/db/mysql/integration-status/integration-status-mysql-repository"

export const makeDbUpdateIntegrationStatus = (pool: Pool): UpdateIntegrationStatus => {
  const campaignMySqlRepository = new CampaignMySqlRepository(pool)
  const integrationStatusMySqlRepository = new IntegrationStatusMySqlRepository(pool)

  return new DbUpdateIntegrationStatus(
    campaignMySqlRepository,
    integrationStatusMySqlRepository,
    integrationStatusMySqlRepository,
    integrationStatusMySqlRepository
  )
}

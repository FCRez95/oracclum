import { Pool } from "mysql2"
import { DbLoadIntegrationStatus } from "../../../../data/usecases/load-integration-status/db-load-integration-status"
import { LoadIntegrationStatus } from "../../../../domain/usecases/campaign/load-integration-status"
import { CampaignMySqlRepository } from "../../../../infra/db/mysql/campaign/campaign-mysql-repository"
import { IntegrationStatusMySqlRepository } from "../../../../infra/db/mysql/integration-status/integration-status-mysql-repository"

export const makeDbLoadIntegrationStatus = (pool: Pool): LoadIntegrationStatus => {
  const campaignMySqlRepository = new CampaignMySqlRepository(pool)
  const integrationStatusMySqlRepository = new IntegrationStatusMySqlRepository(pool)

  return new DbLoadIntegrationStatus(campaignMySqlRepository, integrationStatusMySqlRepository)
}

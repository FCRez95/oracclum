import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { DbDeleteCampaign } from '../../../../data/usecases/delete-campaign/db-delete-campaign'
import { DeleteCampaign } from '../../../../domain/usecases/campaign/delete-campaign'

export const makeDbDeleteCampaign = (pool: Pool): DeleteCampaign => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const deleteCampaignRepository = new CampaignMySqlRepository(pool)
  return new DbDeleteCampaign(loadCampaignsRepository, deleteCampaignRepository)
}

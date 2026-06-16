import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { Pool } from 'mysql2'
import { DbEditCampaign } from '../../../../data/usecases/edit-campaign/db-edit-campaign'
import { EditCampaign } from '../../../../domain/usecases/campaign/edit-campaign'

export const makeDbEditCampaign = (pool: Pool): EditCampaign => {
    const loadCampaignsRepository = new CampaignMySqlRepository(pool)
    const editCampaignRepository = new CampaignMySqlRepository(pool)
    return new DbEditCampaign(loadCampaignsRepository, editCampaignRepository)
}
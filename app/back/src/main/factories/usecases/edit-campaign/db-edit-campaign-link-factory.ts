import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { Pool } from 'mysql2'
import { DbEditCampaignLink } from '../../../../data/usecases/edit-campaign/db-edit-campaign-link'
import { EditCampaignLink } from '../../../../domain/usecases/campaign/edit-campaign'

export const makeDbEditCampaignLink = (pool: Pool): EditCampaignLink => {
    const loadCampaignsRepository = new CampaignMySqlRepository(pool)
    const editCampaignLinkRepository = new CampaignMySqlRepository(pool)
    return new DbEditCampaignLink(loadCampaignsRepository, editCampaignLinkRepository)
}
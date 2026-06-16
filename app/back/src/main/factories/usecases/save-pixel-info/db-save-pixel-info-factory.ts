import { Pool } from "mysql2"
import { DbSavePixelInfo } from "../../../../data/usecases/save-pixel-info/db-save-pixel-info"
import { SavePixelInfo } from "../../../../domain/usecases/campaign/save-pixel-info"
import { CampaignMySqlRepository } from "../../../../infra/db/mysql/campaign/campaign-mysql-repository"
import { CampaignMetaAccessMySqlRepository } from "../../../../infra/db/mysql/campaign-meta-access/campaign-meta-access-mysql-repository"

export const makeDbSavePixelInfo = (pool: Pool): SavePixelInfo => {
  const campaignMySqlRepository = new CampaignMySqlRepository(pool)
  const campaignMetaAccessMySqlRepository = new CampaignMetaAccessMySqlRepository(pool)

  return new DbSavePixelInfo(
    campaignMySqlRepository,
    campaignMetaAccessMySqlRepository,
    campaignMetaAccessMySqlRepository
  )
}

import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { DbLoadUserCampaigns } from '../../../../data/usecases/load-user-campaigns/db-load-user-campaigns'
import { LoadUserCampaigns } from '../../../../domain/usecases/campaign/load-user-campaigns'
import { ClickMysqlRepository } from '../../../../infra/db/mysql/clicks/clicks-mysql-repository'
import { TaboolaRepository } from '../../../../infra/external-apis/taboola/taboola-repository'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import env from '../../../config/env'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { MetaRepository } from '../../../../infra/external-apis/meta/meta-repository'

export const makeDbLoadUserCampaigns = (pool: Pool): LoadUserCampaigns => {
  const campaignRepository = new CampaignMySqlRepository(pool)
  const loadCampaignSummaryRepository = new ClickMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getTaboolaExternalInfo = new TaboolaRepository(decrypter, new AccountMySqlRepository(pool))
  const getMetaExternalInfo = new MetaRepository(decrypter, new AccountMySqlRepository(pool))

  return new DbLoadUserCampaigns(
    campaignRepository,
    loadCampaignSummaryRepository,
    getTaboolaExternalInfo,
    getMetaExternalInfo,
  )
}

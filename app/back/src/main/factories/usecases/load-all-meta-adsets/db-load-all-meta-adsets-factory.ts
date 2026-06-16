import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import env from '../../../config/env'
import { LoadAllMetaAdSets } from '../../../../domain/usecases/meta-ad-sets/load-all-ad-sets-summary'
import { DbLoadAllMetaAdSets } from '../../../../data/usecases/load-all-meta-adsets/db-load-all-meta-adsets'
import { ClickMetaMysqlRepository } from '../../../../infra/db/mysql/clicks-meta/clicks-meta-mysql-repository'
import { MetaRepository } from '../../../../infra/external-apis/meta/meta-repository'

export const makeDbLoadAllMetaAdSets = (pool: Pool): LoadAllMetaAdSets => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const loadAdSetOptData = new ClickMetaMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getMetaAdSetInfo = new MetaRepository(decrypter, new AccountMySqlRepository(pool))
  return new DbLoadAllMetaAdSets(loadCampaignsRepository, loadAdSetOptData, getMetaAdSetInfo)
}

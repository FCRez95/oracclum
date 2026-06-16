import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import env from '../../../config/env'
import { LoadAllMetaAds } from '../../../../domain/usecases/meta-ads/load-all-meta-ads'
import { DbLoadAllMetaAds } from '../../../../data/usecases/load-all-meta-ads/db-load-all-meta-ads'
import { ClickMetaMysqlRepository } from '../../../../infra/db/mysql/clicks-meta/clicks-meta-mysql-repository'
import { MetaRepository } from '../../../../infra/external-apis/meta/meta-repository'

export const makeDbLoadAllMetaAds = (pool: Pool): LoadAllMetaAds => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const loadAdOptData = new ClickMetaMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getMetaAdsInfo = new MetaRepository(decrypter, new AccountMySqlRepository(pool))
  return new DbLoadAllMetaAds(loadCampaignsRepository, loadAdOptData, getMetaAdsInfo)
}

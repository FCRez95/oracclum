import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import env from '../../../config/env'
import { LoadOneMetaAd } from '../../../../domain/usecases/meta-ads/load-one-meta-ad'
import { DbLoadOneMetaAd } from '../../../../data/usecases/load-one-meta-ad/db-load-one-meta-ad'
import { ClickMetaMysqlRepository } from '../../../../infra/db/mysql/clicks-meta/clicks-meta-mysql-repository'
import { MetaRepository } from '../../../../infra/external-apis/meta/meta-repository'

export const makeDbLoadOneMetaAd = (pool: Pool): LoadOneMetaAd => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const loadAdOptData = new ClickMetaMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getMetaAdInfo = new MetaRepository(decrypter, new AccountMySqlRepository(pool))
  return new DbLoadOneMetaAd(loadCampaignsRepository, loadAdOptData, getMetaAdInfo)
}

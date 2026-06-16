import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { ClickMysqlRepository } from '../../../../infra/db/mysql/clicks/clicks-mysql-repository'
import { DbLoadAllAdsSummary } from '../../../../data/usecases/load-all-ads-summary/db-load-all-ads-summary'
import { LoadAllAdsSummary } from '../../../../domain/usecases/ads/load-all-ads-summary'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { TaboolaRepository } from '../../../../infra/external-apis/taboola/taboola-repository'
import env from '../../../config/env'

export const makeDbLoadAllAdsSummary = (pool: Pool): LoadAllAdsSummary => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const getTaboolaId = new ClickMysqlRepository(pool)
  const loadOptimizationDataRepository = new ClickMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getExternalAdInfo = new TaboolaRepository(decrypter, new AccountMySqlRepository(pool))
  return new DbLoadAllAdsSummary(loadCampaignsRepository, getTaboolaId, loadOptimizationDataRepository, getExternalAdInfo)
}

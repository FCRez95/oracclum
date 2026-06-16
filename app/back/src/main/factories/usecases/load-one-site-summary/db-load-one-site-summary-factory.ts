import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { ClickMysqlRepository } from '../../../../infra/db/mysql/clicks/clicks-mysql-repository'
import { DbLoadOneSiteSummary } from '../../../../data/usecases/load-one-site-summary/db-load-one-site-summary'
import { LoadOneSiteSummary } from '../../../../domain/usecases/campaign/load-one-site-summary'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { TaboolaRepository } from '../../../../infra/external-apis/taboola/taboola-repository'
import env from '../../../config/env'

export const makeDbLoadOneSiteSummary = (pool: Pool): LoadOneSiteSummary => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const getTaboolaId = new ClickMysqlRepository(pool)
  const loadOptimizationDataRepository = new ClickMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getExternalSitesInfo = new TaboolaRepository(decrypter, new AccountMySqlRepository(pool))
  return new DbLoadOneSiteSummary(loadCampaignsRepository, getTaboolaId, loadOptimizationDataRepository, getExternalSitesInfo)
}

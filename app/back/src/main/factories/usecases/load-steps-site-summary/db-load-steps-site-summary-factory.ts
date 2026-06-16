import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { ClickMysqlRepository } from '../../../../infra/db/mysql/clicks/clicks-mysql-repository'
import { LoadSiteStepsSummary } from '../../../../domain/usecases/campaign/load-site-steps-summary'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { TaboolaRepository } from '../../../../infra/external-apis/taboola/taboola-repository'
import env from '../../../config/env'
import { DbLoadSiteStepsSummary } from '../../../../data/usecases/load-site-steps-summary/db-load-site-steps-summary'

export const makeDbLoadSiteStepsSummary = (pool: Pool): LoadSiteStepsSummary => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const loadSiteStepsSummary = new ClickMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getExternalSitesInfo = new TaboolaRepository(decrypter, new AccountMySqlRepository(pool))
  return new DbLoadSiteStepsSummary(loadCampaignsRepository, loadSiteStepsSummary, getExternalSitesInfo)
}

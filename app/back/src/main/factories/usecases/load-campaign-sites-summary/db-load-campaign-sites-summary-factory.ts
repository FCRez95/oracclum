import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { ClickMysqlRepository } from '../../../../infra/db/mysql/clicks/clicks-mysql-repository'
import { DbLoadCampaignSitesSummary } from '../../../../data/usecases/load-campaign-sites-summary/db-load-campaign-sites-summary'
import { LoadCampaignSitesSummary } from '../../../../domain/usecases/campaign/load-campaign-sites-summary'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import { TaboolaRepository } from '../../../../infra/external-apis/taboola/taboola-repository'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import env from '../../../config/env'

export const makeDbLoadAdSitesSummary = (pool: Pool): LoadCampaignSitesSummary => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const getTaboolaId = new ClickMysqlRepository(pool)
  const loadOptimizationDataRepository = new ClickMysqlRepository(pool)

  const decrypter = new JwtAdapter(env.jwtSecret)
  const getExternalSitesInfo = new TaboolaRepository(decrypter, new AccountMySqlRepository(pool))
  return new DbLoadCampaignSitesSummary(loadCampaignsRepository, getTaboolaId, loadOptimizationDataRepository, getExternalSitesInfo)
}

import { Pool } from 'mysql2'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { ClickMysqlRepository } from '../../../../infra/db/mysql/clicks/clicks-mysql-repository'
import { ClickMetaMysqlRepository } from '../../../../infra/db/mysql/clicks-meta/clicks-meta-mysql-repository'
import { DbLoadCampaignOptimizationData } from '../../../../data/usecases/load-campaign-optimization-data/db-load-campaign-optimization-data'
import { DbLoadMetaCampaignOptimizationData } from '../../../../data/usecases/load-meta-campaign-optimization-data/db-load-meta-campaign-optimization-data'
import { DbLoadCampaignOptimizationDataComposite } from '../../../../data/usecases/load-campaign-optimization-data/db-load-campaign-optimization-data-composite'
import { GetCampaignOptimizationData } from '../../../../domain/usecases/campaign/get-optimization-data'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { TaboolaRepository } from '../../../../infra/external-apis/taboola/taboola-repository'
import { MetaRepository } from '../../../../infra/external-apis/meta/meta-repository'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'
import env from '../../../config/env'

export const makeDbLoadCampaignOptimizationData = (pool: Pool): GetCampaignOptimizationData => {
  const loadCampaignsRepository = new CampaignMySqlRepository(pool)
  const decrypter = new JwtAdapter(env.jwtSecret)
  const accountRepo = new AccountMySqlRepository(pool)

  const taboolaOptRepo = new ClickMysqlRepository(pool)
  const taboolaExtInfo = new TaboolaRepository(decrypter, accountRepo)
  const taboolaUsecase = new DbLoadCampaignOptimizationData(taboolaOptRepo, taboolaExtInfo)

  const metaOptRepo = new ClickMetaMysqlRepository(pool)
  const metaExtInfo = new MetaRepository(decrypter, accountRepo)
  const metaUsecase = new DbLoadMetaCampaignOptimizationData(metaOptRepo, metaExtInfo)

  return new DbLoadCampaignOptimizationDataComposite(loadCampaignsRepository, taboolaUsecase, metaUsecase)
}

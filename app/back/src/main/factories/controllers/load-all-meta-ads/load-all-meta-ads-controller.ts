import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadAllMetaAdsController } from '../../../../presentation/controller/load-all-meta-ads/load-all-meta-ads-controller'
import { makeDbLoadAllMetaAds } from '../../usecases/load-all-meta-ads/db-load-all-meta-ads-factory'

export const makeLoadAllMetaAdsController = (pool: Pool) => {
  const dbLoadAllMetaAds = makeDbLoadAllMetaAds(pool)
  const loadAllMetaAdsController = new LoadAllMetaAdsController(dbLoadAllMetaAds)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadAllMetaAdsController, logMysqlRepository)
}

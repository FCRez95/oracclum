import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadAllMetaAdsetsController } from '../../../../presentation/controller/load-all-meta-adsets/load-all-meta-adsets-controller'
import { makeDbLoadAllMetaAdSets } from '../../usecases/load-all-meta-adsets/db-load-all-meta-adsets-factory'

export const makeLoadAllMetaAdsetsController = (pool: Pool) => {
  const dbLoadAllMetaAdsets = makeDbLoadAllMetaAdSets(pool)
  const loadAllMetaAdSetsController = new LoadAllMetaAdsetsController(dbLoadAllMetaAdsets)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadAllMetaAdSetsController, logMysqlRepository)
}

import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadOneMetaAdController } from '../../../../presentation/controller/load-one-meta-ad/load-one-meta-ad-controller'
import { makeDbLoadOneMetaAd } from '../../usecases/load-one-meta-ad/db-load-one-meta-ad-factory'

export const makeLoadOneMetaAdController = (pool: Pool) => {
  const dbLoadOneMetaAd = makeDbLoadOneMetaAd(pool)
  const loadOneMetaAdController = new LoadOneMetaAdController(dbLoadOneMetaAd)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadOneMetaAdController, logMysqlRepository)
}

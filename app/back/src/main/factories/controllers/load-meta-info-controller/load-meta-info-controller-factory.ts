import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LoadMetaInfoController } from '../../../../presentation/controller/load-meta-info/load-meta-info-controller'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeDbLoadMetaInfo } from '../../usecases/load-meta-info/db-load-meta-info-factory'

export const makeLoadMetaInfoController = (pool: Pool): Controller => {
  const controller = new LoadMetaInfoController(makeDbLoadMetaInfo(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(controller, logMysqlRepository)
}

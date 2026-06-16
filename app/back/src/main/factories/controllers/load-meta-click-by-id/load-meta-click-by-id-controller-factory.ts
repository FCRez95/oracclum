import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { ClickMetaMysqlRepository } from '../../../../infra/db/mysql/clicks-meta/clicks-meta-mysql-repository'
import { DbLoadMetaClickById } from '../../../../data/usecases/load-meta-click-by-id/db-load-meta-click-by-id'
import { LoadMetaClickByIdController } from '../../../../presentation/controller/load-meta-click-by-id/load-meta-click-by-id-controller'

export const makeLoadMetaClickByIdController = (pool: Pool): Controller => {
  const clickMetaMysqlRepository = new ClickMetaMysqlRepository(pool)
  const dbLoadMetaClickById = new DbLoadMetaClickById(clickMetaMysqlRepository)
  const loadMetaClickByIdController = new LoadMetaClickByIdController(dbLoadMetaClickById)

  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadMetaClickByIdController, logMysqlRepository)
}

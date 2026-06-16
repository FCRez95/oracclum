import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { ClickMysqlRepository } from '../../../../infra/db/mysql/clicks/clicks-mysql-repository'
import { DbLoadClickById } from '../../../../data/usecases/load-click-by-id/db-load-click-by-id'
import { LoadClickByIdController } from '../../../../presentation/controller/load-click-by-id/load-click-by-id-controller'

export const makeLoadClickByIdController = (pool: Pool): Controller => {
  const clickMysqlRepository = new ClickMysqlRepository(pool)
  const dbLoadClickById = new DbLoadClickById(clickMysqlRepository)
  const loadClickByIdController = new LoadClickByIdController(dbLoadClickById)

  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadClickByIdController, logMysqlRepository)
}

import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LoadUserDataController } from '../../../../presentation/controller/load-user-data/load-user-data-controller'
import { makeLoadAccountByToken } from '../../usecases/load-account-by-token/db-load-account-by-token-factory'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'

export const makeLoadUserDataController = (pool: Pool): Controller => {
  const userDataController = new LoadUserDataController(makeLoadAccountByToken(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(userDataController, logMysqlRepository)
}

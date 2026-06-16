import { Controller } from '../../../../presentation/protocols'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LogoutController } from '../../../../presentation/controller/logout/logout-controller'
import { makeDbLogout } from '../../usecases/logout/db-logout-factory'

export const makeLogoutController = (pool: Pool): Controller => {
  const logoutController = new LogoutController(makeDbLogout(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(logoutController, logMysqlRepository)
}

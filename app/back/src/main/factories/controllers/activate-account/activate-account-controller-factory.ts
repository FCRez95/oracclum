import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeDbActivateAccount } from '../../usecases/activate-account/db-activate-account-factory'
import { ActivateAccountController } from '../../../../presentation/controller/activate-account/activate-account-controller'

export const makeActivateAccountController = (pool: Pool): Controller => {
  const activateAccountController = new ActivateAccountController(makeDbActivateAccount(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(activateAccountController, logMysqlRepository)
}

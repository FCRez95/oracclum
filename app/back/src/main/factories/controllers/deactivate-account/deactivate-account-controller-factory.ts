import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeDbDeactivateAccount } from '../../usecases/deactivate-account/db-deactivate-account-factory'
import { DeactivateAccountController } from '../../../../presentation/controller/deactivate-account/deactivate-account-controller'

export const makeDeactivateAccountController = (pool: Pool): Controller => {
  const deactivateAccountController = new DeactivateAccountController(makeDbDeactivateAccount(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(deactivateAccountController, logMysqlRepository)
}

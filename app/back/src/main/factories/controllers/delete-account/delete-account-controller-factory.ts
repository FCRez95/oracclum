import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeDbDeleteAccount } from '../../usecases/delete-account/db-delete-account-factory'
import { DeleteAccountController } from '../../../../presentation/controller/delete-account/delete-account-controller'

export const makeDeleteAccountController = (pool: Pool): Controller => {
  const deleteAccountController = new DeleteAccountController(makeDbDeleteAccount(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(deleteAccountController, logMysqlRepository)
}

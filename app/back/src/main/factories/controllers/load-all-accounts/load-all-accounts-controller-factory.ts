import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LoadUserDataController } from '../../../../presentation/controller/load-user-data/load-user-data-controller'
import { makeLoadAccountByToken } from '../../usecases/load-account-by-token/db-load-account-by-token-factory'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { DbLoadAllAccounts } from '../../../../data/usecases/load-all-accounts/db-load-all-accounts'
import { LoadAllUsersController } from '../../../../presentation/controller/load-all-users/load-all-users-controller'

export const makeLoadAllUsersController = (pool: Pool): Controller => {
  const accountMySqlRepository = new AccountMySqlRepository(pool)
  const dbLoadAllAccounts = new DbLoadAllAccounts(accountMySqlRepository)
  const loadAllAccountsController = new LoadAllUsersController(dbLoadAllAccounts)

  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadAllAccountsController, logMysqlRepository)
}

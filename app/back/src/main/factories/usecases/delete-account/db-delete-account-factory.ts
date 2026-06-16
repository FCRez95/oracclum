import { Pool } from 'mysql2'
import { DbDeleteAccount } from '../../../../data/usecases/delete-account/db-delete-account'
import { DeleteAccount } from '../../../../domain/usecases/account/delete-account'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'

export const makeDbDeleteAccount = (pool: Pool): DeleteAccount => {
  const accountMySqlRepository = new AccountMySqlRepository(pool)
  return new DbDeleteAccount(accountMySqlRepository, accountMySqlRepository)
}

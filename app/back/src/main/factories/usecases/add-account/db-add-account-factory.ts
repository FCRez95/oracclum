import { DbAddAccount } from '../../../../data/usecases/add-account/db-add-account'
import { BcryptAdapter } from '../../../../infra/cryptography/bcrypt-adapter/bcrypt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { Pool } from 'mysql2'
import { AddAccount } from '../../../../domain/usecases/account/add-account'

export const makeDbAddAccount = (pool: Pool): AddAccount => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const accountMySqlRepository = new AccountMySqlRepository(pool)
  return new DbAddAccount(bcryptAdapter, accountMySqlRepository, accountMySqlRepository)
}

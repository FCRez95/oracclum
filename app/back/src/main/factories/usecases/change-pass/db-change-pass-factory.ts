import { BcryptAdapter } from '../../../../infra/cryptography/bcrypt-adapter/bcrypt-adapter'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { Pool } from 'mysql2'
import { DbChangePass } from '../../../../data/usecases/change-pass/db-change-pass'
import { ChangePass } from '../../../../domain/usecases/account/change-password'

export const makeDbChangePass = (pool: Pool): ChangePass => {
  const salt = 12
  const hasher = new BcryptAdapter(salt)
  const changePassRepository = new AccountMySqlRepository(pool)
  return new DbChangePass(hasher, changePassRepository)
}

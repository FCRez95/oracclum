import { DbLogout } from '../../../../data/usecases/logout/db-logout'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { Pool } from 'mysql2'
import { Logout } from '../../../../domain/usecases/account/logout'

export const makeDbLogout = (pool: Pool): Logout => {
  const loadAccountByTokenRepository = new AccountMySqlRepository(pool)
  const updateAccessTokenRepository = new AccountMySqlRepository(pool)

  return new DbLogout(loadAccountByTokenRepository, updateAccessTokenRepository)
}

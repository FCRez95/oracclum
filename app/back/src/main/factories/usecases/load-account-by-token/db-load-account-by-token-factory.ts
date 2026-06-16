import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { Pool } from 'mysql2'
import { LoadAccountByToken } from '../../../../domain/usecases/account/load-account-by-token'
import { DbLoadAccountByToken } from '../../../../data/usecases/load-account-by-token/db-load-account-by-token'
import env from '../../../config/env'
import { JwtAdapter } from '../../../../infra/cryptography/jwt-adapter/jwt-adapter'

export const makeLoadAccountByToken = (pool: Pool): LoadAccountByToken => {
  const jwtAdapter = new JwtAdapter(env.jwtSecret)
  const loadAccountByTokenRepository = new AccountMySqlRepository(pool)
  return new DbLoadAccountByToken(jwtAdapter, loadAccountByTokenRepository)
}

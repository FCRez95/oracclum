import { Pool } from 'mysql2'
import { Middleware } from '../../../presentation/protocols'
import { AuthMiddleware } from '../../../presentation/middlewares/auth-middleware'
import { makeLoadAccountByToken } from '../usecases/load-account-by-token/db-load-account-by-token-factory'

export const makeAuthMiddleware = (pool: Pool, role?: string): Middleware => {
  return new AuthMiddleware(makeLoadAccountByToken(pool), role)
}

import { Pool } from 'mysql2'
import { Middleware } from '../../../presentation/protocols'
import { UserConsentsMiddleware } from '../../../presentation/middlewares/user-consents-middleware'
import { makeLoadUserConsents } from '../usecases/user-consents/db-load-user-consents-factory'

export const makeUserConsentsMiddleware = (pool: Pool): Middleware => {
  return new UserConsentsMiddleware(makeLoadUserConsents(pool))
}

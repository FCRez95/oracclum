import { Pool } from 'mysql2'
import { LoadUserConsents } from '../../../../domain/usecases/user-consents/load-user-consents'
import { DbLoadUserConsents } from '../../../../data/usecases/load-user-consents/db-load-user-consents'
import { UserConsentsMySqlRepository } from '../../../../infra/db/mysql/user-consents/user-consents-mysql-repository'

export const makeLoadUserConsents = (pool: Pool): LoadUserConsents => {
  const repository = new UserConsentsMySqlRepository(pool)
  return new DbLoadUserConsents(repository)
}

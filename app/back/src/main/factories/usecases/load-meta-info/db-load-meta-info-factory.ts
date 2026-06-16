import { Pool } from 'mysql2'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { AllowedMetaAccountMySqlRepository } from '../../../../infra/db/mysql/allowed-meta-account/allowed-meta-account-mysql-repository'
import { DbLoadMetaInfo } from '../../../../data/usecases/load-meta-info/db-load-meta-info'

export const makeDbLoadMetaInfo = (pool: Pool): DbLoadMetaInfo => {
  const accountRepository = new AccountMySqlRepository(pool)
  const allowedMetaAccountRepository = new AllowedMetaAccountMySqlRepository(pool)
  return new DbLoadMetaInfo(accountRepository, allowedMetaAccountRepository)
}

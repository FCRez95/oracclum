import { Pool } from "mysql2"
import { AccountMySqlRepository } from "../../../../infra/db/mysql/account/account-mysql-repository"
import { AllowedMetaAccountMySqlRepository } from "../../../../infra/db/mysql/allowed-meta-account/allowed-meta-account-mysql-repository"
import { DbDisconnectMeta } from "../../../../data/usecases/disconnect-meta/db-disconnect-meta"

export const makeDbDisconnectMeta = (pool: Pool): DbDisconnectMeta => {
  const updateByIdRepository = new AccountMySqlRepository(pool)
  const allowedMetaAccountRepository = new AllowedMetaAccountMySqlRepository(pool)
  return new DbDisconnectMeta(updateByIdRepository, allowedMetaAccountRepository)
}

import { Pool } from "mysql2";
import { AccountMySqlRepository } from "../../../../infra/db/mysql/account/account-mysql-repository";
import { AllowedMetaAccountMySqlRepository } from "../../../../infra/db/mysql/allowed-meta-account/allowed-meta-account-mysql-repository";
import { DbAddMetaInfo } from "../../../../data/usecases/add-meta-info/db-add-meta-info";
import { UsedMetaAccountMySqlRepository } from "../../../../infra/db/mysql/used-meta-account/used-meta-account-mysql-repository";

export const makeDbAddMetaInfo = (pool: Pool): DbAddMetaInfo => {
  const updateByIdRepository = new AccountMySqlRepository(pool)
  const allowedMetaAccountRepository = new AllowedMetaAccountMySqlRepository(pool)
  const usedMetaAccountRepository = new UsedMetaAccountMySqlRepository(pool)
  return new DbAddMetaInfo(
    updateByIdRepository,
    allowedMetaAccountRepository,
    usedMetaAccountRepository,
    usedMetaAccountRepository
  )
}

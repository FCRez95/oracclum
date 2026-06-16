import { Pool } from "mysql2";
import { JwtAdapter } from "../../../../infra/cryptography/jwt-adapter/jwt-adapter";
import { AccountMySqlRepository } from "../../../../infra/db/mysql/account/account-mysql-repository";
import env from "../../../config/env";
import { DbAddTaboolaInfo } from "../../../../data/usecases/add-taboola-info/db-add-taboola-info";
import { TaboolaRepository } from "../../../../infra/external-apis/taboola/taboola-repository";
import { UsedTaboolaAccountMySqlRepository } from "../../../../infra/db/mysql/used-taboola-account/used-taboola-account-mysql-repository";

export const makeDbAddTaboolaInfo = (pool: Pool): DbAddTaboolaInfo => {
  const accountRepository = new AccountMySqlRepository(pool)
  const usedTaboolaAccountRepository = new UsedTaboolaAccountMySqlRepository(pool)
  const encrypter = new JwtAdapter(env.jwtSecret)
  const decrypter = new JwtAdapter(env.jwtSecret)

  const createTbToken = new TaboolaRepository(decrypter, accountRepository)

  return new DbAddTaboolaInfo(
    encrypter,
    accountRepository,
    accountRepository,
    usedTaboolaAccountRepository,
    usedTaboolaAccountRepository,
    createTbToken
  )
}

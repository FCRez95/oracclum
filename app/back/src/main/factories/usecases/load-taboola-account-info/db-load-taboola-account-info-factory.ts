import { Pool } from "mysql2";
import { LoadTaboolaAccountInfo } from "../../../../domain/usecases/account/load-taboola-account-info";
import { DbLoadTaboolaAccountInfo } from "../../../../data/usecases/load-taboola-account-info/db-load-taboola-account-info";
import { JwtAdapter } from "../../../../infra/cryptography/jwt-adapter/jwt-adapter";
import { AccountMySqlRepository } from "../../../../infra/db/mysql/account/account-mysql-repository";
import env from "../../../config/env";

export const makeDbLoadTaboolaAccountInfo = (pool: Pool): LoadTaboolaAccountInfo => {
  const loadAccountByTokenRepository = new AccountMySqlRepository(pool)
  const decrypter = new JwtAdapter(env.jwtSecret)

  return new DbLoadTaboolaAccountInfo(decrypter, loadAccountByTokenRepository)
}
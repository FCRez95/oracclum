import { Pool } from "mysql2"
import { DbClearAccountData } from "../../../../data/usecases/clear-account-data/db-clear-account-data"
import { ClearAccountData } from "../../../../domain/usecases/account/clear-account-data"
import { RemoveClickAuthApi } from "../../../../infra/clicks-api/remove-click-auth"
import { AccountMySqlRepository } from "../../../../infra/db/mysql/account/account-mysql-repository"
import { AllowedMetaAccountMySqlRepository } from "../../../../infra/db/mysql/allowed-meta-account/allowed-meta-account-mysql-repository"
import { CampaignMySqlRepository } from "../../../../infra/db/mysql/campaign/campaign-mysql-repository"
import { UserConsentsMySqlRepository } from "../../../../infra/db/mysql/user-consents/user-consents-mysql-repository"

export const makeDbClearAccountData = (pool: Pool): ClearAccountData => {
  const accountMySqlRepository = new AccountMySqlRepository(pool)
  const campaignMySqlRepository = new CampaignMySqlRepository(pool)
  const allowedMetaAccountMySqlRepository = new AllowedMetaAccountMySqlRepository(pool)
  const userConsentsMySqlRepository = new UserConsentsMySqlRepository(pool)
  const removeClickAuthApi = new RemoveClickAuthApi()

  return new DbClearAccountData(
    accountMySqlRepository,
    campaignMySqlRepository,
    campaignMySqlRepository,
    accountMySqlRepository,
    allowedMetaAccountMySqlRepository,
    userConsentsMySqlRepository,
    removeClickAuthApi
  )
}

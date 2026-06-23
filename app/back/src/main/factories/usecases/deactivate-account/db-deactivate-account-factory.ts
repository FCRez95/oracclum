import { Pool } from 'mysql2'
import { DbDeactivateAccount } from '../../../../data/usecases/deactivate-account/db-deactivate-account'
import { DeactivateAccount } from '../../../../domain/usecases/account/deactivate-account'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { RemoveClickAuthApi } from '../../../../infra/clicks-api/remove-click-auth'
import env from '../../../config/env'

export const makeDbDeactivateAccount = (pool: Pool): DeactivateAccount => {
  const accountMySqlRepository = new AccountMySqlRepository(pool)
  const campaignMySqlRepository = new CampaignMySqlRepository(pool)
  const removeClickAuthApi = new RemoveClickAuthApi(env.clickAuthApi)
  return new DbDeactivateAccount(accountMySqlRepository, accountMySqlRepository, campaignMySqlRepository, removeClickAuthApi)
}

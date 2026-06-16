import { Pool } from 'mysql2'
import { DbActivateAccount } from '../../../../data/usecases/activate-account/db-activate-account'
import { ActivateAccount } from '../../../../domain/usecases/account/activate-account'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { RegisterClickAuthApi } from '../../../../infra/clicks-api/register-click-auth'

export const makeDbActivateAccount = (pool: Pool): ActivateAccount => {
  const accountMySqlRepository = new AccountMySqlRepository(pool)
  const campaignMySqlRepository = new CampaignMySqlRepository(pool)
  const registerClickAuthApi = new RegisterClickAuthApi()
  return new DbActivateAccount(accountMySqlRepository, accountMySqlRepository, campaignMySqlRepository, registerClickAuthApi)
}

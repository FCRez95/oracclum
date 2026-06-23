import { DbAddCampaign } from '../../../../data/usecases/add-campaign/db-add-campaign'
import { ClickIdCreator } from '../../../../infra/cryptography/click-id-creator/click-id-creator'
import { CampaignMySqlRepository } from '../../../../infra/db/mysql/campaign/campaign-mysql-repository'
import { Pool } from 'mysql2'
import { AddCampaign } from '../../../../domain/usecases/campaign/add-campaign'
import { RegisterClickAuthApi } from '../../../../infra/clicks-api/register-click-auth'
import env from '../../../config/env'

export const makeDbAddCampaign = (pool: Pool): AddCampaign => {
  const clickIdCreator = new ClickIdCreator()
  const campaignMySqlRepository = new CampaignMySqlRepository(pool)
  const registerClickAuthApi = new RegisterClickAuthApi(env.clickAuthApi)
  return new DbAddCampaign(clickIdCreator, campaignMySqlRepository, registerClickAuthApi)
}

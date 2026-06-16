import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { AddCampaignController } from '../../../../presentation/controller/add-campaign/add-campaign-controller'
import { makeDbAddCampaign } from '../../usecases/add-campaign/db-add-campaign-factory'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeAddCampaignValidation } from './add-campaign-validation-factory'

export const makeAddCampaignController = (pool: Pool): Controller => {
  const addCampaignController = new AddCampaignController(makeDbAddCampaign(pool), makeAddCampaignValidation())
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(addCampaignController, logMysqlRepository)
}

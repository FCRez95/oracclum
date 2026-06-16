import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { EditCampaignController } from '../../../../presentation/controller/edit-campaign/edit-campaign-controller'
import { makeDbEditCampaign } from '../../usecases/edit-campaign/db-edit-campaign-factory'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeEditCampaignValidation } from './edit-campaign-validation-factory'

export const makeEditCampaignController = (pool: Pool): Controller => {
  const DbEditCampaign = makeDbEditCampaign(pool)
  const editCampaignController = new EditCampaignController(DbEditCampaign, makeEditCampaignValidation())
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(editCampaignController, logMysqlRepository)
}


import { makeDbDeleteCampaign } from '../../usecases/delete-campaign/db-delete-campaign-factory'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { DeleteCampaignController } from '../../../../presentation/controller/delete-campaign/delete-campaign-controller'

export const makeDeleteCampaignController = (pool: Pool) => {
  const dbDeleteCampaign = makeDbDeleteCampaign(pool)
  const deleteCampaignController = new DeleteCampaignController(dbDeleteCampaign)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(deleteCampaignController, logMysqlRepository)
}

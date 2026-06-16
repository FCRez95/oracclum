import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeDbLoadUserCampaigns } from '../../usecases/load-user-campaigns/db-load-user-campaign-factory'
import { LoadUserCampaignsController } from '../../../../presentation/controller/load-user-campaigns-summary/load-user-campaigns-controller'

export const makeLoadUserCampaignsController = (pool: Pool): Controller => {
  const loadUserCampaignsController = new LoadUserCampaignsController(makeDbLoadUserCampaigns(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadUserCampaignsController, logMysqlRepository)
}

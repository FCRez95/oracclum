import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadCampaignOptimizationDataController } from '../../../../presentation/controller/load-campaign-optimization-data/load-campaign-optimization-data-controller'
import { makeDbLoadCampaignOptimizationData } from '../../usecases/load-campaign-optimization-data/load-campaign-optimization-data-factory'

export const makeLoadCampaignOptimizationDataController = (pool: Pool): Controller => {
  const getCampaignOptimizationDataController = new LoadCampaignOptimizationDataController(makeDbLoadCampaignOptimizationData(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(getCampaignOptimizationDataController, logMysqlRepository)
}

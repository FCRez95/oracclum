import { makeDbLoadCampaignStepsByTime } from '../../usecases/load-campaign-steps-by-time/db-load-campaign-steps-by-time-factory'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadCampaignSummaryController } from '../../../../presentation/controller/load-campaign-steps-summary/load-campaign-steps-summary-controller'

export const makeLoadCampaignStepsByTimeController = (pool: Pool) => {
  const dbLoadCampaignStepsByTime = makeDbLoadCampaignStepsByTime(pool)
  const loadCampaignStepsByTimeController = new LoadCampaignSummaryController(dbLoadCampaignStepsByTime)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadCampaignStepsByTimeController, logMysqlRepository)
}

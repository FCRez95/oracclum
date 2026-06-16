import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeDbLoadSiteStepsSummary } from '../../usecases/load-steps-site-summary/db-load-steps-site-summary-factory'
import { LoadSiteStepsSummaryController } from '../../../../presentation/controller/load-site-steps-summary/load-site-steps-summary-controller'

export const makeLoadSiteStepsSummaryController = (pool: Pool) => {
  const dbLoadSiteStepsSummary = makeDbLoadSiteStepsSummary(pool)
  const loadSiteStepsSummaryController = new LoadSiteStepsSummaryController(dbLoadSiteStepsSummary)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadSiteStepsSummaryController, logMysqlRepository)
}

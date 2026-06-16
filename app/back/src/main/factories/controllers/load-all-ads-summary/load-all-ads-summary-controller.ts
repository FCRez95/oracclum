import { makeDbLoadAllAdsSummary } from '../../usecases/load-all-ads-summary/db-load-all-ads-summary-factory'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadAdsSummaryController } from '../../../../presentation/controller/load-ads-summary/load-ads-summary-controller'

export const makeLoadAdsSummaryController = (pool: Pool) => {
  const dbLoadAllAdsSummary = makeDbLoadAllAdsSummary(pool)
  const loadAdsSummaryController = new LoadAdsSummaryController(dbLoadAllAdsSummary)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadAdsSummaryController, logMysqlRepository)
}

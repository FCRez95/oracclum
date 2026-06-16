import { makeDbLoadOneAdSummary } from '../../usecases/load-one-ad-summary/db-load-one-ad-summary-factory'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadOneAdSummaryController } from '../../../../presentation/controller/load-one-ad-summary/load-one-summary-controller'

export const makeLoadOneAdSummaryController = (pool: Pool) => {
  const dbLoadAllAdsSummary = makeDbLoadOneAdSummary(pool)
  const loadOneAdSummaryController = new LoadOneAdSummaryController(dbLoadAllAdsSummary)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadOneAdSummaryController, logMysqlRepository)
}

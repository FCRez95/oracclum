import { makeDbLoadOneSiteSummary } from '../../usecases/load-one-site-summary/db-load-one-site-summary-factory'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadOneSiteSummaryController } from '../../../../presentation/controller/load-one-site-summary/load-one-site-summary-controller'

export const makeLoadOneSiteSummaryController = (pool: Pool) => {
  const dbLoadOneSiteSummary = makeDbLoadOneSiteSummary(pool)
  const loadOneSiteSummaryController = new LoadOneSiteSummaryController(dbLoadOneSiteSummary)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadOneSiteSummaryController, logMysqlRepository)
}

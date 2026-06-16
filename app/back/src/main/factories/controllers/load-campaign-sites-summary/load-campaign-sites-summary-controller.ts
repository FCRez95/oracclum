import { makeDbLoadAdSitesSummary } from '../../usecases/load-campaign-sites-summary/db-load-campaign-sites-summary-factory'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { LoadCampaignSitesSummaryController } from '../../../../presentation/controller/load-campaign-sites-summary/load-campaign-sites-summary-controller'

export const makeLoadCampaignSitesSummaryController = (pool: Pool) => {
  const dbLoadAdSitesSummary = makeDbLoadAdSitesSummary(pool)
  const loadAdsSummaryController = new LoadCampaignSitesSummaryController(dbLoadAdSitesSummary)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadAdsSummaryController, logMysqlRepository)
}

import { DbLoadCampaignStepsByTime } from "../../../../data/usecases/load-campaign-steps-by-time/db-load-campaign-steps-by-time";
import { DbLoadCampaignStepsByTimeComposite } from "../../../../data/usecases/load-campaign-steps-by-time/db-load-campaign-steps-by-time-composite";
import { LoadCampaignByTime } from "../../../../domain/usecases/campaign/load-campaign-by-time";
import { CampaignMySqlRepository } from "../../../../infra/db/mysql/campaign/campaign-mysql-repository";
import { Pool } from "mysql2";
import { ClickMysqlRepository } from "../../../../infra/db/mysql/clicks/clicks-mysql-repository";
import { ClickMetaMysqlRepository } from "../../../../infra/db/mysql/clicks-meta/clicks-meta-mysql-repository";

export const makeDbLoadCampaignStepsByTime = (pool: Pool): LoadCampaignByTime => {
  const loadCampaignRepository = new CampaignMySqlRepository(pool)
  const taboolaRepo = new ClickMysqlRepository(pool)
  const metaRepo = new ClickMetaMysqlRepository(pool)

  const taboolaUsecase = new DbLoadCampaignStepsByTime(loadCampaignRepository, taboolaRepo)
  const metaUsecase = new DbLoadCampaignStepsByTime(loadCampaignRepository, metaRepo)

  return new DbLoadCampaignStepsByTimeComposite(loadCampaignRepository, taboolaUsecase, metaUsecase)
}

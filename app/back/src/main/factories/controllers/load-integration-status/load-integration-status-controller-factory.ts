import { Pool } from "mysql2"
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository"
import { LoadIntegrationStatusController } from "../../../../presentation/controller/load-integration-status/load-integration-status-controller"
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator"
import { makeDbLoadIntegrationStatus } from "../../usecases/load-integration-status/db-load-integration-status-factory"

export const makeLoadIntegrationStatusController = (pool: Pool) => {
  const loadIntegrationStatusController = new LoadIntegrationStatusController(makeDbLoadIntegrationStatus(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)

  return new LogControllerDecorator(loadIntegrationStatusController, logMysqlRepository)
}

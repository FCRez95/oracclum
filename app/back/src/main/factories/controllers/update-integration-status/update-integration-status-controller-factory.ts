import { Pool } from "mysql2"
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository"
import { UpdateIntegrationStatusController } from "../../../../presentation/controller/update-integration-status/update-integration-status-controller"
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator"
import { makeDbUpdateIntegrationStatus } from "../../usecases/update-integration-status/db-update-integration-status-factory"
import { makeUpdateIntegrationStatusValidation } from "./update-integration-status-validation-factory"

export const makeUpdateIntegrationStatusController = (pool: Pool) => {
  const updateIntegrationStatusController = new UpdateIntegrationStatusController(
    makeDbUpdateIntegrationStatus(pool),
    makeUpdateIntegrationStatusValidation()
  )
  const logMysqlRepository = new LogMysqlRepository(pool)

  return new LogControllerDecorator(updateIntegrationStatusController, logMysqlRepository)
}

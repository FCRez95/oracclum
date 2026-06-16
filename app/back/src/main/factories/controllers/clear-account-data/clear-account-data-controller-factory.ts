import { Pool } from "mysql2"
import { ClearAccountDataController } from "../../../../presentation/controller/clear-account-data/clear-account-data-controller"
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository"
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator"
import { makeDbClearAccountData } from "../../usecases/clear-account-data/db-clear-account-data-factory"

export const makeClearAccountDataController = (pool: Pool) => {
  const clearAccountDataController = new ClearAccountDataController(makeDbClearAccountData(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)

  return new LogControllerDecorator(clearAccountDataController, logMysqlRepository)
}

import { Pool } from "mysql2"
import { DisconnectMetaController } from "../../../../presentation/controller/disconnect-meta/disconnect-meta-controller"
import { makeDbDisconnectMeta } from "../../usecases/disconnect-meta/db-disconnect-meta-factory"
import { makeDisconnectMetaValidation } from "./disconnect-meta-validation-factory"
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository"
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator"

export const makeDisconnectMetaController = (pool: Pool) => {
  const disconnectMetaController = new DisconnectMetaController(makeDbDisconnectMeta(pool), makeDisconnectMetaValidation())
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(disconnectMetaController, logMysqlRepository)
}

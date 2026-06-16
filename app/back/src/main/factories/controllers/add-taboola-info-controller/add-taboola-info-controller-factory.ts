import { Pool } from "mysql2";
import { AddTaboolaInfoController } from "../../../../presentation/controller/add-taboola-info/add-taboola-info-controller";
import { makeDbAddTaboolaInfo } from "../../usecases/add-taboola-info/db-add-taboola-info-factory";
import { makeAddTaboolaInfoValidation } from "./add-taboola-info-validation-factory";
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository";
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator";

export const makeAddTaboolaInfoController = (pool: Pool) => {
  const addTaboolaInfoController = new AddTaboolaInfoController(makeDbAddTaboolaInfo(pool), makeAddTaboolaInfoValidation())
  const logMysqlRepository = new LogMysqlRepository(pool)

  return new LogControllerDecorator(addTaboolaInfoController, logMysqlRepository)
}
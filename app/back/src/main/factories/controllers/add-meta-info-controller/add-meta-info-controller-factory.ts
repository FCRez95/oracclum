import { Pool } from "mysql2";
import { AddMetaInfoController } from "../../../../presentation/controller/add-meta-info/add-meta-info-controller";
import { makeDbAddMetaInfo } from "../../usecases/add-meta-info/db-add-meta-info-factory";
import { makeAddMetaInfoValidation } from "./add-meta-info-validation-factory";
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository";
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator";

export const makeAddMetaInfoController = (pool: Pool) => {
  const addMetaInfoController = new AddMetaInfoController(makeDbAddMetaInfo(pool), makeAddMetaInfoValidation())
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(addMetaInfoController, logMysqlRepository)
}

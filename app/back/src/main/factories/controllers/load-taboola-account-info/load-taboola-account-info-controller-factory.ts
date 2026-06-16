import { Pool } from "mysql2";
import { Controller } from "../../../../presentation/protocols";
import { makeDbLoadTaboolaAccountInfo } from "../../usecases/load-taboola-account-info/db-load-taboola-account-info-factory";
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository";
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator";
import { LoadTaboolaAccountInfoController } from "../../../../presentation/controller/load-taboola-account-info/load-taboola-account-info-controller";

export const makeLoadTaboolaAccountInfoController = (pool: Pool): Controller => {
  const dbLoadTaboolaAccountInfo = makeDbLoadTaboolaAccountInfo(pool)
  const loadTaboolaAccountInfoController = new LoadTaboolaAccountInfoController(dbLoadTaboolaAccountInfo)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loadTaboolaAccountInfoController, logMysqlRepository)
}
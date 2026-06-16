import { Pool } from "mysql2";
import { Controller } from "../../../../presentation/protocols";
import { RegisterWaitListController } from "../../../../presentation/controller/register-wait-list/register-wait-list-controller";
import { makeDbRegisterWaitList } from "../../usecases/register-wait-list/db-register-waitlist-factory";
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository";
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator";

export const makeRegisterWaitListController = (pool: Pool): Controller => {
  const registerWaitListController = new RegisterWaitListController(makeDbRegisterWaitList(pool))

  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(registerWaitListController, logMysqlRepository)
}
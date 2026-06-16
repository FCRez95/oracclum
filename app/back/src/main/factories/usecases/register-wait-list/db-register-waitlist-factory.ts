import { Pool } from "mysql2";
import { DbRegisterWaitList } from "../../../../data/usecases/register-wait-list/db-register-wait-list";
import { WaitListMysqlRepository } from "../../../../infra/db/mysql/wait-list/wait-list-mysql-repository";

export const makeDbRegisterWaitList = (pool: Pool): DbRegisterWaitList => {
  const checkEmailRegistered = new WaitListMysqlRepository(pool)
  const addWaitListRepository = new WaitListMysqlRepository(pool)

  return new DbRegisterWaitList(checkEmailRegistered, addWaitListRepository)
}
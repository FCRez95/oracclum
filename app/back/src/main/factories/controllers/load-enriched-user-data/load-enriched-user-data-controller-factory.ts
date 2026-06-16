import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { LoadEnrichedUserDataController } from '../../../../presentation/controller/load-enriched-user-data/load-enriched-user-data-controller'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { AccountMySqlRepository } from '../../../../infra/db/mysql/account/account-mysql-repository'
import { DbLoadEnrichedUserData } from '../../../../data/usecases/load-enriched-user-data/db-load-enriched-user-data'

export const makeLoadEnrichedUserDataController = (pool: Pool): Controller => {
  const accountMySqlRepository = new AccountMySqlRepository(pool)
  const dbLoadEnrichedUserData = new DbLoadEnrichedUserData(accountMySqlRepository)
  const controller = new LoadEnrichedUserDataController(dbLoadEnrichedUserData)
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(controller, logMysqlRepository)
}

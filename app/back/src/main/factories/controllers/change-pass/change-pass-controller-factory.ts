import { Controller } from '../../../../presentation/protocols'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { ChangePassController } from '../../../../presentation/controller/change-pass/change-pass-controller'
import { makeDbChangePass } from '../../usecases/change-pass/db-change-pass-factory'

export const makeChangePassController = (pool: Pool): Controller => {
  const changePassController = new ChangePassController(makeDbChangePass(pool))
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(changePassController, logMysqlRepository)
}

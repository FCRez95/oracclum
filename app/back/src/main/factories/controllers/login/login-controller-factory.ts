import { LoginController } from '../../../../presentation/controller/login/login-controller'
import { makeLoginValidation } from './login-validation-factory'
import { Controller } from '../../../../presentation/protocols'
import { Pool } from 'mysql2'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { makeDbAutehntication } from '../../usecases/authentication/db-authentication-factory'

export const makeLoginController = (pool: Pool): Controller => {
  const loginController = new LoginController(makeDbAutehntication(pool), makeLoginValidation())
  const logMysqlRepository = new LogMysqlRepository(pool)
  return new LogControllerDecorator(loginController, logMysqlRepository)
}

import { SignUpController } from '../../../../presentation/controller/signup/signup-controller'
import { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { Pool } from 'mysql2'
import { makeSignUpValidation } from './signup-validation-factory'
import { makeDbAddAccount } from '../../usecases/add-account/db-add-account-factory'

export const makeSignUpController = (pool: Pool): Controller => {
  const logMysqlRepository = new LogMysqlRepository(pool)
  const signUpController = new SignUpController(makeDbAddAccount(pool), makeSignUpValidation())

  return new LogControllerDecorator(signUpController, logMysqlRepository)
}

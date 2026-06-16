import { Controller } from "../../../../presentation/protocols"
import { LoadUserConsentsController } from "../../../../presentation/controller/load-user-consents/load-user-consents-controller"
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { Pool } from 'mysql2'
import { UserConsentsMySqlRepository } from "../../../../infra/db/mysql/user-consents/user-consents-mysql-repository"
import { DbLoadUserConsents } from "../../../../data/usecases/load-user-consents/db-load-user-consents"

export const makeLoadUserConsentsController = (pool: Pool): Controller => {
    const userConsentsMySqlRepository = new UserConsentsMySqlRepository(pool)
    const dbLoadUserConsents = new DbLoadUserConsents(userConsentsMySqlRepository)
    const loadUserConsentsController = new LoadUserConsentsController(dbLoadUserConsents)
    const logMysqlRepository = new LogMysqlRepository(pool)
    return new LogControllerDecorator(loadUserConsentsController, logMysqlRepository)
}
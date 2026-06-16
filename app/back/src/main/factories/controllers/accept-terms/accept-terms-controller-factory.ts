import { DbAcceptTerms } from "../../../../data/usecases/accept-terms/db-accept-terms"
import { Controller } from "../../../../presentation/protocols"
import { AcceptTermsController } from "../../../../presentation/controller/accept-terms/accept-terms-controller"
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'
import { Pool } from 'mysql2'
import { UserConsentsMySqlRepository } from "../../../../infra/db/mysql/user-consents/user-consents-mysql-repository"

export const makeAcceptTermsController = (pool: Pool): Controller => {
    const userConsentsMySqlRepository = new UserConsentsMySqlRepository(pool)
    const dbAcceptTerms = new DbAcceptTerms(userConsentsMySqlRepository)
    const acceptTermsController = new AcceptTermsController(dbAcceptTerms)
    const logMysqlRepository = new LogMysqlRepository(pool)
    return new LogControllerDecorator(acceptTermsController, logMysqlRepository)
}
import { Pool } from 'mysql2'
import { Controller } from '../../../../presentation/protocols'
import { EditCampaignLinkController } from '../../../../presentation/controller/edit-campaign/edit-campaign-link-controller'
import { makeDbEditCampaignLink } from '../../usecases/edit-campaign/db-edit-campaign-link-factory'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMysqlRepository } from '../../../../infra/db/mysql/log/log-mysql-repository'

export const makeEditCampaignLinkController = (pool: Pool): Controller => {
    const DbEditCampaignLink = makeDbEditCampaignLink(pool)
    const editCampaignLinkController = new EditCampaignLinkController(DbEditCampaignLink)
    const logMysqlRepository = new LogMysqlRepository(pool)
    return new LogControllerDecorator(editCampaignLinkController, logMysqlRepository)
}


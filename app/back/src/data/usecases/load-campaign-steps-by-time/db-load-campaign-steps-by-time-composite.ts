import { CampaignModel } from '../../../domain/models/campaign'
import { CampaignStepsSummary } from '../../../domain/models/campaign-summary'
import { LoadCampaignByTime } from '../../../domain/usecases/campaign/load-campaign-by-time'
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { DbLoadCampaignStepsByTime } from './db-load-campaign-steps-by-time'

export class DbLoadCampaignStepsByTimeComposite implements LoadCampaignByTime {
  private readonly loadCampaignRepository: LoadCampaignRepository
  private readonly taboolaUsecase: DbLoadCampaignStepsByTime
  private readonly metaUsecase: DbLoadCampaignStepsByTime

  constructor (
    loadCampaignRepository: LoadCampaignRepository,
    taboolaUsecase: DbLoadCampaignStepsByTime,
    metaUsecase: DbLoadCampaignStepsByTime
  ) {
    this.loadCampaignRepository = loadCampaignRepository
    this.taboolaUsecase = taboolaUsecase
    this.metaUsecase = metaUsecase
  }

  private getUsecase (campaign: CampaignModel) {
    return campaign.ad_provider === 'meta' ? this.metaUsecase : this.taboolaUsecase
  }

  async load (id_campaign: number, idUser: number, days: number): Promise<CampaignStepsSummary | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if (!campaign || campaign.id_user !== idUser) return null

    return this.getUsecase(campaign).load(id_campaign, idUser, days)
  }

  async loadByDateRange (
    id_campaign: number,
    idUser: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignStepsSummary | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if (!campaign || campaign.id_user !== idUser) return null

    return this.getUsecase(campaign).loadByDateRange(id_campaign, idUser, dateRange)
  }
}

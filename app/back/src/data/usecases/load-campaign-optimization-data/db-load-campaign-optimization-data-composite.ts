import { CampaignModel } from '../../../domain/models/campaign'
import { GetCampaignOptimizationData } from '../../../domain/usecases/campaign/get-optimization-data'
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { DbLoadCampaignOptimizationData } from './db-load-campaign-optimization-data'
import { DbLoadMetaCampaignOptimizationData } from '../load-meta-campaign-optimization-data/db-load-meta-campaign-optimization-data'

export class DbLoadCampaignOptimizationDataComposite implements GetCampaignOptimizationData {
  private readonly loadCampaignRepository: LoadCampaignRepository
  private readonly taboolaUsecase: DbLoadCampaignOptimizationData
  private readonly metaUsecase: DbLoadMetaCampaignOptimizationData

  constructor (
    loadCampaignRepository: LoadCampaignRepository,
    taboolaUsecase: DbLoadCampaignOptimizationData,
    metaUsecase: DbLoadMetaCampaignOptimizationData
  ) {
    this.loadCampaignRepository = loadCampaignRepository
    this.taboolaUsecase = taboolaUsecase
    this.metaUsecase = metaUsecase
  }

  private getUsecase (campaign: CampaignModel) {
    return campaign.ad_provider === 'meta' ? this.metaUsecase : this.taboolaUsecase
  }

  async get (idUser: number, id_campaign: number, days: number): Promise<CampaignModel | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if (!campaign || campaign.id_user !== idUser) return null

    return this.getUsecase(campaign).get(campaign, days)
  }

  async getByDateRange (idUser: number, id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<CampaignModel | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if (!campaign || campaign.id_user !== idUser) return null

    return this.getUsecase(campaign).getByDateRange(campaign, dateRange)
  }
}

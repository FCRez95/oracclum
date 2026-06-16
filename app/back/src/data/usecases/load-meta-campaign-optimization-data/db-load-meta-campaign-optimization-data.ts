import { OptimizationData } from '../../../domain/models/optimization-data'
import { LoadCampaignOptimizationDataRepository } from '../../protocols/db/clicks-meta/load-campaign-optimization-data-repository'
import { GetCampaingExtInfo } from '../../protocols/external-apis/external-info'
import { CampaignModel } from '../add-campaign/db-add-campaign-protocols'

export class DbLoadMetaCampaignOptimizationData {
  private readonly loadCampaignOptimizationDataRepository: LoadCampaignOptimizationDataRepository
  private readonly getCampaingExtInfo: GetCampaingExtInfo

  constructor (loadCampaignOptimizationDataRepository: LoadCampaignOptimizationDataRepository, getCampaingExtInfo: GetCampaingExtInfo) {
    this.loadCampaignOptimizationDataRepository = loadCampaignOptimizationDataRepository
    this.getCampaingExtInfo = getCampaingExtInfo
  }

  private buildSummary (campaign: CampaignModel, internalData: any, externalInfo: any): void {
    const optimizationData: OptimizationData = {
      revenue: 0,
      expenses: 0,
      cpc: 0,
      vcpm: 0,
      cpa: 0,
      vctr: 0,
      clicks: 0,
      checkout: 0,
      sales: 0,
      roas: 0
    }
    campaign.summary = optimizationData

    if (internalData && externalInfo) {
      campaign.summary.revenue = internalData.revenue
      campaign.summary.expenses = externalInfo.expenses
      campaign.summary.cpc = externalInfo.cpc
      campaign.summary.vcpm = externalInfo.vcpm
      campaign.summary.cpa = internalData.sales > 0 ? externalInfo.expenses / internalData.sales : 0
      campaign.summary.vctr = externalInfo.vctr
      campaign.summary.clicks = externalInfo.clicks
      campaign.summary.checkout = internalData.checkout
      campaign.summary.sales = internalData.sales
      campaign.summary.roas = externalInfo.expenses > 0 ? internalData.revenue / externalInfo.expenses : 0
    }
  }

  async get (campaign: CampaignModel, days: number): Promise<CampaignModel> {
    const id_meta = campaign.external_id
    if (!id_meta) {
      this.buildSummary(campaign, null, null)
      return campaign
    }

    const [internalOptimizationData, externalInfo] = await Promise.all([
      this.loadCampaignOptimizationDataRepository.loadCampaignOptData(campaign.id, days),
      this.getCampaingExtInfo.getExtCampaignInfo(campaign.id_user, id_meta, days)
    ])
    this.buildSummary(campaign, internalOptimizationData, externalInfo)

    return campaign
  }

  async getByDateRange (campaign: CampaignModel, dateRange: { startDate: string; endDate: string }): Promise<CampaignModel> {
    const id_meta = campaign.external_id
    if (!id_meta) {
      this.buildSummary(campaign, null, null)
      return campaign
    }

    const [internalOptimizationData, externalInfo] = await Promise.all([
      this.loadCampaignOptimizationDataRepository.loadCampaignOptDataByDateRange(campaign.id, dateRange),
      this.getCampaingExtInfo.getExtCampaignInfoByDateRange(campaign.id_user, id_meta, dateRange)
    ])

    this.buildSummary(campaign, internalOptimizationData, externalInfo)

    return campaign
  }
}

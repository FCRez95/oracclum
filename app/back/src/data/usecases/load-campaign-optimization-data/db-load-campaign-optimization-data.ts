import { CampaignModel } from '../../../domain/models/campaign'
import { OptimizationData } from '../../../domain/models/optimization-data'
import { InternalOptimizationData, LoadOptimizationDataRepository } from '../../protocols/db/clicks-taboola/load-optimization-data-repository'
import { ExternalInfo, GetCampaingExtInfo } from '../../protocols/external-apis/external-info'

export class DbLoadCampaignOptimizationData {
  private readonly loadOptimizationDataRepository: LoadOptimizationDataRepository
  private readonly getCampaingExtInfo: GetCampaingExtInfo

  constructor (loadOptimizationDataRepository: LoadOptimizationDataRepository, getCampaingExtInfo: GetCampaingExtInfo) {
    this.loadOptimizationDataRepository = loadOptimizationDataRepository
    this.getCampaingExtInfo = getCampaingExtInfo
  }

  private buildOptimizationData(internalData: InternalOptimizationData | null, externalData: ExternalInfo | null): OptimizationData {
    const {
      revenue = 0,
      checkout = 0,
      sales = 0,
    } = internalData || {};

    const {
      expenses = 0,
      cpc = 0,
      vcpm = 0,
      vctr = 0,
      clicks = 0,
    } = externalData || {};

    const cpa = sales > 0 ? expenses / sales : 0;
    const roas = expenses > 0 ? revenue / expenses : 0;

    const optimizationData: OptimizationData = {
      revenue,
      expenses,
      cpc,
      vcpm,
      cpa,
      vctr,
      clicks,
      checkout,
      sales,
      roas,
    };

    return optimizationData;
  }

  async get(campaign: CampaignModel, days: number): Promise<CampaignModel> {
    const idTaboola = campaign.external_id
    if (!idTaboola) return campaign

    const [internalOptimizationData, externalInfo] = await Promise.all([
      this.loadOptimizationDataRepository.load(days, campaign.id),
      this.getCampaingExtInfo.getExtCampaignInfo(campaign.id_user, idTaboola, days)
    ])

    campaign.summary = this.buildOptimizationData(internalOptimizationData, externalInfo);

    return campaign
  }

  async getByDateRange(campaign: CampaignModel, dateRange: { startDate: string; endDate: string }): Promise<CampaignModel> {
    const idTaboola = campaign.external_id
    if (!idTaboola) return campaign

    const [internalOptimizationData, externalInfo] = await Promise.all([
      this.loadOptimizationDataRepository.loadByDateRange(dateRange, campaign.id),
      this.getCampaingExtInfo.getExtCampaignInfoByDateRange(campaign.id_user, idTaboola, dateRange)
    ])

    campaign.summary = this.buildOptimizationData(internalOptimizationData, externalInfo);

    return campaign
  }
}

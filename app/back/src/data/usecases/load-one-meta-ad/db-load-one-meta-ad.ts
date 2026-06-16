import { OptimizationData } from "../../../domain/models/optimization-data";
import { LoadOneMetaAd } from "../../../domain/usecases/meta-ads/load-one-meta-ad";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { LoadAdOptimizationDataRepository } from "../../protocols/db/clicks-meta/load-ad-optimization-data-repository";
import { GetMetaAdInfo, MetaAdInfo } from "../../protocols/external-apis/external-info";
import { InternalOptimizationData } from "../../protocols/db/clicks-meta/load-adset-optimization-data-repository";

export class DbLoadOneMetaAd implements LoadOneMetaAd {
  private readonly loadCampaignRepository: LoadCampaignRepository
  private readonly loadAdOptimizationDataRepository: LoadAdOptimizationDataRepository
  private readonly getMetaAdInfo: GetMetaAdInfo

  constructor (
    loadCampaignRepository: LoadCampaignRepository,
    loadAdOptimizationDataRepository: LoadAdOptimizationDataRepository,
    getMetaAdInfo: GetMetaAdInfo
  ) {
    this.loadCampaignRepository = loadCampaignRepository
    this.loadAdOptimizationDataRepository = loadAdOptimizationDataRepository
    this.getMetaAdInfo = getMetaAdInfo
  }

  private buildOptimizationData(internalData: InternalOptimizationData | null, externalData: MetaAdInfo): OptimizationData {
    const { revenue = 0, checkout = 0, sales = 0 } = internalData || {}
    const { expenses = 0, cpc = 0, vcpm = 0, vctr = 0, clicks = 0 } = externalData || {}

    const numExpenses = Number(expenses)
    const cpa = sales > 0 ? numExpenses / sales : 0
    const roas = numExpenses > 0 ? revenue / numExpenses : 0

    return {
      revenue,
      expenses: numExpenses,
      cpc: Number(cpc),
      vcpm: Number(vcpm),
      cpa,
      vctr: Number(vctr),
      clicks: Number(clicks),
      checkout,
      sales,
      roas,
    }
  }

  async loadOne(idUser: number, id_campaign: number, id_ad_meta: string, days: number): Promise<OptimizationData | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if (!campaign || campaign.id_user !== idUser) return null

    const [internalData, externalData] = await Promise.all([
      this.loadAdOptimizationDataRepository.loadAdOptData(id_ad_meta, days),
      this.getMetaAdInfo.getMetaAdInfo(idUser, id_ad_meta, days)
    ])

    return this.buildOptimizationData(internalData, externalData)
  }

  async loadOneByDateRange(idUser: number, id_campaign: number, id_ad_meta: string, dateRange: { startDate: string; endDate: string }): Promise<OptimizationData | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if (!campaign || campaign.id_user !== idUser) return null

    const [internalData, externalData] = await Promise.all([
      this.loadAdOptimizationDataRepository.loadAdOptDataByDateRange(id_ad_meta, dateRange),
      this.getMetaAdInfo.getMetaAdInfoByDateRange(idUser, id_ad_meta, dateRange)
    ])

    return this.buildOptimizationData(internalData, externalData)
  }
}

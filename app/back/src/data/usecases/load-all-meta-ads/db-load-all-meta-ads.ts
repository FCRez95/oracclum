import { MetaAdModel } from "../../../domain/models/meta-ad";
import { LoadAllMetaAds } from "../../../domain/usecases/meta-ads/load-all-meta-ads";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { LoadAdOptimizationDataRepository } from "../../protocols/db/clicks-meta/load-ad-optimization-data-repository";
import { GetMetaAdsInfo } from "../../protocols/external-apis/external-info";

export class DbLoadAllMetaAds implements LoadAllMetaAds {
  private readonly loadCampaignRepository: LoadCampaignRepository
  private readonly loadAdOptimizationDataRepository: LoadAdOptimizationDataRepository
  private readonly getMetaAdsInfo: GetMetaAdsInfo

  constructor (loadCampaignRepository: LoadCampaignRepository, loadAdOptimizationDataRepository: LoadAdOptimizationDataRepository, getMetaAdsInfo: GetMetaAdsInfo) {
    this.loadCampaignRepository = loadCampaignRepository
    this.loadAdOptimizationDataRepository = loadAdOptimizationDataRepository
    this.getMetaAdsInfo = getMetaAdsInfo
  }

  private buildAdModel(item: any, internalData: any): MetaAdModel {
    return {
      id_ad: item.id_meta,
      name: item.name,
      summary: {
        revenue: internalData && internalData.revenue? internalData.revenue : 0,
        checkout: internalData? internalData.checkout : 0,
        sales: internalData? internalData.sales : 0,
        expenses: item.expenses? item.expenses : 0,
        cpc: item.cpc? item.cpc : 0,
        vcpm: item.vcpm? item.vcpm : 0,
        vctr: item.vctr? item.vctr : 0,
        clicks: item.clicks? item.clicks : 0,
        roas: item.expenses>0 && internalData? internalData.revenue / item.expenses : 0,
        cpa: internalData && internalData.sales>0? item.expenses/internalData.sales : 0,
      }
    }
  }

  async loadAll(idUser: number, id_campaign: number, days: number): Promise<MetaAdModel[]> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if(!campaign || campaign.id_user !== idUser) {
      return null
    }
    const idMeta = campaign.external_id
    if (!idMeta) return []

    const externalAds = await this.getMetaAdsInfo.getMetaAdsInfo(idUser, idMeta, days)
    const adsSummary = await Promise.all(externalAds.map(async item => {
      const internalData = await this.loadAdOptimizationDataRepository.loadAdOptData(item.id_meta, days)
      return this.buildAdModel(item, internalData)
    }))

    return adsSummary
  }

  async loadAllByDateRange(idUser: number, id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<MetaAdModel[]> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if(!campaign || campaign.id_user !== idUser) {
      return null
    }
    const idMeta = campaign.external_id
    if (!idMeta) return []

    const externalAds = await this.getMetaAdsInfo.getMetaAdsInfoByDateRange(idUser, idMeta, dateRange)
    const adsSummary = await Promise.all(externalAds.map(async item => {
      const internalData = await this.loadAdOptimizationDataRepository.loadAdOptDataByDateRange(item.id_meta, dateRange)
      return this.buildAdModel(item, internalData)
    }))

    return adsSummary
  }
}

import { MetaAdSetModel } from "../../../domain/models/meta-ad-set";
import { LoadAllMetaAdSets } from "../../../domain/usecases/meta-ad-sets/load-all-ad-sets-summary";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { LoadAdsetOptimizationDataRepository } from "../../protocols/db/clicks-meta/load-adset-optimization-data-repository";
import { GetMetaAdSetInfo } from "../../protocols/external-apis/external-info";

export class DbLoadAllMetaAdSets implements LoadAllMetaAdSets {
  private readonly loadCampaignRepository: LoadCampaignRepository
  private readonly loadAdsetOptimizationDataRepository: LoadAdsetOptimizationDataRepository
  private readonly getMetaAdSetInfo: GetMetaAdSetInfo

  constructor (loadCampaignRepository: LoadCampaignRepository, loadAdsetOptimizationDataRepository: LoadAdsetOptimizationDataRepository, getMetaAdSetInfo: GetMetaAdSetInfo) {
    this.loadCampaignRepository = loadCampaignRepository
    this.loadAdsetOptimizationDataRepository = loadAdsetOptimizationDataRepository
    this.getMetaAdSetInfo = getMetaAdSetInfo
  }

  private buildAdSetModel(item: any, internalData: any): MetaAdSetModel {
    return {
      id_ad_set: item.id_meta,
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

  async loadAll(idUser: number, id_campaign: number, days: number): Promise<MetaAdSetModel[]> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if(!campaign || campaign.id_user !== idUser) {
      return null
    }
    const idMeta = campaign.external_id
    if (!idMeta) return []

    const external_summary_all_ads = await this.getMetaAdSetInfo.getMetaAdSetsInfo(idUser, idMeta, days)
    const ads_summary = await Promise.all(external_summary_all_ads.map(async item => {
      const internalData = await this.loadAdsetOptimizationDataRepository.loadAdsetOptData(item.id_meta, days)
      return this.buildAdSetModel(item, internalData)
    }))

    return ads_summary
  }

  async loadAllByDateRange(idUser: number, id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<MetaAdSetModel[]> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign)
    if(!campaign || campaign.id_user !== idUser) {
      return null
    }
    const idMeta = campaign.external_id
    if (!idMeta) return []

    const external_summary_all_ads = await this.getMetaAdSetInfo.getMetaAdSetsInfoByDateRange(idUser, idMeta, dateRange)
    const ads_summary = await Promise.all(external_summary_all_ads.map(async item => {
      const internalData = await this.loadAdsetOptimizationDataRepository.loadAdsetOptDataByDateRange(item.id_meta, dateRange)
      return this.buildAdSetModel(item, internalData)
    }))

    return ads_summary
  }
}

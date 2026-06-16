import { AdsSummaryModel } from "../../../domain/models/ads-summary";
import { OptimizationData } from "../../../domain/models/optimization-data";
import { LoadAllAdsSummary } from "../../../domain/usecases/ads/load-all-ads-summary";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { GetIdCampaignTaboolaRepository } from "../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository";
import { InternalOptimizationData, LoadOptimizationDataRepository } from "../../protocols/db/clicks-taboola/load-optimization-data-repository";
import { ExternalAdInfo, GetExternalAdsInfo } from "../../protocols/external-apis/external-info";

export class DbLoadAllAdsSummary implements LoadAllAdsSummary {
  private readonly loadCampaignRepository: LoadCampaignRepository
  private readonly getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository
  private readonly loadAdsSummaryByClicks: LoadOptimizationDataRepository
  private readonly getExternalAdsInfo: GetExternalAdsInfo

  constructor(loadCampaignRepository: LoadCampaignRepository, getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository, loadAdsSummaryByClicks: LoadOptimizationDataRepository, getExternalAdsInfo: GetExternalAdsInfo) {
    this.loadCampaignRepository = loadCampaignRepository
    this.getIdCampaignTaboolaRepository = getIdCampaignTaboolaRepository
    this.loadAdsSummaryByClicks = loadAdsSummaryByClicks
    this.getExternalAdsInfo = getExternalAdsInfo
  }

  private async getTaboolaId(idUser: number, id_campaign: number): Promise<number | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign);
    if (!campaign || campaign.id_user !== idUser) {
      return null;
    }
    return Number(campaign.external_id);
  }

  private buildAdSummary(externalData: ExternalAdInfo, internalData: InternalOptimizationData): AdsSummaryModel {
    const {
      revenue = 0,
      checkout = 0,
      sales = 0,
    } = internalData || {};

    const {
      id_taboola = 0,
      title = '',
      thumbnail = '',
      expenses = 0,
      cpc = 0,
      vcpm = 0,
      vctr = 0,
      clicks = 0,
    } = externalData || {};

    const cpa = sales > 0 ? expenses / sales : 0;
    const roas = expenses > 0 ? revenue / expenses : 0;

    const summaryData: OptimizationData = {
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

    const adSummary: AdsSummaryModel = {
      id_ads_taboola: id_taboola,
      title,
      thumbnail,
      summary: summaryData,
    };

    return adSummary;
  }

  async loadAll(idUser: number, id_campaign: number, days: number): Promise<AdsSummaryModel[]> {
    const idTaboola = await this.getTaboolaId(idUser, id_campaign);
    if (!idTaboola) return [];

    const external_ads = await this.getExternalAdsInfo.getExternalAdsInfo(idUser, idTaboola, days)
    const adIds = external_ads.map((item) => item.id_taboola)
    const internalRows = adIds.length
      ? await this.loadAdsSummaryByClicks.loadAdsSummariesByIds(days, adIds)
      : []
    const internalByAdId = new Map<number, InternalOptimizationData>()
    internalRows.forEach((row) => {
      internalByAdId.set(row.id_ads_taboola, row)
    })

    return external_ads.map((item) => {
      const internal = internalByAdId.get(item.id_taboola) || { revenue: 0, sales: 0, checkout: 0 }
      return this.buildAdSummary(item, internal)
    })
  }

  async loadAllByDateRange(
    idUser: number,
    id_campaign: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<AdsSummaryModel[]> {
    const idTaboola = await this.getTaboolaId(idUser, id_campaign);
    if (!idTaboola) return [];

    const external_ads = await this.getExternalAdsInfo.getExternalAdsInfoByDateRange(idUser, idTaboola, dateRange)
    const adIds = external_ads.map((item) => item.id_taboola)
    const internalRows = adIds.length
      ? await this.loadAdsSummaryByClicks.loadAdsSummariesByIdsByDateRange(dateRange, adIds)
      : []
    const internalByAdId = new Map<number, InternalOptimizationData>()
    internalRows.forEach((row) => {
      internalByAdId.set(row.id_ads_taboola, row)
    })

    return external_ads.map((item) => {
      const internal = internalByAdId.get(item.id_taboola) || { revenue: 0, sales: 0, checkout: 0 }
      return this.buildAdSummary(item, internal)
    })
  }
}

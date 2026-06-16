import { OptimizationData } from "../../../domain/models/optimization-data";
import { LoadOneAdSummary } from "../../../domain/usecases/ads/load-one-add-summary";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { GetIdCampaignTaboolaRepository } from "../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository";
import { InternalOptimizationData, LoadOptimizationDataRepository } from "../../protocols/db/clicks-taboola/load-optimization-data-repository";
import { ExternalAdInfo, GetExternalAdInfo } from "../../protocols/external-apis/external-info";

export class DbLoadOneAdSummary implements LoadOneAdSummary {
  private readonly loadCampaignRepository: LoadCampaignRepository;
  private readonly getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository;
  private readonly loadAdsSummaryByClicks: LoadOptimizationDataRepository;
  private readonly getExternalAdInfo: GetExternalAdInfo;

  constructor(
    loadCampaignRepository: LoadCampaignRepository,
    getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository,
    loadAdsSummaryByClicks: LoadOptimizationDataRepository,
    getExternalAdInfo: GetExternalAdInfo
  ) {
    this.loadCampaignRepository = loadCampaignRepository;
    this.getIdCampaignTaboolaRepository = getIdCampaignTaboolaRepository;
    this.loadAdsSummaryByClicks = loadAdsSummaryByClicks;
    this.getExternalAdInfo = getExternalAdInfo;
  }

  private async getTaboolaId(idUser: number, id_campaign: number): Promise<number | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign);
    if (!campaign || campaign.id_user !== idUser) {
      return null;
    }
    return Number(campaign.external_id);
  }

  private buildOptimizationData(internalData: InternalOptimizationData, externalData: ExternalAdInfo | null): OptimizationData {
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

  async loadOne(
    idUser: number,
    id_campaign: number,
    id_ads_taboola: number,
    days: number
  ): Promise<OptimizationData> {
    const idTaboola = await this.getTaboolaId(idUser, id_campaign);
    if (!idTaboola) return null;

    const [internal_summary_ad, external_data] = await Promise.all([
      this.loadAdsSummaryByClicks.load(days, undefined, id_ads_taboola),
      this.getExternalAdInfo.getExternalAdInfo(idUser, idTaboola, id_ads_taboola, days)
    ]);

    return this.buildOptimizationData(internal_summary_ad, external_data);
  }

  async loadOneByDateRange(
    idUser: number,
    id_campaign: number,
    id_ads_taboola: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<OptimizationData> {
    const idTaboola = await this.getTaboolaId(idUser, id_campaign);
    if (!idTaboola) return null;

    const [internal_summary_ad, external_data] = await Promise.all([
      this.loadAdsSummaryByClicks.loadByDateRange(dateRange, undefined, id_ads_taboola),
      this.getExternalAdInfo.getExternalAdInfoByDateRange(idUser, idTaboola, id_ads_taboola, dateRange)
    ]);

    return this.buildOptimizationData(internal_summary_ad, external_data);
  }
}

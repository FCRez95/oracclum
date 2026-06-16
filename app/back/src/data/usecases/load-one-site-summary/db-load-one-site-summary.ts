import { OptimizationData } from "../../../domain/models/optimization-data";
import { LoadOneSiteSummary } from "../../../domain/usecases/campaign/load-one-site-summary";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { GetIdCampaignTaboolaRepository } from "../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository";
import { InternalOptimizationData, LoadOptimizationDataRepository } from "../../protocols/db/clicks-taboola/load-optimization-data-repository";
import { ExternalSiteInfo, GetExternalSiteInfo } from "../../protocols/external-apis/external-info";

export class DbLoadOneSiteSummary implements LoadOneSiteSummary {
  private readonly loadCampaignRepository: LoadCampaignRepository;
  private readonly loadSiteSummaryByClicks: LoadOptimizationDataRepository;
  private readonly getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository;
  private readonly getExternalSiteInfo: GetExternalSiteInfo;

  constructor(
    loadCampaignRepository: LoadCampaignRepository,
    getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository,
    loadSiteSummaryByClicks: LoadOptimizationDataRepository,
    getExternalSiteInfo: GetExternalSiteInfo
  ) {
    this.loadCampaignRepository = loadCampaignRepository;
    this.getIdCampaignTaboolaRepository = getIdCampaignTaboolaRepository;
    this.loadSiteSummaryByClicks = loadSiteSummaryByClicks;
    this.getExternalSiteInfo = getExternalSiteInfo;
  }

  private async getTaboolaId(idUser: number, id_campaign: number): Promise<number | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign);
    if (!campaign || campaign.id_user !== idUser) {
      return null;
    }
    return Number(campaign.external_id);
  }

  private buildOptimizationData(
    internalData: InternalOptimizationData | null,
    externalData: ExternalSiteInfo | null
  ): OptimizationData {
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

    const siteSummary: OptimizationData = {
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

    return siteSummary;
  }

  async loadOne(
    idUser: number,
    id_campaign: number,
    id_site: number,
    days: number
  ): Promise<OptimizationData> {
    const idTaboola = await this.getTaboolaId(idUser, id_campaign);
    if (!idTaboola) return null;

    const [summary_site, external_site_data] = await Promise.all([
      this.loadSiteSummaryByClicks.load(days, id_campaign, undefined, id_site),
      this.getExternalSiteInfo.getExternalSiteInfo(idUser, idTaboola, id_site, days)
    ]);

    return this.buildOptimizationData(summary_site, external_site_data);
  }

  async loadOneByDateRange(
    idUser: number,
    id_campaign: number,
    id_site: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<OptimizationData | null> {
    const idTaboola = await this.getTaboolaId(idUser, id_campaign);
    if (!idTaboola) return null;

    const [summary_site, external_site_data] = await Promise.all([
      this.loadSiteSummaryByClicks.loadByDateRange(dateRange, id_campaign, undefined, id_site),
      this.getExternalSiteInfo.getExternalSiteInfoByDateRange(idUser, idTaboola, id_site, dateRange)
    ]);

    return this.buildOptimizationData(summary_site, external_site_data);
  }
}

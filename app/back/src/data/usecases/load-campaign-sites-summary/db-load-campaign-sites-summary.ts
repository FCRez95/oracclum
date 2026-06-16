import { CampaignSiteSummaryModel } from "../../../domain/models/campaign-site-summary";
import { LoadCampaignSitesSummary } from "../../../domain/usecases/campaign/load-campaign-sites-summary";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { GetIdCampaignTaboolaRepository } from "../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository";
import { InternalOptimizationData, LoadOptimizationDataRepository } from "../../protocols/db/clicks-taboola/load-optimization-data-repository";
import { ExternalSiteInfo, GetExternalSitesInfo } from "../../protocols/external-apis/external-info";

export class DbLoadCampaignSitesSummary implements LoadCampaignSitesSummary {
  private readonly loadCampaignRepository: LoadCampaignRepository;
  private readonly getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository;
  private readonly loadCampaignSiteSummaryByClickRepository: LoadOptimizationDataRepository;
  private readonly getExternalSitesInfo: GetExternalSitesInfo;

  constructor(
    loadCampaignRepository: LoadCampaignRepository,
    getIdCampaignTaboolaRepository: GetIdCampaignTaboolaRepository,
    loadCampaignSiteSummaryByClickRepository: LoadOptimizationDataRepository,
    getExternalSitesInfo: GetExternalSitesInfo
  ) {
    this.loadCampaignRepository = loadCampaignRepository;
    this.getIdCampaignTaboolaRepository = getIdCampaignTaboolaRepository;
    this.loadCampaignSiteSummaryByClickRepository =
      loadCampaignSiteSummaryByClickRepository;
    this.getExternalSitesInfo = getExternalSitesInfo;
  }

  private async getTaboolaId(idUser: number, id_campaign: number): Promise<number | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign);
    if (!campaign || campaign.id_user !== idUser) {
      return null;
    }
    return Number(campaign.external_id);
  }

  private buildCampaignSiteSummary(
    id_campaign: number,
    externalCampaignId: number,
    externalData: ExternalSiteInfo | null,
    internalData: InternalOptimizationData | null
  ): CampaignSiteSummaryModel {
    const {
      revenue = 0,
      checkout = 0,
      sales = 0,
    } = internalData || {};

    const {
      id_taboola = '',
      name = '',
      site = '',
      expenses = 0,
      vcpm = 0,
      cpc = 0,
      vctr = 0,
      clicks = 0,
    } = externalData || {};

    const cpa = sales > 0 ? expenses / sales : 0;
    const roas = expenses > 0 ? revenue / expenses : 0;

    const summary = {
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

    const campaignSiteSummary: CampaignSiteSummaryModel = {
      id_campaign,
      id_campaign_taboola: externalCampaignId,
      id_site: String(id_taboola),
      site: name,
      target: site,
      summary,
    };

    return campaignSiteSummary;
  }


  async loadAllSites(idUser: number, id_campaign: number, days: number): Promise<CampaignSiteSummaryModel[]> {
    const externalCampaignId = await this.getTaboolaId(idUser, id_campaign);
    if (externalCampaignId === null) {
      return [];
    }

    const externalSitesData = await this.getExternalSitesInfo.getExternalSitesInfo(idUser, externalCampaignId, days);

    const siteIdsWithClicks = externalSitesData
      .filter((external) => external.clicks > 0)
      .map((external) => external.id_taboola)
    const internalRows = siteIdsWithClicks.length
      ? await this.loadCampaignSiteSummaryByClickRepository.loadSitesSummariesByCampaignAndIds(
        days,
        id_campaign,
        siteIdsWithClicks
      )
      : []
    const internalBySiteId = new Map<string, InternalOptimizationData>()
    internalRows.forEach((row) => {
      internalBySiteId.set(String(row.id_site), row)
    })

    return externalSitesData.map((external) => {
      const internal = external.clicks > 0
        ? internalBySiteId.get(String(external.id_taboola)) || null
        : null
      return this.buildCampaignSiteSummary(id_campaign, externalCampaignId, external, internal);
    })
  }

  async loadAllSitesByDateRange(idUser: number, id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<CampaignSiteSummaryModel[]> {
    const externalCampaignId = await this.getTaboolaId(idUser, id_campaign);
    if (externalCampaignId === null) {
      return [];
    }

    const externalSitesData = await this.getExternalSitesInfo.getExternalSitesInfoByDateRange(idUser, externalCampaignId, dateRange);

    const siteIdsWithClicks = externalSitesData
      .filter((external) => external.clicks > 0)
      .map((external) => external.id_taboola)
    const internalRows = siteIdsWithClicks.length
      ? await this.loadCampaignSiteSummaryByClickRepository.loadSitesSummariesByCampaignAndIdsByDateRange(
        dateRange,
        id_campaign,
        siteIdsWithClicks
      )
      : []
    const internalBySiteId = new Map<string, InternalOptimizationData>()
    internalRows.forEach((row) => {
      internalBySiteId.set(String(row.id_site), row)
    })

    return externalSitesData.map((external) => {
      const internal = external.clicks > 0
        ? internalBySiteId.get(String(external.id_taboola)) || null
        : null
      return this.buildCampaignSiteSummary(id_campaign, externalCampaignId, external, internal);
    })
  }
}

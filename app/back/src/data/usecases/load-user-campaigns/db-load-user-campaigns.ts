import { CampaignModel } from "../../../domain/models/campaign";
import { CampaignSummaryModel } from "../../../domain/models/campaign-summary";
import { LoadUserCampaigns } from "../../../domain/usecases/campaign/load-user-campaigns";
import {
  CampaignInternalData,
  LoadCampaignSummaryRepository,
} from "../../protocols/db/clicks-taboola/load-campaign-summary-repository";
import { LoadUserCampaignsRepository } from "../../protocols/db/campaign/load-user-campaigns-repository";
import {
  GetExternalData,
  ExternalData,
  GetMetaExternalData,
  MetaCampaignInput,
} from "../../protocols/external-apis/external-info";

export class DbLoadUserCampaigns implements LoadUserCampaigns {
  constructor(
    private readonly loadUserCampaignsRepository: LoadUserCampaignsRepository,
    private readonly loadCampaignSummaryRepository: LoadCampaignSummaryRepository,
    private readonly getTaboolaExternalData: GetExternalData,
    private readonly getMetaExternalData: GetMetaExternalData,
  ) { }

  private async getUserCampaigns(idUser: number): Promise<CampaignModel[] | null> {
    const campaigns = await this.loadUserCampaignsRepository.loadUserCampaigns(idUser);
    return campaigns || [];
  }

  private buildCampaignSummary(
    campaign: CampaignModel,
    internal: CampaignInternalData,
    external?: ExternalData
  ): CampaignSummaryModel {
    const {
      id = 0,
      id_user = 0,
      name = '',
      link = '',
      ad_provider = '',
      sub_account = '',
    } = campaign || {};

    const {
      revenue = 0,
      sales = 0,
      checkout = 0,
    } = internal || {};

    const {
      external_id = 0,
      clicks = 0,
      expenses = 0,
    } = external || {};

    const roas = expenses > 0 ? revenue / expenses : 0;

    const campaignSummary: CampaignSummaryModel = {
      id,
      id_user,
      name,
      link,
      sub_account,
      ad_provider,
      external_id,
      clicks,
      expenses,
      revenue,
      sales,
      checkout,
      roas,
    };
    return campaignSummary;
  }

  async load(idUser: number, days: number): Promise<CampaignSummaryModel[]> {
    const campaigns = await this.getUserCampaigns(idUser);
    if (!campaigns || !campaigns.length) return [];

    const defaultInternal: CampaignInternalData = { revenue: 0, sales: 0, checkout: 0 };

    // Taboola
    const taboolaCampaigns = campaigns.filter((c) => c.ad_provider === "taboola");
    const taboolaCampaignIds = taboolaCampaigns.map((c) => c.id);
    const taboolaIdByCampaignId = new Map<number, string | number>();
    taboolaCampaigns.forEach((c) => {
      if (c.external_id) taboolaIdByCampaignId.set(c.id, c.external_id);
    });
    const taboolaExternalIds = taboolaCampaigns
      .map((c) => Number(c.external_id))
      .filter((id) => Number.isFinite(id) && id > 0);

    // Meta
    const metaCampaigns = campaigns.filter((c) => c.ad_provider === "meta");
    const metaCampaignIds = metaCampaigns.map((c) => c.id);
    const metaIdByCampaignId = new Map<number, string | number>();
    metaCampaigns.forEach((c) => {
      if (c.external_id) metaIdByCampaignId.set(c.id, c.external_id);
    });
    const metaInputs: MetaCampaignInput[] = metaCampaigns
      .filter((c) => c.external_id && c.sub_account)
      .map((c) => ({ external_id: c.external_id, account_id: c.sub_account }));
    // Run all in parallel
    const [taboolaInternalRows, taboolaData, metaInternalRows, metaData] = await Promise.all([
      taboolaCampaignIds.length
        ? this.loadCampaignSummaryRepository.loadSummariesByCampaignIds("taboola", taboolaCampaignIds, days)
        : [],
      taboolaExternalIds.length
        ? this.getTaboolaExternalData.getExternalData(idUser, taboolaExternalIds, days)
        : [],
      metaCampaignIds.length
        ? this.loadCampaignSummaryRepository.loadSummariesByCampaignIds("meta", metaCampaignIds, days)
        : [],
      metaInputs.length
        ? this.getMetaExternalData.getExternalData(idUser, metaInputs, days)
        : [],
    ]);

    // Build internal data map
    const internalByCampaignId = new Map<number, CampaignInternalData>();
    [...taboolaInternalRows, ...metaInternalRows].forEach((row) => {
      internalByCampaignId.set(row.id_campaign, {
        revenue: row.revenue ?? 0,
        sales: row.sales ?? 0,
        checkout: row.checkout ?? 0,
      });
    });

    // Build external data map
    const externalByKey = new Map<string, ExternalData>();
    taboolaData.forEach((e) => {
      externalByKey.set(`taboola-${e.external_id}`, e);
    });
    metaData.forEach((e) => {
      externalByKey.set(`meta-${e.external_id}`, e);
    });
    return campaigns.map((campaign) => {
      const internal = internalByCampaignId.get(campaign.id) || defaultInternal;
      let externalId: string | number | null = null;
      if (campaign.ad_provider === "taboola") {
        externalId = taboolaIdByCampaignId.get(campaign.id) ?? null;
      } else if (campaign.ad_provider === "meta") {
        externalId = metaIdByCampaignId.get(campaign.id) ?? null;
      }
      const key = `${campaign.ad_provider}-${externalId}`;
      const external = externalByKey.get(key);
      return this.buildCampaignSummary(campaign, internal, external);
    });
  }

  async loadByDateRange(
    idUser: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignSummaryModel[]> {
    const campaigns = await this.getUserCampaigns(idUser);
    if (!campaigns || !campaigns.length) return [];

    const defaultInternal: CampaignInternalData = { revenue: 0, sales: 0, checkout: 0 };

    // Taboola
    const taboolaCampaigns = campaigns.filter((c) => c.ad_provider === "taboola");
    const taboolaCampaignIds = taboolaCampaigns.map((c) => c.id);
    const taboolaIdByCampaignId = new Map<number, string | number>();
    taboolaCampaigns.forEach((c) => {
      if (c.external_id) taboolaIdByCampaignId.set(c.id, c.external_id);
    });
    const taboolaExternalIds = taboolaCampaigns
      .map((c) => Number(c.external_id))
      .filter((id) => Number.isFinite(id) && id > 0);

    // Meta
    const metaCampaigns = campaigns.filter((c) => c.ad_provider === "meta");
    const metaCampaignIds = metaCampaigns.map((c) => c.id);
    const metaIdByCampaignId = new Map<number, string | number>();
    metaCampaigns.forEach((c) => {
      if (c.external_id) metaIdByCampaignId.set(c.id, c.external_id);
    });
    const metaInputs: MetaCampaignInput[] = metaCampaigns
      .filter((c) => c.external_id && c.sub_account)
      .map((c) => ({ external_id: c.external_id, account_id: c.sub_account }));

    // Run all in parallel
    const [taboolaInternalRows, taboolaData, metaInternalRows, metaData] = await Promise.all([
      taboolaCampaignIds.length
        ? this.loadCampaignSummaryRepository.loadSummariesByCampaignIdsByDateRange("taboola", taboolaCampaignIds, dateRange)
        : [],
      taboolaExternalIds.length
        ? this.getTaboolaExternalData.getExternalDataByDateRange(idUser, taboolaExternalIds, dateRange)
        : [],
      metaCampaignIds.length
        ? this.loadCampaignSummaryRepository.loadSummariesByCampaignIdsByDateRange("meta", metaCampaignIds, dateRange)
        : [],
      metaInputs.length
        ? this.getMetaExternalData.getExternalDataByDateRange(idUser, metaInputs, dateRange)
        : [],
    ]);

    // Build internal data map
    const internalByCampaignId = new Map<number, CampaignInternalData>();
    [...taboolaInternalRows, ...metaInternalRows].forEach((row) => {
      internalByCampaignId.set(row.id_campaign, {
        revenue: row.revenue ?? 0,
        sales: row.sales ?? 0,
        checkout: row.checkout ?? 0,
      });
    });

    // Build external data map
    const externalByKey = new Map<string, ExternalData>();
    taboolaData.forEach((e) => {
      externalByKey.set(`taboola-${e.external_id}`, e);
    });
    metaData.forEach((e) => {
      externalByKey.set(`meta-${e.external_id}`, e);
    });

    return campaigns.map((campaign) => {
      const internal = internalByCampaignId.get(campaign.id) || defaultInternal;
      let externalId: string | number | null = null;
      if (campaign.ad_provider === "taboola") {
        externalId = taboolaIdByCampaignId.get(campaign.id) ?? null;
      } else if (campaign.ad_provider === "meta") {
        externalId = metaIdByCampaignId.get(campaign.id) ?? null;
      }
      const key = `${campaign.ad_provider}-${externalId}`;
      const external = externalByKey.get(key);
      return this.buildCampaignSummary(campaign, internal, external);
    });
  }
}

import { SiteStepsSummary } from "../../../domain/models/site-funnel";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { LoadSiteStepsRepository } from "../../protocols/db/clicks-taboola/load-site-steps-repository";
import { GetExternalSiteInfo, } from "../../protocols/external-apis/external-info";

export class DbLoadSiteStepsSummary {
  private readonly loadCampaignRepository: LoadCampaignRepository;
  private readonly loadSiteStepsRepository: LoadSiteStepsRepository;
  private readonly getExternalSiteInfo: GetExternalSiteInfo;
  constructor(loadCampaignRepository: LoadCampaignRepository, loadSiteStepsRepository: LoadSiteStepsRepository, getExternalSiteInfo: GetExternalSiteInfo
  ) {
    this.loadCampaignRepository = loadCampaignRepository
    this.loadSiteStepsRepository = loadSiteStepsRepository
    this.getExternalSiteInfo = getExternalSiteInfo
  }

  async load(idUser: number, id_campaign: number, id_site: number, days: number): Promise<SiteStepsSummary> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign);
    if (!campaign || campaign.id_user !== idUser) return null;

    const site_steps_data = await this.loadSiteStepsRepository.loadSiteSteps(id_campaign, id_site, days);
    const external_site_data = await this.getExternalSiteInfo.getExternalSiteInfo(idUser, Number(campaign.external_id), id_site, days);

    const steps: SiteStepsSummary = {
      id: id_site,
      sales: site_steps_data?.total_sales ?? 0,
      revenue: site_steps_data?.revenue ?? 0,
      total_step_1: external_site_data?.clicks ?? 0,
      step_1_views: site_steps_data?.total_clicks ?? 0,
      total_step_2: site_steps_data?.total_step_1 ?? 0,
      step_2_views: site_steps_data?.step_1_views ?? 0,
      total_step_3: site_steps_data?.total_step_2 ?? 0,
      step_3_views: site_steps_data?.step_2_views ?? 0,
      total_step_4: site_steps_data?.total_step_3 ?? 0,
      step_4_views: site_steps_data?.step_3_views ?? 0,
      total_checkout: site_steps_data?.total_checkout ?? 0,
      checkout_views: site_steps_data?.checkout_views ?? 0,
    };

    return steps;
  }

  async loadByDateRange(idUser: number, id_campaign: number, id_site: number, dateRange: { startDate: string; endDate: string }): Promise<SiteStepsSummary> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign);
    if (!campaign || campaign.id_user !== idUser) return null;

    const site_steps_data = await this.loadSiteStepsRepository.loadSiteStepsByDateRange(id_campaign, id_site, dateRange);
    const external_site_data = await this.getExternalSiteInfo.getExternalSiteInfoByDateRange(idUser, Number(campaign.external_id), id_site, dateRange);

    const steps: SiteStepsSummary = {
      id: id_site,
      sales: site_steps_data?.total_sales ?? 0,
      revenue: site_steps_data?.revenue ?? 0,
      total_step_1: external_site_data?.clicks ?? 0,
      step_1_views: site_steps_data?.total_clicks ?? 0,
      total_step_2: site_steps_data?.total_step_1 ?? 0,
      step_2_views: site_steps_data?.step_1_views ?? 0,
      total_step_3: site_steps_data?.total_step_2 ?? 0,
      step_3_views: site_steps_data?.step_2_views ?? 0,
      total_step_4: site_steps_data?.total_step_3 ?? 0,
      step_4_views: site_steps_data?.step_3_views ?? 0,
      total_checkout: site_steps_data?.total_checkout ?? 0,
      checkout_views: site_steps_data?.checkout_views ?? 0,
    };

    return steps;
  }
}
